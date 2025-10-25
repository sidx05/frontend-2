"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingSchema = exports.getArticlesSchema = exports.updateTickerSchema = exports.createTickerSchema = exports.updateSourceSchema = exports.createSourceSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.updateArticleSchema = exports.createArticleSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// User validation schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['reader', 'editor', 'admin']).optional().default('reader'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Article validation schemas
exports.createArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    summary: zod_1.z.string().min(1, 'Summary is required').max(300, 'Summary must be less than 300 characters'),
    content: zod_1.z.string().min(1, 'Content is required'),
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL')).optional().default([]),
    category: zod_1.z.string().min(1, 'Category is required'),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    author: zod_1.z.string().min(1, 'Author is required'),
    lang: zod_1.z.string().min(1, 'Language is required').default('en'),
    sourceId: zod_1.z.string().min(1, 'Source ID is required'),
    seo: zod_1.z.object({
        metaDescription: zod_1.z.string().max(160, 'Meta description must be less than 160 characters').optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional().default([]),
    }).optional(),
});
exports.updateArticleSchema = exports.createArticleSchema.partial();
// Category validation schemas
exports.createCategorySchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Key is required').regex(/^[a-z0-9-]+$/, 'Key must contain only lowercase letters, numbers, and hyphens'),
    label: zod_1.z.string().min(1, 'Label is required'),
    icon: zod_1.z.string().min(1, 'Icon is required').default('newspaper'),
    color: zod_1.z.string().min(1, 'Color is required').default('#6366f1'),
    parent: zod_1.z.string().optional(),
    order: zod_1.z.number().min(0, 'Order must be a positive number').default(0),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
// Source validation schemas
exports.createSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    url: zod_1.z.string().url('Invalid URL'),
    rssUrls: zod_1.z.array(zod_1.z.string().url('Invalid RSS URL')).min(1, 'At least one RSS URL is required'),
    lang: zod_1.z.string().min(1, 'Language is required').default('en'),
    categories: zod_1.z.array(zod_1.z.string()).optional().default([]),
    active: zod_1.z.boolean().default(true),
});
exports.updateSourceSchema = exports.createSourceSchema.partial();
// Ticker validation schemas
exports.createTickerSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text is required').max(200, 'Text must be less than 200 characters'),
    priority: zod_1.z.number().min(1, 'Priority must be at least 1').max(10, 'Priority must be at most 10').default(1),
    expiry: zod_1.z.string().datetime('Invalid expiry date'),
});
exports.updateTickerSchema = exports.createTickerSchema.partial();
// Query validation schemas
exports.getArticlesSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    lang: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['latest', 'popular', 'trending']).optional().default('latest'),
    page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
    limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('10'),
});
exports.getTrendingSchema = zod_1.z.object({
    limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('10'),
});
//# sourceMappingURL=validation.js.map