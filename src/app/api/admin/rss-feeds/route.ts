import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';
// import { SourceConfigService } from '../../../../backend/src/services/source-config.service';

// GET /api/admin/rss-feeds - Get all RSS feeds
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const sources = await Source.find({}).lean();
    const rssFeeds = sources.map(source => ({
      id: source._id,
      name: source.name,
      url: source.url,
      rssUrls: source.rssUrls || [],
      language: source.lang,
      categories: source.categories || [],
      active: source.active,
      lastScraped: source.lastScraped,
      type: source.type
    }));
    
    return NextResponse.json({
      success: true,
      rssFeeds
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
}

// POST /api/admin/rss-feeds - Add new RSS feed
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, url, rssUrls, language, categories, type = 'rss' } = body;
    
    if (!name || !url || !rssUrls || !Array.isArray(rssUrls) || rssUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name, URL, and RSS URLs are required' },
        { status: 400 }
      );
    }
    
    // Check if source already exists
    const existingSource = await Source.findOne({ url });
    if (existingSource) {
      return NextResponse.json(
        { success: false, error: 'Source with this URL already exists' },
        { status: 409 }
      );
    }
    
    // Create new source
    const newSource = new Source({
      name,
      url,
      rssUrls,
      lang: language || 'english',
      categories: categories || ['general'],
      active: true,
      type,
      lastScraped: null
    });
    
    await newSource.save();
    
    // Update source configuration
    const sourceConfigService = new SourceConfigService();
    await sourceConfigService.addSource({
      name,
      url,
      rssUrl: rssUrls[0], // Use first RSS URL as primary
      type: 'rss',
      language: language || 'english',
      categories: categories || ['general'],
      active: true
    });
    
    return NextResponse.json({
      success: true,
      message: 'RSS feed added successfully',
      source: {
        id: newSource._id,
        name: newSource.name,
        url: newSource.url,
        rssUrls: newSource.rssUrls,
        language: newSource.lang,
        categories: newSource.categories,
        active: newSource.active,
        type: newSource.type
      }
    });
  } catch (error) {
    console.error('Error adding RSS feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add RSS feed' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/rss-feeds - Update RSS feed
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, name, url, rssUrls, language, categories, active, type } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (url) updateData.url = url;
    if (rssUrls) updateData.rssUrls = rssUrls;
    if (language) updateData.lang = language;
    if (categories) updateData.categories = categories;
    if (typeof active === 'boolean') updateData.active = active;
    if (type) updateData.type = type;
    
    const updatedSource = await Source.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'RSS feed updated successfully',
      source: {
        id: updatedSource._id,
        name: updatedSource.name,
        url: updatedSource.url,
        rssUrls: updatedSource.rssUrls,
        language: updatedSource.lang,
        categories: updatedSource.categories,
        active: updatedSource.active,
        type: updatedSource.type
      }
    });
  } catch (error) {
    console.error('Error updating RSS feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update RSS feed' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/rss-feeds - Delete RSS feed
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }
    
    const deletedSource = await Source.findByIdAndDelete(id);
    
    if (!deletedSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'RSS feed deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting RSS feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete RSS feed' },
      { status: 500 }
    );
  }
}
