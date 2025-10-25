"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const public_routes_1 = __importDefault(require("./public.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
/**
 * Mount application routes in one place.
 * - /api -> public REST endpoints
 * - /admin -> admin UI / APIs
 */
function setupRoutes(app) {
    // public API under /api
    app.use("/api", public_routes_1.default);
    // admin routes
    app.use("/admin", admin_routes_1.default);
}
//# sourceMappingURL=index.js.map