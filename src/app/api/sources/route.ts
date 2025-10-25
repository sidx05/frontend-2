import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';
import { Article } from '@/models/Article';

// GET /api/sources - List sources with status and article counts
export async function GET() {
  try {
    await connectDB();
    
    // Get all sources
    const sources = await Source.find({})
      .select('name url rssUrls lang categories active lastScraped type')
      .lean();
    
    // Get article counts per source
    const sourceStats = await Article.aggregate([
      {
        $match: {
          status: { $in: ['scraped', 'processed', 'published'] }
        }
      },
      {
        $group: {
          _id: '$source.sourceId',
          articleCount: { $sum: 1 },
          lastArticle: { $max: '$publishedAt' },
          languages: { $addToSet: '$language' }
        }
      }
    ]);
    
    // Create a map for quick lookup
    const statsMap = new Map();
    sourceStats.forEach(stat => {
      statsMap.set(stat._id.toString(), stat);
    });
    
    // Format response
    const formattedSources = sources.map(source => {
      const stats = statsMap.get(source._id.toString()) || {
        articleCount: 0,
        lastArticle: null,
        languages: []
      };
      
      return {
        id: source._id,
        name: source.name,
        url: source.url,
        rssUrls: source.rssUrls || [],
        language: source.lang,
        categories: source.categories || [],
        active: source.active,
        lastScraped: source.lastScraped,
        type: source.type,
        status: source.active ? 'active' : 'inactive',
        articleCount: stats.articleCount,
        lastArticle: stats.lastArticle,
        supportedLanguages: stats.languages,
        health: {
          isActive: source.active,
          hasRecentArticles: stats.articleCount > 0,
          lastScraped: source.lastScraped,
          lastArticle: stats.lastArticle
        }
      };
    });
    
    // Sort by article count (most productive sources first)
    formattedSources.sort((a, b) => b.articleCount - a.articleCount);
    
    // Calculate summary statistics
    const totalSources = formattedSources.length;
    const activeSources = formattedSources.filter(s => s.active).length;
    const totalArticles = formattedSources.reduce((sum, s) => sum + s.articleCount, 0);
    const sourcesWithArticles = formattedSources.filter(s => s.articleCount > 0).length;
    
    return NextResponse.json({
      success: true,
      sources: formattedSources,
      summary: {
        totalSources,
        activeSources,
        inactiveSources: totalSources - activeSources,
        totalArticles,
        sourcesWithArticles,
        sourcesWithoutArticles: totalSources - sourcesWithArticles,
        averageArticlesPerSource: totalSources > 0 ? Math.round(totalArticles / totalSources) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}
