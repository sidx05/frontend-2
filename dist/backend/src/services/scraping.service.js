"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../../src/lib/db");
const logger_1 = require("../utils/logger"); // make sure this exists
// Proxy rotation system
const PROXY_LIST = [
    // Free proxy servers (you can add more)
    { host: '8.8.8.8', port: 80, protocol: 'http' },
    { host: '1.1.1.1', port: 80, protocol: 'http' },
    // Add more proxies as needed
];
// User agent rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
];
let currentProxyIndex = 0;
let currentUserAgentIndex = 0;
// Rate limiting
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
let lastRequestTime = 0;
class ScrapingService {
    constructor() {
        this.rssParser = new rss_parser_1.default();
    }
    // Get next proxy in rotation
    getNextProxy() {
        const proxy = PROXY_LIST[currentProxyIndex];
        currentProxyIndex = (currentProxyIndex + 1) % PROXY_LIST.length;
        return proxy;
    }
    // Get next user agent in rotation
    getNextUserAgent() {
        const userAgent = USER_AGENTS[currentUserAgentIndex];
        currentUserAgentIndex = (currentUserAgentIndex + 1) % USER_AGENTS.length;
        return userAgent;
    }
    // Create axios instance with proper headers and proxy
    createAxiosInstance(useProxy = false) {
        const config = {
            timeout: 15000,
            headers: {
                'User-Agent': this.getNextUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
                'Referer': 'https://www.google.com/'
            },
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        };
        if (useProxy && PROXY_LIST.length > 0) {
            const proxy = this.getNextProxy();
            config.proxy = {
                host: proxy.host,
                port: proxy.port,
                protocol: proxy.protocol
            };
        }
        return axios_1.default.create(config);
    }
    // Rate limiting function
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
            const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
            logger_1.logger.debug(`Rate limiting: waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        lastRequestTime = Date.now();
    }
    // Retry logic with exponential backoff
    async retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await this.rateLimit(); // Apply rate limiting before each request
                return await requestFn();
            }
            catch (error) {
                const isLastAttempt = attempt === maxRetries - 1;
                const isRetryableError = error.response?.status >= 500 ||
                    error.response?.status === 429 ||
                    error.code === 'ECONNRESET' ||
                    error.code === 'ETIMEDOUT';
                if (isLastAttempt || !isRetryableError) {
                    throw error;
                }
                const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
                logger_1.logger.warn(`Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Max retries exceeded');
    }
    async scrapeAllSources() {
        try {
            logger_1.logger.info("🔹 Starting scraping for all sources");
            const sources = await db_1.db.source.findMany({ where: { active: true } });
            let allArticles = [];
            for (const source of sources) {
                try {
                    const articles = await this.scrapeSource(source);
                    for (const scraped of articles) {
                        await db_1.db.article.create({
                            data: {
                                title: scraped.title,
                                summary: scraped.summary,
                                content: scraped.content,
                                url: scraped.sourceUrl,
                                hash: scraped.hash,
                                category: scraped.category,
                                image: scraped.images?.[0]?.url ?? null,
                                published: scraped.publishedAt,
                            },
                        });
                    }
                    allArticles = allArticles.concat(articles);
                    await db_1.db.source.update({
                        where: { id: source.id },
                        data: { lastScraped: new Date() },
                    });
                }
                catch (err) {
                    logger_1.logger.error(`❌ Error scraping source ${source.name}: ${err.message}`);
                }
            }
            logger_1.logger.info(`✅ Scraping completed. Total articles: ${allArticles.length}`);
            return allArticles;
        }
        catch (err) {
            logger_1.logger.error(`❌ scrapeAllSources error: ${err.message}`);
            return [];
        }
    }
    async scrapeSource(source) {
        try {
            logger_1.logger.info(`🔹 Scraping source: ${source.name}`);
            const articles = [];
            // RSS scraping
            if (source.rssUrls && source.rssUrls.length > 0) {
                for (const rssUrl of source.rssUrls) {
                    try {
                        const feed = await this.retryRequest(async () => {
                            return await this.rssParser.parseURL(rssUrl);
                        });
                        for (const item of feed.items) {
                            const scraped = await this.scrapeArticle(item, source);
                            if (scraped)
                                articles.push(scraped);
                        }
                    }
                    catch (err) {
                        logger_1.logger.error(`❌ Error parsing RSS feed ${rssUrl}: ${err.message}`);
                    }
                }
            }
            // API scraping (e.g., NewsAPI)
            if (source.type === "api" && source.apiUrl) {
                try {
                    const resp = await this.retryRequest(async () => {
                        const axiosInstance = this.createAxiosInstance();
                        return await axiosInstance.get(source.apiUrl, {
                            params: { apiKey: process.env.NEWS_API_KEY },
                        });
                    });
                    logger_1.logger.info(`DEBUG API articles count: ${resp.data?.articles?.length || 0}`);
                    for (const item of resp.data.articles || []) {
                        const scraped = await this.scrapeArticle(item, source);
                        if (scraped)
                            articles.push(scraped);
                    }
                }
                catch (err) {
                    logger_1.logger.error(`❌ Error fetching API for ${source.name}: ${err.message}`);
                }
            }
            logger_1.logger.info(`✅ Scraped ${articles.length} articles from ${source.name}`);
            return articles;
        }
        catch (err) {
            logger_1.logger.error(`❌ scrapeSource error for ${source.name}: ${err.message}`);
            return [];
        }
    }
    async scrapeArticle(item, source) {
        try {
            const title = item.title || "";
            const link = item.link || item.url || "";
            const summary = item.contentSnippet || item.description || item.content || "";
            const publishedAt = item.pubDate
                ? new Date(item.pubDate)
                : item.publishedAt
                    ? new Date(item.publishedAt)
                    : new Date();
            if (!title || !link) {
                logger_1.logger.warn(`❌ Skipping item: Missing title/link. Source: ${source.name}`);
                return null;
            }
            const hash = this.generateHash(title + summary + source.id.toString());
            // Skip duplicates
            const existing = await db_1.db.article.findUnique({ where: { hash } });
            if (existing)
                return null;
            const fullContent = source.type === "api" ? summary : await this.fetchArticleContent(link);
            const openGraphData = await this.extractOpenGraphData(link);
            let images = item.urlToImage
                ? [{ url: item.urlToImage, alt: title, source: "api" }]
                : this.extractImages(fullContent, link, openGraphData);
            if (images.length === 0 && openGraphData && 'image' in openGraphData && openGraphData.image) {
                images.push({ url: openGraphData.image, alt: title, caption: "Open Graph image", source: "opengraph" });
            }
            const category = await this.determineCategory(title, summary, source.categories);
            const tags = this.extractTags(title, summary, fullContent);
            return {
                title,
                summary: summary.substring(0, 300),
                content: this.cleanContent(fullContent),
                images,
                category: category ?? "general",
                tags,
                author: item.author || this.extractAuthor(fullContent) || source.name,
                lang: source.lang || "en",
                sourceUrl: link,
                publishedAt,
                hash,
                openGraph: openGraphData,
            };
        }
        catch (err) {
            logger_1.logger.error(`❌ scrapeArticle error: ${err.message}`);
            return null;
        }
    }
    async fetchArticleContent(url) {
        return this.retryRequest(async () => {
            const axiosInstance = this.createAxiosInstance();
            const resp = await axiosInstance.get(url);
            return resp.data;
        }).catch((err) => {
            logger_1.logger.error(`❌ fetchArticleContent failed: ${url} - ${err.message}`);
            return "";
        });
    }
    extractImages(html, baseUrl, openGraphData) {
        const $ = cheerio.load(html);
        const images = [];
        $("img").each((_, el) => {
            const src = $(el).attr("src");
            const alt = $(el).attr("alt") || "Article image";
            if (src) {
                const fullUrl = src.startsWith("http") ? src : new URL(src, baseUrl).href;
                images.push({ url: fullUrl, alt, source: "scraped" });
            }
        });
        return [...new Map(images.map((img) => [img.url, img])).values()].slice(0, 5);
    }
    generateHash(content) {
        return crypto_1.default.createHash("sha256").update(content).digest("hex");
    }
    async extractOpenGraphData(url) {
        return this.retryRequest(async () => {
            const axiosInstance = this.createAxiosInstance();
            const resp = await axiosInstance.get(url);
            const $ = cheerio.load(resp.data);
            return {
                image: $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content"),
                title: $('meta[property="og:title"]').attr("content") || $("title").text(),
                description: $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content"),
            };
        }).catch(() => {
            return {};
        });
    }
    async determineCategory(title, summary, sourceCategories) {
        const text = (title + " " + summary).toLowerCase();
        const keywords = {
            politics: ["politics", "government", "election", "president", "senate"],
            world: ["world", "international", "global", "foreign"],
            sports: ["sports", "football", "basketball", "soccer", "tennis"],
            tech: ["technology", "tech", "software", "ai", "computer", "internet"],
            health: ["health", "medical", "doctor", "hospital", "medicine"],
            ai: ["ai", "artificial intelligence", "machine learning"],
            cyber: ["cybersecurity", "hacking", "malware", "ransomware", "breach"],
            movies: ["movies", "film", "cinema", "bollywood", "hollywood"],
            stocks: ["stocks", "market", "shares", "trading", "equity"],
            hindi: ["hindi"],
            telugu: ["telugu"],
        };
        for (const [key, kws] of Object.entries(keywords)) {
            if (kws.some((kw) => text.includes(kw))) {
                return key; // just return string
            }
        }
        return sourceCategories?.[0] ?? null;
    }
    extractTags(title, summary, content) {
        const words = (title + " " + summary + " " + content).toLowerCase().split(/\W+/).filter(w => w.length > 4);
        return Array.from(new Set(words.slice(0, 10)));
    }
    extractAuthor(content) {
        const match = content.match(/By ([A-Z][a-z]+ [A-Z][a-z]+)/);
        return match ? match[1] : null;
    }
    cleanContent(html) {
        return cheerio.load(html).text().replace(/\s+/g, " ").trim();
    }
}
exports.ScrapingService = ScrapingService;
//# sourceMappingURL=scraping.service.js.map