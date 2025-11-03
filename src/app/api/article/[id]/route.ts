// src/app/api/article/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Function to sanitize ObjectIds from text fields
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove MongoDB ObjectId patterns (24 hex characters)
  return text.replace(/\b[0-9a-fA-F]{24}\b/g, '').trim();
}

// GET /api/article/:id - Proxy to backend API and increment view count
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
  
  // Increment view count first (fire and forget)
  fetch(`${backendUrl}/api/article/${_params?.id}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }).catch(err => console.error('Error incrementing view count:', err));
  
  const response = await fetch(`${backendUrl}/api/article/${_params?.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch article' },
        { status: 500 }
      );
    }

    // Format the article data to match frontend expectations
    const article = data.data;
    const formattedArticle = {
      id: article._id || article.id,
      title: sanitizeText(article.title),
      summary: sanitizeText(article.summary),
      content: sanitizeText(article.content),
      thumbnail: article.thumbnail || article.image,
      // Normalize images from backend: support multiple possible field names
      images: (article.images || article.imagesArray || article.media || []).map((img: any) => ({
        url: img?.url || img?.image || img?.src || img?.thumbnail || '',
        alt: img?.alt || img?.caption || img?.title || ''
      })),
      source: {
        name: article.source?.sourceId?.name || article.source?.name || 'Unknown',
        url: article.source?.url || '',
        sourceId: article.source?.sourceId?._id || article.source?.sourceId || null
      },
      publishedAt: article.publishedAt,
      scrapedAt: article.scrapedAt,
      language: article.language,
      languageConfidence: article.languageConfidence,
      category: article.category?.label || article.category?.name || article.category,
      categories: article.categories || [],
      author: article.author,
      wordCount: article.wordCount,
      readingTime: article.readingTime,
      tags: article.tags || [],
      viewCount: article.viewCount || 0,
      slug: article.slug,
      metadata: {
        scrapedAt: article.scrapedAt,
        language: article.language,
        languageConfidence: article.languageConfidence,
        wordCount: article.wordCount,
        readingTime: article.readingTime,
        categories: article.categories || [],
        tags: article.tags || []
      }
    };
    
    return NextResponse.json({
      success: true,
      article: formattedArticle
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
