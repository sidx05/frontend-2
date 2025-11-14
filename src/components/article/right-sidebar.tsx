"use client";

import { SidebarAd, TrendingArticle } from "./sidebar-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function RightSidebar() {
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);

  useEffect(() => {
    // Fetch trending articles
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/articles?limit=5&sort=viewCount');
        if (response.ok) {
          const data = await response.json();
          setTrendingArticles(data.data?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Error fetching trending articles:', error);
      }
    };

    fetchTrending();
  }, []);

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
      <SidebarAd
        type="banner"
        title="Boost Your Business"
        description="Advertise with us and reach millions of readers worldwide"
        badge="Advertise"
        link="#"
      />

      {/* Editor's Picks */}
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
            {[
              {
                title: "The Future of Artificial Intelligence in 2025",
                category: "Technology",
                time: "5 min read"
              },
              {
                title: "Global Markets React to Economic Policy Changes",
                category: "Business",
                time: "7 min read"
              },
              {
                title: "Climate Summit Reaches Historic Agreement",
                category: "Environment",
                time: "6 min read"
              },
              {
                title: "Breakthrough in Renewable Energy Storage",
                category: "Science",
                time: "8 min read"
              }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-border pb-3 last:border-0 last:pb-0 hover:bg-muted/50 rounded p-2 cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.category}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sponsored Content */}
      <SidebarAd
        type="card"
        title="Professional Development Course"
        description="Master your skills with industry-leading experts. Enroll now and get 30% off!"
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
        badge="Sponsored"
        link="#"
      />

      {/* Upcoming Events */}
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
            {[
              {
                title: "Tech Innovation Summit 2025",
                date: "Nov 20, 2025",
                location: "Virtual"
              },
              {
                title: "Global Business Forum",
                date: "Nov 25, 2025",
                location: "New York"
              },
              {
                title: "Digital Marketing Workshop",
                date: "Dec 1, 2025",
                location: "Online"
              }
            ].map((event, idx) => (
              <div key={idx} className="border-b border-border pb-3 last:border-0 last:pb-0 hover:bg-muted/50 rounded p-2 cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                <div className="text-xs text-muted-foreground">
                  <div>{event.date}</div>
                  <div>{event.location}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Compact Advertisement */}
      <SidebarAd
        type="compact"
        title="Investment Platform"
        description="Start investing with as little as $10. Join 2M+ investors"
        image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop"
        badge="Ad"
        link="#"
      />
    </aside>
  );
}
