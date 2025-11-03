import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const reviewSchema = z.object({
  shipmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

// Create review
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = reviewSchema.parse(req.body);

    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Verify user is part of the shipment
    if (shipment.shipperId !== req.user!.id && shipment.transporterId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Determine who is being reviewed
    const reviewedId = shipment.shipperId === req.user!.id
      ? shipment.transporterId
      : shipment.shipperId;

    if (!reviewedId) {
      return res.status(400).json({ error: 'Cannot review: no transporter assigned' });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        shipmentId: data.shipmentId,
        reviewerId: req.user!.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this shipment' });
    }

    const review = await prisma.review.create({
      data: {
        shipmentId: data.shipmentId,
        reviewerId: req.user!.id,
        reviewedId,
        rating: data.rating,
        comment: data.comment
      },
      include: {
        reviewer: {
          select: {
            name: true
          }
        },
        reviewed: {
          select: {
            name: true
          }
        }
      }
    });

    // Update company rating
    const reviews = await prisma.review.findMany({
      where: { reviewedId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.company.update({
      where: { id: reviewedId },
      data: {
        rating: avgRating,
        totalRatings: reviews.length
      }
    });

    // Notify reviewed company
    await prisma.notification.create({
      data: {
        companyId: reviewedId,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        message: `You received a ${data.rating}-star review`,
        link: `/shipments/${data.shipmentId}`
      }
    });

    res.status(201).json(review);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a company
router.get('/company/:id', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { reviewedId: req.params.id },
      include: {
        reviewer: {
          select: {
            name: true
          }
        },
        shipment: {
          select: {
            id: true,
            pickupCity: true,
            deliveryCity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
