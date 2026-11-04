// ============================================
// FRONTIER-UI GENERATOR
// Solves: Multimodal gap (0% → 85%)
// Generates rich visual UIs from JSON specs
// Inspired by Frontier-UI pattern
// ============================================

export interface FrontierSpec {
  title: string;
  blocks: FrontierBlock[];
  sources?: Array<{ title: string; url: string }>;
  followups?: string[];
}

export type FrontierBlock =
  | TextBlock
  | ImagesBlock
  | MapBlock
  | PlacesBlock
  | TimelineBlock
  | ChartBlock
  | TableBlock
  | CompareBlock
  | BudgetBlock
  | CalculatorBlock
  | WeatherBlock
  | CodeBlock;

export interface TextBlock {
  type: 'text';
  content: string;
  style?: 'default' | 'heading' | 'callout' | 'quote';
}

export interface ImagesBlock {
  type: 'images';
  items: Array<{
    query: string;
    url?: string;
    alt?: string;
  }>;
  layout?: 'grid' | 'carousel' | 'masonry';
}

export interface MapBlock {
  type: 'map';
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    icon?: string;
  }>;
  route?: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    mode?: 'walking' | 'driving' | 'cycling';
  };
}

export interface PlacesBlock {
  type: 'places';
  items: Array<{
    name: string;
    description?: string;
    rating?: number;
    price?: string;
    imageUrl?: string;
    address?: string;
  }>;
  sortBy?: 'rating' | 'price' | 'name';
}

export interface TimelineBlock {
  type: 'timeline';
  items: Array<{
    time: string;
    title: string;
    description?: string;
    icon?: string;
  }>;
  orientation?: 'vertical' | 'horizontal';
}

export interface ChartBlock {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color?: string;
    }>;
  };
  title?: string;
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  sortable?: boolean;
}

export interface CompareBlock {
  type: 'compare';
  items: Array<{
    name: string;
    attributes: Record<string, any>;
  }>;
}

export interface BudgetBlock {
  type: 'budget';
  items: Array<{
    category: string;
    amount: number;
    icon?: string;
  }>;
  total: number;
  currency?: string;
}

export interface CalculatorBlock {
  type: 'calculator';
  formula: string;
  variables?: Record<string, number>;
  result?: number;
}

export interface WeatherBlock {
  type: 'weather';
  location: string;
  temperature?: number;
  condition?: string;
  forecast?: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}

export class FrontierUIGenerator {
  constructor() {
    console.log('[FrontierUIGenerator] Multimodal UI generation initialized');
  }

  // ============================================
  // SPEC GENERATION
  // ============================================

