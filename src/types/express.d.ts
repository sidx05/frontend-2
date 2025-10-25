// backend/src/types/express.d.ts

export {}; // <-- makes this file a module so the global augmentation is picked up

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;  // you use req.user.userId in controllers
        email?: string;
        role?: string;
      };
    }
  }
}
