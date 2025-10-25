import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { BrandWire } from '@/models/BrandWire';
import { Category } from '@/models/Category';

// GET /api/admin/analytics - Get real analytics data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get total articles count
    const totalArticles = await Article.countDocuments({ 
      status: { $in: ['scraped', 'processed', 'published'] } 
    });
    
    // Get total views (sum of all viewCount fields)
    const totalViewsResult = await Article.aggregate([
      { $match: { status: { $in: ['scraped', 'processed', 'published'] } } },
      { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$viewCount', 0] } } } }
    ]);
    const totalViews = totalViewsResult[0]?.totalViews || 0;
    
    // Get articles published today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const articlesToday = await Article.countDocuments({
      status: { $in: ['scraped', 'processed', 'published'] },
      publishedAt: { $gte: today }
    });
    
    // Get top categories with proper name resolution
    const categoryStats = await Article.aggregate([
      { $match: { status: { $in: ['scraped', 'processed', 'published'] } } },
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
    
    // Get language distribution
    const languageStats = await Article.aggregate([
      { $match: { status: { $in: ['scraped', 'processed', 'published'] } } },
      { $group: { 
        _id: '$language', 
        articles: { $sum: 1 },
        views: { $sum: { $ifNull: ['$viewCount', 0] } }
      }},
      { $sort: { articles: -1 } }
    ]);
    
    // Format category data with resolved names
    const topCategories = categoryStats.map((cat, index) => {
      let categoryName = 'Uncategorized';
      
      if (cat._id) {
        // Check if it's an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(String(cat._id))) {
          categoryName = categoryMap.get(String(cat._id)) || 'Unknown Category';
        } else {
          // It's already a string name
          categoryName = String(cat._id);
        }
      }
      
      return {
        name: categoryName,
        count: cat.count,
        percentage: Math.round((cat.count / totalArticles) * 100)
      };
    }).slice(0, 6); // Take top 6
    
    // Format language data
    const languageStatsFormatted = languageStats.map(lang => ({
      language: lang._id ? lang._id.charAt(0).toUpperCase() + lang._id.slice(1) : 'Unknown',
      articles: lang.articles,
      views: lang.views
    }));
    
    // Estimate unique users (this is a rough estimate based on view patterns)
    // In a real app, you'd track unique users separately
    const estimatedUsers = Math.floor(totalViews / 3); // Rough estimate: 3 views per user
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalArticles,
        totalViews,
        totalUsers: estimatedUsers,
        articlesToday,
        topCategories,
        languageStats: languageStatsFormatted
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}