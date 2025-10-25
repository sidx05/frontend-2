import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';
// import { SourceConfigService } from '../../../../../backend/src/services/source-config.service';

// PATCH /api/admin/sources/[id] - Update source
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { active, name, url, rssUrl, categories, language } = body;
    
    const source = await Source.findById(params.id);
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (active !== undefined) source.active = active;
    if (name) source.name = name;
    if (url) source.url = url;
    if (rssUrl) source.rssUrls = [rssUrl];
    if (categories) source.categories = categories;
    if (language) source.lang = language;
    
    await source.save();
    
    // Update source configuration
    const sourceConfigService = new SourceConfigService();
    await sourceConfigService.syncWithDatabase();
    
    return NextResponse.json({
      success: true,
      source: source,
      message: 'Source updated successfully'
    });
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sources/[id] - Delete source
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const source = await Source.findById(params.id);
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    await Source.findByIdAndDelete(params.id);
    
    // Update source configuration
    const sourceConfigService = new SourceConfigService();
    await sourceConfigService.syncWithDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}