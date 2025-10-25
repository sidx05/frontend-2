import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Category } from '@/models/Category';

// GET /api/trending - Get trending topics and articles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const language = searchParams.get('lang');
    
    // Build query
    const query: any = {
      status: { $in: ['scraped', 'processed', 'published'] }
    };
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Get trending articles (most viewed in the last 7 days, fallback to recent articles)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let articles = await Article.find({
      ...query,
      publishedAt: { $gte: sevenDaysAgo }
    })
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(limit)
      .select('title summary thumbnail source publishedAt language viewCount slug category categories')
      .lean();
    
    // If not enough trending articles, get recent popular articles
    if (articles.length < limit) {
      const recentArticles = await Article.find({
        ...query,
        publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
        .sort({ publishedAt: -1 })
        .limit(limit - articles.length)
        .select('title summary thumbnail source publishedAt language viewCount slug category categories')
        .lean();
      
      articles = [...articles, ...recentArticles];
    }
    
    // Get trending topics by analyzing article content and categories
    const trendingTopics = await Article.aggregate([
      { $match: { ...query, publishedAt: { $gte: sevenDaysAgo } } },
      { $unwind: { path: '$categories', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get all categories to resolve ObjectIds to names
    const allCategories = await Category.find({}).select('_id key label name').lean();
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(String(cat._id), cat.label || cat.name || cat.key || 'Unknown');
    });
    
    // If not enough category-based topics, get trending from article titles
    if (trendingTopics.length < 6) {
      const titleWords = await Article.aggregate([
        { $match: { ...query, publishedAt: { $gte: sevenDaysAgo } } },
        { $project: { 
          words: { 
            $split: [
              { $toLower: { $concat: [{ $ifNull: ['$title', ''] }, ' ', { $ifNull: ['$summary', ''] }] } },
              ' '
            ]
          }
        }},
        { $unwind: '$words' },
        { $match: { 
          words: { 
            $regex: /^[a-zA-Z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF\u0980-\u09FF\u0A80-\u0AFF]{3,}$/,
            $nin: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'with', 'this', 'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']
          }
        }},
        { $group: { _id: '$words', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]);
      
      const titleTopics = titleWords.map(word => ({
        _id: word._id,
        count: word.count
      }));
      
      trendingTopics.push(...titleTopics);
    }
    
    // Format trending topics with resolved names
    const formattedTopics = trendingTopics.slice(0, 6).map((topic, index) => {
      let topicName = 'General';
      
      if (topic._id) {
        // Check if it's an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(String(topic._id))) {
          topicName = categoryMap.get(String(topic._id)) || 'Unknown Category';
        } else {
          // It's already a string name (from title words)
          topicName = String(topic._id).charAt(0).toUpperCase() + String(topic._id).slice(1);
        }
      }
      
      return {
        name: topicName,
        count: topic.count,
        trend: "up" as const
      };
    });
    
    // Format response
    const trendingArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      summary: article.summary,
      thumbnail: article.thumbnail,
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || ''
      },
      publishedAt: article.publishedAt,
      language: article.language,
      viewCount: article.viewCount,
      url: `/article/${article.slug || article._id}`
    }));
    
    return NextResponse.json({
      success: true,
      data: trendingArticles,
      topics: formattedTopics,
      total: trendingArticles.length
    });
    
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending articles' },
      { status: 500 }
    );
  }
}
