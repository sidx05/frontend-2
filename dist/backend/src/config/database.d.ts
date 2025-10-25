import mongoose from "mongoose";
/**
 * Connects to MongoDB using mongoose.
 * - Reads DATABASE_URL, then MONGO_URI, then MONGO_URL, then falls back to local.
 * - Returns a promise so callers can await the connection.
 */
export default function connectDB(): Promise<typeof mongoose>;
//# sourceMappingURL=database.d.ts.map