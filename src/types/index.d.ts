declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
      role: string;
    }

    // Extend Request type
    interface Request {
      user?: UserPayload;
    }
  }
}
