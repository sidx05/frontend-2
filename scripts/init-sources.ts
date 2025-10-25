#!/usr/bin/env ts-node

/**
 * Script to initialize sources from configuration files
 * 
 * This script will:
 * 1. Load source configurations from JSON files
 * 2. Create/update sources in the database
 * 3. Validate configurations
 * 4. Provide summary of sources
 */

import { connectDB } from '../src/config/database';
import { SourceConfigService } from '../src/services/source-config.service';
import { logger } from '../src/utils/logger';

async function initializeSources() {
  try {
    logger.info('🚀 Starting source initialization...');
    
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database');

    // Initialize source config service
    const sourceConfigService = new SourceConfigService();
    logger.info('✅ Source configuration service initialized');

    // Validate configuration
    logger.info('🔍 Validating source configuration...');
    const validation = sourceConfigService.validateConfiguration();
    
    if (!validation.isValid) {
      logger.error('❌ Configuration validation failed:');
      validation.errors.forEach(error => logger.error(`  - ${error}`));
      process.exit(1);
    }
    
    logger.info('✅ Configuration validation passed');

    // Get configuration summary
    const summary = sourceConfigService.getConfigurationSummary();
    logger.info('📊 Configuration Summary:');
    logger.info(`  Total Languages: ${summary.totalLanguages}`);
    logger.info(`  Total Sources: ${summary.totalSources}`);
    logger.info(`  Active Sources: ${summary.activeSources}`);
    
    logger.info('📋 Languages:');
    for (const [language, data] of Object.entries(summary.languages)) {
      logger.info(`  ${language}: ${data.activeSources}/${data.totalSources} active sources across ${data.categories} categories`);
    }

    // Sync with database
    await sourceConfigService.syncWithDatabase();

    // Display sources that will be scraped
    const sourcesToScrape = sourceConfigService.getSourcesToScrape();
    logger.info(`🎯 Sources ready for scraping: ${sourcesToScrape.length}`);
    
    if (sourcesToScrape.length > 0) {
      logger.info('📝 Sources to scrape:');
      sourcesToScrape.forEach(source => {
        logger.info(`  - ${source.name} (${source.language}/${source.categories.join(',')}) - ${source.type}`);
      });
    }

    logger.info('🎉 Source initialization completed successfully!');

  } catch (error) {
    logger.error('💥 Source initialization failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeSources();
}

export { initializeSources };
