import { Request, Response, NextFunction } from 'express';
/**
 * Authenticate incoming requests.
 * - If JWT_SECRET is set, expect a Bearer token and verify it.
 * - Otherwise, accept a simple ADMIN_TOKEN API key in the Authorization header.
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
/**
 * Authorize by roles. Usage: authorize(['admin','editor'])
 */
export declare function authorize(allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
declare const _default: {
    authenticate: typeof authenticate;
    authorize: typeof authorize;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map