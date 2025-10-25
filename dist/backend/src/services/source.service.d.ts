export declare class SourceService {
    getSources(filters?: any): Promise<(import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getSourceById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    createSource(data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateSource(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteSource(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getActiveSources(): Promise<(import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    updateLastScraped(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Source").ISource, {}, {}> & import("../models/Source").ISource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
//# sourceMappingURL=source.service.d.ts.map