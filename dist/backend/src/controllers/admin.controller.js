"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const article_service_1 = require("../services/article.service");
const source_service_1 = require("../services/source.service");
const category_service_1 = require("../services/category.service");
const scraping_service_1 = require("../services/scraping.service");
const validation_1 = require("../utils/validation");
const logger_1 = require("../utils/logger");
class AdminController {
    constructor() {
        // Article management
        this.createArticle = async (req, res) => {
            try {
                // Validate input
                const validatedData = validation_1.createArticleSchema.parse(req.body);
                const article = await this.articleService.createArticle({
                    ...validatedData,
                    images: validatedData.images ?? [], // handle images
                });
                res.status(201).json({
                    success: true,
                    message: 'Article created successfully',
                    data: article,
                });
            }
            catch (error) {
                logger_1.logger.error('Create article controller error:', error);
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
                    message: 'Failed to create article',
                });
            }
        };
        this.getArticles = async (req, res) => {
            try {
                const filters = {};
                if (req.query.published !== undefined) {
                    filters.published = req.query.published === 'true';
                }
                if (req.query.categoryId) {
                    filters.categoryId = req.query.categoryId;
                }
                if (req.query.sourceId) {
                    filters.sourceId = req.query.sourceId;
                }
                const articles = await this.articleService.getArticles(filters);
                res.json({
                    success: true,
                    data: articles,
                });
            }
            catch (error) {
                logger_1.logger.error('Get articles controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to fetch articles',
                });
            }
        };
        this.updateArticle = async (req, res) => {
            try {
                const { id } = req.params;
                // Validate input
                const validatedData = validation_1.updateArticleSchema.parse(req.body);
                const article = await this.articleService.updateArticle(id, {
                    ...validatedData,
                    images: validatedData.images ?? [], // handle images
                });
                res.json({
                    success: true,
                    message: 'Article updated successfully',
                    data: article,
                });
            }
            catch (error) {
                logger_1.logger.error('Update article controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Article not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: 'Bad Request',
                        message: error.message,
                    });
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to update article',
                });
            }
        };
        this.publishArticle = async (req, res) => {
            try {
                const { id } = req.params;
                const article = await this.articleService.publishArticle(id);
                res.json({
                    success: true,
                    message: 'Article published successfully',
                    data: article,
                });
            }
            catch (error) {
                logger_1.logger.error('Publish article controller error:', error);
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
                    message: 'Failed to publish article',
                });
            }
        };
        // Source management
        this.createSource = async (req, res) => {
            try {
                const validatedData = validation_1.createSourceSchema.parse(req.body);
                const source = await this.sourceService.createSource(validatedData);
                res.status(201).json({
                    success: true,
                    message: 'Source created successfully',
                    data: source,
                });
            }
            catch (error) {
                logger_1.logger.error('Create source controller error:', error);
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
                    message: 'Failed to create source',
                });
            }
        };
        this.updateSource = async (req, res) => {
            try {
                const { id } = req.params;
                const validatedData = validation_1.updateSourceSchema.parse(req.body);
                const source = await this.sourceService.updateSource(id, validatedData);
                res.json({
                    success: true,
                    message: 'Source updated successfully',
                    data: source,
                });
            }
            catch (error) {
                logger_1.logger.error('Update source controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Source not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: 'Bad Request',
                        message: error.message,
                    });
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to update source',
                });
            }
        };
        this.getSources = async (req, res) => {
            try {
                const filters = {};
                if (req.query.active !== undefined) {
                    filters.active = req.query.active === 'true';
                }
                const sources = await this.sourceService.getSources(filters);
                res.json({
                    success: true,
                    data: sources,
                });
            }
            catch (error) {
                logger_1.logger.error('Get sources controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to get sources',
                });
            }
        };
        // Category management
        this.createCategory = async (req, res) => {
            try {
                const validatedData = validation_1.createCategorySchema.parse(req.body);
                const category = await this.categoryService.createCategory(validatedData);
                res.status(201).json({
                    success: true,
                    message: 'Category created successfully',
                    data: category,
                });
            }
            catch (error) {
                logger_1.logger.error('Create category controller error:', error);
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
                    message: 'Failed to create category',
                });
            }
        };
        this.updateCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const validatedData = validation_1.updateCategorySchema.parse(req.body);
                const category = await this.categoryService.updateCategory(id, validatedData);
                res.json({
                    success: true,
                    message: 'Category updated successfully',
                    data: category,
                });
            }
            catch (error) {
                logger_1.logger.error('Update category controller error:', error);
                if (error instanceof Error) {
                    if (error.message === 'Category not found') {
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: error.message,
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        error: 'Bad Request',
                        message: error.message,
                    });
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to update category',
                });
            }
        };
        this.articleService = new article_service_1.ArticleService();
        this.sourceService = new source_service_1.SourceService();
        this.categoryService = new category_service_1.CategoryService();
        this.scrapingService = new scraping_service_1.ScrapingService();
    }
    // Ingest management
    // inside AdminController
    async triggerScrape(req, res) {
        try {
            const result = await this.scrapingService.scrapeAllSources();
            return res.json({ success: true, count: result.length });
        }
        catch (err) {
            console.error("triggerScrape failed", err);
            return res.status(500).json({ success: false, error: "Scrape failed" });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map