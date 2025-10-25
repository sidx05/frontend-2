import { Document } from 'mongoose';
import { mongoose } from "../lib/mongoose";
export interface ISource extends Document {
    name: string;
    url: string;
    rssUrls: string[];
    lang: string;
    categories: mongoose.Types.ObjectId[];
    active: boolean;
    lastScraped?: Date;
    createdAt: Date;
    updatedAt: Date;
    type: 'rss' | 'api';
}
export declare const Source: mongoose.Model<ISource, {}, {}, {}, Document<unknown, {}, ISource, {}, {}> & ISource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Source.d.ts.map