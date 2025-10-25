"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const models_1 = require("../models");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
class ArticleService {
    async getArticles(query) {
        try {
            const { category, lang, search, sort = 'latest', page = '1', limit = '10', } = query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            // Build query
            const filter = { status: 'published' };
            if (category) {
                // Check if category is a valid ObjectId (24 hex characters)
                const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
                if (isObjectId) {
                    // If it's an ObjectId, search in the category field
                    filter.category = category;
                }
                else {
                    // If it's a string, search in the categories array
                    filter.categories = { $in: [category.toLowerCase()] };
                }
            }
            if (lang) {
                filter.language = lang;
            }
            if (search) {
                filter.$text = { $search: search };
            }
            // Build sort
            let sortOptions = {};
            switch (sort) {
                case 'popular':
                    sortOptions = { viewCount: -1, publishedAt: -1 };
                    break;
                case 'trending':
                    sortOptions = { viewCount: -1, publishedAt: -1 };
                    break;
                case 'latest':
                default:
                    sortOptions = { publishedAt: -1 };
                    break;
            }
            // Get articles
            const articles = await models_1.Article.find(filter)
                .select('title summary slug publishedAt images category source')
                .populate('category', 'key label icon color')
                .populate('source.sourceId', 'name')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum);
            // Get total count
            const total = await models_1.Article.countDocuments(filter);
            return {
                articles,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Get articles error:', error);
            throw error;
        }
    }
    async getArticleBySlug(slug) {
        try {
            // Try to get from cache first
            const cacheKey = `article:${slug}`;
            const cachedArticle = await index_1.redisClient.get(cacheKey);
            if (cachedArticle) {
                return JSON.parse(cachedArticle);
            }
            // Get from database
            const article = await models_1.Article.findOne({ slug, status: 'published' })
                .populate('category', 'key label icon color')
                .populate('source.sourceId', 'name');
            if (!article) {
                throw new Error('Article not found');
            }
            // Increment view count
            await models_1.Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });
            // Cache for 1 hour
            await index_1.redisClient.setEx(cacheKey, 3600, JSON.stringify(article));
            return article;
        }
        catch (error) {
            logger_1.logger.error('Get article by slug error:', error);
            throw error;
        }
    }
    async getArticleById(id) {
        try {
            // Try to get from cache first
            const cacheKey = `article:id:${id}`;
            const cachedArticle = await index_1.redisClient.get(cacheKey);
            if (cachedArticle) {
                return JSON.parse(cachedArticle);
            }
            // Get from database
            const article = await models_1.Article.findById(id)
                .populate('category', 'key label icon color')
                .populate('source.sourceId', 'name');
            if (!article) {
                throw new Error('Article not found');
            }
            // Increment view count
            await models_1.Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });
            // Cache for 1 hour
            await index_1.redisClient.setEx(cacheKey, 3600, JSON.stringify(article));
            return article;
        }
        catch (error) {
            logger_1.logger.error('Get article by ID error:', error);
            throw error;
        }
    }
    async getTrending(query) {
        try {
            const { limit = '10' } = query;
            const limitNum = parseInt(limit);
            // Try to get from cache first
            const cacheKey = `trending:${limit}`;
            const cachedTrending = await index_1.redisClient.get(cacheKey);
            if (cachedTrending) {
                return JSON.parse(cachedTrending);
            }
            // Get trending articles (published in last 7 days with most views)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const trending = await models_1.Article.find({
                status: 'published',
                publishedAt: { $gte: sevenDaysAgo },
            })
                .populate('category', 'key label icon color')
                .populate('source.sourceId', 'name')
                .sort({ viewCount: -1, publishedAt: -1 })
                .limit(limitNum);
            // Cache for 30 minutes
            await index_1.redisClient.setEx(cacheKey, 1800, JSON.stringify(trending));
            return trending;
        }
        catch (error) {
            logger_1.logger.error('Get trending error:', error);
            throw error;
        }
    }
    async createArticle(data) {
        try {
            const article = new models_1.Article(data);
            await article.save();
            return article;
        }
        catch (error) {
            logger_1.logger.error('Create article error:', error);
            throw error;
        }
    }
    async updateArticle(id, data) {
        try {
            const article = await models_1.Article.findByIdAndUpdate(id, data, { new: true });
            if (!article) {
                throw new Error('Article not found');
            }
            return article;
        }
        catch (error) {
            logger_1.logger.error('Update article error:', error);
            throw error;
        }
    }
    async publishArticle(id) {
        try {
            const article = await models_1.Article.findByIdAndUpdate(id, {
                status: 'published',
                publishedAt: new Date(),
            }, { new: true });
            if (!article) {
                throw new Error('Article not found');
            }
            // Clear relevant caches
            await this.clearArticleCaches();
            return article;
        }
        catch (error) {
            logger_1.logger.error('Publish article error:', error);
            throw error;
        }
    }
    async clearArticleCaches() {
        try {
            // Clear trending cache
            const keys = await index_1.redisClient.keys('trending:*');
            if (keys.length > 0) {
                await index_1.redisClient.del(keys);
            }
            // Clear article caches (this could be more specific in production)
            const articleKeys = await index_1.redisClient.keys('article:*');
            if (articleKeys.length > 0) {
                await index_1.redisClient.del(articleKeys);
            }
        }
        catch (error) {
            logger_1.logger.error('Clear article caches error:', error);
        }
    }
}
exports.ArticleService = ArticleService;
//# sourceMappingURL=article.service.js.map