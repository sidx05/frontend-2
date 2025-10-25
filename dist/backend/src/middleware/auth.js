"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
/**
 * Authenticate incoming requests.
 * - If JWT_SECRET is set, expect a Bearer token and verify it.
 * - Otherwise, accept a simple ADMIN_TOKEN API key in the Authorization header.
 */
async function authenticate(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({ error: 'Missing Authorization header' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret && auth.startsWith('Bearer ')) {
            const token = auth.slice(7).trim();
            try {
                const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
                // attach minimal auth info to request
                req.auth = { userId: decoded.sub, roles: decoded.roles || [] };
                return next();
            }
            catch (err) {
                logger_1.logger.warn('JWT verification failed', { err });
                return res.status(401).json({ error: 'Invalid token' });
            }
        }
        // Fallback: check ADMIN_TOKEN (simple dev mode)
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken && auth === `Bearer ${adminToken}`) {
            req.auth = { userId: 'admin', roles: ['admin'] };
            return next();
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
    catch (err) {
        logger_1.logger.error('Authentication error', { err });
        return res.status(500).json({ error: 'Authentication failure' });
    }
}
/**
 * Authorize by roles. Usage: authorize(['admin','editor'])
 */
function authorize(allowedRoles) {
    return (req, res, next) => {
        const auth = req.auth;
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
exports.default = { authenticate, authorize };
//# sourceMappingURL=auth.js.map