"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Clock, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface AdProps {
  title: string;
  description: string;
  image?: string;
  badge?: string;
  link?: string;
  type?: "banner" | "card" | "compact";
}

export function SidebarAd({ title, description, image, badge, link, type = "card" }: AdProps) {
  if (type === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg mb-6 group cursor-pointer"
        onClick={() => link && window.open(link, '_blank')}
      >
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          {badge && <Badge className="self-start z-10 bg-white text-black">{badge}</Badge>}
          <div className="z-10">
            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/90 text-sm mb-4">{description}</p>
            {link && (
              <Button size="sm" variant="secondary" className="gap-2">
                Learn More <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => link && window.open(link, '_blank')}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              {image && (
                <div className="w-20 h-20 rounded bg-muted flex-shrink-0 overflow-hidden">
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {badge && <Badge variant="secondary" className="mb-1 text-xs">{badge}</Badge>}
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => link && window.open(link, '_blank')}>
        {image && (
          <div className="relative h-40 bg-muted overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <CardContent className="p-4">
          {badge && <Badge variant="secondary" className="mb-2">{badge}</Badge>}
          <h3 className="font-semibold mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{description}</p>
          {link && (
            <Button size="sm" variant="outline" className="w-full gap-2">
              Learn More <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrendingArticle({ article }: { article: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {article.images?.[0]?.url && (
              <div className="w-24 h-24 rounded bg-muted flex-shrink-0 overflow-hidden">
                <img 
                  src={article.images[0].url} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-1 text-xs">
                {article.category?.label || article.category || "News"}
              </Badge>
              <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {article.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                )}
                {article.viewCount && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function NewsletterSignup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get the latest news delivered directly to your inbox.
          </p>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm mb-3"
          />
          <Button className="w-full">Subscribe</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
