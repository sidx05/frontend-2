"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickerService = void 0;
const models_1 = require("../models");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
class TickerService {
    async getActiveTickers() {
        try {
            // Try to get from cache first
            const cacheKey = 'tickers:active';
            const cachedTickers = await index_1.redisClient.get(cacheKey);
            if (cachedTickers) {
                return JSON.parse(cachedTickers);
            }
            // Get active tickers from database
            const now = new Date();
            const tickers = await models_1.Ticker.find({
                expiry: { $gt: now },
            })
                .sort({ priority: -1, createdAt: -1 });
            // Cache for 5 minutes
            await index_1.redisClient.setEx(cacheKey, 300, JSON.stringify(tickers));
            return tickers;
        }
        catch (error) {
            logger_1.logger.error('Get active tickers error:', error);
            throw error;
        }
    }
    async createTicker(data) {
        try {
            const ticker = new models_1.Ticker(data);
            await ticker.save();
            // Clear tickers cache
            await this.clearTickersCache();
            return ticker;
        }
        catch (error) {
            logger_1.logger.error('Create ticker error:', error);
            throw error;
        }
    }
    async updateTicker(id, data) {
        try {
            const ticker = await models_1.Ticker.findByIdAndUpdate(id, data, { new: true });
            if (!ticker) {
                throw new Error('Ticker not found');
            }
            // Clear tickers cache
            await this.clearTickersCache();
            return ticker;
        }
        catch (error) {
            logger_1.logger.error('Update ticker error:', error);
            throw error;
        }
    }
    async deleteTicker(id) {
        try {
            const ticker = await models_1.Ticker.findByIdAndDelete(id);
            if (!ticker) {
                throw new Error('Ticker not found');
            }
            // Clear tickers cache
            await this.clearTickersCache();
            return ticker;
        }
        catch (error) {
            logger_1.logger.error('Delete ticker error:', error);
            throw error;
        }
    }
    async cleanupExpiredTickers() {
        try {
            const now = new Date();
            const result = await models_1.Ticker.deleteMany({
                expiry: { $lte: now },
            });
            if (result.deletedCount > 0) {
                logger_1.logger.info(`Cleaned up ${result.deletedCount} expired tickers`);
                await this.clearTickersCache();
            }
            return result.deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Cleanup expired tickers error:', error);
            throw error;
        }
    }
    async clearTickersCache() {
        try {
            await index_1.redisClient.del('tickers:active');
        }
        catch (error) {
            logger_1.logger.error('Clear tickers cache error:', error);
        }
    }
}
exports.TickerService = TickerService;
//# sourceMappingURL=ticker.service.js.map