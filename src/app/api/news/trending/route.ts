import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Source } from '@/models/Source';

// GET /api/news/trending - Get latest trending news from The Hindu
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '15');
    
    // Find The Hindu Latest News source by metadata flag
    const latestNewsSource = await Source.findOne({ 
      'metadata.isLatestNews': true 
    }).select('_id').lean();
    
    if (!latestNewsSource) {
      // Fallback: try to find by name
      const fallbackSource = await Source.findOne({
        name: /The Hindu Latest News/i
      }).select('_id').lean();
      
      if (!fallbackSource || !fallbackSource._id) {
        return NextResponse.json({
          success: true,
          articles: [],
          message: 'Latest news source not configured yet'
        });
      }
      
      // Use fallback source
      const articles = await Article.find({
        source: fallbackSource._id,
        status: { $in: ['scraped', 'processed', 'published'] }
      })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
        .select('title summary slug publishedAt createdAt')
        .lean();
      
      return NextResponse.json({
        success: true,
        articles: articles.map(a => ({
          title: a.title || '',
          slug: a.slug || String(a._id),
          description: a.summary || '',
          pubDate: a.publishedAt || a.createdAt
        }))
      });
    }
    
    // Get articles from the Latest News source
    const articles = await Article.find({
      source: latestNewsSource._id,
      status: { $in: ['scraped', 'processed', 'published'] }
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .select('title summary slug publishedAt createdAt')
      .lean();
    
    return NextResponse.json({
      success: true,
      articles: articles.map(a => ({
        title: a.title || '',
        slug: a.slug || String(a._id),
        description: a.summary || '',
        pubDate: a.publishedAt || a.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching trending news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending news', articles: [] },
      { status: 500 }
    );
  }
}
