// src/app/api/brand-wire/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { BrandWire } from '@/models/BrandWire';

// GET /api/brand-wire/[id] - Get single Brand Wire article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const article = await BrandWire.findById(params.id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await BrandWire.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    return NextResponse.json({
      success: true,
      article: article.toObject()
    });

  } catch (error) {
    console.error('Error fetching Brand Wire article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/brand-wire/[id] - Update Brand Wire article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const updateData = { ...body };
    
    // Handle date fields
    if (updateData.publishedAt) {
      updateData.publishedAt = new Date(updateData.publishedAt);
    }
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    const article = await BrandWire.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article: article.toObject()
    });

  } catch (error) {
    console.error('Error updating Brand Wire article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand-wire/[id] - Delete Brand Wire article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const article = await BrandWire.findByIdAndDelete(params.id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Brand Wire article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
