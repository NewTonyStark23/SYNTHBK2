// Situation Monitor - REAL-TIME news, markets, and geopolitical events
// Wired to: GDELT (news), free financial APIs (markets), GDELT/USGS (events)
export interface SituationMonitorConfig {
  refreshInterval?: number;
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
      refreshInterval: config?.refreshInterval ?? 300000, // 5 min
      newsSources: config?.newsSources ?? ['world', 'technology', 'business'],
      marketSymbols: config?.marketSymbols ?? ['SPY', 'QQQ', 'GLD', 'BTC-USD']
    };
    console.log('[SituationMonitor] Real-time monitoring initialized with live APIs');
  }

  // REAL: GDELT Project - free global news database (no API key needed)
  async getLatestNews(categories?: string[]): Promise<NewsItem[]> {
    const now = Date.now();
    if (this.newsCache.length > 0 && (now - this.lastUpdate) < this.config.refreshInterval!) {
      return categories 
        ? this.newsCache.filter(n => categories.includes(n.category))
        : this.newsCache;
    }

    try {
      // GDELT DOC API - real global news
      const query = this.config.newsSources!.join(' OR ');
      const response = await fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&format=json&maxrecords=30&sort=datedesc`
      );

      if (!response.ok) throw new Error(`GDELT API error: ${response.status}`);

      const data = await response.json();
      const articles = data.articles || [];

      const newsItems: NewsItem[] = articles.map((article: any) => ({
        title: article.title || 'Untitled',
        source: article.domain || 'Unknown',
        url: article.url || '',
        publishedAt: article.seendate || new Date().toISOString(),
        summary: article.socialimage || article.title || '',
        category: this.categorizeNews(article.title || '')
      }));

      this.newsCache = newsItems;
      this.lastUpdate = now;

      return categories 
        ? newsItems.filter(n => categories.includes(n.category))
        : newsItems;

    } catch (error) {
      console.error('[SituationMonitor] GDELT news fetch failed:', error);
      // Fallback: try RSS via rss2json
      return this.fetchRSSNews();
    }
  }

  // REAL: RSS feeds via rss2json (free, no key needed)
  private async fetchRSSNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
      );
      
      if (!response.ok) return this.newsCache;
      
      const data = await response.json();
      const items = data.items || [];
      
      const newsItems: NewsItem[] = items.map((item: any) => ({
        title: item.title || 'Untitled',
        source: data.feed?.title || 'NYTimes',
        url: item.link || '',
        publishedAt: item.pubDate || new Date().toISOString(),
        summary: (item.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
        category: this.categorizeNews(item.title || '')
      }));

      this.newsCache = newsItems;
      this.lastUpdate = Date.now();
      return newsItems;
    } catch (error) {
      console.error('[SituationMonitor] RSS fallback failed:', error);
      return this.newsCache;
    }
  }

  // REAL: Financial data via free APIs
  async getMarketData(): Promise<MarketData[]> {
    const now = Date.now();
    const cachedData = Array.from(this.marketCache.values());
    
    if (cachedData.length > 0 && (now - this.lastUpdate) < this.config.refreshInterval!) {
      return cachedData;
    }

    try {
      // Use Yahoo Finance v8 API (free, no key) via a CORS-friendly endpoint
      const results: MarketData[] = [];
      
      for (const symbol of this.config.marketSymbols!) {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
          );
          
          if (response.ok) {
            const data = await response.json();
            const meta = data.chart?.result?.[0]?.meta;
            
            if (meta) {
              const price = meta.regularMarketPrice || 0;
              const prevClose = meta.chartPreviousClose || meta.previousClose || price;
              const change = price - prevClose;
              const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
              
              const marketData: MarketData = {
                symbol,
                price,
                change,
                changePercent,
                lastUpdated: new Date().toISOString()
              };
              
              results.push(marketData);
              this.marketCache.set(symbol, marketData);
            }
          }
        } catch (e) {
          console.warn(`[SituationMonitor] Failed to fetch ${symbol}:`, e);
        }
      }

      // If Yahoo failed, try alternative: coinbase for crypto
      if (results.length === 0) {
        try {
          const btcResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
          if (btcResponse.ok) {
            const btcData = await btcResponse.json();
            const price = parseFloat(btcData.data.amount);
            results.push({
              symbol: 'BTC-USD',
              price,
              change: 0,
              changePercent: 0,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('[SituationMonitor] Coinbase fallback failed:', e);
        }
      }

      this.lastUpdate = now;
      return results.length > 0 ? results : cachedData;

    } catch (error) {
      console.error('[SituationMonitor] Market data fetch failed:', error);
      return cachedData;
    }
  }

  // REAL: GDELT for geopolitical events (real events database)
  async getGeopoliticalEvents(severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<GeopoliticalEvent[]> {
    try {
      // GDELT GKG API for conflict/protest events
      const response = await fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent('conflict OR protest OR crisis OR war')}&mode=artlist&format=json&maxrecords=20&sort=datedesc&timespan=7d`
      );

      if (!response.ok) {
        // Fallback: USGS earthquakes as geopolitical events
        return this.fetchEarthquakeEvents(severity);
      }

      const data = await response.json();
      const articles = data.articles || [];

      const events: GeopoliticalEvent[] = articles.slice(0, 15).map((article: any, i: number) => ({
        id: `evt_${i}_${Date.now()}`,
        title: article.title || 'Geopolitical Event',
        location: this.extractLocation(article.title || ''),
        severity: this.classifySeverity(article.title || ''),
        timestamp: article.seendate || new Date().toISOString(),
        description: article.title || ''
      }));

      this.eventsCache = events;

      return severity 
        ? events.filter(e => e.severity === severity)
        : events;

    } catch (error) {
      console.error('[SituationMonitor] Events fetch failed:', error);
      return this.fetchEarthquakeEvents(severity);
    }
  }

  // REAL: USGS Earthquake API (free, no key)
  private async fetchEarthquakeEvents(severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<GeopoliticalEvent[]> {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'
      );

      if (!response.ok) return this.eventsCache;

      const data = await response.json();
      const features = data.features || [];

      const events: GeopoliticalEvent[] = features.slice(0, 15).map((feature: any) => {
        const mag = feature.properties.mag || 0;
        return {
          id: feature.id || `eq_${Date.now()}`,
          title: `M${mag.toFixed(1)} Earthquake - ${feature.properties.place || 'Unknown'}`,
          location: feature.properties.place || 'Unknown',
          severity: mag >= 7 ? 'critical' as const : mag >= 5 ? 'high' as const : mag >= 3 ? 'medium' as const : 'low' as const,
          timestamp: new Date(feature.properties.time).toISOString(),
          description: `Magnitude ${mag.toFixed(1)} earthquake at ${feature.properties.place}. Depth: ${feature.geometry?.coordinates?.[2] || 0}km`
        };
      });

      this.eventsCache = events;
      return severity ? events.filter(e => e.severity === severity) : events;
    } catch (error) {
      console.error('[SituationMonitor] USGS fallback failed:', error);
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

    return { news, markets, events, timestamp: Date.now() };
  }

  private categorizeNews(title: string): string {
    const lower = title.toLowerCase();
    if (lower.match(/politic|government|election|senate|congress|president/)) return 'politics';
    if (lower.match(/tech|ai|computer|software|internet|digital/)) return 'technology';
    if (lower.match(/market|stock|economy|business|finance|trade/)) return 'business';
    if (lower.match(/war|conflict|military|attack|defense/)) return 'conflict';
    if (lower.match(/health|disease|medical|virus|pandemic/)) return 'health';
    if (lower.match(/climate|environment|earthquake|flood|storm/)) return 'environment';
    if (lower.match(/sport|game|team|player|score/)) return 'sports';
    return 'general';
  }

  private extractLocation(title: string): string {
    const countries = ['Ukraine', 'Russia', 'China', 'Israel', 'Gaza', 'Iran', 'Syria', 'India', 'Pakistan', 'US', 'UK', 'France', 'Germany', 'Japan', 'Brazil'];
    for (const country of countries) {
      if (title.toLowerCase().includes(country.toLowerCase())) return country;
    }
    return 'Global';
  }

  private classifySeverity(title: string): 'low' | 'medium' | 'high' | 'critical' {
    const lower = title.toLowerCase();
    if (lower.match(/war|attack|killed|dead|massacre|nuclear/)) return 'critical';
    if (lower.match(/conflict|crisis|tension|sanction|protest/)) return 'high';
    if (lower.match(/dispute|agreement|summit|negotiat/)) return 'medium';
    return 'low';
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
