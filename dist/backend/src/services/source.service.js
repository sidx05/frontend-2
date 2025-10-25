"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceService = void 0;
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
class SourceService {
    async getSources(filters = {}) {
        try {
            const sources = await models_1.Source.find(filters)
                .populate('categories', 'key label icon color')
                .sort({ name: 1 });
            return sources;
        }
        catch (error) {
            logger_1.logger.error('Get sources error:', error);
            throw error;
        }
    }
    async getSourceById(id) {
        try {
            const source = await models_1.Source.findById(id).populate('categories', 'key label icon color');
            if (!source) {
                throw new Error('Source not found');
            }
            return source;
        }
        catch (error) {
            logger_1.logger.error('Get source by ID error:', error);
            throw error;
        }
    }
    async createSource(data) {
        try {
            const source = new models_1.Source(data);
            await source.save();
            return source;
        }
        catch (error) {
            logger_1.logger.error('Create source error:', error);
            throw error;
        }
    }
    async updateSource(id, data) {
        try {
            const source = await models_1.Source.findByIdAndUpdate(id, data, { new: true });
            if (!source) {
                throw new Error('Source not found');
            }
            return source;
        }
        catch (error) {
            logger_1.logger.error('Update source error:', error);
            throw error;
        }
    }
    async deleteSource(id) {
        try {
            const source = await models_1.Source.findByIdAndDelete(id);
            if (!source) {
                throw new Error('Source not found');
            }
            return source;
        }
        catch (error) {
            logger_1.logger.error('Delete source error:', error);
            throw error;
        }
    }
    async getActiveSources() {
        try {
            const sources = await models_1.Source.find({ active: true })
                .populate('categories', 'key label icon color')
                .sort({ name: 1 });
            return sources;
        }
        catch (error) {
            logger_1.logger.error('Get active sources error:', error);
            throw error;
        }
    }
    async updateLastScraped(id) {
        try {
            const source = await models_1.Source.findByIdAndUpdate(id, { lastScraped: new Date() }, { new: true });
            if (!source) {
                throw new Error('Source not found');
            }
            return source;
        }
        catch (error) {
            logger_1.logger.error('Update last scraped error:', error);
            throw error;
        }
    }
}
exports.SourceService = SourceService;
//# sourceMappingURL=source.service.js.map