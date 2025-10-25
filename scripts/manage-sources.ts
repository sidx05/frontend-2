#!/usr/bin/env ts-node

/**
 * CLI script to manage source configurations
 * 
 * Usage:
 *   npx ts-node scripts/manage-sources.ts init          # Initialize sources from config
 *   npx ts-node scripts/manage-sources.ts list          # List all sources
 *   npx ts-node scripts/manage-sources.ts validate      # Validate configuration
 *   npx ts-node scripts/manage-sources.ts scrape <lang> # Scrape specific language
 *   npx ts-node scripts/manage-sources.ts summary       # Show configuration summary
 */

import { connectDB } from '../src/config/database';
import { SourceConfigService } from '../src/services/source-config.service';
import { EnhancedScrapingService } from '../src/services/enhanced-scraping.service';
import { logger } from '../src/utils/logger';

async function main() {
  const command = process.argv[2];
  const language = process.argv[3];

  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database');

    const sourceConfigService = new SourceConfigService();
    const scrapingService = new EnhancedScrapingService();

    switch (command) {
      case 'init':
        await initializeSources(sourceConfigService);
        break;
      
      case 'list':
        await listSources(sourceConfigService);
        break;
      
      case 'validate':
        await validateConfiguration(sourceConfigService);
        break;
      
      case 'scrape':
        if (!language) {
          logger.error('❌ Please specify a language to scrape');
          process.exit(1);
        }
        await scrapeLanguage(scrapingService, language);
        break;
      
      case 'summary':
        await showSummary(sourceConfigService);
        break;
      
      default:
        showHelp();
        break;
    }

  } catch (error) {
    logger.error('💥 Command failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function initializeSources(sourceConfigService: SourceConfigService) {
  logger.info('🚀 Initializing sources from configuration...');
  
  // Validate configuration first
  const validation = sourceConfigService.validateConfiguration();
  if (!validation.isValid) {
    logger.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => logger.error(`  - ${error}`));
    process.exit(1);
  }
  
  // Sync with database
  await sourceConfigService.syncWithDatabase();
  
  logger.info('✅ Sources initialized successfully!');
}

async function listSources(sourceConfigService: SourceConfigService) {
  logger.info('📋 Listing all configured sources...');
  
  const languages = sourceConfigService.getAvailableLanguages();
  
  for (const language of languages) {
    logger.info(`\n🌐 Language: ${language.toUpperCase()}`);
    const categories = sourceConfigService.getCategoriesForLanguage(language);
    
    for (const category of categories) {
      logger.info(`  📂 Category: ${category}`);
      const sources = sourceConfigService.getSourcesByLanguageAndCategory(language, category);
      
      sources.forEach(source => {
        const status = source.active ? '✅' : '❌';
        const type = source.type.toUpperCase();
        logger.info(`    ${status} ${source.name} (${type}) - ${source.url}`);
      });
    }
  }
}

async function validateConfiguration(sourceConfigService: SourceConfigService) {
  logger.info('🔍 Validating source configuration...');
  
  const validation = sourceConfigService.validateConfiguration();
  
  if (validation.isValid) {
    logger.info('✅ Configuration is valid!');
  } else {
    logger.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => logger.error(`  - ${error}`));
    process.exit(1);
  }
}

async function scrapeLanguage(scrapingService: EnhancedScrapingService, language: string) {
  logger.info(`🔹 Starting scraping for language: ${language}`);
  
  const articles = await scrapingService.scrapeLanguageSources(language);
  
  logger.info(`✅ Scraping completed for ${language}`);
  logger.info(`📊 Total articles scraped: ${articles.length}`);
  
  if (articles.length > 0) {
    logger.info('📝 Sample articles:');
    articles.slice(0, 3).forEach(article => {
      logger.info(`  - ${article.title} (${article.lang})`);
    });
  }
}

async function showSummary(sourceConfigService: SourceConfigService) {
  logger.info('📊 Source Configuration Summary');
  
  const summary = sourceConfigService.getConfigurationSummary();
  
  logger.info(`\n📈 Overall Statistics:`);
  logger.info(`  Total Languages: ${summary.totalLanguages}`);
  logger.info(`  Total Sources: ${summary.totalSources}`);
  logger.info(`  Active Sources: ${summary.activeSources}`);
  
  logger.info(`\n🌐 Language Breakdown:`);
  for (const [language, data] of Object.entries(summary.languages)) {
    logger.info(`  ${language.toUpperCase()}:`);
    logger.info(`    Categories: ${data.categories}`);
    logger.info(`    Total Sources: ${data.totalSources}`);
    logger.info(`    Active Sources: ${data.activeSources}`);
  }
  
  // Show sources ready for scraping
  const sourcesToScrape = sourceConfigService.getSourcesToScrape();
  logger.info(`\n🎯 Sources Ready for Scraping: ${sourcesToScrape.length}`);
  
  if (sourcesToScrape.length > 0) {
    sourcesToScrape.forEach(source => {
      logger.info(`  - ${source.name} (${source.language}/${source.categories.join(',')})`);
    });
  }
}

function showHelp() {
  logger.info('📖 Source Management CLI');
  logger.info('\nUsage: npx ts-node scripts/manage-sources.ts <command> [options]');
  logger.info('\nCommands:');
  logger.info('  init                    Initialize sources from configuration files');
  logger.info('  list                    List all configured sources');
  logger.info('  validate                Validate source configuration');
  logger.info('  scrape <language>       Scrape sources for specific language');
  logger.info('  summary                 Show configuration summary');
  logger.info('\nExamples:');
  logger.info('  npx ts-node scripts/manage-sources.ts init');
  logger.info('  npx ts-node scripts/manage-sources.ts list');
  logger.info('  npx ts-node scripts/manage-sources.ts scrape telugu');
  logger.info('  npx ts-node scripts/manage-sources.ts summary');
}

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}
