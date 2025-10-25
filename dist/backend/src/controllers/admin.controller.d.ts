import { Request, Response } from 'express';
export declare class AdminController {
    private scrapingService;
    private articleService;
    private sourceService;
    private categoryService;
    constructor();
    createArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getArticles: (req: Request, res: Response) => Promise<void>;
    updateArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    publishArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createSource: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateSource: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getSources: (req: Request, res: Response) => Promise<void>;
    createCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    triggerScrape(req: any, res: any): Promise<any>;
}
//# sourceMappingURL=admin.controller.d.ts.map