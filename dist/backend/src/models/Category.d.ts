import { Document } from 'mongoose';
import { mongoose } from "../lib/mongoose";
export interface ICategory extends Document {
    key: string;
    label: string;
    icon: string;
    color: string;
    parent?: mongoose.Types.ObjectId;
    order: number;
    active?: boolean;
    language?: string;
    isDynamic?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Category.d.ts.map