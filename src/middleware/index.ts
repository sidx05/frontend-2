import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { logger } from '../utils/logger';

export function setupMiddleware(app: express.Application) {
  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Rate limiting (only for API routes) - Increased limits for development
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // 1000 requests (increased for dev)
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Compression middleware
  app.use(compression());

  // Logging middleware
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Trust proxy (important for rate limiting + deployment)
  app.set('trust proxy', 1);
}