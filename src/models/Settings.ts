import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  enableRegistration: boolean;
  enableComments: boolean;
  enableNotifications: boolean;
  maxArticlesPerPage: number;
  cacheTimeout: number;
  maintenanceMode: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: 'NewsHub' },
  siteDescription: { type: String, default: 'Your trusted source for news' },
  siteUrl: { type: String, default: 'http://localhost:3000' },
  adminEmail: { type: String, default: 'admin@newshub.com' },
  enableRegistration: { type: Boolean, default: false },
  enableComments: { type: Boolean, default: true },
  enableNotifications: { type: Boolean, default: true },
  maxArticlesPerPage: { type: Number, default: 20 },
  cacheTimeout: { type: Number, default: 3600 },
  maintenanceMode: { type: Boolean, default: false },
  seoTitle: { type: String, default: 'NewsHub - Latest News' },
  seoDescription: { type: String, default: 'Stay updated with the latest news from around the world' },
  seoKeywords: { type: String, default: 'news, latest, updates, world news, breaking news' }
}, {
  timestamps: true
});

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
