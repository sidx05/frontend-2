"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/categories.ts
const express_1 = require("express");
const Category_1 = require("../models/Category");
const Article_1 = require("../models/Article");
const router = (0, express_1.Router)();
/**
 * GET /api/categories
 * → List all categories
 */
router.get("/", async (_req, res) => {
    try {
        const categories = await Category_1.Category.find({})
            .sort({ order: 1 })
            .select("_id key label icon color order parent");
        res.json({ success: true, data: categories });
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
});
/**
 * GET /api/categories/:slug
 * → Fetch all articles for a category by slug (key)
 */
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category_1.Category.findOne({ key: slug }).select("_id key label icon color order parent");
        if (!category) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }
        const articles = await Article_1.Article.find({
            $or: [
                { category: category._id },
                { categories: category._id },
            ],
            status: "published",
        })
            .populate("category", "key label icon color")
            .populate("categories", "key label icon color")
            .populate("sourceId", "name")
            .sort({ publishedAt: -1 });
        res.json({ success: true, category, articles });
    }
    catch (err) {
        console.error("Error fetching category articles:", err);
        res.status(500).json({ success: false, error: "Failed to fetch category articles" });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map