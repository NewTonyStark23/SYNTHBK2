// Real web search with multiple search engines
export class WebSearch {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 1800000; // 30 minutes

  constructor() {
    console.log('[WebSearch] Initialized with multiple search engines');
  }

  // DuckDuckGo Instant Answer API (no API key needed)
  async searchDuckDuckGo(query: string): Promise<any[]> {
    const cacheKey = `ddg_${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use DuckDuckGo's instant answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      
      const data = await response.json();
      const results: any[] = [];

      // Abstract (main answer)
      if (data.Abstract) {
        results.push({
          title: data.Heading || query,
          snippet: data.Abstract,
          url: data.AbstractURL || '',
          source: 'DuckDuckGo'
        });
      }

      // Related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || query,
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo'
            });
          }
        }
      }

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[WebSearch] DuckDuckGo search failed:', error);
      return [];
    }
  }

  // Wikipedia search (as fallback)
  async searchWikipedia(query: string): Promise<any[]> {
    const cacheKey = `wiki_search_${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`
      );
      
      const data = await response.json();
      const results = (data.query?.search || []).map((item: any) => ({
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>/g, ''),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
        source: 'Wikipedia'
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[WebSearch] Wikipedia search failed:', error);
      return [];
    }
  }

  // Combined search across multiple sources
  async search(query: string): Promise<{
    results: Array<{
      title: string;
      snippet: string;
      url: string;
      source: string;
    }>;
    instantAnswer?: string;
  }> {
    const allResults: Array<{
      title: string;
      snippet: string;
      url: string;
      source: string;
    }> = [];

    // Try DuckDuckGo first
    const ddgResults = await this.searchDuckDuckGo(query);
    allResults.push(...ddgResults);

    // Add Wikipedia results
    const wikiResults = await this.searchWikipedia(query);
    allResults.push(...wikiResults);

    // Get instant answer if available
    let instantAnswer: string | undefined;
    if (ddgResults.length > 0 && ddgResults[0].snippet) {
      instantAnswer = ddgResults[0].snippet;
    }

    // Remove duplicates based on URL
    const uniqueResults = allResults.filter((result, index, self) =>
      index === self.findIndex(r => r.url === result.url)
    );

    return {
      results: uniqueResults.slice(0, 10),
      instantAnswer
    };
  }

  // Research a topic in depth
  async research(topic: string): Promise<{
    summary: string;
    keyPoints: string[];
    sources: Array<{ title: string; url: string }>;
  }> {
    const searchResults = await this.search(topic);
    
    const keyPoints: string[] = [];
    const sources: Array<{ title: string; url: string }> = [];

    // Extract key points from results
    for (const result of searchResults.results.slice(0, 5)) {
      if (result.snippet && result.snippet.length > 50) {
        // Extract first sentence as key point
        const firstSentence = result.snippet.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.length > 20) {
          keyPoints.push(firstSentence.trim());
        }
      }
      
      sources.push({
        title: result.title,
        url: result.url
      });
    }

    // Generate summary
    const summary = searchResults.instantAnswer || 
                   (keyPoints.length > 0 ? keyPoints.join(' ') : 'No information found.');

    return {
      summary,
      keyPoints: keyPoints.slice(0, 5),
      sources: sources.slice(0, 5)
    };
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
    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout
    };
  }
}
