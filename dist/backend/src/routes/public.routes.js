"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/public.routes.ts
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
const publicController = new public_controller_1.PublicController();
// Keep the same paths you used in the controller
router.get("/health", publicController.getHealth);
// Articles - using different paths to avoid conflicts
router.get("/public/articles", publicController.getArticles);
router.get("/public/articles/:slug", publicController.getArticleBySlug);
router.get("/public/article/:id", publicController.getArticleById);
// Also support the singular form that frontend expects
router.get("/article/:id", publicController.getArticleById);
// Categories
router.get("/categories", publicController.getCategories);
// Trending
router.get("/trending", publicController.getTrending);
// Tickers
router.get("/ticker/active", publicController.getActiveTickers);
exports.default = router;
//# sourceMappingURL=public.routes.js.map