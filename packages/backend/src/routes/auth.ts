import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  role: z.enum(['SHIPPER', 'TRANSPORTER'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.company.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const company = await prisma.company.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role as UserRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true
      }
    });

    // If transporter, create profile
    if (data.role === 'TRANSPORTER') {
      await prisma.transporterProfile.create({
        data: {
          companyId: company.id,
          licenseNumber: 'PENDING',
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: company.id, email: company.email, role: company.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({ company, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const company = await prisma.company.findUnique({
      where: { email: data.email }
    });

    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, company.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: company.id, email: company.email, role: company.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { password, ...companyData } = company;

    res.json({ company: companyData, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const company = await prisma.company.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        taxId: true,
        verified: true,
        rating: true,
        totalRatings: true,
        createdAt: true
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
