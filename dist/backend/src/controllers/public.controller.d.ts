import { Request, Response } from 'express';
export declare class PublicController {
    private articleService;
    private categoryService;
    private tickerService;
    constructor();
    getHealth: (req: Request, res: Response) => Promise<void>;
    getArticles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getArticleBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getArticleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCategories: (req: Request, res: Response) => Promise<void>;
    getTrending: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getActiveTickers: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=public.controller.d.ts.map