// backend/src/config/database.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config(); // make sure env vars are loaded when this module loads

const DEFAULT_MONGO = "mongodb://localhost:27017/newshub";

/**
 * Connects to MongoDB using mongoose.
 * - Reads DATABASE_URL, then MONGO_URI, then MONGO_URL, then falls back to local.
 * - Returns a promise so callers can await the connection.
 */
export default async function connectDB(): Promise<typeof mongoose> {
  const uri =
    process.env.DATABASE_URL ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    DEFAULT_MONGO;

  if (!uri) {
    logger.error(
      "MongoDB connection string not found in env (DATABASE_URL / MONGO_URI / MONGO_URL) and no default is available."
    );
    process.exit(1);
  }

  // recommended mongoose settings
  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(uri, {
      // you can add mongoose options here if desired
    });

    // hide credentials if present when logging
    const safeUri = uri.replace(/\/\/(.+@)/, "//***@");
    logger.info(`✅ Connected to MongoDB (${safeUri})`);
    return mongoose;
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
    // unreachable but satisfies types
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw err;
  }
}
