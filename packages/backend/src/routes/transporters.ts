import express from 'express';
import { PrismaClient, VehicleType } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const bidSchema = z.object({
  shipmentId: z.string(),
  price: z.number().positive(),
  estimatedDays: z.number().int().positive(),
  message: z.string().optional()
});

const vehicleSchema = z.object({
  type: z.enum(['SMALL_VAN', 'LARGE_VAN', 'SMALL_TRUCK', 'LARGE_TRUCK', 'REFRIGERATED', 'FLATBED']),
  licensePlate: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().int(),
  capacity: z.number().positive()
});

const depositSchema = z.object({
  amount: z.number().positive()
});

// Submit bid
router.post('/bids', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const data = bidSchema.parse(req.body);

    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    if (shipment.status !== 'PENDING' && shipment.status !== 'BIDDING') {
      return res.status(400).json({ error: 'Shipment is not accepting bids' });
    }

    // Check if already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        shipmentId: data.shipmentId,
        transporterId: req.user!.id
      }
    });

    if (existingBid) {
      return res.status(400).json({ error: 'You have already bid on this shipment' });
    }

    const bid = await prisma.bid.create({
      data: {
        ...data,
        transporterId: req.user!.id
      },
      include: {
        transporter: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalRatings: true
          }
        }
      }
    });

    // Update shipment status to BIDDING if it's PENDING
    if (shipment.status === 'PENDING') {
      await prisma.shipment.update({
        where: { id: data.shipmentId },
        data: { status: 'BIDDING' }
      });
    }

    // Notify shipper
    await prisma.notification.create({
      data: {
        companyId: shipment.shipperId,
        type: 'NEW_BID',
        title: 'New Bid Received',
        message: `New bid of ${data.price} TND received for your shipment`,
        link: `/shipments/${data.shipmentId}`
      }
    });

    res.status(201).json(bid);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to submit bid' });
  }
});

// Get transporter profile
router.get('/profile', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.transporterProfile.findUnique({
      where: { companyId: req.user!.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            rating: true,
            totalRatings: true
          }
        },
        vehicles: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update transporter profile
router.put('/profile', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const { licenseNumber, licenseExpiry, insuranceNumber, insuranceExpiry } = req.body;

    const profile = await prisma.transporterProfile.update({
      where: { companyId: req.user!.id },
      data: {
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        insuranceNumber,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined
      }
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add vehicle
router.post('/vehicles', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const data = vehicleSchema.parse(req.body);

    // Get transporter profile
    const profile = await prisma.transporterProfile.findUnique({
      where: { companyId: req.user!.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Transporter profile not found' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        type: data.type as VehicleType,
        transporterId: profile.id
      }
    });

    // Update vehicle count
    await prisma.transporterProfile.update({
      where: { id: profile.id },
      data: {
        vehicleCount: {
          increment: 1
        }
      }
    });

    res.status(201).json(vehicle);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Get vehicles
router.get('/vehicles', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.transporterProfile.findUnique({
      where: { companyId: req.user!.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { transporterId: profile.id }
    });

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Submit security deposit
router.post('/deposit', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const data = depositSchema.parse(req.body);

    // Check if deposit already exists
    const existing = await prisma.securityDeposit.findUnique({
      where: { companyId: req.user!.id }
    });

    if (existing && existing.held) {
      return res.status(400).json({ error: 'Security deposit already submitted' });
    }

    const deposit = await prisma.securityDeposit.upsert({
      where: { companyId: req.user!.id },
      create: {
        companyId: req.user!.id,
        amount: data.amount,
        held: true
      },
      update: {
        amount: data.amount,
        held: true,
        refunded: false
      }
    });

    res.status(201).json(deposit);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to submit deposit' });
  }
});

// Get security deposit
router.get('/deposit', authenticate, authorize('TRANSPORTER'), async (req: AuthRequest, res) => {
  try {
    const deposit = await prisma.securityDeposit.findUnique({
      where: { companyId: req.user!.id }
    });

    res.json(deposit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deposit' });
  }
});

export default router;
