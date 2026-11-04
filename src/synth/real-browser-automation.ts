// Browser Automation - Browser-compatible implementation
// Uses fetch API for web scraping (no Node.js dependencies)
export class RealBrowserAutomation {
  private isConnected: boolean = false;

  constructor() {
    console.log('[RealBrowserAutomation] Initialized with browser-compatible fetch API');
  }

  // Fetch and parse a web page using fetch API
  async navigate(url: string): Promise<{
    title: string;
    content: string;
    url: string;
  }> {
    try {
      // Use a CORS proxy or direct fetch
      const response = await fetch(url, {
        mode: 'cors',
        headers: { 'Accept': 'text/html,application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let content = '';
      let title = '';

      if (contentType.includes('html')) {
        const html = await response.text();
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : 'Untitled';
        // Extract text content (strip tags)
        content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim()
                     .substring(0, 5000);
      } else if (contentType.includes('json')) {
        const json = await response.json();
        content = JSON.stringify(json, null, 2).substring(0, 5000);
        title = 'JSON Response';
      } else {
        content = await response.text();
        content = content.substring(0, 5000);
        title = url;
      }

      this.isConnected = true;
      return { title, content, url };
    } catch (error) {
      // Try via CORS proxy
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const html = await response.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
          const content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim()
                             .substring(0, 5000);
          
          this.isConnected = true;
          return { title, content, url };
        }
      } catch (proxyError) {
        // Fall through
      }

      this.isConnected = false;
      throw error;
    }
  }

  // Extract text content from a URL
  async extractText(url: string): Promise<string> {
    const result = await this.navigate(url);
    return result.content;
  }

  // Extract links from a URL
  async extractLinks(url: string): Promise<string[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      const linkRegex = /href=["']([^"']+)["']/gi;
      const links: string[] = [];
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (href.startsWith('http') || href.startsWith('/')) {
          links.push(href);
        }
      }
      
      return [...new Set(links)].slice(0, 50);
    } catch (error) {
      console.error('[RealBrowserAutomation] Link extraction failed:', error);
      return [];
    }
  }

  // Take a screenshot (using canvas - limited browser capability)
  async screenshot(url: string): Promise<string | null> {
    console.warn('[RealBrowserAutomation] Screenshots not available in browser context');
    return null;
  }

  // Execute JavaScript on a page (limited to fetch-based operations)
  async evaluate(url: string, script: string): Promise<any> {
    console.warn('[RealBrowserAutomation] Page evaluation not available in browser context');
    return null;
  }

  async close(): Promise<void> {
    this.isConnected = false;
  }

  getStats() {
    return {
      connected: this.isConnected,
      capabilities: ['fetch', 'parse-html', 'extract-links', 'extract-text'],
      limitations: ['no-screenshots', 'no-js-evaluation', 'cors-dependent']
    };
  }
}
