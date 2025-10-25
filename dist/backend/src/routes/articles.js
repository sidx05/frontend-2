"use strict";
// backend/src/routes/articles.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Article_1 = require("../models/Article");
const Category_1 = require("../models/Category");
const router = (0, express_1.Router)();
/**
 * GET /api/articles
 * → Fetch all published articles (optionally filter by category, search, limit)
 * Query params:
 *    ?category=slug
 *    ?search=keyword
 *    ?limit=20
 */
router.get("/", async (req, res) => {
    try {
        const { category, search, limit } = req.query;
        const query = { status: "published" };
        // Optional: filter by category slug
        if (category) {
            const cat = await Category_1.Category.findOne({ key: category });
            if (cat)
                query.category = cat._id;
        }
        // Optional: text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ];
        }
        const articles = await Article_1.Article.find(query)
            .populate("category", "key label icon color")
            .populate("source.sourceId", "name")
            .sort({ publishedAt: -1 })
            .limit(limit ? parseInt(limit, 10) : 50);
        res.json({ success: true, data: articles });
    }
    catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).json({ success: false, error: "Failed to fetch articles" });
    }
});
/**
 * GET /api/articles/:id
 * → Fetch single article by ID
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article_1.Article.findOne({ _id: id })
            .populate("category", "key label icon color")
            .populate("source.sourceId", "name");
        if (!article) {
            return res.status(404).json({ success: false, error: "Article not found" });
        }
        res.json({ success: true, data: article });
    }
    catch (err) {
        console.error("Error fetching article:", err);
        res.status(500).json({ success: false, error: "Failed to fetch article" });
    }
});
exports.default = router;
//# sourceMappingURL=articles.js.map