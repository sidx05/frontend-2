"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
// backend/src/config/database.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config(); // make sure env vars are loaded when this module loads
const DEFAULT_MONGO = "mongodb://localhost:27017/newshub";
/**
 * Connects to MongoDB using mongoose.
 * - Reads DATABASE_URL, then MONGO_URI, then MONGO_URL, then falls back to local.
 * - Returns a promise so callers can await the connection.
 */
async function connectDB() {
    const uri = process.env.DATABASE_URL ||
        process.env.MONGO_URI ||
        process.env.MONGO_URL ||
        DEFAULT_MONGO;
    if (!uri) {
        logger_1.logger.error("MongoDB connection string not found in env (DATABASE_URL / MONGO_URI / MONGO_URL) and no default is available.");
        process.exit(1);
    }
    // recommended mongoose settings
    mongoose_1.default.set("strictQuery", false);
    try {
        await mongoose_1.default.connect(uri, {
        // you can add mongoose options here if desired
        });
        // hide credentials if present when logging
        const safeUri = uri.replace(/\/\/(.+@)/, "//***@");
        logger_1.logger.info(`✅ Connected to MongoDB (${safeUri})`);
        return mongoose_1.default;
    }
    catch (err) {
        logger_1.logger.error("MongoDB connection error:", err);
        process.exit(1);
        // unreachable but satisfies types
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw err;
    }
}
//# sourceMappingURL=database.js.map