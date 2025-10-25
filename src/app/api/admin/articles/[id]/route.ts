// src/app/api/admin/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';

// GET /api/admin/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const article = await Article.findById(_params?.id)
      .populate('category', 'key label')
      .lean();
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const updateData = { ...body };
    
    // Handle date fields
    if (updateData.publishedAt) {
      updateData.publishedAt = new Date(updateData.publishedAt);
    }

    const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const article = await Article.findByIdAndUpdate(
      _params?.id,
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
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const article = await Article.findByIdAndDelete(_params?.id);

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
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}