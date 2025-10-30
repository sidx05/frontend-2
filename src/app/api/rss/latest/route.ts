// src/app/api/rss/latest/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rssUrl = 'https://www.thehindu.com/news/national/?service=rss';
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const xmlText = await response.text();
    
    // Parse XML manually (simple parser for RSS)
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
      
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                         itemXml.match(/<description>(.*?)<\/description>/)?.[1] || '';
      
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      items.push({
        title: title.trim(),
        link: link.trim(),
        description: description.trim().replace(/<[^>]*>/g, ''),
        pubDate: pubDate.trim()
      });

      if (items.length >= 15) break; // Limit to 15 items
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSS feed', items: [] },
      { status: 500 }
    );
  }
}
