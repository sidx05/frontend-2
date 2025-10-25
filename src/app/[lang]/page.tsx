"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Loader2, ChevronUp, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WeatherCompact from "@/components/weather/weather-compact";

type UiArticle = {
  id: string;
  title: string;
  summary?: string;
  thumbnail?: string;
  slug?: string;
  source?: { name?: string } | string;
  publishedAt?: string;
};

// Helper function to map article data to UI format
const mapArticleToUi = (article: any) => {
  const publishedAt = new Date(article.publishedAt || article.scrapedAt || Date.now());
  
  let category = "General";
  
  if (typeof article.category === "object" && article.category) {
    category = article.category.label || article.category.name || article.category.key || "General";
  } else if (article.category) {
    category = article.category;
  } else if (article.categories && article.categories.length > 0) {
    category = article.categories[0] || "General";
  }
  
  if (/^[0-9a-fA-F]{24}$/.test(String(category))) {
    if (article.categories && article.categories.length > 0) {
      const firstCategory = article.categories[0];
      if (typeof firstCategory === 'string' && !/^[0-9a-fA-F]{24}$/.test(firstCategory)) {
        category = firstCategory;
      } else {
        category = 'General';
      }
    } else {
      category = 'General';
    }
  }
  
  category = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    id: article._id || article.id,
    title: article.title || 'Untitled',
    summary: article.summary || '',
    thumbnail: article.thumbnail || article.image || article.openGraph?.image || (Array.isArray(article.images) && article.images[0]?.url),
    slug: article.slug || article._id || article.id,
    source: article.source?.name || 'Unknown Source',
    publishedAt: article.publishedAt,
    category: category
  };
};

