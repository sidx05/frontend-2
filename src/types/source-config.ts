export interface SourceConfig {
  name: string;
  url: string;
  rssUrl?: string;
  type: 'rss' | 'css' | 'api';
  categories: string[];
  active: boolean;
  selectors?: CSSSelectors;
  language: string;
  priority?: number;
  updateFrequency?: number; // in minutes
  lastScraped?: Date;
}

export interface CSSSelectors {
  title: string;
  content: string;
  date: string;
  thumbnail?: string;
  author?: string;
  summary?: string;
}

export interface LanguageSourceConfig {
  [category: string]: SourceConfig[];
}

export interface SourcesConfig {
  [language: string]: LanguageSourceConfig;
}

export interface ScrapingSelectorsConfig {
  sites: {
    [domain: string]: {
      type: 'css';
      selectors: CSSSelectors;
      language: string;
      categories: string[];
    };
  };
  fallback_selectors: CSSSelectors;
  common_patterns: {
    date_formats: string[];
    time_formats: string[];
  };
}

export interface SourceManagerConfig {
  sources: SourcesConfig;
  selectors: ScrapingSelectorsConfig;
  defaultUpdateFrequency: number; // in minutes
  maxConcurrentScrapers: number;
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}
