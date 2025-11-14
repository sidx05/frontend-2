"use client";

import { SidebarAd, TrendingArticle } from "@/components/article/sidebar-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export function RightSidebar() {
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

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
    // Fetch trending articles
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/trending?limit=5');
        if (response.ok) {
          const data = await response.json();
          setTrendingArticles(data.data?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Error fetching trending articles:', error);
      }
    };

    // Fetch ads for right sidebar
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/ads?position=right");
        const data = await response.json();
        if (data.success) {
          setAds(data.data);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    // Fetch editor's picks
    const fetchEditorsPicks = async () => {
      try {
        const response = await fetch("/api/editors-picks");
        const data = await response.json();
        if (data.success) {
          setEditorsPicks(data.data);
        }
      } catch (error) {
        console.error("Error fetching editor's picks:", error);
      }
    };

    // Fetch events
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchTrending();
    fetchAds();
    fetchEditorsPicks();
    fetchEvents();
  }, []);

  const getAdByPosition = (position: string) => {
    return ads.find(ad => ad.position === position);
  };

  const topAd = getAdByPosition("right-top");
  const middleAd = getAdByPosition("right-middle");
  const bottomAd = getAdByPosition("right-bottom");

  return (
    <aside className="space-y-6">
      {/* Trending Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingArticles.length > 0 ? (
              trendingArticles.map((article, idx) => (
                <TrendingArticle key={article._id || idx} article={article} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading trending articles...
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Advertisement */}
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

      {/* Editor's Picks */}
      {editorsPicks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Editor's Picks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editorsPicks.map((item, idx) => (
                <Link key={idx} href={item.slug ? `/article/${item.slug}` : "#"}>
                  <div className="border-b border-border pb-3 last:border-0 last:pb-0 hover:bg-muted/50 rounded p-2 cursor-pointer transition-colors">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sponsored Content */}
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

      {/* Upcoming Events */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event, idx) => (
                <Link key={idx} href={event.link || "#"}>
                  <div className="border-b border-border pb-3 last:border-0 last:pb-0 hover:bg-muted/50 rounded p-2 cursor-pointer transition-colors">
                    <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      <div>{event.date}</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compact Advertisement */}
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
