"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.app = void 0;
// backend/src/index.ts
/// <reference path="./types/express.d.ts" />
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("redis");
const bullmq_1 = require("./config/bullmq");
const routes_1 = require("./routes");
const middleware_1 = require("./middleware");
const logger_1 = require("./utils/logger");
const swagger_1 = require("./config/swagger");
// routes
const categories_1 = __importDefault(require("./routes/categories"));
const articles_1 = __importDefault(require("./routes/articles")); // make sure this exists
const PORT = parseInt(process.env.PORT || "3001", 10);
exports.app = (0, express_1.default)();
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
exports.redisClient.on("error", (err) => {
    logger_1.logger.error("Redis Client Error:", err);
});
exports.redisClient.on("connect", () => {
    logger_1.logger.info("Connected to Redis");
});
async function startServer() {
    try {
        // ensure DB connection before starting other services
        await (0, database_1.default)();
        // Connect Redis
        await exports.redisClient.connect();
        exports.app.use(express_1.default.json());
        exports.app.use(express_1.default.urlencoded({ extended: true }));
        // middleware, routes, swagger
        (0, middleware_1.setupMiddleware)(exports.app);
        (0, routes_1.setupRoutes)(exports.app);
        (0, swagger_1.setupSwagger)(exports.app);
        // mount category + article routes
        exports.app.use("/api/categories", categories_1.default);
        exports.app.use("/api/articles", articles_1.default);
        // schedule jobs (RSS worker etc.)
        const bullmq = (0, bullmq_1.createBullMQ)();
        (0, bullmq_1.scheduleScrapingJob)().catch((error) => {
            logger_1.logger.error("Failed to schedule scraping job:", error);
        });
        // health
        exports.app.get("/health", (req, res) => {
            res.json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });
        // generic error handler
        exports.app.use((err, req, res, next) => {
            logger_1.logger.error("Unhandled error:", err);
            res.status(500).json({
                error: "Internal Server Error",
                message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
            });
        });
        // 404
        exports.app.use("*", (req, res) => {
            res.status(404).json({ error: "Route not found" });
        });
        exports.app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        });
        const graceful = async () => {
            logger_1.logger.info("Graceful shutdown initiated");
            try {
                await exports.redisClient.quit();
            }
            catch (e) {
                logger_1.logger.error("Error quitting redis", e);
            }
            process.exit(0);
        };
        process.on("SIGTERM", graceful);
        process.on("SIGINT", graceful);
    }
    catch (err) {
        logger_1.logger.error("Startup error:", err);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map