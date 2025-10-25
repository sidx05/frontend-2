"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
// All admin routes require authentication and admin/editor role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['admin', 'editor']));
// Article management
router.post('/articles', adminController.createArticle);
router.patch('/articles/:id', adminController.updateArticle);
router.post('/articles/:id/publish', adminController.publishArticle);
router.get('/articles', adminController.getArticles);
// Source management
router.post('/sources', adminController.createSource);
router.patch('/sources/:id', adminController.updateSource);
router.get('/sources', adminController.getSources);
// Category management
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
// Ingest management
router.post("/scrape", adminController.triggerScrape.bind(adminController));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map