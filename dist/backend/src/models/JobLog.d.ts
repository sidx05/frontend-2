import mongoose, { Document } from 'mongoose';
export interface IJobLog extends Document {
    jobType: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    meta: {
        sourceId?: string;
        articleId?: string;
        error?: string;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const JobLog: mongoose.Model<IJobLog, {}, {}, {}, mongoose.Document<unknown, {}, IJobLog, {}, {}> & IJobLog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=JobLog.d.ts.map