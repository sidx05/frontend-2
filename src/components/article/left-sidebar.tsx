"use client";

import { SidebarAd, NewsletterSignup } from "@/components/article/sidebar-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export function LeftSidebar() {
  const [ads, setAds] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Track ad impression
  const trackAdImpression = useCallback(async (adId: string) => {
    try {
      await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, action: "impression" }),
      });
    } catch (error) {
      console.error("Error tracking ad impression:", error);
    }
  }, []);

  // Track ad click
  const trackAdClick = useCallback(async (adId: string) => {
    try {
      await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, action: "click" }),
      });
    } catch (error) {
      console.error("Error tracking ad click:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch ads for left sidebar
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/ads?position=left");
        const data = await response.json();
        if (data.success) {
          setAds(data.data);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Fetch category stats
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories/stats");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchAds();
    fetchStats();
    fetchCategories();
  }, []);

  const getAdByPosition = (position: string) => {
    return ads.find(ad => ad.position === position);
  };

  const topAd = getAdByPosition("left-top");
  const middleAd = getAdByPosition("left-middle");
  const bottomAd = getAdByPosition("left-bottom");

  return (
    <aside className="space-y-6">
      {/* Featured Advertisement */}
      {topAd && (
        <SidebarAd
          id={topAd.id}
          type={topAd.type || "banner"}
          title={topAd.title}
          description={topAd.description}
          badge={topAd.badge}
          image={topAd.image}
          link={topAd.link}
          onImpression={trackAdImpression}
          onClick={trackAdClick}
        />
      )}

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Quick Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Articles Published</span>
                <span className="font-bold">{stats.articlesPublishedToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Readers</span>
                <span className="font-bold">{(stats.totalReaders / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Breaking News</span>
                <span className="font-bold text-red-500">{stats.breakingNews}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Advertisement Card */}
      {middleAd && (
        <SidebarAd
          id={middleAd.id}
          type={middleAd.type || "card"}
          title={middleAd.title}
          description={middleAd.description}
          image={middleAd.image}
          badge={middleAd.badge}
          link={middleAd.link}
          onImpression={trackAdImpression}
          onClick={trackAdClick}
        />
      )}

      {/* Categories Quick Access */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Popular Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat, idx) => (
                <Link key={idx} href={`/categories/${cat.name.toLowerCase()}`}>
                  <div className="flex justify-between items-center py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-2 cursor-pointer transition-colors">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.count} articles</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compact Ad */}
      {bottomAd && (
        <SidebarAd
          id={bottomAd.id}
          type={bottomAd.type || "compact"}
          title={bottomAd.title}
          description={bottomAd.description}
          image={bottomAd.image}
          badge={bottomAd.badge}
          link={bottomAd.link}
          onImpression={trackAdImpression}
          onClick={trackAdClick}
        />
      )}
    </aside>
  );
}
