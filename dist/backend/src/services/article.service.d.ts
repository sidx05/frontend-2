import { GetArticlesQuery, GetTrendingQuery } from '../utils/validation';
export declare class ArticleService {
    getArticles(query: GetArticlesQuery): Promise<{
        articles: (import("mongoose").Document<unknown, {}, import("../models/Article").IArticle, {}, {}> & import("../models/Article").IArticle & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getArticleBySlug(slug: string): Promise<any>;
    getArticleById(id: string): Promise<any>;
    getTrending(query: GetTrendingQuery): Promise<any>;
    createArticle(data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Article").IArticle, {}, {}> & import("../models/Article").IArticle & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateArticle(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Article").IArticle, {}, {}> & import("../models/Article").IArticle & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    publishArticle(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Article").IArticle, {}, {}> & import("../models/Article").IArticle & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private clearArticleCaches;
}
//# sourceMappingURL=article.service.d.ts.map