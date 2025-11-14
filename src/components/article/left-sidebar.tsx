"use client";

import { SidebarAd, NewsletterSignup } from "@/components/article/sidebar-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

export function LeftSidebar() {
  const [ads, setAds] = useState<any[]>([]);

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

    fetchAds();
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
