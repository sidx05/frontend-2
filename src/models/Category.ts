// src/models/Category.ts
import { Document, Schema } from 'mongoose';
import mongoose from 'mongoose';

export interface ICategory extends Document {
  key: string;
  label: string;
  icon: string;
  color: string;
  parent?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      default: 'newspaper',
    },
    color: {
      type: String,
      required: true,
      default: '#6366f1',
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

// Create indexes (avoid duplicate declaration if model is reused)
try {
  categorySchema.index({ parent: 1 });
  categorySchema.index({ order: 1 });
} catch {}

// Use existing connection or create new one
const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export { Category };
