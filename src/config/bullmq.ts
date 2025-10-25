import { Queue, Worker } from "bullmq";
import { logger } from "../utils/logger";
import { JobProcessor } from "../jobs/job.processor";

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

// Create queues
export const scrapingQueue = new Queue("scraping", { connection });
export const moderationQueue = new Queue("moderation", { connection });
export const publishingQueue = new Queue("publishing", { connection });

// Create job processor instance
const jobProcessor = new JobProcessor();

// Create workers
export const createWorkers = () => {
  // Scraping worker (ENABLED - only metadata processing)
  const scrapingWorker = new Worker(
    "scraping",
    async (job) => {
      logger.info(`Processing scraping job: ${job.id}`);
      return await jobProcessor.processScrapingJob(job);
    },
    { connection }
  );

  // Removed AI rewriting and plagiarism workers

  // Moderation worker (DISABLED - converted to metadata-only)
  const moderationWorker = new Worker(
    "moderation",
    async (job) => {
      logger.info(`Processing moderation job (DISABLED): ${job.id}`);
      return await jobProcessor.processModerationJob(job);
    },
    { connection }
  );

  // Publishing worker (ENABLED - no AI dependency)
  const publishingWorker = new Worker(
    "publishing",
    async (job) => {
      logger.info(`Processing publishing job: ${job.id}`);
      return await jobProcessor.processPublishingJob(job);
    },
    { connection }
  );

  // Worker event listeners
  [
    scrapingWorker,
    moderationWorker,
    publishingWorker,
  ].forEach((worker) => {
    worker.on("completed", (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
      logger.error(`Job ${job?.id} failed:`, err);
    });
  });

  return {
    scrapingWorker,
    moderationWorker,
    publishingWorker,
  };
};

// Job scheduling functions
export const scheduleScrapingJob = async (sourceId?: string) => {
  try {
    const job = await scrapingQueue.add(
      "scrape-all",
      { sourceId },
      {
        repeat: {
          every: 5 * 60 * 1000, // Every 5 minutes
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    logger.info(`Scheduled scraping job: ${job.id}`);
    return job;
  } catch (error) {
    logger.error("Error scheduling scraping job:", error);
    throw error;
  }
};

// Removed addAIRewritingJob and addPlagiarismJob APIs

export const addModerationJob = async (articleId: string) => {
  // MODERATION DISABLED: This will now only approve all content
  try {
    const job = await moderationQueue.add(
      "moderate-content",
      { articleId },
      {
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    logger.info(
      `Added moderation job (DISABLED): ${job.id} for article: ${articleId}`
    );
    return job;
  } catch (error) {
    logger.error("Error adding moderation job:", error);
    throw error;
  }
};

export const addPublishingJob = async (articleId: string) => {
  try {
    const job = await publishingQueue.add(
      "publish-article",
      { articleId },
      {
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    logger.info(
      `Added publishing job: ${job.id} for article: ${articleId}`
    );
    return job;
  } catch (error) {
    logger.error("Error adding publishing job:", error);
    throw error;
  }
};

export const createBullMQ = () => {
  return {
    scrapingQueue,
    moderationQueue,
    publishingQueue,
    createWorkers,
    scheduleScrapingJob,
    addModerationJob,
    addPublishingJob,
  };
};
