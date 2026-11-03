// Real News API Integration - Using multiple free news sources
export class RealNewsAPI {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor() {
    console.log('[RealNewsAPI] Initialized with multiple news sources');
  }

  // GDELT Project - Free global news database
  async fetchGDELTNews(query: string, limit: number = 10): Promise<any[]> {
    const cacheKey = `gdelt_${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&format=json&maxrecords=${limit}&sort=datedesc`
      );
      
      if (!response.ok) throw new Error(`GDELT API error: ${response.status}`);
      
      const data = await response.json();
      const articles = data.articles || [];
      
      const results = articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.domain || 'Unknown',
        publishedAt: article.seendate,
        summary: article.socialimage || '',
        category: this.categorizeNews(article.title)
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[RealNewsAPI] GDELT fetch failed:', error);
      return [];
    }
  }

  // NewsAPI.org alternative - Using free RSS feeds
  async fetchRSSNews(source: string = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'): Promise<any[]> {
    const cacheKey = `rss_${source}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use RSS2JSON service to convert RSS to JSON
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source)}`
      );
      
      if (!response.ok) throw new Error(`RSS2JSON error: ${response.status}`);
      
      const data = await response.json();
      const items = data.items || [];
      
      const results = items.map((item: any) => ({
        title: item.title,
        url: item.link,
        source: data.feed?.title || 'Unknown',
        publishedAt: item.pubDate,
        summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
        category: this.categorizeNews(item.title)
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[RealNewsAPI] RSS fetch failed:', error);
      return [];
    }
  }

  // Multiple RSS sources
  async fetchMultipleRSS(): Promise<any[]> {
    const sources = [
      'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
      'http://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.aljazeera.com/xml/aljazeera.rss',
      'https://feeds.reuters.com/reuters/topNews'
    ];

    const allNews = await Promise.all(
      sources.map(source => this.fetchRSSNews(source))
    );

    // Flatten and sort by date
    return allNews
      .flat()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 50);
  }

  // Search across all sources
  async searchNews(query: string): Promise<any[]> {
    const [gdeltResults, rssResults] = await Promise.all([
      this.fetchGDELTNews(query, 20),
      this.fetchMultipleRSS()
    ]);

    // Filter RSS results by query
    const filteredRSS = rssResults.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase())
    );

    // Combine and deduplicate
    const combined = [...gdeltResults, ...filteredRSS];
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(t => t.url === item.url)
    );

    return unique.slice(0, 30);
  }

  // Get latest news by category
  async getLatestByCategory(category: string): Promise<any[]> {
    const allNews = await this.fetchMultipleRSS();
    return allNews.filter(item => item.category === category).slice(0, 20);
  }

  // Categorize news
  private categorizeNews(title: string): string {
    const lower = title.toLowerCase();
    
    if (lower.includes('politics') || lower.includes('election') || lower.includes('government')) {
      return 'politics';
    }
    if (lower.includes('business') || lower.includes('market') || lower.includes('stock') || lower.includes('economy')) {
      return 'business';
    }
    if (lower.includes('tech') || lower.includes('ai') || lower.includes('software') || lower.includes('computer')) {
      return 'technology';
    }
    if (lower.includes('sport') || lower.includes('game') || lower.includes('team')) {
      return 'sports';
    }
    if (lower.includes('health') || lower.includes('medical') || lower.includes('disease')) {
      return 'health';
    }
    if (lower.includes('science') || lower.includes('research') || lower.includes('study')) {
      return 'science';
    }
    if (lower.includes('entertainment') || lower.includes('movie') || lower.includes('music')) {
      return 'entertainment';
    }
    
    return 'general';
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      sources: ['GDELT', 'NYTimes RSS', 'BBC RSS', 'AlJazeera RSS', 'Reuters RSS']
    };
  }
}
