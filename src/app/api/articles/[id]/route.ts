import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';

// GET /api/articles/[id] - Get single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const article = await Article.findById(params.id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Article.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    // Format response
    const formattedArticle = {
      id: article._id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      thumbnail: article.thumbnail,
      images: article.images,
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || ''
      },
      publishedAt: article.publishedAt,
      scrapedAt: article.scrapedAt,
      language: article.language,
      category: article.category,
      categories: article.categories || [],
      author: article.author,
      wordCount: article.wordCount,
      readingTime: article.readingTime,
      tags: article.tags || [],
      viewCount: article.viewCount,
      url: `/article/${article.slug || article._id}`
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
