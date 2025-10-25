"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProcessor = void 0;
const scraping_service_1 = require("../services/scraping.service");
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
class JobProcessor {
    constructor() {
        this.scrapingService = new scraping_service_1.ScrapingService();
    }
    async processScrapingJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing scraping job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'scraping',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    sourceId: job.data.sourceId,
                },
            });
            await jobLog.save();
            // Get sources to scrape
            const sources = job.data.sourceId
                ? await models_1.Source.find({ _id: job.data.sourceId, active: true })
                : await models_1.Source.find({ active: true });
            let totalArticles = 0;
            let successfulArticles = 0;
            for (const source of sources) {
                try {
                    const scrapedArticles = await this.scrapingService.scrapeSource(source);
                    totalArticles += scrapedArticles.length;
                    // Process each scraped article
                    for (const scrapedArticle of scrapedArticles) {
                        try {
                            await this.processScrapedArticle(scrapedArticle, source);
                            successfulArticles++;
                        }
                        catch (error) {
                            logger_1.logger.error(`Error processing scraped article:`, error);
                        }
                    }
                    // Update source last scraped time
                    await models_1.Source.findByIdAndUpdate(source._id, { lastScraped: new Date() });
                }
                catch (error) {
                    logger_1.logger.error(`Error scraping source ${source.name}:`, error);
                }
            }
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                totalArticles,
                successfulArticles,
                sourcesProcessed: sources.length,
            };
            await jobLog.save();
            logger_1.logger.info(`Scraping job completed. Processed ${successfulArticles}/${totalArticles} articles`);
            return { success: true, totalArticles, successfulArticles };
        }
        catch (error) {
            logger_1.logger.error('Scraping job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    // Removed AI rewriting job processing
    async processAIRewritingJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing AI rewriting job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'ai-rewriting',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // AI DISABLED: Set article to pending status instead of processing with AI
            article.status = 'pending';
            // Removed aiInfo usage
            // Generate basic summary without AI
            article.summary = this.generateSummary(article.content);
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                note: 'AI processing removed - article set to pending status',
            };
            await jobLog.save();
            logger_1.logger.info(`AI rewriting job handler deprecated for article: ${article.title}`);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('AI rewriting job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    // Removed plagiarism job processing
    async processPlagiarismJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing plagiarism job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'plagiarism-check',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // Removed plagiarism handling
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                note: 'Plagiarism check removed',
            };
            await jobLog.save();
            logger_1.logger.info(`Plagiarism job handler deprecated for article: ${article.title}`);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Plagiarism job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processModerationJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing moderation job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'moderation',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // MODERATION DISABLED: Skip AI moderation and SEO generation
            // Keep article status as is (don't reject based on disabled moderation)
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                approved: true,
                reason: 'Moderation disabled',
                note: 'AI moderation and SEO generation disabled',
            };
            await jobLog.save();
            logger_1.logger.info(`Content moderation completed (DISABLED) for article: ${article.title}`);
            return { success: true, approved: true, reason: 'Moderation disabled' };
        }
        catch (error) {
            logger_1.logger.error('Moderation job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processPublishingJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing publishing job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'publishing',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // Check if article can be published
            if (article.status === 'rejected') {
                throw new Error('Cannot publish rejected article');
            }
            // Removed plagiarism gating
            // Publish article
            article.status = 'published';
            article.publishedAt = new Date();
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                publishedAt: article.publishedAt,
            };
            await jobLog.save();
            logger_1.logger.info(`Article published successfully: ${article.title}`);
            return { success: true, publishedAt: article.publishedAt };
        }
        catch (error) {
            logger_1.logger.error('Publishing job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processImageGenerationJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing image generation job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'image-generation',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // IMAGE GENERATION DISABLED: Skip AI image generation
            logger_1.logger.info('Image generation disabled - skipping AI image creation');
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                imagesGenerated: 0,
                note: 'Image generation disabled',
            };
            await jobLog.save();
            logger_1.logger.info(`Image generation job completed (DISABLED) for article: ${article.title}`);
            return { success: true, imagesGenerated: 0 };
        }
        catch (error) {
            logger_1.logger.error('Image generation job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processFactCheckJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing fact-check job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'fact-check',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // FACT-CHECK DISABLED: Skip AI fact-checking
            article.factCheck = {
                isReliable: true,
                confidence: 0,
                issues: [],
                suggestions: [],
                checkedAt: new Date(),
                note: 'Fact-checking disabled'
            };
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                isReliable: true,
                confidence: 0,
                issuesFound: 0,
                note: 'Fact-checking disabled',
            };
            await jobLog.save();
            logger_1.logger.info(`Fact-check job completed (DISABLED) for article: ${article.title}`);
            return { success: true, isReliable: true, confidence: 0, issues: [], suggestions: [] };
        }
        catch (error) {
            logger_1.logger.error('Fact-check job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processSocialMediaJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing social media job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'social-media',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                    platforms: job.data.platforms || ['twitter', 'linkedin', 'facebook'],
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // SOCIAL MEDIA DISABLED: Skip AI social media post generation
            const platforms = job.data.platforms || ['twitter', 'linkedin', 'facebook'];
            const socialPosts = {};
            // Create simple fallback posts without AI
            platforms.forEach((platform) => {
                socialPosts[platform] = `Read: ${article.title}`;
            });
            // Update article with simple social media posts
            article.socialMedia = {
                posts: socialPosts,
                generatedAt: new Date(),
                note: 'Social media generation disabled'
            };
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                platforms: Object.keys(socialPosts),
                postsGenerated: Object.keys(socialPosts).length,
                note: 'Social media generation disabled',
            };
            await jobLog.save();
            logger_1.logger.info(`Social media job completed (DISABLED) for article: ${article.title}`);
            return { success: true, posts: socialPosts };
        }
        catch (error) {
            logger_1.logger.error('Social media job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processTranslationJob(job) {
        const startTime = new Date();
        let jobLog;
        try {
            logger_1.logger.info(`Processing translation job: ${job.id}`);
            // Create job log
            jobLog = new models_1.JobLog({
                jobType: 'translation',
                status: 'running',
                startTime,
                meta: {
                    jobId: job.id,
                    articleId: job.data.articleId,
                    targetLanguage: job.data.targetLanguage,
                },
            });
            await jobLog.save();
            // Get article
            const article = await models_1.Article.findById(job.data.articleId);
            if (!article) {
                throw new Error('Article not found');
            }
            // TRANSLATION DISABLED: Skip AI translation
            const translatedArticle = {
                title: `${article.title} (${job.data.targetLanguage})`,
                content: article.content, // Keep original content
                summary: this.generateSummary(article.content),
                originalArticleId: article._id,
                language: job.data.targetLanguage,
                translationConfidence: 0,
                translatedAt: new Date(),
                note: 'Translation disabled - original content preserved'
            };
            // Save translated article (you might want to create a separate model for translations)
            // For now, we'll store it in the original article's translations array
            if (!article.translations) {
                article.translations = [];
            }
            article.translations.push(translatedArticle);
            await article.save();
            // Update job log
            jobLog.status = 'completed';
            jobLog.endTime = new Date();
            jobLog.meta = {
                ...jobLog.meta,
                targetLanguage: job.data.targetLanguage,
                confidence: 0,
                note: 'Translation disabled',
            };
            await jobLog.save();
            logger_1.logger.info(`Translation job completed (DISABLED) for article: ${article.title} to ${job.data.targetLanguage}`);
            return { success: true, translated: article.content, confidence: 0 };
        }
        catch (error) {
            logger_1.logger.error('Translation job error:', error);
            // Update job log with error
            if (jobLog) {
                jobLog.status = 'failed';
                jobLog.endTime = new Date();
                jobLog.meta = {
                    ...jobLog.meta,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                await jobLog.save();
            }
            throw error;
        }
    }
    async processScrapedArticle(scrapedArticle, source) {
        try {
            // Calculate word count and reading time
            const wordCount = scrapedArticle.content.split(/\s+/).filter(word => word.length > 0).length;
            const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
            // Create article with new schema
            const article = new models_1.Article({
                title: scrapedArticle.title,
                summary: scrapedArticle.summary,
                content: scrapedArticle.content,
                images: scrapedArticle.images,
                category: scrapedArticle.category,
                categories: scrapedArticle.categories || [], // New field
                tags: scrapedArticle.tags,
                author: scrapedArticle.author,
                language: scrapedArticle.lang || 'en', // Updated field name
                source: {
                    name: source.name,
                    url: source.url,
                    sourceId: source._id
                },
                status: 'scraped', // Updated status
                publishedAt: scrapedArticle.publishedAt,
                scrapedAt: new Date(),
                canonicalUrl: scrapedArticle.canonicalUrl || scrapedArticle.url,
                thumbnail: scrapedArticle.thumbnail,
                wordCount: wordCount,
                readingTime: readingTime,
                languageConfidence: scrapedArticle.languageConfidence,
                originalHtml: scrapedArticle.originalHtml,
                rawText: scrapedArticle.rawText,
                hash: scrapedArticle.hash,
            });
            await article.save();
            // Queue AI rewriting job (now disabled)
            // This will be handled by the job queue system
            logger_1.logger.info(`Created article: ${article.title} (status: ${article.status})`);
            return article;
        }
        catch (error) {
            logger_1.logger.error('Process scraped article error:', error);
            throw error;
        }
    }
    generateSummary(content) {
        // Simple extractive summarization
        const sentences = content.split('.').filter(s => s.trim().length > 0);
        if (sentences.length <= 2) {
            return content;
        }
        // Return first two sentences as summary
        return sentences.slice(0, 2).join('. ') + '.';
    }
}
exports.JobProcessor = JobProcessor;
//# sourceMappingURL=job.processor.js.map