import mongoose from "mongoose";
import { logger } from "../../backend/src/utils/logger";

export async function connectDB() {
  try {
    const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/newshub";
    await mongoose.connect(uri);
    logger.info("✅ Connected to MongoDB (Mongoose)");
  } catch (err) {
    logger.error("❌ Failed to connect MongoDB", err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info("🔒 MongoDB connection closed");
  } catch (err) {
    logger.error("❌ Error closing MongoDB connection", err);
  }
}

export { mongoose }; 
