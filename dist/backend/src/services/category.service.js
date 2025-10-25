"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const models_1 = require("../models");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
class CategoryService {
    async getCategories() {
        try {
            // Try to get from cache first
            const cacheKey = 'categories:all';
            const cachedCategories = await index_1.redisClient.get(cacheKey);
            if (cachedCategories) {
                return JSON.parse(cachedCategories);
            }
            // Get from database
            const categories = await models_1.Category.find()
                .sort({ order: 1, label: 1 })
                .populate('parent', 'key label');
            // Cache for 1 hour
            await index_1.redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));
            return categories;
        }
        catch (error) {
            logger_1.logger.error('Get categories error:', error);
            throw error;
        }
    }
    async getCategoryByKey(key) {
        try {
            const category = await models_1.Category.findOne({ key }).populate('parent', 'key label');
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        }
        catch (error) {
            logger_1.logger.error('Get category by key error:', error);
            throw error;
        }
    }
    async createCategory(data) {
        try {
            const category = new models_1.Category(data);
            await category.save();
            // Clear categories cache
            await this.clearCategoriesCache();
            return category;
        }
        catch (error) {
            logger_1.logger.error('Create category error:', error);
            throw error;
        }
    }
    async updateCategory(id, data) {
        try {
            const category = await models_1.Category.findByIdAndUpdate(id, data, { new: true });
            if (!category) {
                throw new Error('Category not found');
            }
            // Clear categories cache
            await this.clearCategoriesCache();
            return category;
        }
        catch (error) {
            logger_1.logger.error('Update category error:', error);
            throw error;
        }
    }
    async deleteCategory(id) {
        try {
            const category = await models_1.Category.findByIdAndDelete(id);
            if (!category) {
                throw new Error('Category not found');
            }
            // Clear categories cache
            await this.clearCategoriesCache();
            return category;
        }
        catch (error) {
            logger_1.logger.error('Delete category error:', error);
            throw error;
        }
    }
    async clearCategoriesCache() {
        try {
            await index_1.redisClient.del('categories:all');
        }
        catch (error) {
            logger_1.logger.error('Clear categories cache error:', error);
        }
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map