// backend/src/routes/public.routes.ts
import { Router } from "express";
import { PublicController } from "../controllers/public.controller";

const router = Router();
const publicController = new PublicController();

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

export default router;
