// Real knowledge base with Wikipedia API integration
export class RealKnowledgeBase {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 3600000; // 1 hour

  constructor() {
    console.log('[RealKnowledgeBase] Initialized with Wikipedia API integration');
  }

  // Search Wikipedia API
  async searchWikipedia(query: string, limit: number = 5): Promise<any[]> {
    const cacheKey = `wiki_search_${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`
      );
      
      const data = await response.json();
      const results = data.query?.search || [];
      
      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[RealKnowledgeBase] Wikipedia search failed:', error);
      return [];
    }
  }

  // Get full article from Wikipedia
  async getWikipediaArticle(title: string): Promise<string | null> {
    const cacheKey = `wiki_article_${title}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`
      );
      
      const data = await response.json();
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      
      if (pageId && pages[pageId].extract) {
        const extract = pages[pageId].extract;
        this.setCache(cacheKey, extract);
        return extract;
      }
      
      return null;
    } catch (error) {
      console.error('[RealKnowledgeBase] Wikipedia article fetch failed:', error);
      return null;
    }
  }

  // Get Wikipedia summary
  async getWikipediaSummary(title: string): Promise<string | null> {
    const cacheKey = `wiki_summary_${title}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const summary = data.extract || null;
      
      if (summary) {
        this.setCache(cacheKey, summary);
      }
      
      return summary;
    } catch (error) {
      console.error('[RealKnowledgeBase] Wikipedia summary fetch failed:', error);
      return null;
    }
  }

  // Search with multiple sources
  async search(query: string): Promise<{
    results: Array<{
      title: string;
      snippet: string;
      url: string;
      source: string;
    }>;
    fullAnswer?: string;
  }> {
    const results: Array<{
      title: string;
      snippet: string;
      url: string;
      source: string;
    }> = [];

    // Search Wikipedia
    const wikiResults = await this.searchWikipedia(query, 5);
    
    for (const result of wikiResults) {
      results.push({
        title: result.title,
        snippet: result.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
        source: 'Wikipedia'
      });
    }

    // Get full answer from top result
    let fullAnswer: string | undefined;
    if (wikiResults.length > 0) {
      const topResult = wikiResults[0];
      const summary = await this.getWikipediaSummary(topResult.title);
      if (summary) {
        fullAnswer = summary;
      } else {
        const article = await this.getWikipediaArticle(topResult.title);
        if (article) {
          // Take first 3 paragraphs
          const paragraphs = article.split('\n\n').slice(0, 3).join('\n\n');
          fullAnswer = paragraphs;
        }
      }
    }

    return { results, fullAnswer };
  }

  // Answer a question using knowledge base
  async answerQuestion(question: string): Promise<{
    answer: string;
    sources: Array<{ title: string; url: string }>;
    confidence: number;
  }> {
    const searchResults = await this.search(question);
    
    if (searchResults.fullAnswer) {
      return {
        answer: searchResults.fullAnswer,
        sources: searchResults.results.slice(0, 3).map(r => ({
          title: r.title,
          url: r.url
        })),
        confidence: 0.85
      };
    }

    if (searchResults.results.length > 0) {
      const topResult = searchResults.results[0];
      return {
        answer: topResult.snippet,
        sources: [{
          title: topResult.title,
          url: topResult.url
        }],
        confidence: 0.6
      };
    }

    return {
      answer: 'I could not find information about that in my knowledge base.',
      sources: [],
      confidence: 0.1
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
    if (this.cache.size > 1000) {
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
