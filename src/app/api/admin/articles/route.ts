import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';

// GET /api/admin/articles - Get all articles with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (language) query.language = language;
    if (category) query.categories = { $in: [category] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title summary content thumbnail source publishedAt scrapedAt language category categories author wordCount readingTime tags slug status viewCount')
      .lean();
    
    const total = await Article.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      articles: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}