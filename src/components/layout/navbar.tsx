// src/components/layout/navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Menu, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchBar from "@/components/search/SearchBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { fetchCategories } from "@/lib/api";
import Ticker from "@/components/ticker/Ticker";
import LanguageNav from "@/components/layout/LanguageNav";
// BrandWireLink removed per request; using a simple category link instead
import { cn } from "@/lib/utils";

export function Navbar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchCategories()
      .then((cats) => {
        if (mounted && Array.isArray(cats)) setCategories(cats);
      })
      .catch((e) => console.error("Failed fetching categories:", e));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement search redirect
    console.log("Search", searchQuery);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Breaking ticker (live) */}
        <Ticker />

        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NewsHub
              </span>
            </Link>
            {/* Brand Wire + Languages (modular) */}
            <div className="hidden md:flex items-center gap-3 ml-6 text-sm">
              <Link href="/brand-wire" className="font-semibold hover:underline">
                Brand Wire
              </Link>
              <span className="text-muted-foreground">|</span>
              <LanguageNav />
            </div>
          </div>

          {/* Desktop Categories removed as requested */}

          {/* Search + Theme + Mobile */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center">
              <SearchBar />
            </div>

            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 rounded p-1"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden h-9 w-9 p-0 rounded">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-4">
                  {/* Mobile Logo */}
                  <div className="px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        NewsHub
                      </span>
                    </div>
                  </div>

                  {/* Mobile Search */}
                  <div className="px-4">
                    <SearchBar className="w-full" />
                  </div>

                  {/* Mobile Categories removed as requested */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
