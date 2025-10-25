import { mongoose } from "../lib/mongoose";
import { Document } from "mongoose";
export interface IArticle extends Document {
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
        generated?: boolean;
    }>;
    category: mongoose.Types.ObjectId;
    categories: string[];
    categoryDetected?: string;
    tags: string[];
    author?: string;
    language: string;
    source: {
        name: string;
        url: string;
        sourceId: mongoose.Types.ObjectId;
    };
    status: 'scraped' | 'pending' | 'processed' | 'published' | 'rejected' | 'needs_review';
    publishedAt: Date;
    scrapedAt: Date;
    canonicalUrl: string;
    thumbnail?: string;
    wordCount: number;
    readingTime: number;
    languageConfidence?: number;
    originalHtml?: string;
    rawText?: string;
    seo: {
        metaDescription: string;
        keywords: string[];
    };
    factCheck?: {
        isReliable: boolean;
        confidence: number;
        issues: string[];
        suggestions: string[];
        checkedAt: Date;
        note?: string;
    };
    socialMedia?: {
        posts: {
            [platform: string]: string;
        };
        generatedAt: Date;
        note?: string;
    };
    translations?: Array<{
        title: string;
        content: string;
        summary: string;
        language: string;
        translationConfidence: number;
        translatedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    viewCount: number;
    hash: string;
}
export declare const Article: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, {}> & IArticle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Article.d.ts.map