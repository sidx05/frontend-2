"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = setupMiddleware;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../utils/logger");
function setupMiddleware(app) {
    // Security middleware
    app.use((0, helmet_1.default)());
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    }));
    // Rate limiting (only for API routes) - Increased limits for development
    const limiter = (0, express_rate_limit_1.default)({
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
    app.use((0, compression_1.default)());
    // Logging middleware
    app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Trust proxy (important for rate limiting + deployment)
    app.set('trust proxy', 1);
}
//# sourceMappingURL=index.js.map