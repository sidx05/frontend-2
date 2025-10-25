// backend/src/index.ts
/// <reference path="./types/express.d.ts" />
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/database";
import { createClient } from "redis";
import { createBullMQ, scheduleScrapingJob } from "./config/bullmq";
import { setupRoutes } from "./routes";
import { setupMiddleware } from "./middleware";
import { logger } from "./utils/logger";
import { setupSwagger } from "./config/swagger";

// routes
import categoriesRoutes from "./routes/categories";
import articlesRoutes from "./routes/articles"; // make sure this exists

const PORT: number = parseInt(process.env.PORT || "3001", 10);

export const app = express();

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});
redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

async function startServer() {
  try {
    // ensure DB connection before starting other services
    await connectDB();

    // Connect Redis
    await redisClient.connect();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // middleware, routes, swagger
    setupMiddleware(app);
    setupRoutes(app);
    setupSwagger(app);

    // mount category + article routes
    app.use("/api/categories", categoriesRoutes);
    app.use("/api/articles", articlesRoutes);

    // schedule jobs (RSS worker etc.)
    const bullmq = createBullMQ();
    scheduleScrapingJob().catch((error) => {
      logger.error("Failed to schedule scraping job:", error);
    });

    // health
    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    });

    // generic error handler
    app.use(
      (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error("Unhandled error:", err);
        res.status(500).json({
          error: "Internal Server Error",
          message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
        });
      }
    );

    // 404
    app.use("*", (req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });

    const graceful = async () => {
      logger.info("Graceful shutdown initiated");
      try {
        await redisClient.quit();
      } catch (e) {
        logger.error("Error quitting redis", e);
      }
      process.exit(0);
    };

    process.on("SIGTERM", graceful);
    process.on("SIGINT", graceful);
  } catch (err) {
    logger.error("Startup error:", err);
    process.exit(1);
  }
}

startServer();
