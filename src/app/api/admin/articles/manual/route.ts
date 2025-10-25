import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Source } from '@/models/Source';
import { Category } from '@/models/Category';
import crypto from 'crypto';

// POST /api/admin/articles/manual - Add manual article
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      title, 
      content, 
      language, 
      category, 
      sourceName, 
      sourceUrl, 
      publishedAt, 
      thumbnail,
      summary,
      tags,
      author
    } = body;
    
    // Validate required fields
    if (!title || !content || !language || !category || !sourceName) {
      return NextResponse.json(
        { success: false, error: 'Title, content, language, category, and source name are required' },
        { status: 400 }
      );
    }
    
    // Validate language
    const supportedLanguages = ['en','hi','te','ta','ml','kn','gu','bn','mr','pa','english','hindi','telugu','tamil','malayalam','kannada','gujarati','bengali','marathi','punjabi'];
    if (!supportedLanguages.includes(String(language).toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Find or create source
    let source = await Source.findOne({ name: sourceName });
    if (!source) {
      // Resolve category to ObjectId if possible (Source.categories expects ObjectIds)
      let sourceCategoryIds: any[] = [];
      try {
      const catDoc: any = await Category.findOne({ key: String(category).toLowerCase() }).select('_id').lean();
      if (catDoc && (catDoc as any)._id) sourceCategoryIds = [(catDoc as any)._id];
      } catch {}
      source = new Source({
        name: sourceName,
        url: sourceUrl || '',
        rssUrls: [],
        lang: String(language).toLowerCase(),
        categories: sourceCategoryIds,
        active: true,
        type: 'api',
        lastScraped: new Date()
      });
      await source.save();
    }
    
    // Generate unique hash for the article
    const hash = crypto.createHash('md5')
      .update(`${title}-${sourceName}-${publishedAt || new Date().toISOString()}`)
      .digest('hex');
    
    // Check if article already exists
    const existingArticle = await Article.findOne({ hash });
    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article with similar content already exists' },
        { status: 409 }
      );
    }
    
    // Create new article
    // Resolve category: accept slug/key, attempt to map to ObjectId or string fallback in categories[]
    let categoryRef: any = null;
    try {
      const catDoc = await Category.findOne({ key: String(category).toLowerCase() }).lean();
      if (catDoc && (catDoc as any)._id) categoryRef = (catDoc as any)._id;
    } catch {}

    const imageArr = thumbnail ? [{ url: thumbnail, alt: title, caption: title }] : [];
    const words = content.split(/\s+/).filter(Boolean).length;

    const manualTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
    if (!manualTags.includes('manual')) manualTags.push('manual');

    const newArticle = new Article({
      title: title.trim(),
      summary: summary || (content.substring(0, 200) + '...'),
      content: content.trim(),
      canonicalUrl: sourceUrl || `manual-${Date.now()}`,
      language: String(language).toLowerCase(),
      category: categoryRef || undefined,
      categories: categoryRef ? [] : [String(category).toLowerCase()],
      source: { name: source.name, url: source.url, sourceId: source._id },
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      status: 'published',
      thumbnail: thumbnail || undefined, // Set thumbnail field for homepage display
      images: imageArr,
      tags: manualTags,
      author: author || sourceName,
      wordCount: words,
      readingTime: Math.ceil(words / 200),
      hash
    });
    
    await newArticle.save();
    
    // No populate needed: source is embedded with sourceId
    
    return NextResponse.json({
      success: true,
      message: 'Article added successfully',
      article: {
        id: newArticle._id,
        title: newArticle.title,
        summary: newArticle.summary,
        language: newArticle.language,
        category: newArticle.category || newArticle.categories?.[0] || null,
        source: newArticle.source,
        publishedAt: newArticle.publishedAt,
        thumbnail: (newArticle as any).images?.[0]?.url || null,
        createdAt: (newArticle as any).createdAt
      }
    });
  } catch (error) {
    console.error('Error adding manual article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add article' },
      { status: 500 }
    );
  }
}

// GET /api/admin/articles/manual - Get manual articles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    
    const filter: any = { tags: { $in: ['manual'] } };
    
    if (language) {
      filter.language = language.toLowerCase();
    }
    
    if (category) {
      filter.category = category.toLowerCase();
    }
    
    const skip = (page - 1) * limit;
    
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title summary content images source publishedAt scrapedAt language category categories author wordCount readingTime tags slug status viewCount createdAt')
      .lean();
    
    const total = await Article.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      articles: articles.map(article => ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        language: article.language,
        category: article.category,
        source: article.source,
        publishedAt: article.publishedAt,
        thumbnail: (article as any).images?.[0]?.url || null,
        isManual: true,
        createdAt: article.createdAt,
        viewCount: article.viewCount
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching manual articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch manual articles' },
      { status: 500 }
    );
  }
}
