import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Modular Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dailyReportRoutes from './routes/dailyReportRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Permit PDF previews & Vite dev proxy
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Rate Limiter for Sensitive Auth Login/Registration Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  skip: (req) => req.path === '/me',
  message: { success: false, error: 'Too many requests from this IP. Please try again later.' },
});

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      service: 'I2S Business OS Backend API',
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Register Modular API Endpoints
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', dailyReportRoutes);
app.use('/api/services', serviceRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Serve React production build static assets
app.use(express.static(clientDistPath));

// Centralized Error Handler
app.use(errorHandler);

// SPA fallback: any non-API route serves index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.redirect('http://localhost:5173' + req.url);
    }
  });
});

export default app;

