// src/models/Article.ts
import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

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
  categories: string[]; // Array of category strings like ["politics", "movies", "business"]
  tags: string[];
  author?: string; // Made optional
  language: string; // ISO language code (e.g., "hi", "te", "en", "ta")
  source: {
    name: string;
    url: string;
    sourceId: mongoose.Types.ObjectId;
  };
  status: 'scraped' | 'pending' | 'processed' | 'published' | 'rejected' | 'needs_review';
  publishedAt: Date; // Original publish time from source
  scrapedAt: Date; // When we scraped this article
  canonicalUrl: string; // For deduplication
  thumbnail?: string; // URL to thumbnail image
  wordCount: number;
  readingTime: number; // Estimated reading time in minutes
  languageConfidence?: number; // If language detector is used
  originalHtml?: string; // Raw HTML for debugging
  rawText?: string; // Raw text for debugging
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
    posts: { [platform: string]: string };
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

const articleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    generated: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false,  // allow missing
    default: null
  },
  categories: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: false,
    trim: true
  },
  language: {
    type: String,
    required: true,
    default: 'en',
    validate: {
      validator: function(v: string) {
        // Basic ISO language code validation (2-3 characters)
        return /^[a-z]{2,3}$/.test(v);
      },
      message: 'Language must be a valid ISO language code (2-3 characters)'
    }
  },
  source: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Source',
      required: true
    }
  },
  status: {
    type: String,
    enum: ['scraped', 'pending', 'processed', 'published', 'rejected', 'needs_review'],
    default: 'scraped'
  },
  publishedAt: {
    type: Date,
    required: true
  },
  scrapedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  canonicalUrl: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0
  },
  readingTime: {
    type: Number,
    required: true,
    min: 0
  },
  languageConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  originalHtml: {
    type: String
  },
  rawText: {
    type: String
  },
  
  seo: {
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  factCheck: {
    isReliable: {
      type: Boolean,
      default: true
    },
    confidence: {
      type: Number,
      default: 50
    },
    issues: [{
      type: String,
      trim: true
    }],
    suggestions: [{
      type: String,
      trim: true
    }],
    checkedAt: {
      type: Date,
      default: Date.now
    }
  },
  socialMedia: {
    posts: {
      type: Map,
      of: String
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  translations: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    translationConfidence: {
      type: Number,
      default: 0
    },
    translatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  hash: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Generate slug and calculate metadata before validation (so required fields are set)
articleSchema.pre('validate', function(next) {
  // Generate slug if not provided
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // Calculate word count if not provided
  if (this.isModified('content') && !this.wordCount) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // Calculate reading time if not provided (assuming 200 words per minute)
  if (this.isModified('wordCount') && !this.readingTime) {
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  // Set scrapedAt if not provided
  if (this.isNew && !this.scrapedAt) {
    this.scrapedAt = new Date();
  }
  
  // Set publishedAt when status changes to published (if not already set)
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Create indexes for performance and deduplication
articleSchema.index({ language: 1, status: 1, publishedAt: -1 });
articleSchema.index({ categories: 1, status: 1, publishedAt: -1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ canonicalUrl: 1 }, { unique: true });
articleSchema.index({ tags: 1 });
articleSchema.index({ 'source.sourceId': 1 });
articleSchema.index({ language: 1, categories: 1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ scrapedAt: -1 });
articleSchema.index({ wordCount: 1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });

// Use existing connection or create new one
const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', articleSchema);

export { Article };
