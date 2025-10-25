// backend/src/routes/index.ts
import { Express } from "express";
import publicRoutes from "./public.routes";
import adminRoutes from "./admin.routes";

/**
 * Mount application routes in one place.
 * - /api -> public REST endpoints
 * - /admin -> admin UI / APIs
 */
export function setupRoutes(app: Express) {
  // public API under /api
  app.use("/api", publicRoutes);

  // admin routes
  app.use("/admin", adminRoutes);
}
