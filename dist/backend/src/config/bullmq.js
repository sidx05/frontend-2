"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBullMQ = exports.addPublishingJob = exports.addModerationJob = exports.scheduleScrapingJob = exports.createWorkers = exports.publishingQueue = exports.moderationQueue = exports.scrapingQueue = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = require("../utils/logger");
const job_processor_1 = require("../jobs/job.processor");
// Redis connection config
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
};
// Create queues
exports.scrapingQueue = new bullmq_1.Queue("scraping", { connection });
exports.moderationQueue = new bullmq_1.Queue("moderation", { connection });
exports.publishingQueue = new bullmq_1.Queue("publishing", { connection });
// Create job processor instance
const jobProcessor = new job_processor_1.JobProcessor();
// Create workers
const createWorkers = () => {
    // Scraping worker (ENABLED - only metadata processing)
    const scrapingWorker = new bullmq_1.Worker("scraping", async (job) => {
        logger_1.logger.info(`Processing scraping job: ${job.id}`);
        return await jobProcessor.processScrapingJob(job);
    }, { connection });
    // Removed AI rewriting and plagiarism workers
    // Moderation worker (DISABLED - converted to metadata-only)
    const moderationWorker = new bullmq_1.Worker("moderation", async (job) => {
        logger_1.logger.info(`Processing moderation job (DISABLED): ${job.id}`);
        return await jobProcessor.processModerationJob(job);
    }, { connection });
    // Publishing worker (ENABLED - no AI dependency)
    const publishingWorker = new bullmq_1.Worker("publishing", async (job) => {
        logger_1.logger.info(`Processing publishing job: ${job.id}`);
        return await jobProcessor.processPublishingJob(job);
    }, { connection });
    // Worker event listeners
    [
        scrapingWorker,
        moderationWorker,
        publishingWorker,
    ].forEach((worker) => {
        worker.on("completed", (job) => {
            logger_1.logger.info(`Job ${job.id} completed successfully`);
        });
        worker.on("failed", (job, err) => {
            logger_1.logger.error(`Job ${job?.id} failed:`, err);
        });
    });
    return {
        scrapingWorker,
        moderationWorker,
        publishingWorker,
    };
};
exports.createWorkers = createWorkers;
// Job scheduling functions
const scheduleScrapingJob = async (sourceId) => {
    try {
        const job = await exports.scrapingQueue.add("scrape-all", { sourceId }, {
            repeat: {
                every: 5 * 60 * 1000, // Every 5 minutes
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Scheduled scraping job: ${job.id}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error scheduling scraping job:", error);
        throw error;
    }
};
exports.scheduleScrapingJob = scheduleScrapingJob;
// Removed addAIRewritingJob and addPlagiarismJob APIs
const addModerationJob = async (articleId) => {
    // MODERATION DISABLED: This will now only approve all content
    try {
        const job = await exports.moderationQueue.add("moderate-content", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added moderation job (DISABLED): ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding moderation job:", error);
        throw error;
    }
};
exports.addModerationJob = addModerationJob;
const addPublishingJob = async (articleId) => {
    try {
        const job = await exports.publishingQueue.add("publish-article", { articleId }, {
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        logger_1.logger.info(`Added publishing job: ${job.id} for article: ${articleId}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error("Error adding publishing job:", error);
        throw error;
    }
};
exports.addPublishingJob = addPublishingJob;
const createBullMQ = () => {
    return {
        scrapingQueue: exports.scrapingQueue,
        moderationQueue: exports.moderationQueue,
        publishingQueue: exports.publishingQueue,
        createWorkers: exports.createWorkers,
        scheduleScrapingJob: exports.scheduleScrapingJob,
        addModerationJob: exports.addModerationJob,
        addPublishingJob: exports.addPublishingJob,
    };
};
exports.createBullMQ = createBullMQ;
//# sourceMappingURL=bullmq.js.map