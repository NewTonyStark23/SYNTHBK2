// Vane AI Search Integration - Privacy-focused AI answering engine
export interface VaneSearchConfig {
  apiUrl: string;
  apiKey?: string;
  defaultMode: 'speed' | 'balanced' | 'quality';
}

export interface SearchResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  followUpQuestions?: string[];
  confidence: number;
}

export class VaneSearch {
  private config: VaneSearchConfig;
  private cache: Map<string, SearchResult> = new Map();

  constructor(config?: Partial<VaneSearchConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || 'http://localhost:3000',
      apiKey: config?.apiKey,
      defaultMode: config?.defaultMode || 'balanced'
    };
    console.log('[VaneSearch] AI-powered search engine initialized');
  }

  async search(query: string, options?: {
    mode?: 'speed' | 'balanced' | 'quality';
    sources?: string[];
  }): Promise<SearchResult> {
    const cacheKey = `vane_${query}_${options?.mode || this.config.defaultMode}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Call Vane API
      const response = await fetch(`${this.config.apiUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          query,
          mode: options?.mode || this.config.defaultMode,
          sources: options?.sources || ['web', 'academic']
        })
      });

      if (!response.ok) {
        throw new Error(`Vane API error: ${response.status}`);
      }

      const data = await response.json();
      
      const result: SearchResult = {
        answer: data.answer || 'No answer found',
        sources: data.sources || [],
        followUpQuestions: data.followUpQuestions || [],
        confidence: data.confidence || 0.7
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('[VaneSearch] Search failed:', error);
      // Fallback to basic search
      return {
        answer: `I searched for "${query}" but encountered an error. Please try again.`,
        sources: [],
        confidence: 0.1
      };
    }
  }

  async research(topic: string): Promise<{
    summary: string;
    keyPoints: string[];
    sources: Array<{ title: string; url: string }>;
  }> {
    const result = await this.search(topic, { mode: 'quality' });
    
    return {
      summary: result.answer,
      keyPoints: result.sources.slice(0, 5).map(s => s.snippet),
      sources: result.sources.map(s => ({ title: s.title, url: s.url }))
    };
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      apiUrl: this.config.apiUrl,
      defaultMode: this.config.defaultMode
    };
  }
}
