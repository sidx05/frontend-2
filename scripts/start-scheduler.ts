#!/usr/bin/env ts-node

/**
 * Script to start the automated scraping scheduler
 * 
 * This script initializes and starts the scheduler service
 * for automated content scraping.
 */

import { connectDB } from '../src/config/database';
import { SchedulerService } from '../src/services/scheduler.service';
import { SchedulerConfigService } from '../src/services/scheduler-config.service';
import { logger } from '../src/utils/logger';

async function startScheduler() {
  try {
    logger.info('🚀 Starting automated scraping scheduler...');
    
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database');

    // Initialize scheduler services
    const schedulerService = new SchedulerService();
    const configService = new SchedulerConfigService();
    
    logger.info('✅ Scheduler services initialized');

    // Get current configuration
    const settings = configService.getSettings();
    const statusSummary = configService.getStatusSummary();
    
    logger.info('📊 Scheduler Configuration:');
    logger.info(`  Enabled: ${settings.enabled}`);
    logger.info(`  Interval: ${settings.interval} (${statusSummary.intervalLabel})`);
    logger.info(`  Stagger Delay: ${settings.staggerDelay}ms`);
    logger.info(`  Max Concurrent: ${settings.maxConcurrent}`);
    logger.info(`  Timezone: ${settings.timezone}`);
    logger.info(`  Auto-enable after first scrape: ${settings.autoEnableAfterFirstScrape}`);

    // Start the scheduler if enabled
    if (settings.enabled) {
      schedulerService.startScheduler();
      logger.info('🎯 Scheduler started successfully');
    } else {
      logger.info('⏸️ Scheduler is disabled. Will enable after first manual scrape.');
    }

    // Keep the process running
    logger.info('🔄 Scheduler process is running. Press Ctrl+C to stop.');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('🛑 Received SIGINT, shutting down gracefully...');
      schedulerService.stopScheduler();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      schedulerService.stopScheduler();
      process.exit(0);
    });

  } catch (error) {
    logger.error('💥 Failed to start scheduler:', error);
    process.exit(1);
  }
}

// Run scheduler if this script is executed directly
if (require.main === module) {
  startScheduler();
}

export { startScheduler };
