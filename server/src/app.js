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
import profileRoutes from './routes/profileRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Permit PDF previews & Vite dev proxy
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production deployment
  },
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

// Helper to check live database health
const checkDbHealth = async () => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return { connected: true, statusText: 'Connected' };
  } catch (err) {
    return { connected: false, statusText: 'Disconnected', error: err.message };
  }
};

// Root Status Page (HTML Presentation for Browsers, JSON fallback for API clients)
app.get('/', async (req, res) => {
  const dbHealth = await checkDbHealth();
  const acceptsHtml = req.accepts(['html', 'json']) === 'html';

  if (!acceptsHtml) {
    return res.status(dbHealth.connected ? 200 : 503).json({
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      database: dbHealth.connected ? 'connected' : 'disconnected',
      service: 'I2S Business Portal API',
      timestamp: new Date().toISOString(),
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>I2S Business Portal API — System Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-orange: #FF5A00;
      --orange-soft: #FFF4ED;
      --dark-navy: #0B0F17;
      --card-bg: #FFFFFF;
      --border-color: #E2E8F0;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --success-green: #10B981;
      --danger-red: #EF4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 50% 0%, #FFF4ED 0%, #F8FAFC 75%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .status-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: clamp(2rem, 5vw, 2.75rem);
      max-width: 580px;
      width: 100%;
      box-shadow: 0 10px 30px -10px rgba(11, 15, 23, 0.08), 0 20px 25px -5px rgba(255, 90, 0, 0.04);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .status-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-orange) 0%, #FF8A3D 100%);
    }
    .brand-header {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--dark-navy);
      letter-spacing: -0.02em;
    }
    .brand-badge {
      font-size: 0.7rem;
      color: var(--primary-orange);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: block;
      margin-top: -2px;
    }
    .service-tag {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      background: var(--orange-soft);
      color: var(--primary-orange);
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 90, 0, 0.15);
    }
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin: 1.75rem 0;
      text-align: left;
    }
    .status-box {
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.15rem;
    }
    .status-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .status-value {
      font-size: 1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .pulse-green {
      background: var(--success-green);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 2s infinite;
    }
    .pulse-red {
      background: var(--danger-red);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .meta-footer {
      font-size: 0.8rem;
      color: var(--text-muted);
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .meta-link {
      color: var(--primary-orange);
      text-decoration: none;
      font-weight: 600;
    }
    .meta-link:hover {
      text-decoration: underline;
    }
    @media (max-width: 480px) {
      .status-grid { grid-template-columns: 1fr; }
      .meta-footer { justify-content: center; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="status-card">
    <div class="brand-header">
      <svg class="brand-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="9" fill="#FF5A00"/>
        <path d="M19 39H37V78C37 81.3137 34.3137 84 31 84H25C21.6863 84 19 81.3137 19 78V39Z" fill="#FF5A00"/>
        <path d="M42 39C42 36.7909 43.7909 35 46 35H76C78.2091 35 80 36.7909 80 39V49C80 51.2091 78.2091 53 76 53H58C55.7909 53 54 54.7909 54 57V59C54 61.2091 55.7909 63 58 63H74C77.3137 63 80 65.6863 80 69V78C80 81.3137 77.3137 84 74 84H42V39Z" fill="#0B0F17"/>
      </svg>
      <div style="text-align: left;">
        <div class="brand-title">Imagination 2 Software</div>
        <span class="brand-badge">I2S Business Portal API</span>
      </div>
    </div>

    <div class="service-tag">I2S Business Portal API</div>

    <div class="status-grid">
      <div class="status-box">
        <div class="status-label">Backend API Status</div>
        <div class="status-value" style="color: var(--success-green);">
          <span class="pulse-dot pulse-green"></span>
          Operational
        </div>
      </div>

      <div class="status-box">
        <div class="status-label">Database Status</div>
        <div class="status-value" style="color: ${dbHealth.connected ? 'var(--success-green)' : 'var(--danger-red)'};">
          <span class="pulse-dot ${dbHealth.connected ? 'pulse-green' : 'pulse-red'}"></span>
          ${dbHealth.connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>

    <div class="meta-footer">
      <span>Checked: ${new Date().toUTCString()}</span>
      <a href="/api/health" class="meta-link">Raw JSON Health API &rarr;</a>
    </div>
  </div>
</body>
</html>`;

  res.status(dbHealth.connected ? 200 : 503).send(html);
});

// Machine-readable Health Check API (accessible via both /health and /api/health)
const healthHandler = async (req, res) => {
  const dbHealth = await checkDbHealth();
  const statusCode = dbHealth.connected ? 200 : 503;

  res.status(statusCode).json({
    status: dbHealth.connected ? 'healthy' : 'unhealthy',
    database: dbHealth.connected ? 'connected' : 'disconnected',
    service: 'I2S Business Portal API',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

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
app.use('/api/profile', profileRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/public', publicRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const uploadsPath = path.resolve(__dirname, '../uploads');

// Serve uploaded user media securely
app.use('/uploads', express.static(uploadsPath));

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

