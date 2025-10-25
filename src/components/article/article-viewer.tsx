// src/components/article/article-viewer.tsx
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Eye, Bookmark, Share2,
  Facebook, Twitter, Linkedin, MessageCircle,
  Heart, User, Calendar, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useState } from "react";

interface ArticleViewerProps {
  article: any;
}

export default function ArticleViewer({ article }: ArticleViewerProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleBookmark = () => setIsBookmarked(!isBookmarked);
  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };

  // Normalize fields coming from backend
  const normalizedAuthor = typeof article.author === "string"
    ? { name: article.author }
    : (article.author || { name: "NewsHub" });

  const views = article.viewCount ?? article.views ?? 0;
  const likes = article.likes ?? article.reactions ?? article.likesCount ?? 0;
  const commentsCount = article.commentsCount ?? (Array.isArray(article.comments) ? article.comments.length : 0);

  const categoryLabel = article.category?.label || article.category?.name || article.category || "General";

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Button variant="ghost" className="mb-6" onClick={() => (history.back())}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to News
            </Button>
          </motion.div>

          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">{categoryLabel}</Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{article.title}</h1>
              {article.subtitle && <p className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(article.publishedAt || article.createdAt)}</div>
                {article.readTime && <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.readTime}</div>}
                <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{views.toLocaleString()} views</div>
              </div>

              {/* Article Metadata */}
              <Card className="mb-6 bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">Source:</span>
                        <span>{article.source?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">Published:</span>
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">Language:</span>
                        <Badge variant="outline" className="text-xs">
                          {article.language || 'English'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {article.scrapedAt && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Scraped:</span>
                          <span className="text-xs">{formatDate(article.scrapedAt)}</span>
                        </div>
                      )}
                      {article.wordCount && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Words:</span>
                          <span>{article.wordCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {article.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag: string) => (
                    <div key={tag} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                      <Tag className="h-3 w-3" />{tag}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {article.images?.length > 0 && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                <img src={article.images[0].url} alt={article.images[0].alt || article.title} className="w-full h-full object-cover" />
              </div>
            )}

            {normalizedAuthor && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={normalizedAuthor.avatar || `https://www.gravatar.com/avatar/?d=mp&s=200`} alt={normalizedAuthor.name || "Author"} />
                      <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{normalizedAuthor.name}</h4>
                      {normalizedAuthor.bio && <p className="text-muted-foreground text-sm mb-2">{normalizedAuthor.bio}</p>}
                      {normalizedAuthor.twitter && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{normalizedAuthor.twitter}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="prose prose-lg max-w-none mb-8">
              <div className="[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:mt-8 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
            </div>

            <div className="flex items-center justify-between py-6 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant={isBookmarked ? "default" : "outline"} size="sm" onClick={handleBookmark} className="flex items-center gap-2">
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>

                <div className="relative">
                  <Button variant="outline" size="sm" onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>

                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-2 z-10">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")}><Facebook className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")}><Twitter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare("linkedin")}><Linkedin className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Heart className="h-4 w-4 mr-1" />{likes.toLocaleString()}</Button>
                <Button variant="ghost" size="sm"><MessageCircle className="h-4 w-4 mr-1" />{commentsCount.toLocaleString()}</Button>
              </div>
            </div>

            <Separator className="my-8" />

            {article.relatedArticles && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {article.relatedArticles.map((ra: any) => (
                    <Card key={ra.id || ra._id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img src={ra.images?.[0]?.url || "/placeholder.png"} alt={ra.images?.[0]?.alt || ra.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{ra.category?.label || ra.category || "General"}</Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2">{ra.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ra.summary}</p>
                        <div className="flex items-center justify-between">
                          {ra.readTime && <span className="text-xs text-muted-foreground">{ra.readTime}</span>}
                          <Button variant="ghost" size="sm">Read More</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </motion.article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
