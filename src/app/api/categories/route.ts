// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Category } from '@/models/Category';

// GET /api/categories - List categories with article counts
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang');
    
    // Build query
    const query: any = {
      status: { $in: ['scraped', 'processed', 'published'] }
    };
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Get all categories from Category collection first
    const allCategoryDocs = await Category.find({}).lean();
    const categoryMap = new Map();
    allCategoryDocs.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), {
        _id: cat._id,
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        order: cat.order
      });
    });

    // Get category statistics from categories array (ObjectIds)
    const categoryStats = await Article.aggregate([
      { $match: query },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          lastArticle: { $max: '$publishedAt' },
          languages: { $addToSet: '$language' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Also get single category stats
    const singleCategoryStats = await Article.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          lastArticle: { $max: '$publishedAt' },
          languages: { $addToSet: '$language' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Combine and deduplicate categories
    const allCategories = new Map();
    
    // Add categories from categories array (ObjectIds)
    categoryStats.forEach(stat => {
      if (stat._id) {
        const categoryId = stat._id.toString();
        const categoryDoc = categoryMap.get(categoryId);
        
        if (categoryDoc) {
          // Use the ObjectId as the name for filtering consistency
          const existing = allCategories.get(categoryId);
          
          if (existing) {
            existing.articleCount += stat.count;
            existing.languages = [...new Set([...existing.languages, ...stat.languages])];
            if (stat.lastArticle > existing.lastArticle) {
              existing.lastArticle = stat.lastArticle;
            }
          } else {
            allCategories.set(categoryId, {
              name: categoryId,
              key: categoryDoc.key,
              label: categoryDoc.label,
              icon: categoryDoc.icon,
              color: categoryDoc.color,
              order: categoryDoc.order,
              articleCount: stat.count,
              lastArticle: stat.lastArticle,
              languages: stat.languages
            });
          }
        }
      }
    });
    
    // Add single categories (ObjectIds)
    singleCategoryStats.forEach(stat => {
      if (stat._id && stat._id !== 'general') {
        const categoryId = stat._id.toString();
        const categoryDoc = categoryMap.get(categoryId);
        
        if (categoryDoc) {
          const existing = allCategories.get(categoryId);
          
          if (existing) {
            existing.articleCount += stat.count;
            existing.languages = [...new Set([...existing.languages, ...stat.languages])];
            if (stat.lastArticle > existing.lastArticle) {
              existing.lastArticle = stat.lastArticle;
            }
          } else {
            allCategories.set(categoryId, {
              name: categoryId,
              key: categoryDoc.key,
              label: categoryDoc.label,
              icon: categoryDoc.icon,
              color: categoryDoc.color,
              order: categoryDoc.order,
              articleCount: stat.count,
              lastArticle: stat.lastArticle,
              languages: stat.languages
            });
          }
        }
      }
    });
    
    // Convert to array and sort
    const categories = Array.from(allCategories.values())
      .filter(cat => cat.name && typeof cat.name === 'string') // Filter out invalid entries
      .map(cat => ({
        name: cat.name, // This is now the ObjectId
        displayName: cat.label || cat.key || cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        articleCount: cat.articleCount,
        lastArticle: cat.lastArticle,
        supportedLanguages: cat.languages,
        isActive: cat.articleCount > 0
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order first, then by article count
    
    // Calculate summary
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const totalArticles = categories.reduce((sum, c) => sum + c.articleCount, 0);
    
    return NextResponse.json({
      success: true,
      categories: categories,
      summary: {
        totalCategories,
        activeCategories,
        inactiveCategories: totalCategories - activeCategories,
        totalArticles,
        averageArticlesPerCategory: totalCategories > 0 ? Math.round(totalArticles / totalCategories) : 0
      },
      filter: {
        language: language || 'all'
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
