import express from 'express';
import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createShipmentSchema = z.object({
  pickupAddress: z.string(),
  pickupCity: z.string(),
  pickupDate: z.string(),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  deliveryAddress: z.string(),
  deliveryCity: z.string(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  description: z.string(),
  weight: z.number(),
  volume: z.number().optional(),
  fragile: z.boolean().optional(),
  requiresRefrigeration: z.boolean().optional(),
  estimatedPrice: z.number().optional()
});

// Create shipment
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createShipmentSchema.parse(req.body);

    const shipment = await prisma.shipment.create({
      data: {
        ...data,
        pickupDate: new Date(data.pickupDate),
        shipperId: req.user!.id,
        status: 'PENDING'
      },
      include: {
        shipper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rating: true
          }
        }
      }
    });

    res.status(201).json(shipment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Get all shipments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, role } = req.query;

    const where: any = {};

    // Filter by role
    if (req.user!.role === 'SHIPPER') {
      where.shipperId = req.user!.id;
    } else if (req.user!.role === 'TRANSPORTER') {
      // Show shipments assigned to transporter or available for bidding
      where.OR = [
        { transporterId: req.user!.id },
        { status: 'PENDING' },
        { status: 'BIDDING' }
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        shipper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            rating: true
          }
        },
        transporter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rating: true
          }
        },
        bids: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                rating: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(shipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get single shipment
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        shipper: {
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
        transporter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rating: true,
            totalRatings: true
          }
        },
        vehicle: true,
        bids: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                rating: true,
                totalRatings: true,
                transporterProfile: {
                  select: {
                    completedShipments: true,
                    documentsVerified: true
                  }
                }
              }
            }
          },
          orderBy: {
            price: 'asc'
          }
        },
        trackingUpdates: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        payments: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// Update shipment status
router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, currentLat, currentLng, notes } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Authorization check
    if (
      shipment.shipperId !== req.user!.id &&
      shipment.transporterId !== req.user!.id
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        status,
        currentLat,
        currentLng,
        ...(status === 'DELIVERED' && { deliveryDate: new Date() })
      },
      include: {
        shipper: true,
        transporter: true
      }
    });

    // Create tracking update
    if (status) {
      await prisma.trackingUpdate.create({
        data: {
          shipmentId: req.params.id,
          status,
          location: notes || status,
          latitude: currentLat,
          longitude: currentLng,
          notes
        }
      });
    }

    // Create notification
    const notifyId =
      req.user!.id === shipment.shipperId
        ? shipment.transporterId
        : shipment.shipperId;

    if (notifyId) {
      await prisma.notification.create({
        data: {
          companyId: notifyId,
          type: 'SHIPMENT_UPDATE',
          title: 'Shipment Status Updated',
          message: `Shipment status changed to ${status}`,
          link: `/shipments/${req.params.id}`
        }
      });
    }

    res.json(updatedShipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Submit proof of delivery
router.post('/:id/proof', authenticate, async (req: AuthRequest, res) => {
  try {
    const { deliverySignature, deliveryPhotos, deliveryNotes } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    if (shipment.transporterId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        deliverySignature,
        deliveryPhotos,
        deliveryNotes,
        status: 'DELIVERED',
        deliveryDate: new Date()
      }
    });

    // Notify shipper
    await prisma.notification.create({
      data: {
        companyId: shipment.shipperId,
        type: 'DELIVERY_COMPLETED',
        title: 'Shipment Delivered',
        message: 'Your shipment has been delivered. Please review and release payment.',
        link: `/shipments/${req.params.id}`
      }
    });

    res.json(updatedShipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit proof of delivery' });
  }
});

// Accept bid
router.post('/:id/accept-bid/:bidId', authenticate, async (req: AuthRequest, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    if (shipment.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: req.params.bidId }
    });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Update bid and shipment
    await prisma.bid.update({
      where: { id: req.params.bidId },
      data: { accepted: true }
    });

    const updatedShipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        transporterId: bid.transporterId,
        finalPrice: bid.price,
        status: 'ACCEPTED'
      },
      include: {
        transporter: true,
        shipper: true
      }
    });

    // Notify transporter
    await prisma.notification.create({
      data: {
        companyId: bid.transporterId,
        type: 'BID_ACCEPTED',
        title: 'Bid Accepted',
        message: 'Your bid has been accepted!',
        link: `/shipments/${req.params.id}`
      }
    });

    res.json(updatedShipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept bid' });
  }
});

export default router;
