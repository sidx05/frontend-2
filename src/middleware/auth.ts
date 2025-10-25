import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Simple payload type for decoded tokens
type TokenPayload = {
  sub?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  [key: string]: any;
};

/**
 * Authenticate incoming requests.
 * - If JWT_SECRET is set, expect a Bearer token and verify it.
 * - Otherwise, accept a simple ADMIN_TOKEN API key in the Authorization header.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret && auth.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();
      try {
        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
        // attach minimal auth info to request
        (req as any).auth = { userId: decoded.sub, roles: decoded.roles || [] };
        return next();
      } catch (err) {
        logger.warn('JWT verification failed', { err });
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Fallback: check ADMIN_TOKEN (simple dev mode)
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken && auth === `Bearer ${adminToken}`) {
      (req as any).auth = { userId: 'admin', roles: ['admin'] };
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (err) {
    logger.error('Authentication error', { err });
    return res.status(500).json({ error: 'Authentication failure' });
  }
}

/**
 * Authorize by roles. Usage: authorize(['admin','editor'])
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as { roles?: string[] } | undefined;
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const roles = auth.roles || [];
    const has = roles.some((r) => allowedRoles.includes(r));
    if (!has) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}

const authMiddleware = { authenticate, authorize };
export default authMiddleware;

//export default { authenticate, authorize };