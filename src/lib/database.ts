// src/lib/database.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_MONGO = "mongodb://localhost:27017/newshub";

/**
 * Connects to MongoDB using mongoose.
 * - Reads DATABASE_URL, then MONGO_URI, then MONGO_URL, then falls back to local.
 * - Returns a promise so callers can await the connection.
 */
export default async function connectDB(): Promise<typeof mongoose> {
  // Prefer explicit Mongo env vars; only use DATABASE_URL if it's a Mongo URI
  const mongoFromDbUrl =
    process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb")
      ? process.env.DATABASE_URL
      : undefined;

  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL ||
    mongoFromDbUrl ||
    DEFAULT_MONGO;

  if (!uri) {
    console.error(
      "MongoDB connection string not found in env (DATABASE_URL / MONGO_URI / MONGO_URL) and no default is available."
    );
    throw new Error("Database connection string not found");
  }

  // recommended mongoose settings
  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(uri, {
      // you can add mongoose options here if desired
    });

    // hide credentials if present when logging
    const safeUri = uri.replace(/\/\/(.+@)/, "//***@");
    console.log(`✅ Connected to MongoDB (${safeUri})`);
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
