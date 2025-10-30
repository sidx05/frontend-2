'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LatestArticle {
  id: string;
  title: string;
  description: string;
  slug: string;
  pubDate: string;
  link: string;
}

export default function LatestNewsPage() {
  const [articles, setArticles] = useState<LatestArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestNews() {
      try {
        setLoading(true);
        const response = await fetch('/api/news/trending');
        if (!response.ok) {
          throw new Error('Failed to fetch latest news');
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching latest news:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    }

    fetchLatestNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading latest news...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Latest News</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Scroll.in
            </span>
            <span className="text-muted-foreground">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No articles available yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for the latest news from Scroll.in</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/article/${article.slug}`}
                  className="group block h-full"
                >
                  <div className="h-full bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Latest
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(article.pubDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
