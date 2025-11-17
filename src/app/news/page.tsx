// src/app/news/page.tsx  
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Eye, Filter, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import WeatherCompact from "@/components/weather/weather-compact";
import { fetchArticles, fetchCategories } from "@/lib/api";

const languageMap: Record<string, string> = {
  te: "Telugu",
  en: "English", 
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  bn: "Bengali"
};

// Function to sanitize ObjectIds from text fields
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove MongoDB ObjectId patterns (24 hex characters)
  return text.replace(/\b[0-9a-fA-F]{24}\b/g, '').trim();
}

function NewsPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [textOnlyArticles, setTextOnlyArticles] = useState<any[]>([]);
  const [generalArticles, setGeneralArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uncategorizedArticles, setUncategorizedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Derive language/category from query or pretty URL (/telugu/sports)
  const pathSegments = (pathname || '').split('/').filter(Boolean);
  const prettyLang = pathSegments[0] || '';
  const prettyCategory = pathSegments[1] || '';
  const prettyLangMap: Record<string,string> = {
    telugu: 'te', hindi: 'hi', english: 'en', tamil: 'ta', bengali: 'bn', gujarati: 'gu', marathi: 'mr'
  };
  const language = searchParams.get('lang') || prettyLangMap[prettyLang] || 'all';
  const languageName = language === 'all' ? 'All Languages' : (languageMap[language] || 'English');
  const categoryFromUrl = searchParams.get('category') || prettyCategory || 'all';
  const typeFromUrl = (searchParams.get('type') || searchParams.get('contentType') || '').toLowerCase();
  
  // Helper function to get category display name
  const getCategoryDisplayName = () => {
    if (selectedCategory === 'all') return '';
    const isObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);
    const category = categories.find(
      (cat) =>
        cat.name === selectedCategory ||
        cat.key === selectedCategory ||
        String(cat._id) === selectedCategory ||
        String(cat.id) === selectedCategory
    );
    if (category) return category.displayName || category.label || category.name || category.key;
    // Avoid flashing raw ObjectId before categories load
    if (isObjectId(selectedCategory)) return '';
    return selectedCategory;
  };

  // Update selectedCategory immediately from URL - no delay
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setCurrentPage(1); // Reset to first page when category changes
  }, [categoryFromUrl]);

  // When categories load, map ObjectId-like category to its canonical name to prevent future flashes
  useEffect(() => {
    const isObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);
    if (!categories?.length) return;
    if (selectedCategory !== 'all' && isObjectId(selectedCategory)) {
      const match = categories.find(
        (cat) => String(cat._id) === selectedCategory || String(cat.id) === selectedCategory
      );
      if (match && match.name && match.name !== selectedCategory) {
        setSelectedCategory(match.name);
      }
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    loadArticles();
  }, [language, categoryFromUrl, typeFromUrl, sortBy, currentPage, searchTerm]); // Include typeFromUrl for filtering

  // Sync search term from URL param `q` (from navbar search)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
    // reset to first page when a new query arrives
    if (q) setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, [language]);

  // Load uncategorized articles
  useEffect(() => {
    const loadUncategorizedArticles = async () => {
      try {
        const params = new URLSearchParams({
          category: 'uncategorized',
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        });
        
        if (language !== 'all') {
          params.append('lang', language);
        }
        
        const response = await fetch(`/api/news?${params}`);
        const data = await response.json();
        
        if (data.success && data.articles) {
          setUncategorizedArticles(data.articles);
        }
      } catch (error) {
        console.error('Error loading uncategorized articles:', error);
      }
    };
    
    loadUncategorizedArticles();
  }, [language]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Use categoryFromUrl directly instead of selectedCategory state
      const currentCategory = searchParams.get('category') || prettyCategory || 'all';
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '30', // Set explicit limit for more articles per page
        sortBy: sortBy === 'latest' ? 'publishedAt' : 'viewCount',
        sortOrder: 'desc'
      });

      // Only add language parameter if it's not 'all'
      if (language !== 'all') {
        params.append('lang', language);
      }

      if (currentCategory !== 'all') {
        params.append('category', currentCategory);
      }

      // Pass through content type (video, photo-gallery, etc.)
      if (typeFromUrl) {
        params.append('type', typeFromUrl);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        const fetchedArticles = data.articles || [];
        setTotalPages(data.pagination?.pages || 1);
        
        // Separate articles by category and images
        const generalArticles = fetchedArticles.filter((article: any) => {
          const mappedArticle = mapArticleToUi(article);
          return mappedArticle.category.toLowerCase() === 'general';
        });
        
        const nonGeneralArticles = fetchedArticles.filter((article: any) => {
          const mappedArticle = mapArticleToUi(article);
          return mappedArticle.category.toLowerCase() !== 'general';
        });
        
        // Separate non-general articles with and without images
        const imageArticles = nonGeneralArticles.filter((article: any) => {
          const imgSrc = article?.thumbnail || article?.image || article?.openGraph?.image || (Array.isArray(article?.images) && article.images[0]?.url);
          return Boolean(imgSrc && imgSrc.trim() !== '');
        });
        
        const textOnly = nonGeneralArticles.filter((article: any) => {
          const imgSrc = article?.thumbnail || article?.image || article?.openGraph?.image || (Array.isArray(article?.images) && article.images[0]?.url);
          return !Boolean(imgSrc && imgSrc.trim() !== '');
        });
        
        setArticles(imageArticles);
        setTextOnlyArticles(textOnly);
        setGeneralArticles(generalArticles);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const url = language === 'all' ? '/api/categories' : `/api/categories?lang=${language}`;
      const response = await fetch(url);
      const data = await response.json();

      const apiCats = data.success ? (data.categories || []) : [];

      // Canonical set used across the app; restrict Telugu as requested
      const defaultCategoryKeys = (
        language === 'te'
          ? ['politics','sports','entertainment','health','andhra-pradesh','crime','business']
          : ['politics','sports','business','entertainment','technology','health','education','crime']
      );

      // Normalize: always expose the canonical set; prefer API category when present
      const normalized = defaultCategoryKeys.map((key) => {
        const found = apiCats.find((c: any) => (c.key || '').toLowerCase() === key || (c.name || '').toLowerCase() === key);
        if (found) return found;
        return {
          name: key, // APIs accept string keys too
          key,
          displayName: key.charAt(0).toUpperCase() + key.slice(1),
          articleCount: 0
        };
      });

      setCategories(normalized);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles();
  };

  const mapArticleToUi = (article: any) => {
    const publishedAt = new Date(article.publishedAt || article.scrapedAt || Date.now());
    
    // Use database category if available, otherwise fall back to smart detection
    let category = "General";
    
    // First, try to get category from database
    if (typeof article.category === "object" && article.category) {
      category = article.category.label || article.category.name || article.category.key || "General";
    } else if (article.category) {
      category = article.category;
    } else if (article.categories && article.categories.length > 0) {
      // If no single category, try to get from categories array
      // This would need to be resolved from ObjectId to name, but for now use first one
      category = article.categories[0] || "General";
    } else {
      // Only do smart categorization if no database category is available
      const titleText = (article.title || "").toLowerCase();
      const summaryText = (article.summary || "").toLowerCase();
      const contentText = (article.content || "").toLowerCase();
      const combinedText = `${titleText} ${summaryText} ${contentText}`;
      
      // Enhanced category keywords mapping with Telugu support
      const categoryKeywords = {
        politics: [
          // English keywords
          'politics', 'political', 'election', 'government', 'minister', 'chief minister', 'pm', 'president', 'parliament', 'assembly', 'vote', 'voting', 'party', 'congress', 'bjp', 'tdp', 'ysr', 'jagan', 'modi', 'rahul', 'trs', 'aap',
          // Telugu keywords
          'రాజకీయాలు', 'ఎన్నికలు', 'ప్రభుత్వం', 'మంత్రి', 'ముఖ్యమంత్రి', 'అసెంబ్లీ', 'పార్టీ', 'కాంగ్రెస్', 'బీజేపీ', 'టీడీపీ', 'వైఎస్ఆర్', 'జగన్', 'మోదీ', 'రాహుల్', 'టీఆర్ఎస్', 'ఆప్'
        ],
        sports: [
          // English keywords
          'sports', 'cricket', 'football', 'tennis', 'badminton', 'hockey', 'olympics', 'world cup', 'ipl', 'bcci', 'match', 'player', 'team', 'score', 'tournament', 'championship', 'athlete', 'game', 'sport',
          // Telugu keywords
          'క్రీడలు', 'క్రికెట్', 'ఫుట్బాల్', 'టెన్నిస్', 'బ్యాడ్మింటన్', 'హాకీ', 'ఒలింపిక్స్', 'వరల్డ్ కప్', 'ఐపిఎల్', 'బిసిసిఐ', 'మ్యాచ్', 'ఆటగాడు', 'టీమ్', 'స్కోర్', 'టోర్నమెంట్', 'ఛాంపియన్షిప్', 'ఆట'
        ],
        entertainment: [
          // English keywords
          'movie', 'film', 'cinema', 'actor', 'actress', 'director', 'bollywood', 'tollywood', 'kollywood', 'music', 'song', 'album', 'singer', 'dance', 'drama', 'theater', 'entertainment', 'celebrity', 'star', 'hero', 'heroine',
          // Telugu keywords
          'సినిమా', 'చలనచిత్రం', 'నటుడు', 'నటి', 'దర్శకుడు', 'టాలీవుడ్', 'కొలీవుడ్', 'సంగీతం', 'పాట', 'ఆల్బమ్', 'గాయకుడు', 'నృత్యం', 'నాటకం', 'థియేటర్', 'వినోదం', 'సెలబ్రిటీ', 'నక్షత్రం', 'హీరో', 'హీరోయిన్'
        ],
        technology: [
          // English keywords - made more specific
          'technology', 'computer', 'software', 'mobile phone', 'internet', 'artificial intelligence', 'robot', 'digital', 'cyber', 'hacking', 'startup', 'innovation', 'gadget', 'device', 'smartphone', 'laptop', 'programming', 'coding',
          // Telugu keywords
          'టెక్నాలజీ', 'కంప్యూటర్', 'సాఫ్ట్వేర్', 'మొబైల్ ఫోన్', 'ఇంటర్నెట్', 'కృత్రిమ మేధస్సు', 'రోబోట్', 'డిజిటల్', 'సైబర్', 'హ్యాకింగ్', 'స్టార్టప్', 'నవీకరణ', 'గ్యాజెట్', 'పరికరం', 'స్మార్ట్ఫోన్', 'ల్యాప్టాప్'
        ],
        health: [
          // English keywords
          'health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'covid', 'corona', 'vaccine', 'treatment', 'surgery', 'patient', 'clinic', 'pharmacy', 'drug', 'therapy', 'wellness', 'fitness', 'nutrition', 'diet',
          // Telugu keywords
          'ఆరోగ్యం', 'వైద్య', 'డాక్టర్', 'ఆసుపత్రి', 'మందు', 'వ్యాధి', 'కోవిడ్', 'కరోనా', 'వ్యాక్సిన్', 'చికిత్స', 'శస్త్రచికిత్స', 'రోగి', 'క్లినిక్', 'ఫార్మసీ', 'మందు', 'థెరపీ', 'ఆరోగ్యం', 'ఫిట్నెస్', 'పోషకాహారం'
        ],
        business: [
          // English keywords
          'business', 'economy', 'economic', 'market', 'stock', 'share', 'company', 'corporate', 'finance', 'banking', 'investment', 'profit', 'loss', 'revenue', 'trade', 'commerce', 'industry', 'manufacturing', 'export', 'import',
          // Telugu keywords
          'వ్యాపారం', 'ఆర్థిక వ్యవస్థ', 'ఆర్థిక', 'మార్కెట్', 'స్టాక్', 'షేర్', 'కంపెనీ', 'కార్పొరేట్', 'ఫైనాన్స్', 'బ్యాంకింగ్', 'పెట్టుబడి', 'లాభం', 'నష్టం', 'రెవెన్యూ', 'వ్యాపారం', 'వాణిజ్యం', 'పరిశ్రమ', 'ఉత్పత్తి', 'ఎగుమతి', 'దిగుమతి'
        ],
        education: [
          // English keywords
          'education', 'school', 'college', 'university', 'student', 'teacher', 'exam', 'result', 'admission', 'course', 'degree', 'study', 'learning', 'academic', 'institute', 'training', 'scholarship', 'tuition',
          // Telugu keywords
          'విద్య', 'పాఠశాల', 'కళాశాల', 'విశ్వవిద్యాలయం', 'విద్యార్థి', 'ఉపాధ్యాయుడు', 'పరీక్ష', 'ఫలితం', 'ప్రవేశం', 'కోర్స్', 'డిగ్రీ', 'అధ్యయనం', 'అభ్యాసం', 'అకడమిక్', 'సంస్థ', 'శిక్షణ', 'విద్యార్థి వేతనం'
        ],
        crime: [
          // English keywords
          'crime', 'police', 'murder', 'theft', 'robbery', 'fraud', 'scam', 'arrest', 'jail', 'court', 'law', 'legal', 'criminal', 'investigation', 'case', 'trial', 'judge', 'lawyer', 'justice',
          // Telugu keywords
          'నేరం', 'పోలీసు', 'హత్య', 'దొంగతనం', 'దోపిడీ', 'మోసం', 'స్కామ్', 'అరెస్ట్', 'జైలు', 'కోర్టు', 'చట్టం', 'చట్టపరమైన', 'నేరస్థుడు', 'విచారణ', 'కేసు', 'విచారణ', 'న్యాయమూర్తి', 'వకీలు', 'న్యాయం'
        ]
      };
      
      // Enhanced category detection with minimum match threshold
      let categoryScore = 0;
      let bestCategory = 'general';
      
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        const matches = keywords.filter(keyword => {
          // Use flexible matching - check for exact word matches and partial matches
          const exactRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          const partialRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          
          // Prefer exact word matches, but also accept partial matches for Telugu text
          return exactRegex.test(combinedText) || partialRegex.test(combinedText);
        });
        
        // Calculate score based on number of matches and keyword length
        // Give higher weight to exact matches
        const score = matches.reduce((acc, keyword) => {
          const exactMatch = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(combinedText);
          return acc + keyword.length + (exactMatch ? 5 : 0); // Bonus for exact matches
        }, 0);
        
        if (score > categoryScore) {
          categoryScore = score;
          bestCategory = cat;
        }
      }
      
      // Only use detected category if score is above threshold
      if (categoryScore > 3) {
        category = bestCategory;
      }
    }
    
    // If backend sent an ObjectId-like value, try to get category name from categories array or use smart detection
    if (/^[0-9a-fA-F]{24}$/.test(String(category))) {
      // Try to get category from categories array first
      if (article.categories && article.categories.length > 0) {
        const firstCategory = article.categories[0];
        if (typeof firstCategory === 'string' && !/^[0-9a-fA-F]{24}$/.test(firstCategory)) {
          category = firstCategory;
        } else {
          // Fall back to smart detection for ObjectId categories
          const titleText = (article.title || "").toLowerCase();
          const summaryText = (article.summary || "").toLowerCase();
          const contentText = (article.content || "").toLowerCase();
          const combinedText = `${titleText} ${summaryText} ${contentText}`;
          
          // Use the same smart detection logic as below
          const categoryKeywords = {
            politics: ['politics', 'political', 'election', 'government', 'minister', 'chief minister', 'pm', 'president', 'parliament', 'assembly', 'vote', 'voting', 'party', 'congress', 'bjp', 'tdp', 'ysr', 'jagan', 'modi', 'rahul', 'trs', 'aap', 'రాజకీయాలు', 'ఎన్నికలు', 'ప్రభుత్వం', 'మంత్రి', 'ముఖ్యమంత్రి', 'అసెంబ్లీ', 'పార్టీ', 'కాంగ్రెస్', 'బీజేపీ', 'టీడీపీ', 'వైఎస్ఆర్', 'జగన్', 'మోదీ', 'రాహుల్', 'టీఆర్ఎస్', 'ఆప్'],
            sports: ['sports', 'cricket', 'football', 'tennis', 'badminton', 'hockey', 'olympics', 'world cup', 'ipl', 'bcci', 'match', 'player', 'team', 'score', 'tournament', 'championship', 'athlete', 'game', 'sport', 'క్రీడలు', 'క్రికెట్', 'ఫుట్బాల్', 'టెన్నిస్', 'బ్యాడ్మింటన్', 'హాకీ', 'ఒలింపిక్స్', 'వరల్డ్ కప్', 'ఐపిఎల్', 'బిసిసిఐ', 'మ్యాచ్', 'ఆటగాడు', 'టీమ్', 'స్కోర్', 'టోర్నమెంట్', 'ఛాంపియన్షిప్', 'ఆట'],
            entertainment: ['movie', 'film', 'cinema', 'actor', 'actress', 'director', 'bollywood', 'tollywood', 'kollywood', 'music', 'song', 'album', 'singer', 'dance', 'drama', 'theater', 'entertainment', 'celebrity', 'star', 'hero', 'heroine', 'సినిమా', 'చలనచిత్రం', 'నటుడు', 'నటి', 'దర్శకుడు', 'టాలీవుడ్', 'కొలీవుడ్', 'సంగీతం', 'పాట', 'ఆల్బమ్', 'గాయకుడు', 'నృత్యం', 'నాటకం', 'థియేటర్', 'వినోదం', 'సెలబ్రిటీ', 'నక్షత్రం', 'హీరో', 'హీరోయిన్'],
            technology: ['technology', 'computer', 'software', 'mobile phone', 'internet', 'artificial intelligence', 'robot', 'digital', 'cyber', 'hacking', 'startup', 'innovation', 'gadget', 'device', 'smartphone', 'laptop', 'programming', 'coding', 'టెక్నాలజీ', 'కంప్యూటర్', 'సాఫ్ట్వేర్', 'మొబైల్ ఫోన్', 'ఇంటర్నెట్', 'కృత్రిమ మేధస్సు', 'రోబోట్', 'డిజిటల్', 'సైబర్', 'హ్యాకింగ్', 'స్టార్టప్', 'నవీకరణ', 'గ్యాజెట్', 'పరికరం', 'స్మార్ట్ఫోన్', 'ల్యాప్టాప్'],
            health: ['health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'covid', 'corona', 'vaccine', 'treatment', 'surgery', 'patient', 'clinic', 'pharmacy', 'drug', 'therapy', 'wellness', 'fitness', 'nutrition', 'diet', 'ఆరోగ్యం', 'వైద్య', 'డాక్టర్', 'ఆసుపత్రి', 'మందు', 'వ్యాధి', 'కోవిడ్', 'కరోనా', 'వ్యాక్సిన్', 'చికిత్స', 'శస్త్రచికిత్స', 'రోగి', 'క్లినిక్', 'ఫార్మసీ', 'మందు', 'థెరపీ', 'ఆరోగ్యం', 'ఫిట్నెస్', 'పోషకాహారం'],
            business: ['business', 'economy', 'economic', 'market', 'stock', 'share', 'company', 'corporate', 'finance', 'banking', 'investment', 'profit', 'loss', 'revenue', 'trade', 'commerce', 'industry', 'manufacturing', 'export', 'import', 'వ్యాపారం', 'ఆర్థిక వ్యవస్థ', 'ఆర్థిక', 'మార్కెట్', 'స్టాక్', 'షేర్', 'కంపెనీ', 'కార్పొరేట్', 'ఫైనాన్స్', 'బ్యాంకింగ్', 'పెట్టుబడి', 'లాభం', 'నష్టం', 'రెవెన్యూ', 'వ్యాపారం', 'వాణిజ్యం', 'పరిశ్రమ', 'ఉత్పత్తి', 'ఎగుమతి', 'దిగుమతి'],
            education: ['education', 'school', 'college', 'university', 'student', 'teacher', 'exam', 'result', 'admission', 'course', 'degree', 'study', 'learning', 'academic', 'institute', 'training', 'scholarship', 'tuition', 'విద్య', 'పాఠశాల', 'కళాశాల', 'విశ్వవిద్యాలయం', 'విద్యార్థి', 'ఉపాధ్యాయుడు', 'పరీక్ష', 'ఫలితం', 'ప్రవేశం', 'కోర్స్', 'డిగ్రీ', 'అధ్యయనం', 'అభ్యాసం', 'అకడమిక్', 'సంస్థ', 'శిక్షణ', 'విద్యార్థి వేతనం'],
            crime: ['crime', 'police', 'murder', 'theft', 'robbery', 'fraud', 'scam', 'arrest', 'jail', 'court', 'law', 'legal', 'criminal', 'investigation', 'case', 'trial', 'judge', 'lawyer', 'justice', 'నేరం', 'పోలీసు', 'హత్య', 'దొంగతనం', 'దోపిడీ', 'మోసం', 'స్కామ్', 'అరెస్ట్', 'జైలు', 'కోర్టు', 'చట్టం', 'చట్టపరమైన', 'నేరస్థుడు', 'విచారణ', 'కేసు', 'విచారణ', 'న్యాయమూర్తి', 'వకీలు', 'న్యాయం']
          };
          
          let categoryScore = 0;
          let bestCategory = 'general';
          
          for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            const matches = keywords.filter(keyword => {
              const exactRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              const partialRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
              return exactRegex.test(combinedText) || partialRegex.test(combinedText);
            });
            
            const score = matches.reduce((acc, keyword) => {
              const exactMatch = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(combinedText);
              return acc + keyword.length + (exactMatch ? 5 : 0);
            }, 0);
            
            if (score > categoryScore) {
              categoryScore = score;
              bestCategory = cat;
            }
          }
          
          if (categoryScore > 3) {
            category = bestCategory;
          } else {
            category = 'general';
          }
        }
      } else {
        category = 'general';
      }
    }
    // Capitalize first letter for display
    category = category.charAt(0).toUpperCase() + category.slice(1);
    
    return {
      id: article._id || article.id,
      title: sanitizeText(article.title) || 'Untitled',
      summary: sanitizeText(article.summary) || '',
      content: sanitizeText(article.content) || '',
      image: (() => {
        // Prioritize thumbnail for manual articles, then fallback to other sources
        const imgSrc = article?.thumbnail || article?.image || article?.openGraph?.image || (Array.isArray(article?.images) && article.images[0]?.url);
        return (imgSrc && imgSrc.trim() !== '') ? imgSrc : null;
      })(),
      category: category,
      time: timeAgo(publishedAt),
      readTime: article.readingTime || estimateReadTime(article.content || ''),
      slug: article.slug || article._id || article.id,
      source: article.source?.name || 'Unknown Source',
      language: article.language || language
    };
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const estimateReadTime = (text: string) => {
    if (!text) return "1 min read";
    const words = text.replace(/<\/?[^>]+(>|$)/g, "").split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {languageName} News
                {selectedCategory !== 'all' && getCategoryDisplayName() && (
                  <span className="text-2xl text-muted-foreground ml-2">
                    - {getCategoryDisplayName()}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                Latest news and updates in {languageName}
                {selectedCategory !== 'all' && getCategoryDisplayName() && ` - ${getCategoryDisplayName()} category`}
              </p>
            </div>
            
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {articles.length + textOnlyArticles.length} Articles
            </Badge>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href={language !== 'all' ? `/news?lang=${language}` : '/news'}>
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                size="sm"
                className="text-xs"
              >
                All
              </Button>
            </Link>
            {categories
              .slice(0, 8)
              .map((cat) => (
                <Link 
                  key={cat.name} 
                  href={language !== 'all' ? `/news?lang=${language}&category=${cat.name}` : `/news?category=${cat.name}`}
                >
                  <Button 
                    variant={selectedCategory === cat.name ? 'default' : 'outline'} 
                    size="sm"
                    className="text-xs"
                  >
                    {cat.displayName}
                  </Button>
                </Link>
              ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.displayName || cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (articles.length > 0 || textOnlyArticles.length > 0) ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => {
                const mappedArticle = mapArticleToUi(article);
                return (
                  <motion.div
                    key={`main-${mappedArticle.id || `fallback-${index}`}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={mappedArticle.image || '/placeholder-news.jpg'}
                          alt={mappedArticle.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                          }}
                        />
                        <Badge className="absolute top-3 left-3">
                          {mappedArticle.category}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          <Link 
                            href={`/article/${mappedArticle.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {mappedArticle.title}
                          </Link>
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {mappedArticle.summary}
                        </p>
                        
                        <div className="flex items-center justify-start text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {mappedArticle.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {mappedArticle.readTime}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
                  </>
                )}
                
                {/* Pages around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  if (page < 1 || page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortBy("latest");
                setCurrentPage(1);
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <WeatherCompact />
            
            {/* Text-only Articles */}
            {textOnlyArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    More Stories
                    <Badge variant="secondary" className="text-xs">No images</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {textOnlyArticles.slice(0, 8).map((article, index) => {
                    const mappedArticle = mapArticleToUi(article);
                    return (
                      <Link 
                        key={`text-${mappedArticle.id || `fallback-${index}`}-${index}`} 
                        href={`/article/${mappedArticle.slug}`}
                        className="block group"
                      >
                        <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {mappedArticle.title}
                          </h4>
                          {mappedArticle.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {mappedArticle.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {mappedArticle.time}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* General Articles - Always show in right corner */}
            {generalArticles && generalArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    General Articles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generalArticles.slice(0, 6).map((article, index) => {
                    const mappedArticle = mapArticleToUi(article);
                    return (
                      <Link 
                        key={`general-${mappedArticle.id || `fallback-${index}`}-${index}`} 
                        href={`/article/${mappedArticle.id}`}
                        className="block group"
                      >
                        <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {mappedArticle.title}
                          </h4>
                          {mappedArticle.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {mappedArticle.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {mappedArticle.time}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* Uncategorized Articles - Always show in right corner */}
            {uncategorizedArticles && uncategorizedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Other Articles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {uncategorizedArticles.slice(0, 4).map((article, index) => {
                    const mappedArticle = mapArticleToUi(article);
                    return (
                      <Link 
                        key={`uncategorized-${mappedArticle.id || `fallback-${index}`}-${index}`} 
                        href={`/article/${mappedArticle.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          {mappedArticle.image && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                              <img 
                                src={mappedArticle.image} 
                                alt={mappedArticle.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {mappedArticle.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {mappedArticle.time}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {uncategorizedArticles.length > 4 && (
                    <div className="pt-2 border-t">
                      <Link 
                        href={`/news?lang=${language}&category=uncategorized`}
                        className="text-sm text-primary hover:underline"
                      >
                        View all uncategorized articles →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Quick Access</h3>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  {[
                    { label: 'Breaking News', icon: '🔥', href: '/latest-news' },
                    { label: 'Live Updates', icon: '📡', href: '/latest-news' },
                    { label: 'Video News', icon: '📹', href: '/news?type=video' },
                    { label: 'Photo Gallery', icon: '📸', href: '/news?type=photo-gallery' },
                    { label: 'Podcasts', icon: '🎙️', href: '/news?type=podcast' },
                    { label: 'Opinion', icon: '💭', href: '/news?type=opinion' }
                  ].map((item, index) => (
                    <motion.div
                      key={`quick-link-${item.label}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={item.href}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {item.label}
                          </span>
                          <svg className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Advertisement Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <CardContent className="p-0">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=500&fit=crop" 
                      alt="Partner with us" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge variant="secondary" className="mb-3 text-xs">Featured Partner</Badge>
                      <h3 className="text-white font-bold text-xl mb-2">Advertise Here</h3>
                      <p className="text-white/90 text-sm mb-4">Premium placement for your brand</p>
                      <Button size="sm" className="w-full bg-white text-black hover:bg-white/90">
                        Get Started →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Other Languages</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {['Telugu', 'Hindi', 'Tamil', 'Bengali', 'Gujarati', 'Marathi'].filter(lang => lang.toLowerCase() !== language).map((lang, index) => (
                      <motion.div
                        key={`lang-switch-${lang}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Link href={`/news?lang=${lang.toLowerCase()}`}>
                          <div className="border border-border/50 rounded-lg p-3 text-center hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:scale-105">
                            <div className="font-semibold text-sm">{lang}</div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link href="/news" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      View All Languages
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading news...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  );
}
