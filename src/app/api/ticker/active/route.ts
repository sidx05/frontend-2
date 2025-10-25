import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';

// GET /api/ticker/active - Get active ticker articles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const language = searchParams.get('lang');
    
    // Build query
    const query: any = {
      status: { $in: ['scraped', 'processed', 'published'] }
    };
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Get recent breaking news for ticker (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const articles = await Article.find({
      ...query,
      publishedAt: { $gte: oneDayAgo }
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title source publishedAt language slug')
      .lean();
    
    // Format response for ticker
    const tickerItems = articles.map(article => ({
      id: article._id,
      title: article.title,
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt,
      language: article.language,
      url: `/article/${article.slug || article._id}`
    }));
    
    return NextResponse.json({
      success: true,
      data: tickerItems,
      total: tickerItems.length
    });
    
  } catch (error) {
    console.error('Error fetching ticker articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticker articles' },
      { status: 500 }
    );
  }
}
