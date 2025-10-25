// src/app/api/brand-wire/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { BrandWire } from '@/models/BrandWire';

// GET /api/brand-wire - Fetch Brand Wire articles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const language = searchParams.get('lang') || 'en';
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const slug = searchParams.get('slug');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status, language };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (slug) {
      query.slug = slug;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [articles, total] = await Promise.all([
      BrandWire.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      BrandWire.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching Brand Wire articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/brand-wire - Create new Brand Wire article
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      title,
      summary,
      content,
      images = [],
      category,
      tags = [],
      author,
      language = 'en',
      status = 'draft',
      featured = false,
      priority = 0,
      publishedAt,
      expiresAt,
      seo = {}
    } = body;

    // Validation
    if (!title || !summary || !content || !author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const article = new BrandWire({
      title,
      summary,
      content,
      images,
      category: category || 'influential-personalities',
      tags,
      author,
      language,
      status,
      featured,
      priority,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      seo: {
        metaDescription: seo.metaDescription || summary.substring(0, 160),
        keywords: seo.keywords || []
      }
    });

    await article.save();

    return NextResponse.json({
      success: true,
      article: article.toObject()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Brand Wire article:', error);
    // If it's a Mongoose validation error, return the validation messages
    let message = 'Failed to create article';
    try {
      if (error && (error as any).message) {
        message = (error as any).message;
      }
    } catch (e) {
      // ignore
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
