import { mongoose } from "../lib/mongoose";
import { Document } from "mongoose";
export interface IBrandWire extends Document {
    title: string;
    slug: string;
    summary: string;
    content: string;
    images: Array<{
        url: string;
        alt: string;
        caption?: string;
        width?: number;
        height?: number;
    }>;
    category: string;
    tags: string[];
    author: string;
    language: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    priority: number;
    publishedAt: Date;
    expiresAt?: Date;
    seo: {
        metaDescription: string;
        keywords: string[];
    };
    socialMedia?: {
        posts: {
            [platform: string]: string;
        };
        generatedAt: Date;
    };
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BrandWire: mongoose.Model<IBrandWire, {}, {}, {}, mongoose.Document<unknown, {}, IBrandWire, {}, {}> & IBrandWire & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=BrandWire.d.ts.map