import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';
import rssFeedsData from '@/data/rss-feeds.json';

// POST /api/admin/rss-feeds/load - Load RSS feeds from configuration
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    let loadedCount = 0;
    let skippedCount = 0;
    
    // Process each language
    for (const [language, categories] of Object.entries(rssFeedsData)) {
      // Process each category
      for (const [category, feeds] of Object.entries(categories)) {
        // Process each feed
        for (const feed of feeds) {
          try {
            // Check if source already exists
            const existingSource = await Source.findOne({ 
              $or: [
                { url: feed.url },
                { name: feed.name }
              ]
            });
            
            if (existingSource) {
              skippedCount++;
              continue;
            }
            
            // Create new source
            const newSource = new Source({
              name: feed.name,
              url: feed.url,
              rssUrls: feed.rssUrls,
              lang: feed.language,
              categories: feed.categories,
              active: feed.active,
              type: 'rss',
              lastScraped: null
            });
            
            await newSource.save();
            loadedCount++;
            
          } catch (error) {
            console.error(`Error loading feed ${feed.name}:`, error);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `RSS feeds loaded successfully`,
      loaded: loadedCount,
      skipped: skippedCount,
      total: loadedCount + skippedCount
    });
    
  } catch (error) {
    console.error('Error loading RSS feeds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load RSS feeds' },
      { status: 500 }
    );
  }
}
