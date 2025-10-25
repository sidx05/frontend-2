// Script to load RSS feeds from configuration
// Run this with: node src/scripts/load-rss-feeds.js

const fetch = require('node-fetch');

async function loadRSSFeeds() {
  try {
    console.log('Loading RSS feeds...');
    
    const response = await fetch('http://localhost:3000/api/admin/rss-feeds/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ RSS feeds loaded successfully!');
      console.log(`📊 Loaded: ${result.loaded} feeds`);
      console.log(`⏭️  Skipped: ${result.skipped} feeds (already exist)`);
      console.log(`📈 Total: ${result.total} feeds processed`);
    } else {
      console.error('❌ Failed to load RSS feeds:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error loading RSS feeds:', error);
  }
}

loadRSSFeeds();
