import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { prisma } from './config/prisma.js';
import { initSocketIO } from './services/socketService.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import firstAidRoutes from './routes/firstAidRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration explicitly from backend directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const httpServer = http.createServer(app);

// Connect to Database
prisma.$connect()
  .then(() => console.log('[Database] PostgreSQL Connected successfully via Prisma'))
  .catch((err) => {
    console.error('[Database Error] Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  });

// Initialize Socket.IO
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
initSocketIO(httpServer, clientOrigin);

// Security & Parsing Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CareBridge Healthcare Platform API',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/first-aid', firstAidRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

// Static uploads serving (protected by route handlers for clinical files, but fallback here)
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[CareBridge Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[CareBridge Socket.IO] Ready for real-time telehealth connections`);
});
