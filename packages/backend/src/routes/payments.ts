import express from 'express';
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createPaymentSchema = z.object({
  shipmentId: z.string(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'CHECK', 'ESCROW']),
  isEscrow: z.boolean().optional(),
  isInstallment: z.boolean().optional(),
  installments: z.array(z.object({
    amount: z.number().positive(),
    dueDate: z.string()
  })).optional()
});

// Create payment
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createPaymentSchema.parse(req.body);

    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    if (shipment.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!shipment.transporterId) {
      return res.status(400).json({ error: 'No transporter assigned' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        shipmentId: data.shipmentId,
        payerId: req.user!.id,
        receiverId: shipment.transporterId,
        amount: data.amount,
        method: data.method as PaymentMethod,
        isEscrow: data.isEscrow || data.method === 'ESCROW',
        isInstallment: data.isInstallment || false,
        status: data.isEscrow ? 'PENDING' : 'COMPLETED'
      }
    });

    // Create installments if applicable
    if (data.isInstallment && data.installments && data.installments.length > 0) {
      await prisma.paymentInstallment.createMany({
        data: data.installments.map((inst, index) => ({
          paymentId: payment.id,
          amount: inst.amount,
          dueDate: new Date(inst.dueDate),
          installmentNumber: index + 1,
          status: 'PENDING' as PaymentStatus
        }))
      });
    }

    // Notify transporter
    await prisma.notification.create({
      data: {
        companyId: shipment.transporterId,
        type: 'PAYMENT_CREATED',
        title: 'Payment Initiated',
        message: data.isEscrow
          ? 'Payment has been placed in escrow'
          : 'Payment has been initiated',
        link: `/shipments/${data.shipmentId}`
      }
    });

    const fullPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        installments: true
      }
    });

    res.status(201).json(fullPayment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Release escrow payment
router.post('/:id/release', authenticate, async (req: AuthRequest, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        shipment: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.payerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!payment.isEscrow) {
      return res.status(400).json({ error: 'Payment is not in escrow' });
    }

    if (payment.escrowReleased) {
      return res.status(400).json({ error: 'Escrow already released' });
    }

    // Verify shipment is delivered
    if (payment.shipment.status !== 'DELIVERED') {
      return res.status(400).json({
        error: 'Cannot release escrow before delivery confirmation'
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        escrowReleased: true,
        escrowReleaseDate: new Date(),
        status: 'COMPLETED'
      }
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        companyId: payment.receiverId,
        type: 'PAYMENT_RELEASED',
        title: 'Escrow Payment Released',
        message: `Payment of ${payment.amount} ${payment.currency} has been released`,
        link: `/shipments/${payment.shipmentId}`
      }
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to release escrow payment' });
  }
});

// Get payments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { payerId: req.user!.id },
          { receiverId: req.user!.id }
        ]
      },
      include: {
        shipment: {
          select: {
            id: true,
            pickupCity: true,
            deliveryCity: true,
            status: true
          }
        },
        payer: {
          select: {
            name: true
          }
        },
        receiver: {
          select: {
            name: true
          }
        },
        installments: {
          orderBy: {
            dueDate: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Pay installment
router.post('/installments/:id/pay', authenticate, async (req: AuthRequest, res) => {
  try {
    const installment = await prisma.paymentInstallment.findUnique({
      where: { id: req.params.id },
      include: {
        payment: true
      }
    });

    if (!installment) {
      return res.status(404).json({ error: 'Installment not found' });
    }

    if (installment.payment.payerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (installment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Installment already paid' });
    }

    const updatedInstallment = await prisma.paymentInstallment.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        paidDate: new Date()
      }
    });

    // Check if all installments are paid
    const allInstallments = await prisma.paymentInstallment.findMany({
      where: { paymentId: installment.paymentId }
    });

    const allPaid = allInstallments.every(inst =>
      inst.id === req.params.id || inst.status === 'COMPLETED'
    );

    if (allPaid) {
      await prisma.payment.update({
        where: { id: installment.paymentId },
        data: { status: 'COMPLETED' }
      });
    } else {
      await prisma.payment.update({
        where: { id: installment.paymentId },
        data: { status: 'PARTIAL' }
      });
    }

    res.json(updatedInstallment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to pay installment' });
  }
});

export default router;
