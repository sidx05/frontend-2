export declare class TickerService {
    getActiveTickers(): Promise<any>;
    createTicker(data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Ticker").ITicker, {}, {}> & import("../models/Ticker").ITicker & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateTicker(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Ticker").ITicker, {}, {}> & import("../models/Ticker").ITicker & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteTicker(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Ticker").ITicker, {}, {}> & import("../models/Ticker").ITicker & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    cleanupExpiredTickers(): Promise<number>;
    private clearTickersCache;
}
//# sourceMappingURL=ticker.service.d.ts.map