#!/usr/bin/env ts-node

/**
 * Migration script to update Article schema for multilingual support
 * 
 * This script will:
 * 1. Add new fields to existing articles
 * 2. Migrate data from old fields to new fields
 * 3. Create new indexes
 * 4. Handle backward compatibility
 */

import { connectDB } from '../src/config/database';
import { Article } from '../src/models/Article';
import { Source } from '../src/models/Source';
import { logger } from '../src/utils/logger';

interface LegacyArticle {
  _id: any;
  title: string;
  lang?: string;
  sourceId: any;
  author?: string;
  publishedAt?: Date;
  content: string;
  [key: string]: any;
}

async function migrateArticleSchema() {
  try {
    logger.info('🚀 Starting Article schema migration...');
    
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database');

    // Get all existing articles
    const articles = await Article.find({});
    logger.info(`📊 Found ${articles.length} articles to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        const updateData: any = {};

        // Migrate lang to language
        if (article.lang && !article.language) {
          updateData.language = article.lang;
        }

        // Set default language if not present
        if (!article.language) {
          updateData.language = 'en';
        }

        // Migrate sourceId to source object
        if (article.sourceId && !article.source) {
          const source = await Source.findById(article.sourceId);
          if (source) {
            updateData.source = {
              name: source.name,
              url: source.url,
              sourceId: source._id
            };
          }
        }

        // Set scrapedAt if not present
        if (!article.scrapedAt) {
          updateData.scrapedAt = article.createdAt || new Date();
        }

        // Set canonicalUrl if not present (use hash as fallback)
        if (!article.canonicalUrl) {
          updateData.canonicalUrl = `https://example.com/article/${article.hash}`;
        }

        // Calculate word count and reading time
        if (!article.wordCount) {
          const wordCount = article.content.split(/\s+/).filter((word: string) => word.length > 0).length;
          updateData.wordCount = wordCount;
          updateData.readingTime = Math.ceil(wordCount / 200);
        }

        // Set default categories if not present
        if (!article.categories || article.categories.length === 0) {
          updateData.categories = ['general'];
        }

        // Set default status if not present
        if (!article.status) {
          updateData.status = 'scraped';
        }

        // Set publishedAt if not present
        if (!article.publishedAt) {
          updateData.publishedAt = article.createdAt || new Date();
        }

        // Update the article if there are changes
        if (Object.keys(updateData).length > 0) {
          await Article.findByIdAndUpdate(article._id, updateData);
          migratedCount++;
          
          if (migratedCount % 100 === 0) {
            logger.info(`📝 Migrated ${migratedCount} articles...`);
          }
        }

      } catch (error) {
        logger.error(`❌ Error migrating article ${article._id}:`, error);
        errorCount++;
      }
    }

    logger.info(`✅ Migration completed!`);
    logger.info(`📊 Successfully migrated: ${migratedCount} articles`);
    logger.info(`❌ Errors: ${errorCount} articles`);

    // Create new indexes
    logger.info('🔧 Creating new indexes...');
    
    try {
      // These indexes will be created automatically by Mongoose
      // but we can verify they exist
      const indexes = await Article.collection.getIndexes();
      logger.info('📋 Current indexes:', Object.keys(indexes));
    } catch (error) {
      logger.error('❌ Error checking indexes:', error);
    }

    logger.info('🎉 Migration script completed successfully!');

  } catch (error) {
    logger.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateArticleSchema();
}

export { migrateArticleSchema };
