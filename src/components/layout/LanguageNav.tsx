"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = { code: string; label: string; count?: number };

const DEFAULT_LANGS: Lang[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "mr", label: "Marathi" },
];

export default function LanguageNav({ className }: { className?: string }) {
  const [langs, setLangs] = useState<Lang[]>(DEFAULT_LANGS);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        const detected: string[] = Array.isArray(json?.categories)
          ? Array.from(new Set(json.categories.map((c: any) => c.language).filter(Boolean)))
          : [];
        if (!mounted) return;
        if (detected.length > 0) {
          const merged: Lang[] = DEFAULT_LANGS.filter(l => detected.includes(l.code));
          setLangs(merged);
        }
      } catch {}
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={className}>
      {langs.map((lng, idx) => (
        <span key={lng.code}>
          <Link
            href={`/${lng.code}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {lng.label}
          </Link>
          {idx < langs.length - 1 && <span className="mx-2 text-muted-foreground/60">|</span>}
        </span>
      ))}
    </div>
  );
}


