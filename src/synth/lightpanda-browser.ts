// Lightpanda Browser Integration - Ultra-fast headless browser for AI agents
export interface LightpandaConfig {
  apiUrl: string;
  timeout?: number;
}

export interface BrowserResult {
  content: string;
  title?: string;
  links?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

export class LightpandaBrowser {
  private config: LightpandaConfig;
  private isConnected: boolean = false;

  constructor(config?: Partial<LightpandaConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || 'http://localhost:9223',
      timeout: config?.timeout ?? 60000
    };
    console.log('[LightpandaBrowser] Ultra-fast browser automation initialized');
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('[LightpandaBrowser] Connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async scrape(url: string, options?: {
    extractImages?: boolean;
    extractLinks?: boolean;
    waitForSelector?: string;
  }): Promise<BrowserResult> {
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Cannot connect to Lightpanda browser');
      }
    }

    try {
      // Use Lightpanda's agent mode for natural language tasks
      const script = `
        const page = new Page();
        await page.goto("${url}");
        ${options?.waitForSelector ? `await page.waitForSelector("${options.waitForSelector}");` : ''}
        const content = await page.extract({
          title: "title",
          text: "body",
          ${options?.extractLinks ? 'links: ["a"]' : ''}
          ${options?.extractImages ? ', images: ["img"]' : ''}
        });
        return content;
      `;

      const timeout = this.config.timeout ?? 60000;
      const response = await fetch(`${this.config.apiUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'run',
            arguments: { script, timeout }
          }
        }),
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw new Error(`Lightpanda error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.result?.text || data.result?.content || '',
        title: data.result?.title,
        links: data.result?.links || [],
        images: data.result?.images || [],
        metadata: data.result?.metadata || {}
      };

    } catch (error) {
      console.error('[LightpandaBrowser] Scrape failed:', error);
      throw error;
    }
  }

  async interact(url: string, actions: Array<{
    type: 'click' | 'type' | 'scroll' | 'wait';
    selector?: string;
    value?: string;
  }>): Promise<BrowserResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const actionScript = actions.map(action => {
        switch (action.type) {
          case 'click':
            return `await page.click("${action.selector}");`;
          case 'type':
            return `await page.type("${action.selector}", "${action.value}");`;
          case 'scroll':
            return `await page.scroll(${action.value || 500});`;
          case 'wait':
            return `await page.waitForTimeout(${action.value || 1000});`;
          default:
            return '';
        }
      }).join('\n');

      const script = `
        const page = new Page();
        await page.goto("${url}");
        ${actionScript}
        const content = await page.extract({
          title: "title",
          text: "body"
        });
        return content;
      `;

      const response = await fetch(`${this.config.apiUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'run',
            arguments: { script, timeout: this.config.timeout }
          }
        })
      });

      const data = await response.json();
      
      return {
        content: data.result?.text || data.result?.content || '',
        title: data.result?.title,
        metadata: { actions: actions.length }
      };

    } catch (error) {
      console.error('[LightpandaBrowser] Interaction failed:', error);
      throw error;
    }
  }

  async agent(task: string): Promise<string> {
    // Natural language browser control
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'agent',
            arguments: { task }
          }
        })
      });

      const data = await response.json();
      return data.result || '';

    } catch (error) {
      console.error('[LightpandaBrowser] Agent task failed:', error);
      throw error;
    }
  }

  getStats() {
    return {
      isConnected: this.isConnected,
      apiUrl: this.config.apiUrl,
      timeout: this.config.timeout
    };
  }
}
