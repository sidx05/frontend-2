import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["reader", "editor", "admin"]>>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "reader" | "editor" | "admin";
}, {
    email: string;
    password: string;
    role?: "reader" | "editor" | "admin" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createArticleSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    content: z.ZodString;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    category: z.ZodString;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    author: z.ZodString;
    lang: z.ZodDefault<z.ZodString>;
    sourceId: z.ZodString;
    seo: z.ZodOptional<z.ZodObject<{
        metaDescription: z.ZodOptional<z.ZodString>;
        keywords: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        keywords: string[];
        metaDescription?: string | undefined;
    }, {
        metaDescription?: string | undefined;
        keywords?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    lang: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    images: string[];
    tags: string[];
    author: string;
    sourceId: string;
    seo?: {
        keywords: string[];
        metaDescription?: string | undefined;
    } | undefined;
}, {
    title: string;
    summary: string;
    content: string;
    category: string;
    author: string;
    sourceId: string;
    lang?: string | undefined;
    images?: string[] | undefined;
    tags?: string[] | undefined;
    seo?: {
        metaDescription?: string | undefined;
        keywords?: string[] | undefined;
    } | undefined;
}>;
export declare const updateArticleSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    author: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    sourceId: z.ZodOptional<z.ZodString>;
    seo: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        metaDescription: z.ZodOptional<z.ZodString>;
        keywords: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        keywords: string[];
        metaDescription?: string | undefined;
    }, {
        metaDescription?: string | undefined;
        keywords?: string[] | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    lang?: string | undefined;
    title?: string | undefined;
    summary?: string | undefined;
    content?: string | undefined;
    category?: string | undefined;
    images?: string[] | undefined;
    tags?: string[] | undefined;
    author?: string | undefined;
    seo?: {
        keywords: string[];
        metaDescription?: string | undefined;
    } | undefined;
    sourceId?: string | undefined;
}, {
    lang?: string | undefined;
    title?: string | undefined;
    summary?: string | undefined;
    content?: string | undefined;
    category?: string | undefined;
    images?: string[] | undefined;
    tags?: string[] | undefined;
    author?: string | undefined;
    seo?: {
        metaDescription?: string | undefined;
        keywords?: string[] | undefined;
    } | undefined;
    sourceId?: string | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    icon: z.ZodDefault<z.ZodString>;
    color: z.ZodDefault<z.ZodString>;
    parent: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    key: string;
    label: string;
    icon: string;
    color: string;
    order: number;
    parent?: string | undefined;
}, {
    key: string;
    label: string;
    icon?: string | undefined;
    color?: string | undefined;
    parent?: string | undefined;
    order?: number | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    color: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    parent: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    key?: string | undefined;
    label?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parent?: string | undefined;
    order?: number | undefined;
}, {
    key?: string | undefined;
    label?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parent?: string | undefined;
    order?: number | undefined;
}>;
export declare const createSourceSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    rssUrls: z.ZodArray<z.ZodString, "many">;
    lang: z.ZodDefault<z.ZodString>;
    categories: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    rssUrls: string[];
    active: boolean;
    categories: string[];
    lang: string;
}, {
    name: string;
    url: string;
    rssUrls: string[];
    active?: boolean | undefined;
    categories?: string[] | undefined;
    lang?: string | undefined;
}>;
export declare const updateSourceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    rssUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lang: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    categories: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    url?: string | undefined;
    rssUrls?: string[] | undefined;
    active?: boolean | undefined;
    categories?: string[] | undefined;
    lang?: string | undefined;
}, {
    name?: string | undefined;
    url?: string | undefined;
    rssUrls?: string[] | undefined;
    active?: boolean | undefined;
    categories?: string[] | undefined;
    lang?: string | undefined;
}>;
export declare const createTickerSchema: z.ZodObject<{
    text: z.ZodString;
    priority: z.ZodDefault<z.ZodNumber>;
    expiry: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    priority: number;
    expiry: string;
}, {
    text: string;
    expiry: string;
    priority?: number | undefined;
}>;
export declare const updateTickerSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    expiry: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    priority?: number | undefined;
    expiry?: string | undefined;
}, {
    text?: string | undefined;
    priority?: number | undefined;
    expiry?: string | undefined;
}>;
export declare const getArticlesSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<["latest", "popular", "trending"]>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    sort: "latest" | "popular" | "trending";
    limit: string;
    page: string;
    search?: string | undefined;
    lang?: string | undefined;
    category?: string | undefined;
}, {
    search?: string | undefined;
    lang?: string | undefined;
    category?: string | undefined;
    sort?: "latest" | "popular" | "trending" | undefined;
    limit?: string | undefined;
    page?: string | undefined;
}>;
export declare const getTrendingSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    limit: string;
}, {
    limit?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
export type CreateTickerInput = z.infer<typeof createTickerSchema>;
export type UpdateTickerInput = z.infer<typeof updateTickerSchema>;
export type GetArticlesQuery = z.infer<typeof getArticlesSchema>;
export type GetTrendingQuery = z.infer<typeof getTrendingSchema>;
//# sourceMappingURL=validation.d.ts.map