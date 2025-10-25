import mongoose from "mongoose";
// Avoid importing server-only logger in frontend build; use console as a fallback

export async function connectDB() {
  try {
    const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/newshub";
    await mongoose.connect(uri);
    console.info("✅ Connected to MongoDB (Mongoose)");
  } catch (err) {
    console.error("❌ Failed to connect MongoDB", err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.info("🔒 MongoDB connection closed");
  } catch (err) {
    console.error("❌ Error closing MongoDB connection", err);
  }
}

export { mongoose }; 
