// Real Browser Automation - Puppeteer Core (Headless Chrome)
import puppeteer from 'puppeteer-core';

export class RealBrowserAutomation {
  private browser: any = null;
  private executablePath: string;

  constructor(executablePath?: string) {
    // Auto-detect Chrome/Chromium path
    this.executablePath = executablePath || this.findChromePath();
    console.log('[RealBrowserAutomation] Initialized with Puppeteer Core');
  }

  // Find Chrome/Chromium executable
  private findChromePath(): string {
    const paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];

    // Return first path (actual detection would require fs.existsSync)
    return paths[0];
  }

  // Launch browser
  async launch(): Promise<void> {
    if (this.browser) return;

    try {
      this.browser = await puppeteer.launch({
        executablePath: this.executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('[RealBrowserAutomation] Browser launched');
    } catch (error) {
      console.error('[RealBrowserAutomation] Launch failed:', error);
      throw error;
    }
  }

  // Close browser
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[RealBrowserAutomation] Browser closed');
    }
  }

  // Navigate to URL
  async navigate(url: string): Promise<any> {
    if (!this.browser) await this.launch();

    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const title = await page.title();
      const content = await page.content();
      const url_final = page.url();

      return {
        title,
        content,
        url: url_final,
        page
      };
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Extract text content
  async extractText(url: string): Promise<string> {
    const { page } = await this.navigate(url);
    
    try {
      const text = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(el => el.remove());
        
        return document.body.innerText;
      });

      await page.close();
      return text;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Extract links
  async extractLinks(url: string): Promise<any[]> {
    const { page } = await this.navigate(url);
    
    try {
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.map(anchor => ({
          text: anchor.innerText,
          href: anchor.href,
          title: anchor.title
        })).filter(link => link.href && link.text);
      });

      await page.close();
      return links;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Extract images
  async extractImages(url: string): Promise<any[]> {
    const { page } = await this.navigate(url);
    
    try {
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
          width: img.naturalWidth,
          height: img.naturalHeight
        })).filter(img => img.src);
      });

      await page.close();
      return images;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Take screenshot
  async screenshot(url: string, outputPath?: string): Promise<Buffer> {
    const { page } = await this.navigate(url);
    
    try {
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
      });

      await page.close();
      return screenshot;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Generate PDF
  async generatePDF(url: string): Promise<Buffer> {
    const { page } = await this.navigate(url);
    
    try {
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });

      await page.close();
      return pdf;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Execute JavaScript on page
  async executeScript(url: string, script: string): Promise<any> {
    const { page } = await this.navigate(url);
    
    try {
      const result = await page.evaluate(script);
      await page.close();
      return result;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Fill form
  async fillForm(url: string, formData: Record<string, string>): Promise<boolean> {
    const { page } = await this.navigate(url);
    
    try {
      for (const [selector, value] of Object.entries(formData)) {
        await page.type(selector, value);
      }
      
      await page.close();
      return true;
    } catch (error) {
      await page.close();
      return false;
    }
  }

  // Click element
  async clickElement(url: string, selector: string): Promise<boolean> {
    const { page } = await this.navigate(url);
    
    try {
      await page.click(selector);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.close();
      return true;
    } catch (error) {
      await page.close();
      return false;
    }
  }

  // Wait for element
  async waitForElement(url: string, selector: string, timeout: number = 5000): Promise<boolean> {
    const { page } = await this.navigate(url);
    
    try {
      await page.waitForSelector(selector, { timeout });
      await page.close();
      return true;
    } catch (error) {
      await page.close();
      return false;
    }
  }

  // Scrape with custom selector
  async scrapeWithSelector(url: string, selector: string): Promise<any[]> {
    const { page } = await this.navigate(url);
    
    try {
      const elements = await page.evaluate((sel: string) => {
        const items = Array.from(document.querySelectorAll(sel));
        return items.map(item => ({
          text: item.textContent?.trim() || '',
          html: item.innerHTML,
          attributes: Array.from(item.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {} as Record<string, string>)
        }));
      }, selector);

      await page.close();
      return elements;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Get page metadata
  async getMetadata(url: string): Promise<any> {
    const { page } = await this.navigate(url);
    
    try {
      const metadata = await page.evaluate(() => {
        const meta: Record<string, string> = {};
        
        // Get meta tags
        document.querySelectorAll('meta').forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          if (name && content) {
            meta[name] = content;
          }
        });

        return {
          title: document.title,
          description: meta['description'] || meta['og:description'] || '',
          keywords: meta['keywords'] || '',
          author: meta['author'] || '',
          ogTitle: meta['og:title'] || '',
          ogDescription: meta['og:description'] || '',
          ogImage: meta['og:image'] || '',
          ogUrl: meta['og:url'] || '',
          twitterCard: meta['twitter:card'] || '',
          twitterTitle: meta['twitter:title'] || '',
          twitterDescription: meta['twitter:description'] || '',
          twitterImage: meta['twitter:image'] || ''
        };
      });

      await page.close();
      return metadata;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  getStats() {
    return {
      browserLaunched: !!this.browser,
      executablePath: this.executablePath,
      capabilities: [
        'navigate',
        'extractText',
        'extractLinks',
        'extractImages',
        'screenshot',
        'generatePDF',
        'executeScript',
        'fillForm',
        'clickElement',
        'waitForElement',
        'scrapeWithSelector',
        'getMetadata'
      ]
    };
  }
}
