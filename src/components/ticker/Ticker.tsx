"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchActiveTickers, fetchArticles } from "@/lib/api";

type TickerItem = { title: string; url?: string };

interface TickerProps {
  className?: string;
  limit?: number;
  lang?: string; // optional: filter headlines by language code (e.g., 'en','hi','te')
  category?: string; // optional: filter by category key
  label?: string; // left badge label, default 'BREAKING'
}

export default function Ticker({ className, limit = 15, lang, category, label = "BREAKING" }: TickerProps) {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) Try dedicated ticker API if available
      const tickers = await fetchActiveTickers().catch(() => []);

      let headlines: TickerItem[] = Array.isArray(tickers)
        ? tickers
            .map((t: any) => ({ title: String(t?.text || t?.title || "").trim(), url: t?.url }))
            .filter((t) => t.title.length > 0)
        : [];

      // 2) Fallback to latest articles if ticker API empty
      if (headlines.length === 0) {
        // Try backend library (may point to external API host)
        let articles: any[] = await fetchArticles({
          limit: Math.min(limit, 25),
          lang,
          category,
          sortBy: "publishedAt",
          sortOrder: "desc",
        }).catch(() => []);

        // 3) Final fallback: hit this app's own Next.js API route (/api/news)
        if (!articles || articles.length === 0) {
          try {
            const url = new URL("/api/news", window.location.origin);
            url.searchParams.set("limit", String(Math.min(limit, 25)));
            url.searchParams.set("sortBy", "publishedAt");
            url.searchParams.set("sortOrder", "desc");
            if (lang) url.searchParams.set("lang", lang);
            if (category) url.searchParams.set("category", category);
            const res = await fetch(url.toString(), { cache: "no-store" });
            const json = await res.json().catch(() => null as any);
            articles = Array.isArray(json?.articles) ? json.articles : [];
          } catch {
            articles = [];
          }
        }

        headlines = (articles || [])
          .map((a: any) => ({ title: String(a?.title || "").trim(), url: a?.canonicalUrl || a?.url }))
          .filter((t) => t.title.length > 0);
      }

      if (!cancelled) {
        // De-duplicate by title
        const seen = new Set<string>();
        const deduped: TickerItem[] = [];
        for (const h of headlines) {
          if (!seen.has(h.title)) {
            seen.add(h.title);
            deduped.push(h);
          }
          if (deduped.length >= limit) break;
        }
        setItems(deduped);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit, lang, category]);

  const marqueeText = useMemo(() => {
    if (!items || items.length === 0) return "";
    return items.map((i) => i.title).join(" • ");
  }, [items]);

  return (
    <div className={className}>
      <div className="h-8 flex items-center bg-red-600 text-white overflow-hidden">
        <div className="bg-red-700 px-3 py-1 font-semibold text-sm whitespace-nowrap">{label}</div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap px-4 text-sm">
            {marqueeText || "Loading latest headlines..."}
          </div>
        </div>
      </div>
    </div>
  );
}


