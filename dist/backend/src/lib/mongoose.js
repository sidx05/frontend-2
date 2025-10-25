"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const logger_1 = require("../utils/logger");
async function connectDB() {
    try {
        const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/newshub";
        await mongoose_1.default.connect(uri);
        logger_1.logger.info("✅ Connected to MongoDB (Mongoose)");
    }
    catch (err) {
        logger_1.logger.error("❌ Failed to connect MongoDB", err);
        process.exit(1);
    }
}
async function disconnectDB() {
    try {
        await mongoose_1.default.connection.close();
        logger_1.logger.info("🔒 MongoDB connection closed");
    }
    catch (err) {
        logger_1.logger.error("❌ Error closing MongoDB connection", err);
    }
}
//# sourceMappingURL=mongoose.js.map