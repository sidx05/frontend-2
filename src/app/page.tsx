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
  const [rssLatestNews, setRssLatestNews] = useState<any[]>([]);
  const [latestNewsLoading, setLatestNewsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);  

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((prev) =>
        featuredArticles.length ? (prev + 1) % featuredArticles.length : 0
      );
    }, 5000);
    return () => clearInterval(t);
  }, [featuredArticles.length]);

  // Fetch RSS Latest News from database (trending category)
  useEffect(() => {
    let mounted = true;
    
    const fetchLatestNews = async () => {
      try {
        setLatestNewsLoading(true);
        const response = await fetch('/api/news/trending?limit=15');
        const data = await response.json();
        if (mounted && data.success && data.articles && data.articles.length > 0) {
          setRssLatestNews(data.articles);
        } else if (mounted && data.articles) {
          // Even if empty, clear the old data
          setRssLatestNews([]);
        }
      } catch (error) {
        console.error('Error fetching latest news:', error);
        if (mounted) {
          setRssLatestNews([]);
        }
      } finally {
        if (mounted) {
          setLatestNewsLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchLatestNews();
    
    // Refresh every 5 minutes to get new articles
    const intervalId = setInterval(fetchLatestNews, 5 * 60 * 1000);
    
    return () => { 
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch only essential data in parallel for faster initial load
        const [rawArticles, trendingData] = await Promise.all([
          fetchArticles({ lang: 'en', limit: 12 }), // Limit initial fetch
          fetchTrending().catch(() => [])
        ]);
        
        const articlesList = Array.isArray(rawArticles) ? rawArticles : [];

        articlesList.sort((a: any, b: any) => {
          const ta = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const tb = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return tb - ta;
        });

        const mapped = articlesList.map(mapArticleToUi);

        if (!mounted) return;
        
        // Set featured and latest articles immediately
        const featured = mapped.slice(0, 3);
        if (featured.length === 0 && mapped.length > 0) {
          setFeaturedArticles(mapped.slice(0, Math.min(3, mapped.length)));
        } else {
          setFeaturedArticles(featured);
        }
        
        setLatestArticles(mapped.slice(0, 4));
        
        // Set trending topics
        if (trendingData && trendingData.topics && Array.isArray(trendingData.topics) && trendingData.topics.length > 0) {
          setTrendingTopics(trendingData.topics.slice(0, 6));
        } else if (Array.isArray(trendingData) && trendingData.length > 0) {
          const trendingTopics = trendingData.slice(0, 6).map((article: any, index: number) => ({
            name: article.title || `Trending ${index + 1}`,
            count: article.viewCount || Math.floor(Math.random() * 100) + 10,
            trend: "up" as const
          }));
          setTrendingTopics(trendingTopics);
        } else {
          setTrendingTopics(computeTrendingFromArticles(articlesList).slice(0, 6));
        }

        // Load language sections in parallel - all languages
        const languages = ['en', 'hi', 'te', 'ta', 'bn', 'gu', 'mr'];
        const languageSectionsData: any[] = [];
        
        // Fetch all language sections in parallel instead of sequentially (keeps it fast)
        const languagePromises = languages.map(async (lang) => {
          try {
            const [langArticles, categories] = await Promise.all([
              fetch(`/api/news/latest?lang=${lang}&limit=6`).then(res => res.json()),
              fetch(`/api/categories?lang=${lang}`).then(res => res.json())
            ]);
            
            if (langArticles.success && langArticles.articles.length > 0) {
              const cats = categories.success ? (categories.categories || []) : [];
              const defaultCategoryKeys = ['politics', 'sports', 'business', 'entertainment', 'technology', 'health'];
              
              const normalizedCats = defaultCategoryKeys.map((key) => {
                const found = cats.find((c: any) => (c.key || '').toLowerCase() === key);
                if (found) return found;
                return {
                  name: key,
                  key,
                  displayName: key.charAt(0).toUpperCase() + key.slice(1),
                  articleCount: 0,
                };
              });
              
              return {
                language: lang,
                displayName: getLanguageDisplayName(lang),
                articles: langArticles.articles.map(mapArticleToUi),
                categories: normalizedCats
              };
            }
          } catch (err) {
            console.error(`Error fetching ${lang} articles:`, err);
          }
          return null;
        });

        const results = await Promise.all(languagePromises);
        const validResults = results.filter(r => r !== null);
        
        // Enforce display order: English → Hindi → Telugu → others in original order
        const langOrder: Record<string, number> = { en: 0, hi: 1, te: 2 };
        validResults.sort((a: any, b: any) => {
          const oa = langOrder[a.language] ?? 99;
          const ob = langOrder[b.language] ?? 99;
          return oa - ob;
        });
        
        if (mounted) setLanguageSections(validResults);

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
    
    // Simplified category mapping - just use what backend provides
    let category = "General";
    if (typeof a.category === "object") {
      category = a.category.label || a.category.name || a.category.key || "General";
    } else if (a.category) {
      category = String(a.category);
    }
    
    // Capitalize first letter if needed
    if (category && category.length > 0) {
      category = category.charAt(0).toUpperCase() + category.slice(1);
    }

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
          {/* Welcome Banner - Glass Effect with Increased Height */}
          <section className="mb-6">
            <div className="relative h-24 rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
              <div className="relative text-center px-6 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Welcome to NewsHub</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">Stay updated with the latest news from around the world</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => router.push('/news')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                >
                  Explore <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </section>

          {/* Latest News - Professional Sleek Design */}
          {latestNewsLoading ? (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              <div className="relative h-52 rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/10 flex items-center justify-center">
                <div className="text-white text-sm">Loading latest news...</div>
              </div>
            </section>
          ) : rssLatestNews.length > 0 ? (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Business Standard</span>
                  <span className="text-sm text-muted-foreground">{rssLatestNews.length} stories</span>
                </div>
              </div>
              <div className="relative h-52 rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                <div className="absolute inset-0 flex items-center">
                  <div className="flex gap-6 animate-scroll px-6">
                    {[...rssLatestNews, ...rssLatestNews].map((item, index) => (
                      <Link
                        key={`rss-${index}`}
                        href={`/article/${item.slug}`}
                        className="group flex-shrink-0 w-[440px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 hover:from-white/15 hover:to-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-start gap-4 h-full">
                          {/* Modern Image Placeholder */}
                          <div className="flex-shrink-0 w-28 h-28 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm">
                              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-200 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-white/70 line-clamp-2 mb-3 leading-relaxed">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                                <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-white/70 font-medium">
                                  {new Date(item.pubDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Business Standard</span>
              </div>
              <div className="relative h-52 rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                <div className="relative text-center">
                  <div className="text-white/90 text-base font-semibold mb-2">No latest news available yet</div>
                  <div className="text-white/60 text-sm">Articles will appear here once scraped from Business Standard</div>
                </div>
              </div>
            </section>
          )}

          {/* Featured (Removed - replaced by welcome banner) */}
          <section className="mb-12 hidden">
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
                        {section.displayName} News
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
