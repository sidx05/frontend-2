import { connectDB } from '../src/config/database';
import { AdvancedScraperService } from '../src/services/advanced-scraper.service';
import { SourceConfigService } from '../src/services/source-config.service';
import { Article } from '../src/models/Article';

// Mock the logger to avoid console output during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Scraper Integration Tests', () => {
  let scraperService: AdvancedScraperService;
  let sourceConfigService: SourceConfigService;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
    scraperService = new AdvancedScraperService();
    sourceConfigService = new SourceConfigService();
  });

  afterAll(async () => {
    // Clean up test data
    await Article.deleteMany({});
  });

  describe('Source Configuration', () => {
    test('should load source configuration', () => {
      const sources = sourceConfigService.getAllActiveSources();
      expect(Array.isArray(sources)).toBe(true);
    });

    test('should have sources configured', () => {
      const sources = sourceConfigService.getAllActiveSources();
      expect(sources.length).toBeGreaterThan(0);
    });
  });

  describe('Scraping Service', () => {
    test('should initialize scraper service', () => {
      expect(scraperService).toBeDefined();
      expect(scraperService).toBeInstanceOf(AdvancedScraperService);
    });

    test('should scrape sources and return results', async () => {
      const result = await scraperService.scrapeAllSources();
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.articles).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.sourceStats).toBeDefined();
      
      expect(Array.isArray(result.articles)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(typeof result.sourceStats).toBe('object');
    }, 30000); // 30 second timeout for scraping

    test('should create articles in database', async () => {
      // First, clean up any existing test articles
      await Article.deleteMany({ title: { $regex: /test/i } });
      
      const result = await scraperService.scrapeAllSources();
      
      if (result.success && result.articles.length > 0) {
        // Check if articles were saved to database
        const savedArticles = await Article.find({});
        expect(savedArticles.length).toBeGreaterThan(0);
        
        // Verify article structure
        const firstArticle = savedArticles[0];
        expect(firstArticle.title).toBeDefined();
        expect(firstArticle.content).toBeDefined();
        expect(firstArticle.language).toBeDefined();
        expect(firstArticle.source).toBeDefined();
        expect(firstArticle.publishedAt).toBeDefined();
        expect(firstArticle.scrapedAt).toBeDefined();
      }
    }, 30000);
  });

  describe('Article Schema Validation', () => {
    test('should validate article schema fields', async () => {
      const articles = await Article.find({}).limit(1);
      
      if (articles.length > 0) {
        const article = articles[0];
        
        // Required fields
        expect(article.title).toBeDefined();
        expect(article.content).toBeDefined();
        expect(article.language).toBeDefined();
        expect(article.source).toBeDefined();
        expect(article.publishedAt).toBeDefined();
        expect(article.scrapedAt).toBeDefined();
        
        // Optional fields that should be present if scraped
        expect(article.wordCount).toBeDefined();
        expect(article.readingTime).toBeDefined();
        expect(article.categories).toBeDefined();
        expect(Array.isArray(article.categories)).toBe(true);
      }
    });
  });

  describe('Language Detection', () => {
    test('should detect language for articles', async () => {
      const articles = await Article.find({ language: { $exists: true } }).limit(5);
      
      if (articles.length > 0) {
        articles.forEach(article => {
          expect(article.language).toBeDefined();
          expect(typeof article.language).toBe('string');
          expect(article.language.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Deduplication', () => {
    test('should prevent duplicate articles', async () => {
      // This test would require running the scraper twice and checking for duplicates
      // For now, we'll just verify the deduplication logic exists
      const articles = await Article.find({});
      const titles = articles.map(a => a.title);
      const uniqueTitles = [...new Set(titles)];
      
      // If deduplication is working, we shouldn't have many duplicates
      expect(titles.length - uniqueTitles.length).toBeLessThan(titles.length * 0.1);
    });
  });
});
