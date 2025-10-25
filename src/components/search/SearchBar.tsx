"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  placeholder?: string;
  initialQuery?: string;
};

export default function SearchBar({ className, placeholder = "Search news...", initialQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const submittedRef = useRef(false);

  const onSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    submittedRef.current = true;
    // Route to unified news listing with q param (backend supports q)
    router.push(`/news?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  }, [onSubmit]);

  // Optional: allow Ctrl+K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = inputRef.current;
        if (el) el.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form onSubmit={onSubmit} className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className={cn("transition-all duration-300", focused ? "w-80" : "w-64")}
        />
        <button type="submit" className="absolute right-0 top-0 h-full px-3">
          <Search className="h-4 w-4" />
        </button>
      </div>
      <Button type="submit" variant="secondary" className="hidden md:inline-flex">
        Search
      </Button>
    </form>
  );
}