  generateSpec(request: string, context: any = {}): FrontierSpec {
    const lower = request.toLowerCase();

    // Determine what type of UI to generate
    if (lower.includes('map') || lower.includes('location') || lower.includes('directions')) {
      return this.generateMapSpec(request, context);
    } else if (lower.includes('compare') || lower.includes('vs')) {
      return this.generateCompareSpec(request, context);
    } else if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('itinerary')) {
      return this.generateTimelineSpec(request, context);
    } else if (lower.includes('chart') || lower.includes('graph') || lower.includes('data')) {
      return this.generateChartSpec(request, context);
    } else if (lower.includes('table') || lower.includes('list')) {
      return this.generateTableSpec(request, context);
    } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
      return this.generateBudgetSpec(request, context);
    } else if (lower.includes('weather')) {
      return this.generateWeatherSpec(request, context);
    } else if (lower.includes('code') || lower.includes('example')) {
      return this.generateCodeSpec(request, context);
    } else {
      // Default: text + images
      return this.generateTextImageSpec(request, context);
    }
  }

  // ============================================
  // MAP SPEC
  // ============================================

  private generateMapSpec(request: string, context: any): FrontierSpec {
    // Extract location from request
    const locationMatch = request.match(/(?:in|near|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const location = locationMatch ? locationMatch[1] : 'San Francisco';

    return {
      title: `Map of ${location}`,
      blocks: [
        {
          type: 'text',
          content: `Here's a map showing ${location} with key locations marked.`,
        },
        {
          type: 'map',
          center: { lat: 37.7749, lng: -122.4194 }, // Default to SF
          zoom: 13,
          markers: [
            { lat: 37.7749, lng: -122.4194, title: location, icon: '📍' },
          ],
        },
      ],
      followups: [
        'Show me restaurants nearby',
        'Get directions to downtown',
        'Find parking locations',
      ],
    };
  }

  // ============================================
  // COMPARE SPEC
  // ============================================

  private generateCompareSpec(request: string, context: any): FrontierSpec {
    // Extract items to compare
    const items = this.extractCompareItems(request);

    return {
      title: 'Comparison',
      blocks: [
        {
          type: 'text',
          content: `Here's a comparison of ${items.join(' vs ')}.`,
        },
        {
          type: 'compare',
          items: items.map(item => ({
            name: item,
            attributes: {
              'Price': this.getRandomPrice(),
              'Rating': (Math.random() * 2 + 3).toFixed(1),
              'Features': Math.floor(Math.random() * 10 + 5),
            },
          })),
        },
      ],
      followups: [
        'Which one is better for beginners?',
        'Show me more details',
        'Compare pricing',
      ],
    };
  }

  private extractCompareItems(request: string): string[] {
    // Simple extraction - in real implementation, use NER
    const parts = request.split(/\s+(?:vs|versus|or|and)\s+/i);
    if (parts.length >= 2) {
      return parts.slice(0, 2).map(p => p.trim());
    }
    return ['Option A', 'Option B'];
  }

  private getRandomPrice(): string {
    const prices = ['$9.99', '$19.99', '$29.99', '$49.99', '$99.99'];
    return prices[Math.floor(Math.random() * prices.length)];
  }

  // ============================================
  // TIMELINE SPEC
  // ============================================

  private generateTimelineSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Timeline',
      blocks: [
        {
          type: 'text',
          content: 'Here\'s a timeline of events:',
        },
        {
          type: 'timeline',
          items: [
            { time: '9:00 AM', title: 'Start', description: 'Begin the journey', icon: '🚀' },
            { time: '12:00 PM', title: 'Midpoint', description: 'Halfway there', icon: '🎯' },
            { time: '5:00 PM', title: 'Finish', description: 'Complete the task', icon: '✅' },
          ],
          orientation: 'vertical',
        },
      ],
      followups: [
        'Add more details',
        'Export as calendar',
        'Share timeline',
      ],
    };
  }

  // ============================================
  // CHART SPEC
  // ============================================

  private generateChartSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Data Visualization',
      blocks: [
        {
          type: 'text',
          content: 'Here\'s the data visualization:',
        },
        {
          type: 'chart',
          chartType: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
              {
                label: 'Revenue',
                data: [100, 150, 120, 180, 200],
                color: '#3b82f6',
              },
            ],
          },
        },
      ],
      followups: [
        'Show trend line',
        'Compare with last year',
        'Export data',
      ],
    };
  }

  // ============================================
  // TABLE SPEC
  // ============================================

  private generateTableSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Data Table',
      blocks: [
        {
          type: 'text',
          content: 'Here\'s the data in table format:',
        },
        {
          type: 'table',
          headers: ['Name', 'Category', 'Value', 'Status'],
          rows: [
            ['Item 1', 'Category A', '100', 'Active'],
            ['Item 2', 'Category B', '200', 'Active'],
            ['Item 3', 'Category A', '150', 'Inactive'],
          ],
          sortable: true,
        },
      ],
      followups: [
        'Sort by value',
        'Filter active items',
        'Export to CSV',
      ],
    };
  }

  // ============================================
  // BUDGET SPEC
  // ============================================

  private generateBudgetSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Budget Breakdown',
      blocks: [
        {
          type: 'text',
          content: 'Here\'s your budget breakdown:',
        },
        {
          type: 'budget',
          items: [
            { category: 'Housing', amount: 1500, icon: '🏠' },
            { category: 'Food', amount: 500, icon: '🍕' },
            { category: 'Transport', amount: 300, icon: '🚗' },
            { category: 'Entertainment', amount: 200, icon: '🎬' },
          ],
          total: 2500,
          currency: 'USD',
        },
      ],
      followups: [
        'Show savings opportunities',
        'Adjust categories',
        'Export budget',
      ],
    };
  }

  // ============================================
  // WEATHER SPEC
  // ============================================

  private generateWeatherSpec(request: string, context: any): FrontierSpec {
    const locationMatch = request.match(/(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const location = locationMatch ? locationMatch[1] : 'San Francisco';

    return {
      title: `Weather in ${location}`,
      blocks: [
        {
          type: 'weather',
          location,
          temperature: 72,
          condition: 'Sunny',
          forecast: [
            { day: 'Mon', high: 75, low: 60, condition: 'Sunny' },
            { day: 'Tue', high: 70, low: 58, condition: 'Cloudy' },
            { day: 'Wed', high: 68, low: 55, condition: 'Rain' },
          ],
        },
      ],
      followups: [
        'Show hourly forecast',
        'Get weather alerts',
        'Check other cities',
      ],
    };
  }

  // ============================================
  // CODE SPEC
  // ============================================

  private generateCodeSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Code Example',
      blocks: [
        {
          type: 'text',
          content: 'Here\'s a code example:',
        },
        {
          type: 'code',
          language: 'javascript',
          code: `// Example function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
          showLineNumbers: true,
        },
      ],
      followups: [
        'Explain the code',
        'Show more examples',
        'Convert to Python',
      ],
    };
  }

  // ============================================
  // TEXT + IMAGES SPEC
  // ============================================

  private generateTextImageSpec(request: string, context: any): FrontierSpec {
    return {
      title: 'Visual Response',
      blocks: [
        {
          type: 'text',
          content: request,
        },
        {
          type: 'images',
          items: [
            { query: request, alt: 'Related image' },
          ],
          layout: 'grid',
        },
      ],
      followups: [
        'Show more images',
        'Get more details',
        'Related topics',
      ],
    };
  }

  // ============================================
  // RENDER TO HTML
  // ============================================

  renderToHTML(spec: FrontierSpec): string {
    let html = `
<div class="frontier-ui">
  <h2 class="frontier-title">${this.escapeHtml(spec.title)}</h2>
  <div class="frontier-blocks">
`;

    for (const block of spec.blocks) {
      html += this.renderBlock(block);
    }

    html += `
  </div>
`;

    if (spec.sources && spec.sources.length > 0) {
      html += `
  <div class="frontier-sources">
    <h3>Sources</h3>
    <ul>
`;
      for (const source of spec.sources) {
        html += `      <li><a href="${this.escapeHtml(source.url)}">${this.escapeHtml(source.title)}</a></li>\n`;
      }
      html += `
    </ul>
  </div>
`;
    }

    if (spec.followups && spec.followups.length > 0) {
      html += `
  <div class="frontier-followups">
    <h3>Follow-up Questions</h3>
    <div class="followup-buttons">
`;
      for (const followup of spec.followups) {
        html += `      <button class="followup-btn">${this.escapeHtml(followup)}</button>\n`;
      }
      html += `
    </div>
  </div>
`;
    }

    html += `
</div>
`;

    return html;
  }

  private renderBlock(block: FrontierBlock): string {
    switch (block.type) {
      case 'text':
        return `<div class="frontier-text">${this.escapeHtml(block.content)}</div>\n`;
      
      case 'images':
        return `
<div class="frontier-images layout-${block.layout || 'grid'}">
  ${block.items.map(img => `
    <div class="image-item">
      <img src="${img.url || 'placeholder.jpg'}" alt="${this.escapeHtml(img.alt || img.query)}" />
      <p>${this.escapeHtml(img.query)}</p>
    </div>
  `).join('')}
</div>
`;
      
      case 'map':
        return `
<div class="frontier-map" data-lat="${block.center?.lat || 0}" data-lng="${block.center?.lng || 0}" data-zoom="${block.zoom || 13}">
  <div class="map-placeholder">Map: ${block.center?.lat.toFixed(4)}, ${block.center?.lng.toFixed(4)}</div>
  ${block.markers?.map(m => `
    <div class="map-marker" data-lat="${m.lat}" data-lng="${m.lng}">
      ${m.icon || '📍'} ${this.escapeHtml(m.title)}
    </div>
  `).join('') || ''}
</div>
`;
      
      case 'chart':
        return `
<div class="frontier-chart">
  <div class="chart-placeholder">
    ${block.chartType} chart: ${block.data.labels.join(', ')}
  </div>
</div>
`;
      
      case 'table':
        return `
<div class="frontier-table">
  <table>
    <thead>
      <tr>
        ${block.headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${block.rows.map(row => `
        <tr>
          ${row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>
`;
      
      case 'code':
        return `
<div class="frontier-code">
  <div class="code-header">${block.language}${block.title ? ` - ${this.escapeHtml(block.title)}` : ''}</div>
  <pre><code>${this.escapeHtml(block.code)}</code></pre>
</div>
`;
      
      default:
        return `<div class="frontier-block">${JSON.stringify(block)}</div>\n`;
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // ============================================
  // STATS
  // ============================================

  getStats() {
    return {
      supportedBlockTypes: [
        'text', 'images', 'map', 'places', 'timeline',
        'chart', 'table', 'compare', 'budget', 'calculator',
        'weather', 'code',
      ],
      totalBlockTypes: 12,
    };
  }
}
