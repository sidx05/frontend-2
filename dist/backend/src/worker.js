"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("./config/bullmq");
const logger_1 = require("./utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
async function startWorker() {
    try {
        logger_1.logger.info('Starting NewsHub worker...');
        // Create and start workers
        const workers = (0, bullmq_1.createWorkers)();
        logger_1.logger.info('Workers created successfully');
        // Schedule the recurring scraping job
        await (0, bullmq_1.scheduleScrapingJob)();
        logger_1.logger.info('Scraping job scheduled to run every 5 minutes');
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received, shutting down worker gracefully');
            process.exit(0);
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('SIGINT received, shutting down worker gracefully');
            process.exit(0);
        });
        logger_1.logger.info('Worker started successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to start worker:', error);
        process.exit(1);
    }
}
// Start the worker
startWorker();
//# sourceMappingURL=worker.js.map