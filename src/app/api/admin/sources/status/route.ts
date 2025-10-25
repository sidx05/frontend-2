import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';

// GET /api/admin/sources/status - Get detailed source status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const sources = await Source.find({}).lean();
    
    // Return basic source data without external services
    const detailedSources = sources.map(source => ({
      id: source._id,
      name: source.name,
      url: source.url,
      rssUrls: source.rssUrls || [],
      language: source.lang,
      categories: source.categories || [],
      active: source.active,
      lastScraped: source.lastScraped,
      type: source.type,
      metrics: {
        lastScraped: source.lastScraped || new Date().toISOString(),
        lastError: null,
        lastErrorTime: null,
        consecutiveErrors: 0,
        totalScrapes: 0,
        totalErrors: 0,
        averageScrapeDuration: 0,
        lastScrapeDuration: 0,
        errorRate: 0,
        successRate: 100
      },
      rateLimit: {
        requestsThisMinute: 0,
        requestsThisHour: 0,
        lastRequestTime: new Date().toISOString(),
        robotsTxt: null,
        isBlocked: false,
        blockedUntil: null
      },
      health: {
        status: source.active ? 'healthy' : 'inactive',
        issues: source.active ? [] : ['Inactive']
      }
    }));
    
    return NextResponse.json({
      success: true,
      sources: detailedSources
    });
  } catch (error) {
    console.error('Error fetching source status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch source status' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sources/status - Update source status
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sourceId, active, resetErrors } = body;
    
    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }
    
    // Update source active status
    if (typeof active === 'boolean') {
      await Source.findByIdAndUpdate(sourceId, { active });
    }
    
    // In simplified mode, just return success for resetErrors
    if (resetErrors) {
      // No-op in simplified mode
    }
    
    return NextResponse.json({
      success: true,
      message: 'Source status updated successfully (simplified mode)'
    });
  } catch (error) {
    console.error('Error updating source status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update source status' },
      { status: 500 }
    );
  }
}
