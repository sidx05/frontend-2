import { Job } from 'bullmq';
export declare class JobProcessor {
    private scrapingService;
    constructor();
    processScrapingJob(job: Job): Promise<{
        success: boolean;
        totalArticles: number;
        successfulArticles: number;
    }>;
    processAIRewritingJob(job: Job): Promise<{
        success: boolean;
    }>;
    processPlagiarismJob(job: Job): Promise<{
        success: boolean;
    }>;
    processModerationJob(job: Job): Promise<{
        success: boolean;
        approved: boolean;
        reason: string;
    }>;
    processPublishingJob(job: Job): Promise<{
        success: boolean;
        publishedAt: Date;
    }>;
    processImageGenerationJob(job: Job): Promise<{
        success: boolean;
        imagesGenerated: number;
    }>;
    processFactCheckJob(job: Job): Promise<{
        success: boolean;
        isReliable: boolean;
        confidence: number;
        issues: never[];
        suggestions: never[];
    }>;
    processSocialMediaJob(job: Job): Promise<{
        success: boolean;
        posts: {
            [platform: string]: string;
        };
    }>;
    processTranslationJob(job: Job): Promise<{
        success: boolean;
        translated: string;
        confidence: number;
    }>;
    private processScrapedArticle;
    private generateSummary;
}
//# sourceMappingURL=job.processor.d.ts.map