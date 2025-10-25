import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';

// GET /api/admin/sources - Get all sources
export async function GET() {
  try {
    await connectDB();
    
    const sources = await Source.find({}).populate('categories');
    
    // Get basic configuration summary
    const configSummary = {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.active).length,
      rssSources: sources.filter(s => s.type === 'rss').length,
      apiSources: sources.filter(s => s.type === 'api').length,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      sources: sources,
      config: configSummary
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sources - Add new source
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, url, rssUrl, type, categories, language, active = true } = body;
    
    // Validate required fields
    if (!name || !url || !type || !language) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new source
    const newSource = new Source({
      name,
      url,
      rssUrls: rssUrl ? [rssUrl] : [],
      lang: language,
      categories: categories || [],
      active,
      type: type === 'rss' ? 'rss' : 'api'
    });
    
    await newSource.save();
    
    return NextResponse.json({
      success: true,
      source: newSource,
      message: 'Source added successfully'
    });
  } catch (error) {
    console.error('Error adding source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add source' },
      { status: 500 }
    );
  }
}