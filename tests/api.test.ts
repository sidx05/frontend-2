import request from 'supertest';
import { connectDB } from '../src/config/database';
import { Article } from '../src/models/Article';

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('News API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    // Clean up test data
    await Article.deleteMany({ title: { $regex: /test/i } });
  });

  describe('GET /api/news/latest', () => {
    test('should return latest articles for Telugu language', async () => {
      // Create a test article
      const testArticle = new Article({
        title: 'Test Telugu Article',
        content: 'This is a test article in Telugu',
        summary: 'Test summary',
        language: 'telugu',
        category: 'politics',
        categories: ['politics'],
        source: {
          name: 'Test Source',
          url: 'https://test.com'
        },
        publishedAt: new Date(),
        scrapedAt: new Date(),
        status: 'scraped',
        wordCount: 10,
        readingTime: 1
      });
      
      await testArticle.save();

      // Test the API endpoint
      const response = await request('http://localhost:3000')
        .get('/api/news/latest?lang=telugu&limit=8')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.articles).toBeDefined();
      expect(Array.isArray(response.body.articles)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.language).toBe('telugu');
    });

    test('should return articles with required fields', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/news/latest?lang=telugu&limit=5')
        .expect(200);

      if (response.body.articles.length > 0) {
        const article = response.body.articles[0];
        
        // Required fields
        expect(article.id).toBeDefined();
        expect(article.title).toBeDefined();
        expect(article.summary).toBeDefined();
        expect(article.content).toBeDefined();
        expect(article.source).toBeDefined();
        expect(article.source.name).toBeDefined();
        expect(article.publishedAt).toBeDefined();
        expect(article.scrapedAt).toBeDefined();
        expect(article.language).toBeDefined();
        expect(article.category).toBeDefined();
        expect(article.author).toBeDefined();
        expect(article.wordCount).toBeDefined();
        expect(article.readingTime).toBeDefined();
        expect(article.url).toBeDefined();
      }
    });
  });

  describe('GET /api/news', () => {
    test('should return filtered news by category', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/news?lang=telugu&category=politics&page=1&limit=12')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.articles).toBeDefined();
      expect(Array.isArray(response.body.articles)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.filters).toBeDefined();
      expect(response.body.filters.language).toBe('telugu');
      expect(response.body.filters.category).toBe('politics');
    });

    test('should support search functionality', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/news?search=test&page=1&limit=12')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.articles).toBeDefined();
      expect(Array.isArray(response.body.articles)).toBe(true);
      expect(response.body.filters.search).toBe('test');
    });
  });

  describe('GET /api/languages', () => {
    test('should return supported languages', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/languages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.languages).toBeDefined();
      expect(Array.isArray(response.body.languages)).toBe(true);
      expect(response.body.totalLanguages).toBeDefined();
      expect(response.body.activeLanguages).toBeDefined();
      expect(response.body.totalArticles).toBeDefined();

      if (response.body.languages.length > 0) {
        const language = response.body.languages[0];
        expect(language.code).toBeDefined();
        expect(language.name).toBeDefined();
        expect(language.nativeName).toBeDefined();
        expect(language.articleCount).toBeDefined();
        expect(language.isActive).toBeDefined();
      }
    });
  });

  describe('GET /api/sources', () => {
    test('should return sources with status', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sources).toBeDefined();
      expect(Array.isArray(response.body.sources)).toBe(true);
      expect(response.body.summary).toBeDefined();

      if (response.body.sources.length > 0) {
        const source = response.body.sources[0];
        expect(source.id).toBeDefined();
        expect(source.name).toBeDefined();
        expect(source.url).toBeDefined();
        expect(source.active).toBeDefined();
        expect(source.articleCount).toBeDefined();
        expect(source.health).toBeDefined();
      }
    });
  });

  describe('GET /api/categories', () => {
    test('should return categories with article counts', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/categories?lang=telugu')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.categories).toBeDefined();
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.filter).toBeDefined();

      if (response.body.categories.length > 0) {
        const category = response.body.categories[0];
        expect(category.name).toBeDefined();
        expect(category.displayName).toBeDefined();
        expect(category.articleCount).toBeDefined();
        expect(category.isActive).toBeDefined();
      }
    });
  });
});