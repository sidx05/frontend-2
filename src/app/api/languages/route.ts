import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';

// GET /api/languages - List supported languages with article counts
export async function GET() {
  try {
    await connectDB();
    
    // Get language statistics from articles
    const languageStats = await Article.aggregate([
      {
        $match: {
          status: { $in: ['scraped', 'processed', 'published'] }
        }
      },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          lastArticle: { $max: '$publishedAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Define language metadata
    const languageMetadata: { [key: string]: { name: string; nativeName: string; code: string } } = {
      'english': { name: 'English', nativeName: 'English', code: 'en' },
      'hindi': { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi' },
      'telugu': { name: 'Telugu', nativeName: 'తెలుగు', code: 'te' },
      'tamil': { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta' },
      'kannada': { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn' },
      'malayalam': { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml' },
      'gujarati': { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu' },
      'bengali': { name: 'Bengali', nativeName: 'বাংলা', code: 'bn' },
      'marathi': { name: 'Marathi', nativeName: 'मराठी', code: 'mr' },
      'punjabi': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa' }
    };
    
    // Format response
    const languages = languageStats.map(stat => {
      const metadata = languageMetadata[stat._id] || {
        name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        nativeName: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        code: stat._id.substring(0, 2)
      };
      
      return {
        code: stat._id,
        name: metadata.name,
        nativeName: metadata.nativeName,
        articleCount: stat.count,
        lastArticle: stat.lastArticle,
        isActive: stat.count > 0
      };
    });
    
    // Add languages with no articles but are supported
    const supportedLanguages = Object.keys(languageMetadata);
    const existingLanguageCodes = languages.map(l => l.code);
    
    supportedLanguages.forEach(langCode => {
      if (!existingLanguageCodes.includes(langCode)) {
        const metadata = languageMetadata[langCode];
        languages.push({
          code: langCode,
          name: metadata.name,
          nativeName: metadata.nativeName,
          articleCount: 0,
          lastArticle: null,
          isActive: false
        });
      }
    });
    
    // Sort by article count (active languages first)
    languages.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return b.articleCount - a.articleCount;
    });
    
    return NextResponse.json({
      success: true,
      languages: languages,
      totalLanguages: languages.length,
      activeLanguages: languages.filter(l => l.isActive).length,
      totalArticles: languages.reduce((sum, l) => sum + l.articleCount, 0)
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
