// src/app/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, TrendingUp, Bookmark, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import WeatherWidget from "@/components/weather/weather-widget";
import { fetchCategories, fetchArticles, fetchTrending } from "../lib/api";

type BackendArticle = any;

// Function to sanitize ObjectIds from text fields
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove MongoDB ObjectId patterns (24 hex characters)
  return text.replace(/\b[0-9a-fA-F]{24}\b/g, '').trim();
}

export default function HomePage() {
  const router = useRouter();

  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<any[]>([]);
  const [languageSections, setLanguageSections] = useState<any[]>([]);
  const [uncategorizedArticles, setUncategorizedArticles] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);  

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((prev) =>
        featuredArticles.length ? (prev + 1) % featuredArticles.length : 0
      );
    }, 5000);
    return () => clearInterval(t);
  }, [featuredArticles.length]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch articles and trending data in parallel
        const [rawArticles, trendingData] = await Promise.all([
          fetchArticles({ lang: 'en' }), // Only fetch English articles for homepage, let API use settings limit
          fetchTrending().catch(() => []) // Fallback to empty array if trending fails
        ]);
        
        const articlesList = Array.isArray(rawArticles) ? rawArticles : [];

        articlesList.sort((a: any, b: any) => {
          const ta = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const tb = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return tb - ta;
        });

        const mapped = articlesList.map(mapArticleToUi);

        if (!mounted) return;
        
        // Ensure we always have featured articles for the carousel
        const featured = mapped.slice(0, 3);
        if (featured.length === 0 && mapped.length > 0) {
          // If no featured articles, use the latest ones
          setFeaturedArticles(mapped.slice(0, Math.min(3, mapped.length)));
        } else {
          setFeaturedArticles(featured);
        }
        
        setLatestArticles(mapped.slice(0, 4));
        
        // Use real trending topics from backend
        if (trendingData && trendingData.topics && Array.isArray(trendingData.topics) && trendingData.topics.length > 0) {
          setTrendingTopics(trendingData.topics.slice(0, 6));
        } else if (Array.isArray(trendingData) && trendingData.length > 0) {
          // Fallback: use article titles as trending topics
          const trendingTopics = trendingData.slice(0, 6).map((article: any, index: number) => ({
            name: article.title || `Trending ${index + 1}`,
            count: article.viewCount || Math.floor(Math.random() * 100) + 10,
            trend: "up" as const
          }));
          setTrendingTopics(trendingTopics);
        } else {
          setTrendingTopics(computeTrendingFromArticles(articlesList).slice(0, 6));
        }

        const catsResp = await fetchCategories();
        const cats = Array.isArray(catsResp) ? catsResp : [];

        if (cats.length > 0) {
          const catSections: any[] = [];
          for (const c of cats.slice(0, 6)) {
            const catKey = c._id || c.id || c.key || c.slug || c.name;
            let catArticlesArr: any[] = [];
            if (catKey) {
              catArticlesArr = await fetchArticles({ category: String(catKey) });
              if (!Array.isArray(catArticlesArr) || catArticlesArr.length === 0) {
                catArticlesArr = await fetchArticles({ categoryKey: String(catKey) });
              }
            }
            const normalizedArr = Array.isArray(catArticlesArr) ? catArticlesArr : [];
            catSections.push({
              category:
                c.label || c.name || c.key || (typeof c === "string" ? c : "Category"),
              articles: normalizedArr.map(mapArticleToUi).map((a) => ({
                id: a.id,
                slug: a.slug,
                title: a.title,
                summary: a.summary,
                time: a.time,
              })),
            });
          }
          if (mounted) setCategoryArticles(catSections);
        } else {
          if (mounted) setCategoryArticles(deriveCategorySectionsFromArticles(mapped));
        }

        // Fetch language-based sections
        // Display order preference: English first, then Hindi, then Telugu, remaining unchanged
        const languages = ['en', 'hi', 'te', 'ta', 'ml', 'bn', 'gu', 'mr'];
        const languageSectionsData: any[] = [];
        
        // Canonical category order we want to expose per language
        const defaultCategoryKeys = [
          'politics',
          'sports',
          'business',
          'entertainment',
          'technology',
          'health',
          'education',
          'crime'
        ];

        for (const lang of languages) {
          try {
            const langArticles = await fetch(`/api/news/latest?lang=${lang}&limit=6`).then(res => res.json());
            const categories = await fetch(`/api/categories?lang=${lang}`).then(res => res.json());
            
            
            if (langArticles.success && langArticles.articles.length > 0) {
              const cats = categories.success ? (categories.categories || []) : [];
              // Normalize to ensure we always show the canonical set (even if 0 articles yet)
              const normalizedCats = defaultCategoryKeys.map((key) => {
                const found = cats.find((c: any) => (c.key || '').toLowerCase() === key);
                if (found) return found; // has { name: ObjectId, key, displayName, ... }
                // Fallback stub uses key as the filter value (APIs accept string keys now)
                return {
                  name: key,
                  key,
                  displayName: key.charAt(0).toUpperCase() + key.slice(1),
                  articleCount: 0,
                };
              });
              languageSectionsData.push({
              language: lang,
              displayName: getLanguageDisplayName(lang),
              articles: langArticles.articles.map(mapArticleToUi),
                // Always present canonical set; existing ones include ids, missing ones fall back to key
                categories: normalizedCats
              } as any);
            }
          } catch (err) {
            console.error(`Error fetching ${lang} articles:`, err);
          }
        }
        
        // Enforce display order: English → Hindi → Telugu → others in original order
        const langOrder: Record<string, number> = { en: 0, hi: 1, te: 2 };
        languageSectionsData.sort((a: any, b: any) => {
          const oa = langOrder[a.language] ?? 99;
          const ob = langOrder[b.language] ?? 99;
          return oa - ob;
        });
        
        if (mounted) setLanguageSections(languageSectionsData);

        // Load uncategorized articles
        try {
          const uncategorizedResp = await fetch('/api/news?category=uncategorized');
          const uncategorizedData = await uncategorizedResp.json();
          if (uncategorizedData.success && uncategorizedData.articles) {
            const mappedUncategorized = uncategorizedData.articles.map(mapArticleToUi);
            if (mounted) setUncategorizedArticles(mappedUncategorized);
          }
        } catch (error) {
          console.error('Error loading uncategorized articles:', error);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Helpers ---
  function getLanguageDisplayName(lang: string): string {
    const names: { [key: string]: string } = {
      'te': 'తెలుగు',
      'hi': 'हिन्दी',
      'en': 'English',
      'ta': 'தமிழ்',
      'ml': 'മലയാളം',
      'bn': 'বাংলা',
      'mr': 'मराठी',
      'gu': 'ગુજરાતી',
      'kn': 'ಕನ್ನಡ',
      'pa': 'ਪੰਜਾਬੀ'
    };
    return names[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }


  function mapArticleToUi(a: BackendArticle) {
    const id = a._id || a.id || a.hash || String(Math.random());
    const slug = a.slug || id;

    let image: string | null = null;
    try {
      // Check thumbnail first (this is what manual articles and scrapers set)
      if (a.thumbnail && typeof a.thumbnail === "string" && a.thumbnail.trim() !== '') {
        image = a.thumbnail;
      } else if (Array.isArray(a.images) && a.images.length > 0) {
        const first = a.images[0];
        if (typeof first === "string" && first.trim() !== '') image = first;
        else if (first?.url && first.url.trim() !== '') image = first.url;
        else if (first?.src && first.src.trim() !== '') image = first.src;
      } else if (a.image && typeof a.image === "string" && a.image.trim() !== '') {
        image = a.image;
      } else if (a.openGraph?.image && typeof a.openGraph.image === "string" && a.openGraph.image.trim() !== '') {
        image = a.openGraph.image;
      } else if (a.media && Array.isArray(a.media) && a.media[0]?.url && a.media[0].url.trim() !== '') {
        image = a.media[0].url;
      } else if (a.enclosures && Array.isArray(a.enclosures) && a.enclosures[0]?.url && a.enclosures[0].url.trim() !== '') {
        image = a.enclosures[0].url;
      }
    } catch (_) {}

    const title = sanitizeText(a.title) || "Untitled";
    const summary = sanitizeText(
      a.summary || (a.content ? truncate(stripHtml(a.content), 160) : "")
    );
    const publishedAt = a.publishedAt
      ? new Date(a.publishedAt)
      : a.createdAt
      ? new Date(a.createdAt)
      : new Date();
    const time = timeAgo(publishedAt);

    const readTime = estimateReadTime(a.content || a.summary || "");
    // Enhanced category mapping
    let category = "General";
    
    if (typeof a.category === "object") {
      category = a.category.label || a.category.name || a.category.key || "General";
    } else if (a.category) {
      category = a.category;
    }
    
    // Smart categorization based on content analysis
    const titleText = (a.title || "").toLowerCase();
    const summaryText = (a.summary || "").toLowerCase();
    const contentText = (a.content || "").toLowerCase();
    const combinedText = `${titleText} ${summaryText} ${contentText}`;
    
    // Enhanced category keywords mapping with Telugu support
    const categoryKeywords = {
      politics: [
        // English keywords
        'politics', 'political', 'election', 'government', 'minister', 'chief minister', 'pm', 'president', 'parliament', 'assembly', 'vote', 'voting', 'party', 'congress', 'bjp', 'tdp', 'ysr', 'jagan', 'modi', 'rahul', 'trs', 'aap',
        // Telugu keywords
        'రాజకీయాలు', 'ఎన్నికలు', 'ప్రభుత్వం', 'మంత్రి', 'ముఖ్యమంత్రి', 'అసెంబ్లీ', 'పార్టీ', 'కాంగ్రెస్', 'బీజేపీ', 'టీడీపీ', 'వైఎస్ఆర్', 'జగన్', 'మోదీ', 'రాహుల్', 'టీఆర్ఎస్', 'ఆప్'
      ],
      sports: [
        // English keywords
        'sports', 'cricket', 'football', 'tennis', 'badminton', 'hockey', 'olympics', 'world cup', 'ipl', 'bcci', 'match', 'player', 'team', 'score', 'tournament', 'championship', 'athlete', 'game', 'sport',
        // Telugu keywords
        'క్రీడలు', 'క్రికెట్', 'ఫుట్బాల్', 'టెన్నిస్', 'బ్యాడ్మింటన్', 'హాకీ', 'ఒలింపిక్స్', 'వరల్డ్ కప్', 'ఐపిఎల్', 'బిసిసిఐ', 'మ్యాచ్', 'ఆటగాడు', 'టీమ్', 'స్కోర్', 'టోర్నమెంట్', 'ఛాంపియన్షిప్', 'ఆట'
      ],
      entertainment: [
        // English keywords
        'movie', 'film', 'cinema', 'actor', 'actress', 'director', 'bollywood', 'tollywood', 'kollywood', 'music', 'song', 'album', 'singer', 'dance', 'drama', 'theater', 'entertainment', 'celebrity', 'star', 'hero', 'heroine',
        // Telugu keywords
        'సినిమా', 'చలనచిత్రం', 'నటుడు', 'నటి', 'దర్శకుడు', 'టాలీవుడ్', 'కొలీవుడ్', 'సంగీతం', 'పాట', 'ఆల్బమ్', 'గాయకుడు', 'నృత్యం', 'నాటకం', 'థియేటర్', 'వినోదం', 'సెలబ్రిటీ', 'నక్షత్రం', 'హీరో', 'హీరోయిన్'
      ],
      technology: [
        // English keywords - made more specific
        'technology', 'computer', 'software', 'mobile phone', 'internet', 'artificial intelligence', 'robot', 'digital', 'cyber', 'hacking', 'startup', 'innovation', 'gadget', 'device', 'smartphone', 'laptop', 'programming', 'coding',
        // Telugu keywords
        'టెక్నాలజీ', 'కంప్యూటర్', 'సాఫ్ట్వేర్', 'మొబైల్ ఫోన్', 'ఇంటర్నెట్', 'కృత్రిమ మేధస్సు', 'రోబోట్', 'డిజిటల్', 'సైబర్', 'హ్యాకింగ్', 'స్టార్టప్', 'నవీకరణ', 'గ్యాజెట్', 'పరికరం', 'స్మార్ట్ఫోన్', 'ల్యాప్టాప్'
      ],
      health: [
        // English keywords
        'health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'covid', 'corona', 'vaccine', 'treatment', 'surgery', 'patient', 'clinic', 'pharmacy', 'drug', 'therapy', 'wellness', 'fitness', 'nutrition', 'diet',
        // Telugu keywords
        'ఆరోగ్యం', 'వైద్య', 'డాక్టర్', 'ఆసుపత్రి', 'మందు', 'వ్యాధి', 'కోవిడ్', 'కరోనా', 'వ్యాక్సిన్', 'చికిత్స', 'శస్త్రచికిత్స', 'రోగి', 'క్లినిక్', 'ఫార్మసీ', 'మందు', 'థెరపీ', 'ఆరోగ్యం', 'ఫిట్నెస్', 'పోషకాహారం'
      ],
      business: [
        // English keywords
        'business', 'economy', 'economic', 'market', 'stock', 'share', 'company', 'corporate', 'finance', 'banking', 'investment', 'profit', 'loss', 'revenue', 'trade', 'commerce', 'industry', 'manufacturing', 'export', 'import',
        // Telugu keywords
        'వ్యాపారం', 'ఆర్థిక వ్యవస్థ', 'ఆర్థిక', 'మార్కెట్', 'స్టాక్', 'షేర్', 'కంపెనీ', 'కార్పొరేట్', 'ఫైనాన్స్', 'బ్యాంకింగ్', 'పెట్టుబడి', 'లాభం', 'నష్టం', 'రెవెన్యూ', 'వ్యాపారం', 'వాణిజ్యం', 'పరిశ్రమ', 'ఉత్పత్తి', 'ఎగుమతి', 'దిగుమతి'
      ],
      education: [
        // English keywords
        'education', 'school', 'college', 'university', 'student', 'teacher', 'exam', 'result', 'admission', 'course', 'degree', 'study', 'learning', 'academic', 'institute', 'training', 'scholarship', 'tuition',
        // Telugu keywords
        'విద్య', 'పాఠశాల', 'కళాశాల', 'విశ్వవిద్యాలయం', 'విద్యార్థి', 'ఉపాధ్యాయుడు', 'పరీక్ష', 'ఫలితం', 'ప్రవేశం', 'కోర్స్', 'డిగ్రీ', 'అధ్యయనం', 'అభ్యాసం', 'అకడమిక్', 'సంస్థ', 'శిక్షణ', 'విద్యార్థి వేతనం'
      ],
      crime: [
        // English keywords
        'crime', 'police', 'murder', 'theft', 'robbery', 'fraud', 'scam', 'arrest', 'jail', 'court', 'law', 'legal', 'criminal', 'investigation', 'case', 'trial', 'judge', 'lawyer', 'justice',
        // Telugu keywords
        'నేరం', 'పోలీసు', 'హత్య', 'దొంగతనం', 'దోపిడీ', 'మోసం', 'స్కామ్', 'అరెస్ట్', 'జైలు', 'కోర్టు', 'చట్టం', 'చట్టపరమైన', 'నేరస్థుడు', 'విచారణ', 'కేసు', 'విచారణ', 'న్యాయమూర్తి', 'వకీలు', 'న్యాయం'
      ]
    };
    
    // Enhanced category detection with minimum match threshold
    let categoryScore = 0;
    let bestCategory = 'general';
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => {
        // Use flexible matching - check for exact word matches and partial matches
        const exactRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const partialRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // Prefer exact word matches, but also accept partial matches for Telugu text
        return exactRegex.test(combinedText) || partialRegex.test(combinedText);
      });
      
      // Calculate score based on number of matches and keyword length
      // Give higher weight to exact matches
      const score = matches.reduce((acc, keyword) => {
        const exactMatch = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(combinedText);
        return acc + keyword.length + (exactMatch ? 5 : 0); // Bonus for exact matches
      }, 0);
      
      if (score > categoryScore) {
        categoryScore = score;
        bestCategory = cat;
      }
    }
    
    // Only use detected category if score is above threshold
    // Lowered threshold to be more sensitive to category detection
    if (categoryScore > 3) {
      category = bestCategory;
    }
    
    
    // Capitalize first letter
    category = category.charAt(0).toUpperCase() + category.slice(1);

    const views = a.viewCount || a.views || 0;

    return {
      id,
      slug,
      title,
      summary,
      content: sanitizeText(a.content) || "",
      image, // can be null
      thumbnail: image, // also set thumbnail for consistency
      category,
      time,
      readTime,
      views,
      tags: a.tags || [],
      source: a.source || { name: 'Unknown' },
    };
  }

  function stripHtml(input: string) {
    return input.replace(/<\/?[^>]+(>|$)/g, "");
  }
  function truncate(s: string, n = 140) {
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  }
  function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    return `${Math.floor(months / 12)} years ago`;
  }
  function estimateReadTime(text: string) {
    if (!text) return "1 min read";
    const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  }
  function computeTrendingFromArticles(articles: BackendArticle[]) {
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    
    // Count categories and tags from articles
    for (const a of articles || []) {
      // Count categories
      if (a.category) {
        const catKey = String(a.category).toLowerCase();
        categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
      }
      
      // Count tags
      const tags: string[] = a.tags || [];
      tags.forEach((t) => {
        if (!t) return;
        const key = String(t).toLowerCase();
        tagCounts[key] = (tagCounts[key] || 0) + 1;
      });
    }
    
    // Combine and sort by count
    const allCounts = { ...categoryCounts, ...tagCounts };
    const entries = Object.entries(allCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        count, 
        trend: "up" as const 
      }));
    
    // Return top trending topics or fallback
    return entries.length > 0 
      ? entries.slice(0, 6)
      : [
          { name: "Breaking News", count: Math.floor(Math.random() * 50) + 20, trend: "up" as const },
          { name: "World News", count: Math.floor(Math.random() * 40) + 15, trend: "up" as const },
          { name: "Technology", count: Math.floor(Math.random() * 35) + 10, trend: "up" as const },
          { name: "Sports", count: Math.floor(Math.random() * 30) + 8, trend: "up" as const },
          { name: "Politics", count: Math.floor(Math.random() * 25) + 5, trend: "up" as const },
          { name: "Health", count: Math.floor(Math.random() * 20) + 3, trend: "up" as const },
        ];
  }
  function deriveCategorySectionsFromArticles(mapped: any[]) {
    const groups: Record<string, any[]> = {};
    mapped.forEach((a) => {
      const cat = a.category || "General";
      groups[cat] = groups[cat] || [];
      if (groups[cat].length < 2) groups[cat].push(a);
    });
    return Object.entries(groups).map(([category, articles]) => ({
      category,
      articles: articles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        time: a.time,
      })),
    }));
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Featured */}
          <section className="mb-12">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
              {featuredArticles.length > 0 ? (
                featuredArticles.map((article, index) => (
                  <motion.div key={`featured-${article.id || `fallback-${index}`}-${index}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: index === currentSlide ? 1 : 0 }} transition={{ duration: 0.5 }}>
                    {article.image ? (
                      <div
                        className="relative h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${article.image})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <Badge variant="secondary" className="mb-4">{sanitizeText(article.category)}</Badge>
                          <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            <Link href={`/article/${article.slug}`} className="text-white no-underline">{article.title}</Link>
                          </h1>
                          <p className="text-lg md:text-xl mb-4 max-w-3xl">{article.summary}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.time}</div>
                            <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.readTime}</div>
                            <Button variant="secondary" size="sm" onClick={() => router.push(`/article/${article.slug}`)}>
                              Read More <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                        <div className="text-center p-8">
                          <Badge variant="secondary" className="mb-4">{sanitizeText(article.category)}</Badge>
                          <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            <Link href={`/article/${article.slug}`} className="text-white no-underline">{article.title}</Link>
                          </h1>
                          <p className="text-lg md:text-xl mb-4 max-w-3xl">{article.summary}</p>
                          <div className="flex items-center gap-4 text-sm justify-center">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.time}</div>
                            <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.readTime}</div>
                            <Button variant="secondary" size="sm" onClick={() => router.push(`/article/${article.slug}`)}>
                              Read More <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="relative h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to NewsHub</h1>
                    <p className="text-lg md:text-xl mb-4 max-w-3xl">Stay updated with the latest news from around the world</p>
                    <Button variant="secondary" size="lg" onClick={() => router.push('/news')}>
                      Explore News <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <WeatherWidget />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic: any, index: number) => (
                    <div key={`trending-${topic.name}-${index}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{topic.count}</span>
                        <div className={`w-2 h-2 rounded-full ${topic.trend === "up" ? "bg-green-500" : topic.trend === "down" ? "bg-red-500" : "bg-gray-500"}`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Uncategorized Articles */}
              {uncategorizedArticles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5" />
                      Other Stories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {uncategorizedArticles.slice(0, 4).map((article: any, index: number) => (
                      <Link 
                        key={`home-uncategorized-${article.id || `fallback-${index}`}-${index}`} 
                        href={`/article/${article.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          {article.thumbnail && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                              <img 
                                src={article.thumbnail} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {article.time}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {uncategorizedArticles.length > 4 && (
                      <div className="pt-2 border-t">
                        <Link 
                          href="/news?category=uncategorized"
                          className="text-sm text-primary hover:underline"
                        >
                          View all other stories →
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Language-Specific News Sections */}
              <div className="space-y-16">
                {languageSections.map((section) => (
                  <section key={section.language} className="space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h2 className="text-2xl font-bold text-foreground">
                        Latest {section.displayName} News
                      </h2>
                      <Link 
                        href={`/news?lang=${section.language}`} 
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                      >
                        View All →
                      </Link>
                    </div>
                    
                    {/* Category Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/news?lang=${section.language}`}
                        className="text-xs"
                      >
                        All
                      </Button>
                      {(() => {
                        const categories = Array.isArray(section.categories) ? section.categories : [];
                        // For Telugu, only show selected categories; others removed as requested
                        const filtered = section.language === 'te'
                          ? categories.filter((c: any) => ['politics','entertainment','sports','health','andhra-pradesh','crime','business'].includes((c.key || c.name || '').toLowerCase()))
                          : categories;
                        return filtered.slice(0, 8).map((cat: any) => (
                          <Button 
                            key={cat.name}
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/news?lang=${section.language}&category=${cat.name}`}
                            className="text-xs"
                          >
                            {cat.displayName}
                          </Button>
                        ));
                      })()}
                    </div>
                    
                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {section.articles.slice(0, 6).map((article: any, index: number) => (
                        <Card key={`home-${section.language}-${article.id || `fallback-${index}`}-${index}`} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
                          <Link href={`/article/${article.slug}`} className="block">
                            <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                              {article.thumbnail ? (
                                <img 
                                  src={article.thumbnail} 
                                  alt={article.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground font-medium">No Image</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4 space-y-3">
                              {/* Article Meta */}
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {sanitizeText(article.category) || 'General'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{article.time}</span>
                              </div>
                              
                              {/* Article Title */}
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                              
                              {/* Article Summary */}
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {article.summary}
                              </p>
                              
                              {/* Article Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span className="font-medium">{article.source?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                    <Bookmark className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
