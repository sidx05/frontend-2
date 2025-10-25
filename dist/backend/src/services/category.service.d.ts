export declare class CategoryService {
    getCategories(): Promise<any>;
    getCategoryByKey(key: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, {}> & import("../models/Category").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    createCategory(data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, {}> & import("../models/Category").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateCategory(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, {}> & import("../models/Category").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteCategory(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, {}> & import("../models/Category").ICategory & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private clearCategoriesCache;
}
//# sourceMappingURL=category.service.d.ts.map