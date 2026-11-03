// Situation Monitor Integration - Real-time news, markets, and geopolitical events
export interface SituationMonitorConfig {
  refreshInterval?: number; // milliseconds
  newsSources?: string[];
  marketSymbols?: string[];
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  category: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface GeopoliticalEvent {
  id: string;
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}

export class SituationMonitor {
  private config: SituationMonitorConfig;
  private newsCache: NewsItem[] = [];
  private marketCache: Map<string, MarketData> = new Map();
  private eventsCache: GeopoliticalEvent[] = [];
  private lastUpdate: number = 0;

  constructor(config?: Partial<SituationMonitorConfig>) {
    this.config = {
      refreshInterval: config?.refreshInterval ?? 3600000, // 1 hour default
      newsSources: config?.newsSources ?? ['reuters', 'ap', 'bbc', 'aljazeera'],
      marketSymbols: config?.marketSymbols ?? ['SPY', 'QQQ', 'GLD', 'USO']
    };
    console.log('[SituationMonitor] Real-time monitoring initialized');
  }

  async getLatestNews(categories?: string[]): Promise<NewsItem[]> {
    const now = Date.now();
    if (this.newsCache.length > 0 && (now - this.lastUpdate) < this.config.refreshInterval!) {
      return categories 
        ? this.newsCache.filter(n => categories.includes(n.category))
        : this.newsCache;
    }

    try {
      // Simulate fetching from multiple news sources
      // In production, this would call actual news APIs
      const newsItems: NewsItem[] = [];

      // Fetch from configured sources
      for (const source of this.config.newsSources!) {
        const sourceNews = await this.fetchNewsFromSource(source);
        newsItems.push(...sourceNews);
      }

      // Sort by timestamp (newest first)
      newsItems.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      this.newsCache = newsItems;
      this.lastUpdate = now;

      return categories 
        ? newsItems.filter(n => categories.includes(n.category))
        : newsItems;

    } catch (error) {
      console.error('[SituationMonitor] Failed to fetch news:', error);
      return this.newsCache; // Return cached data on error
    }
  }

  private async fetchNewsFromSource(source: string): Promise<NewsItem[]> {
    // Simulated news fetch - in production, integrate with actual APIs
    // Example sources: NewsAPI, GDELT, RSS feeds
    const mockNews: NewsItem[] = [
      {
        title: `Latest update from ${source}`,
        source,
        url: `https://${source}.com/article/123`,
        publishedAt: new Date().toISOString(),
        summary: `Breaking news from ${source} source`,
        category: 'general'
      }
    ];
    return mockNews;
  }

  async getMarketData(): Promise<MarketData[]> {
    const now = Date.now();
    const cachedData = Array.from(this.marketCache.values());
    
    if (cachedData.length > 0 && (now - this.lastUpdate) < this.config.refreshInterval!) {
      return cachedData;
    }

    try {
      // Simulate fetching market data
      // In production, integrate with Finnhub, Alpha Vantage, or similar
      const marketData: MarketData[] = [];

      for (const symbol of this.config.marketSymbols!) {
        const data = await this.fetchMarketDataForSymbol(symbol);
        marketData.push(data);
        this.marketCache.set(symbol, data);
      }

      this.lastUpdate = now;
      return marketData;

    } catch (error) {
      console.error('[SituationMonitor] Failed to fetch market data:', error);
      return cachedData;
    }
  }

  private async fetchMarketDataForSymbol(symbol: string): Promise<MarketData> {
    // Simulated market data - in production, call actual API
    return {
      symbol,
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 2,
      lastUpdated: new Date().toISOString()
    };
  }

  async getGeopoliticalEvents(severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<GeopoliticalEvent[]> {
    try {
      // Simulate fetching geopolitical events
      // In production, integrate with GDELT, ACLED, or similar
      const events: GeopoliticalEvent[] = [
        {
          id: 'evt_1',
          title: 'Sample geopolitical event',
          location: 'Global',
          severity: 'medium',
          timestamp: new Date().toISOString(),
          description: 'Sample event description'
        }
      ];

      this.eventsCache = events;

      return severity 
        ? events.filter(e => e.severity === severity)
        : events;

    } catch (error) {
      console.error('[SituationMonitor] Failed to fetch events:', error);
      return this.eventsCache;
    }
  }

  async getGlobalContext(): Promise<{
    news: NewsItem[];
    markets: MarketData[];
    events: GeopoliticalEvent[];
    timestamp: number;
  }> {
    const [news, markets, events] = await Promise.all([
      this.getLatestNews(),
      this.getMarketData(),
      this.getGeopoliticalEvents()
    ]);

    return {
      news,
      markets,
      events,
      timestamp: Date.now()
    };
  }

  getStats() {
    return {
      newsCount: this.newsCache.length,
      marketSymbols: this.marketCache.size,
      eventsCount: this.eventsCache.length,
      lastUpdate: this.lastUpdate,
      refreshInterval: this.config.refreshInterval
    };
  }
}
