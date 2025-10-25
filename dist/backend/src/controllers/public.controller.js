"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const article_service_1 = require("../services/article.service");
const category_service_1 = require("../services/category.service");
const ticker_service_1 = require("../services/ticker.service");
const validation_1 = require("../utils/validation");
const logger_1 = require("../utils/logger");
class PublicController {
    constructor() {
        this.getHealth = async (req, res) => {
            try {
                res.json({
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV,
                });
            }
            catch (error) {
                logger_1.logger.error('Health check error:', error);
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Health check failed',
                });
            }
        };
        this.getArticles = async (req, res) => {
            try {
                // Validate query parameters
                const validatedQuery = validation_1.getArticlesSchema.parse(req.query);
                const result = await this.articleService.getArticles(validatedQuery);
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                logger_1.logger.error('Get articles controller error:', error);
                if (error instanceof Error) {
                    return res.status(400).json({
                        success: false,
                        error: 'Bad Request',
                        message: error.message,
                    });
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get articles',
                });
            }
        };
        this.getArticleBySlug = async (req, res) => {
            try {
                const { slug } = req.params;
                const article = await this.articleService.getArticleBySlug(slug);
                res.json({
                    success: true,
                    data: article,
                });
            }
            catch (error) {
                logger_1.logger.error('Get article by slug controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Article not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get article',
                });
            }
        };
        this.getArticleById = async (req, res) => {
            try {
                const { id } = req.params;
                const article = await this.articleService.getArticleById(id);
                res.json({
                    success: true,
                    data: article,
                });
            }
            catch (error) {
                logger_1.logger.error('Get article by ID controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Article not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get article',
                });
            }
        };
        this.getCategories = async (req, res) => {
            try {
                const categories = await this.categoryService.getCategories();
                res.json({
                    success: true,
                    data: categories,
                });
            }
            catch (error) {
                logger_1.logger.error('Get categories controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get categories',
                });
            }
        };
        this.getTrending = async (req, res) => {
            try {
                // Validate query parameters
                const validatedQuery = validation_1.getTrendingSchema.parse(req.query);
                const trending = await this.articleService.getTrending(validatedQuery);
                res.json({
                    success: true,
                    data: trending,
                });
            }
            catch (error) {
                logger_1.logger.error('Get trending controller error:', error);
                if (error instanceof Error) {
                    return res.status(400).json({
                        success: false,
                        error: 'Bad Request',
                        message: error.message,
                    });
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get trending articles',
                });
            }
        };
        this.getActiveTickers = async (req, res) => {
            try {
                const tickers = await this.tickerService.getActiveTickers();
                res.json({
                    success: true,
                    data: tickers,
                });
            }
            catch (error) {
                logger_1.logger.error('Get active tickers controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get active tickers',
                });
            }
        };
        this.articleService = new article_service_1.ArticleService();
        this.categoryService = new category_service_1.CategoryService();
        this.tickerService = new ticker_service_1.TickerService();
    }
}
exports.PublicController = PublicController;
//# sourceMappingURL=public.controller.js.map