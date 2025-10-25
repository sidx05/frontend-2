import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Category } from '@/models/Category';
import { Setting } from '@/models/Setting';


// GET /api/news/latest?lang=telugu&limit=8 - Get latest articles by language
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';
    const category = searchParams.get('category');
    let limit = parseInt(searchParams.get('limit') || '0');
    if (!limit || isNaN(limit) || limit <= 0) {
      try {
        const s = await Setting.findOne({}).lean();
        if (s && language && language !== 'all') {
          const map = (s as any).perLanguageViewAllLimit || {};
          const candidate = map[String(language).toLowerCase()];
          if (typeof candidate === 'number' && candidate > 0) {
            limit = candidate;
          }
        }
      } catch {}
      if (!limit || limit <= 0) limit = 8;
    }
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query
    const query: any = {
      status: { $in: ['scraped', 'processed', 'published'] }
    };
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Category filter: combine as AND with search
    const orConditions: any[] = [];
    const categoryConditions: any[] = [];
    if (category && category !== 'all') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isObjectId) {
        categoryConditions.push(
          { categories: { $in: [category] } },
          { category: category }
        );
      } else {
        const key = String(category).toLowerCase();
        let catDocId: any = null;
        try {
          const catDoc: any = await Category.findOne({ key }).select('_id').lean();
          catDocId = catDoc && catDoc._id ? String(catDoc._id) : null;
        } catch {}
        categoryConditions.push(
          { categories: { $in: [key] } },
          { category: { $regex: new RegExp(`^${key}$`, 'i') } },
          { tags: { $in: [new RegExp(`^${key}$`, 'i')] } },
          ...(catDocId ? [ { categories: { $in: [catDocId] } }, { category: catDocId } ] : [])
        );
      }
    }
    const andGroups: any[] = [];
    if (categoryConditions.length > 0) andGroups.push({ $or: categoryConditions });
    if (andGroups.length > 0) query.$and = andGroups;
    
    // Get articles with pagination
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title summary content thumbnail source publishedAt scrapedAt language category categories author wordCount readingTime slug')
      .lean();
    
    // Get total count for pagination
    const total = await Article.countDocuments(query);
    // Format response with content categorization fallback
    const computeCategoryFromText = (title: string, summary: string, content: string): string => {
      const text = `${(title||'').toLowerCase()} ${(summary||'').toLowerCase()} ${(content||'').toLowerCase()}`;
      const dict: Record<string,string[]> = {
        politics: ['politics','political','election','elections','minister','government','parliament','assembly','mla','mp','party','pm','president','congress','bjp','tdp','ysr','trs','aap','రాజకీయ','ఎన్నిక','మంత్రి','ప్రభుత్వ','అసెంబ్లీ','పార్టీ','ముఖ్యమంత్రి','అధ్యక్షుడు','ఎంపీ','ఎంఎల్ఏ'],
        sports: ['sports','sport','cricket','football','soccer','tennis','badminton','hockey','ipl','match','player','tournament','score','క్రీడ','క్రికెట్','ఫుట్బాల్','టెన్నిస్','బ్యాడ్మింటన్','హాకీ','మ్యాచ్','ఆటగాడు'],
        entertainment: ['entertainment','movie','movies','film','cinema','actor','actress','director','trailer','song','review','bollywood','tollywood','kollywood','సినిమా','చిత్రం','నటుడు','నటి','దర్శకుడు','పాట','సమీక్ష'],
        technology: ['technology','tech','gadget','smartphone','mobile','ai','artificial intelligence','software','internet','robot','startup','టెక్నాలజీ','గాడ్జెట్','మొబైల్','స్మార్ట్‌ఫోన్','కృత్రిమ మేధస్సు','సాఫ్ట్‌వేర్','ఇంటర్నెట్'],
        health: ['health','hospital','doctor','covid','vaccine','medical','fitness','disease','ఆరోగ్యం','ఆసుపత్రి','డాక్టర్','వ్యాక్సిన్','వైద్యం','వ్యాధి'],
        business: ['business','market','stock','share','company','finance','banking','economy','revenue','profit','వ్యాపారం','మార్కెట్','స్టాక్','షేర్','కంపెనీ','ఫైనాన్స్','బ్యాంకింగ్','ఆర్థిక'],
        education: ['education','exam','results','student','school','college','university','విద్య','పరీక్ష','ఫలితాలు','విద్యార్థి','పాఠశాల','కళాశాల','విశ్వవిద్యాలయం'],
        crime: ['crime','police','murder','theft','robbery','scam','fraud','arrest','క్రైమ్','నేరం','పోలీసు','హత్య','దొంగతనం','దోపిడీ','అరెస్ట్','మోసం']
      };
      let best = 'general'; let bestScore = 0;
      for (const [cat, keys] of Object.entries(dict)) {
        let score = 0; keys.forEach(k=>{ if (text.includes(k)) score += Math.max(1, k.length/3); });
        if (score > bestScore) { bestScore = score; best = cat; }
      }
      return bestScore > 0 ? best : 'general';
    };

    const formattedArticles = articles.map(article => {
      let displayCategory: any = undefined;
      const requestedCategory = (searchParams.get('category') || '').toLowerCase();
      if (Array.isArray(article.categories) && article.categories.length > 0) {
        const first = String(article.categories[0]);
        displayCategory = /^[0-9a-fA-F]{24}$/.test(first) && requestedCategory && !/^[0-9a-fA-F]{24}$/.test(requestedCategory)
          ? requestedCategory
          : first;
      } else if (typeof (article as any).category === 'string') {
        displayCategory = (article as any).category;
      } else {
        displayCategory = computeCategoryFromText(article.title, article.summary, article.content);
      }
      return ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        thumbnail: article.thumbnail,
        source: {
          name: article.source?.name || 'Unknown',
          url: article.source?.url || ''
        },
        publishedAt: article.publishedAt,
        scrapedAt: article.scrapedAt,
        language: article.language,
        category: displayCategory,
        categories: article.categories || [],
        author: article.author,
        wordCount: article.wordCount,
        readingTime: article.readingTime,
        url: `/article/${article.slug || article._id}`
      });
    });
    
    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      language,
      totalFound: total
    });
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch latest news' },
      { status: 500 }
    );
  }
}