export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = String(params?.lang || "en");
  // Let the API use the settings limit instead of hardcoding

  const [articles, setArticles] = useState<UiArticle[]>([]);
  const [textOnly, setTextOnly] = useState<UiArticle[]>([]);
  const [general, setGeneral] = useState<UiArticle[]>([]);
  const [uncategorized, setUncategorized] = useState<UiArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // Track processed article IDs to prevent duplicates across all batches
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // reset when lang changes
    setArticles([]);
    setTextOnly([]);
    setGeneral([]);
    setUncategorized([]);
    setPage(1);
    setDone(false);
    processedIdsRef.current.clear(); // Clear processed IDs when language changes
  }, [lang]);

  // Update time every second to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    // Set initial time
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lang]);

  // Load uncategorized articles
  useEffect(() => {
    const loadUncategorized = async () => {
      try {
        const url = new URL(`/api/news`, window.location.origin);
        url.searchParams.set("lang", lang);
        url.searchParams.set("category", "uncategorized");
        url.searchParams.set("sortBy", "publishedAt");
        url.searchParams.set("sortOrder", "desc");
        
        const res = await fetch(url.toString(), { cache: "no-store" });
        const json = await res.json();
        const uncategorizedArticles: UiArticle[] = Array.isArray(json?.articles) ? json.articles : [];
        setUncategorized(uncategorizedArticles);
      } catch (error) {
        console.error('Error loading uncategorized articles:', error);
      }
    };
    
    loadUncategorized();
  }, [lang]);

  useEffect(() => {
    if (!sentinelRef.current || done) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && !done) {
        setPage((p) => p + 1);
      }
    }, { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, done]);

  async function loadMore() {
    if (loading || done) return;
    setLoading(true);
    try {
      const url = new URL(`/api/news`, window.location.origin);
      url.searchParams.set("lang", lang);
      url.searchParams.set("page", String(page));
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("sortOrder", "desc");
      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      const batch: UiArticle[] = Array.isArray(json?.articles) ? json.articles : [];
      
      // Process articles and categorize them properly to avoid duplicates
      const processedArticles: UiArticle[] = [];
      const generalArticles: UiArticle[] = [];
      const textOnlyArticles: UiArticle[] = [];
      
      batch.forEach((a: any) => {
        const articleId = a.id || a.slug || a._id;
        if (!articleId || processedIdsRef.current.has(articleId)) return;
        
        processedIdsRef.current.add(articleId);
        const mappedArticle = mapArticleToUi(a);
        
        // Check if article has image
        const hasImage = Boolean(a?.thumbnail || a?.image || a?.openGraph?.image || (Array.isArray(a?.images) && a.images[0]?.url));
        
        // Categorize articles
        if (mappedArticle.category.toLowerCase() === 'general') {
          generalArticles.push(mappedArticle);
        } else {
          processedArticles.push(mappedArticle);
        }
        
        // Add to text-only if no image (but only if not already in general)
        if (!hasImage && mappedArticle.category.toLowerCase() !== 'general') {
          textOnlyArticles.push(mappedArticle);
        }
      });
      
      // Update state with processed articles using functional updates to prevent duplicates
      setArticles((prev) => {
        const existingIds = new Set(prev.map(a => a.id));
        const newArticles = processedArticles.filter(a => !existingIds.has(a.id));
        return [...prev, ...newArticles];
      });
      
      if (generalArticles.length) {
        setGeneral((prev) => {
          const existingIds = new Set(prev.map(a => a.id));
          const newArticles = generalArticles.filter(a => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
      
      if (textOnlyArticles.length) {
        setTextOnly((prev) => {
          const existingIds = new Set(prev.map(a => a.id));
          const newArticles = textOnlyArticles.filter(a => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
      
      // Check if we got fewer articles than expected (indicating end of data)
      if (batch.length === 0) setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // helper to check if article has an image for main grid
  const getImageSrc = (a: any) => a?.thumbnail || a?.image || a?.openGraph?.image || (Array.isArray(a?.images) && a.images[0]?.url) || "";
  const hasImage = (a: any) => Boolean(getImageSrc(a));

  // Show all non-general articles in main grid (both with and without images)
  const mainGridArticles = articles;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h1 className="text-xl md:text-2xl font-semibold">All {lang.toUpperCase()} Articles</h1>
              <Badge variant="secondary" className="ml-1">Infinite</Badge>
            </div>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            Showing {articles.length + general.length} loaded
          </div>
        </div>

        {/* Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainGridArticles.map((a, index) => {
            const src = getImageSrc(a);
            return (
          <a key={`main-${a.id || a.slug || `fallback-${index}`}-${index}`} href={a.slug ? `/articles/${a.slug}` : (a.id ? `/article/${a.id}` : '#')} className="block border rounded-lg p-4 hover:shadow">
              {src && (<img src={String(src)} alt={a.title} className="w-full h-40 object-cover rounded mb-3" />)}
            <h3 className="font-semibold mb-2 line-clamp-2">{a.title}</h3>
            {a.summary && (
              <p className="text-sm text-muted-foreground line-clamp-3">{a.summary}</p>
            )}
          </a>
        );})}
          </div>

           {/* Sidebar: weather/time + text-only articles */}
          <aside className="lg:col-span-1 space-y-4">
             {/* Weather */}
             <WeatherCompact />
             {/* Local time */}
             <div className="border rounded-lg p-4 text-sm text-muted-foreground">
               <div className="font-semibold text-foreground mb-1">Local time</div>
               <div className="flex items-center gap-2">
                 <Clock className="h-4 w-4" />
                 <span>{currentTime || "Loading..."}</span>
               </div>
             </div>
            {textOnly.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">More stories</h3>
                  <Badge variant="secondary" className="text-xs">No images</Badge>
                </div>
                <div className="space-y-3">
                  {textOnly.slice(0, 12).map((t, index) => (
                    <a key={`text-${t.id || t.slug || `fallback-${index}`}-${index}`} href={t.slug ? `/articles/${t.slug}` : (t.id ? `/article/${t.id}` : '#')} className="block group">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">{t.title}</h4>
                      {t.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.summary}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* General Articles */}
            {general.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">General Articles</h3>
                  <Badge variant="secondary" className="text-xs">General</Badge>
                </div>
                <div className="space-y-3">
                  {general.slice(0, 6).map((article, index) => (
                    <a key={`general-${article.id || article.slug || `fallback-${index}`}-${index}`} href={article.slug ? `/articles/${article.slug}` : (article.id ? `/article/${article.id}` : '#')} className="block group">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">{article.title}</h4>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{article.summary}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Uncategorized Articles */}
            {uncategorized.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Other Articles</h3>
                  <Badge variant="outline" className="text-xs">Uncategorized</Badge>
                </div>
                <div className="space-y-3">
                  {uncategorized.slice(0, 6).map((article, index) => (
                    <a key={`uncategorized-${article.id || article.slug || `fallback-${index}`}-${index}`} href={article.slug ? `/articles/${article.slug}` : (article.id ? `/article/${article.id}` : '#')} className="block group">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">{article.title}</h4>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{article.summary}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Sentinel & states */}
        <div className="mt-8 flex items-center justify-center">
          {!done ? (
            <div ref={sentinelRef} className="flex items-center gap-2 text-sm text-muted-foreground">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Loading more..." : "Scroll to load more"}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">You have reached the end.</div>
          )}
        </div>
      </main>

      {/* Back-to-top */}
      {showTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 rounded-full h-10 w-10 p-0 shadow-lg"
          variant="default"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      <Footer />
    </div>
  );
}

// (server fallback removed; client page above handles infinite scroll)