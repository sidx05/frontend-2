"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Eye, Tag, Star, Share2, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BrandWireArticle {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  category: string;
  tags: string[];
  author: string;
  language: string;
  status: string;
  featured: boolean;
  priority: number;
  publishedAt: string;
  viewCount: number;
  seo?: {
    metaDescription: string;
    keywords: string[];
  };
}

const CATEGORIES = [
  { value: 'influential-personalities', label: 'Influential Personalities' },
  { value: 'brand-spotlight', label: 'Brand Spotlight' },
  { value: 'industry-insights', label: 'Industry Insights' },
  { value: 'thought-leadership', label: 'Thought Leadership' },
  { value: 'company-news', label: 'Company News' }
];

export default function BrandWireArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [article, setArticle] = useState<BrandWireArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to find by slug
      const response = await fetch(`/api/brand-wire?slug=${slug}&status=published`);
      const data = await response.json();
      
      if (data.success && data.articles.length > 0) {
        setArticle(data.articles[0]);
      } else {
        setError('Article not found');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/brand-wire">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Brand Wire
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/brand-wire" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Brand Wire
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">
                {getCategoryLabel(article.category)}
              </Badge>
              {article.featured && (
                <Badge variant="destructive">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {article.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimateReadingTime(article.content)} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.viewCount} views
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.images.length > 0 && (
            <div className="mb-8">
              <img
                src={article.images[0].url}
                alt={article.images[0].alt}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              {article.images[0].caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {article.images[0].caption}
                </p>
              )}
            </div>
          )}

          <Separator className="mb-8" />

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div 
              className="whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
            />
          </article>

          {/* Additional Images */}
          {article.images.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">More Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.images.slice(1).map((image, index) => (
                  <Card key={index}>
                    <CardContent className="p-0">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {image.caption && (
                        <p className="p-4 text-sm text-muted-foreground">
                          {image.caption}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Published on {formatDate(article.publishedAt)} by {article.author}
              </div>
              <Button asChild variant="outline">
                <Link href="/brand-wire">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  More Articles
                </Link>
              </Button>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
