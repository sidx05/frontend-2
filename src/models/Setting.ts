// src/models/Setting.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  categoryDisplay: {
    articlesPerCategory: number;
    categoriesPerLanguage: number;
    showCategoryCounts: boolean;
    showCategoryDescriptions: boolean;
  };
  homepage: {
    featuredArticlesCount: number;
    latestArticlesCount: number;
    trendingTopicsCount: number;
    languageSectionsCount: number;
  };
  scraping: {
    defaultLanguage: string;
    enableAutoScraping: boolean;
    scrapingInterval: string;
    maxArticlesPerSource: number;
  };
  display: {
    showReadingTime: boolean;
    showWordCount: boolean;
    showSourceInfo: boolean;
    showPublishDate: boolean;
    showLanguage: boolean;
  };
  perLanguageViewAllLimit: {
    en?: number;
    hi?: number;
    te?: number;
    ta?: number;
    mr?: number;
    gu?: number;
    bn?: number;
    [key: string]: number | undefined;
  };
}

const SettingsSchema = new Schema<ISettings>({
  categoryDisplay: {
    articlesPerCategory: { type: Number, default: 6 },
    categoriesPerLanguage: { type: Number, default: 4 },
    showCategoryCounts: { type: Boolean, default: true },
    showCategoryDescriptions: { type: Boolean, default: false }
  },
  homepage: {
    featuredArticlesCount: { type: Number, default: 3 },
    latestArticlesCount: { type: Number, default: 4 },
    trendingTopicsCount: { type: Number, default: 6 },
    languageSectionsCount: { type: Number, default: 4 }
  },
  scraping: {
    defaultLanguage: { type: String, default: 'en' },
    enableAutoScraping: { type: Boolean, default: true },
    scrapingInterval: { type: String, default: '*/10 * * * *' },
    maxArticlesPerSource: { type: Number, default: 50 }
  },
  display: {
    showReadingTime: { type: Boolean, default: true },
    showWordCount: { type: Boolean, default: true },
    showSourceInfo: { type: Boolean, default: true },
    showPublishDate: { type: Boolean, default: true },
    showLanguage: { type: Boolean, default: true }
  },
  perLanguageViewAllLimit: {
    type: Map,
    of: Number,
    default: {
      en: 12,
      hi: 12,
      te: 12,
      ta: 12,
      mr: 12,
      gu: 12,
      bn: 12
    }
  }
}, { timestamps: true });

const Setting = mongoose.models.Setting || mongoose.model<ISettings>('Setting', SettingsSchema);

export { Setting };


