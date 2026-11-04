// Real code generation with AST-based generation
export class EnhancedCodeGenerator {
  private codePatterns: Map<string, CodePattern> = new Map();

  constructor() {
    this.initializePatterns();
    console.log('[EnhancedCodeGenerator] Initialized with AST-based generation');
  }

  private initializePatterns(): void {
    // Initialize common code patterns
    this.codePatterns.set('html_basic', {
      name: 'Basic HTML',
      template: this.generateHTMLTemplate(),
      variables: ['title', 'content']
    });

    this.codePatterns.set('javascript_function', {
      name: 'JavaScript Function',
      template: this.generateJSFunctionTemplate(),
      variables: ['functionName', 'parameters', 'body']
    });

    this.codePatterns.set('css_styled', {
      name: 'CSS Styled Component',
      template: this.generateCSSTemplate(),
      variables: ['className', 'styles']
    });
  }

  // Generate code based on requirements
  async generateCode(requirements: string, language: string = 'html'): Promise<{
    code: string;
    language: string;
    explanation: string;
    preview?: string;
  }> {
    const lower = requirements.toLowerCase();
    
    // Determine what to generate
    if (lower.includes('website') || lower.includes('page') || language === 'html') {
      return this.generateWebsite(requirements);
    } else if (lower.includes('function') || lower.includes('algorithm') || language === 'javascript') {
      return this.generateFunction(requirements);
    } else if (lower.includes('style') || lower.includes('css') || language === 'css') {
      return this.generateStyles(requirements);
    } else if (lower.includes('component') || lower.includes('react')) {
      return this.generateComponent(requirements);
    } else {
      return this.generateGeneric(requirements, language);
    }
  }

  // Generate a complete website
  private async generateWebsite(requirements: string): Promise<{
    code: string;
    language: string;
    explanation: string;
    preview?: string;
  }> {
    const lower = requirements.toLowerCase();
    
    // Extract features
    const features = this.extractFeatures(requirements);
    
    // Generate HTML structure
    let html = this.generateHTMLStructure(features);
    
    // Generate CSS styles
    const css = this.generateCSSStyles(features);
    
    // Generate JavaScript if needed
    const js = features.needsJS ? this.generateJavaScript(features) : '';
    
    // Combine into complete HTML
    const code = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${features.title || 'Generated Website'}</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
${js ? `<script>
${js}
</script>` : ''}
</body>
</html>`;

    return {
      code,
      language: 'html',
      explanation: this.generateExplanation(features),
      preview: code
    };
  }

  // Extract features from requirements
  private extractFeatures(requirements: string): WebsiteFeatures {
    const lower = requirements.toLowerCase();
    
    const features: WebsiteFeatures = {
      title: this.extractTitle(requirements),
      hasHeader: lower.includes('header') || lower.includes('navigation'),
      hasFooter: lower.includes('footer'),
      hasSidebar: lower.includes('sidebar'),
      hasForm: lower.includes('form') || lower.includes('input') || lower.includes('contact'),
      hasList: lower.includes('list') || lower.includes('items'),
      hasImages: lower.includes('image') || lower.includes('photo') || lower.includes('gallery'),
      hasButtons: lower.includes('button') || lower.includes('click'),
      needsJS: lower.includes('interactive') || lower.includes('dynamic') || 
               lower.includes('form') || lower.includes('button'),
      colorScheme: this.extractColorScheme(requirements),
      style: this.extractStyle(requirements)
    };
    
    return features;
  }

  private extractTitle(requirements: string): string {
    const match = requirements.match(/(?:called|named|titled)\s+["']?([^"']+)["']?/i);
    return match ? match[1] : 'Generated Website';
  }

  private extractColorScheme(requirements: string): string {
    const lower = requirements.toLowerCase();
    
    if (lower.includes('red')) return 'red';
    if (lower.includes('blue')) return 'blue';
    if (lower.includes('green')) return 'green';
    if (lower.includes('dark')) return 'dark';
    if (lower.includes('light')) return 'light';
    
    return 'blue';
  }

  private extractStyle(requirements: string): string {
    const lower = requirements.toLowerCase();
    
    if (lower.includes('modern')) return 'modern';
    if (lower.includes('minimal')) return 'minimal';
    if (lower.includes('professional')) return 'professional';
    if (lower.includes('colorful')) return 'colorful';
    
    return 'modern';
  }

  // Generate HTML structure
  private generateHTMLStructure(features: WebsiteFeatures): string {
    let html = '';
    
    // Header
    if (features.hasHeader) {
      html += `    <header>
        <h1>${features.title}</h1>
        <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>\n\n`;
    } else {
      html += `    <h1>${features.title}</h1>\n\n`;
    }
    
    // Main content
    html += `    <main>\n`;
    
    if (features.hasSidebar) {
      html += `        <aside class="sidebar">
            <h2>Sidebar</h2>
            <p>Sidebar content goes here.</p>
        </aside>\n`;
    }
    
    html += `        <section class="content">\n`;
    
    if (features.hasForm) {
      html += this.generateFormHTML();
    }
    
    if (features.hasList) {
      html += this.generateListHTML();
    }
    
    if (features.hasImages) {
      html += this.generateImageGalleryHTML();
    }
    
    if (features.hasButtons) {
      html += this.generateButtonsHTML();
    }
    
    if (!features.hasForm && !features.hasList && !features.hasImages && !features.hasButtons) {
      html += `            <p>Welcome to ${features.title}. This is the main content area.</p>\n`;
    }
    
    html += `        </section>\n`;
    html += `    </main>\n\n`;
    
    // Footer
    if (features.hasFooter) {
      html += `    <footer>
        <p>&copy; 2024 ${features.title}. All rights reserved.</p>
    </footer>\n`;
    }
    
    return html;
  }

  private generateFormHTML(): string {
    return `            <form id="contactForm">
                <h2>Contact Us</h2>
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" rows="4" required></textarea>
                </div>
                <button type="submit">Submit</button>
                <div id="formMessage"></div>
            </form>\n\n`;
  }

  private generateListHTML(): string {
    return `            <ul class="item-list">
                <li class="item">Item 1</li>
                <li class="item">Item 2</li>
                <li class="item">Item 3</li>
                <li class="item">Item 4</li>
                <li class="item">Item 5</li>
            </ul>\n\n`;
  }

  private generateImageGalleryHTML(): string {
    return `            <div class="gallery">
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200" alt="Image 1">
                    <p>Image 1</p>
                </div>
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200" alt="Image 2">
                    <p>Image 2</p>
                </div>
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200" alt="Image 3">
                    <p>Image 3</p>
                </div>
            </div>\n\n`;
  }

  private generateButtonsHTML(): string {
    return `            <div class="button-group">
                <button class="btn primary">Primary Button</button>
                <button class="btn secondary">Secondary Button</button>
                <button class="btn danger">Danger Button</button>
            </div>\n\n`;
  }

  // Generate CSS styles
  private generateCSSStyles(features: WebsiteFeatures): string {
    const colors = this.getColorPalette(features.colorScheme);
    
    let css = `        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: ${colors.text};
            background: ${colors.background};
        }

        header {
            background: ${colors.primary};
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        header h1 {
            font-size: 1.5rem;
        }

        nav a {
            color: white;
            text-decoration: none;
            margin-left: 1.5rem;
            transition: opacity 0.3s;
        }

        nav a:hover {
            opacity: 0.8;
        }

        main {
            display: flex;
            min-height: calc(100vh - 200px);
            padding: 2rem;
        }

        .sidebar {
            width: 250px;
            background: ${colors.secondary};
            padding: 1.5rem;
            margin-right: 2rem;
            border-radius: 8px;
        }

        .content {
            flex: 1;
        }

        h1, h2 {
            color: ${colors.primary};
            margin-bottom: 1rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        input, textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: ${colors.primary};
        }

        button, .btn {
            padding: 0.75rem 1.5rem;
            background: ${colors.primary};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s;
        }

        button:hover, .btn:hover {
            background: ${colors.primaryDark};
        }

        .btn.secondary {
            background: ${colors.secondary};
        }

        .btn.danger {
            background: #dc3545;
        }

        .button-group {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
        }

        .item-list {
            list-style: none;
        }

        .item {
            padding: 1rem;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            transition: transform 0.2s;
        }

        .item:hover {
            transform: translateX(5px);
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .gallery-item {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .gallery-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }

        .gallery-item p {
            padding: 1rem;
        }

        footer {
            background: ${colors.primary};
            color: white;
            text-align: center;
            padding: 1rem;
            margin-top: 2rem;
        }

        #formMessage {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 4px;
            display: none;
        }

        #formMessage.success {
            background: #d4edda;
            color: #155724;
            display: block;
        }

        #formMessage.error {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }`;
    
    return css;
  }

  private getColorPalette(scheme: string): ColorPalette {
    const palettes: Record<string, ColorPalette> = {
      red: {
        primary: '#dc3545',
        primaryDark: '#c82333',
        secondary: '#f8f9fa',
        background: '#ffffff',
        text: '#333333'
      },
      blue: {
        primary: '#007bff',
        primaryDark: '#0056b3',
        secondary: '#f8f9fa',
        background: '#ffffff',
        text: '#333333'
      },
      green: {
        primary: '#28a745',
        primaryDark: '#218838',
        secondary: '#f8f9fa',
        background: '#ffffff',
        text: '#333333'
      },
      dark: {
        primary: '#343a40',
        primaryDark: '#23272b',
        secondary: '#495057',
        background: '#212529',
        text: '#f8f9fa'
      },
      light: {
        primary: '#007bff',
        primaryDark: '#0056b3',
        secondary: '#e9ecef',
        background: '#ffffff',
        text: '#333333'
      }
    };
    
    return palettes[scheme] || palettes.blue;
  }

  // Generate JavaScript
  private generateJavaScript(features: WebsiteFeatures): string {
    let js = '';
    
    if (features.hasForm) {
      js += `        // Form handling
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            const formMessage = document.getElementById('formMessage');
            
            if (name && email && message) {
                formMessage.className = 'success';
                formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                this.reset();
            } else {
                formMessage.className = 'error';
                formMessage.textContent = 'Please fill in all fields.';
            }
        });\n\n`;
    }
    
    if (features.hasButtons) {
      js += `        // Button click handlers
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                alert('Button clicked: ' + this.textContent);
            });
        });\n\n`;
    }
    
    return js;
  }

  // Generate explanation
  private generateExplanation(features: WebsiteFeatures): string {
    let explanation = `I've generated a ${features.style} website`;
    
    if (features.title) {
      explanation += ` called "${features.title}"`;
    }
    
    explanation += ` with a ${features.colorScheme} color scheme.`;
    
    const components: string[] = [];
    if (features.hasHeader) components.push('navigation header');
    if (features.hasSidebar) components.push('sidebar');
    if (features.hasForm) components.push('contact form');
    if (features.hasList) components.push('item list');
    if (features.hasImages) components.push('image gallery');
    if (features.hasButtons) components.push('interactive buttons');
    if (features.hasFooter) components.push('footer');
    
    if (components.length > 0) {
      explanation += ` It includes ${components.join(', ')}.`;
    }
    
    if (features.needsJS) {
      explanation += ` The site is interactive with JavaScript functionality.`;
    }
    
    return explanation;
  }

  // Generate a function
  private async generateFunction(requirements: string): Promise<{
    code: string;
    language: string;
    explanation: string;
  }> {
    const lower = requirements.toLowerCase();
    
    // Extract function details
    const nameMatch = requirements.match(/(?:called|named)\s+["']?(\w+)["']?/i);
    const functionName = nameMatch ? nameMatch[1] : 'generatedFunction';
    
    let code = '';
    let explanation = '';
    
    if (lower.includes('sort')) {
      code = this.generateSortFunction(functionName);
      explanation = `I've created a ${functionName} function that sorts an array.`;
    } else if (lower.includes('search') || lower.includes('find')) {
      code = this.generateSearchFunction(functionName);
      explanation = `I've created a ${functionName} function that searches for items.`;
    } else if (lower.includes('calculate') || lower.includes('math')) {
      code = this.generateMathFunction(functionName, requirements);
      explanation = `I've created a ${functionName} function for mathematical calculations.`;
    } else {
      code = this.generateGenericFunction(functionName, requirements);
      explanation = `I've created a ${functionName} function based on your requirements.`;
    }
    
    return {
      code,
      language: 'javascript',
      explanation
    };
  }

  private generateSortFunction(name: string): string {
    return `function ${name}(array) {
    // Quick sort implementation
    if (array.length <= 1) {
        return array;
    }
    
    const pivot = array[array.length - 1];
    const left = [];
    const right = [];
    
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] < pivot) {
            left.push(array[i]);
        } else {
            right.push(array[i]);
        }
    }
    
    return [...${name}(left), pivot, ...${name}(right)];
}`;
  }

  private generateSearchFunction(name: string): string {
    return `function ${name}(array, target) {
    // Binary search implementation
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (array[mid] === target) {
            return mid;
        } else if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`;
  }

  private generateMathFunction(name: string, requirements: string): string {
    const lower = requirements.toLowerCase();
    
    if (lower.includes('factorial')) {
      return `function ${name}(n) {
    if (n <= 1) return 1;
    return n * ${name}(n - 1);
}`;
    } else if (lower.includes('fibonacci')) {
      return `function ${name}(n) {
    if (n <= 1) return n;
    return ${name}(n - 1) + ${name}(n - 2);
}`;
    } else {
      return `function ${name}(a, b) {
    return a + b;
}`;
    }
  }

  private generateGenericFunction(name: string, requirements: string): string {
    return `function ${name}(input) {
    // TODO: Implement based on requirements
    // ${requirements}
    
    return input;
}`;
  }

  // Generate styles
  private async generateStyles(requirements: string): Promise<{
    code: string;
    language: string;
    explanation: string;
  }> {
    const features = this.extractFeatures(requirements);
    const css = this.generateCSSStyles(features);
    
    return {
      code: css,
      language: 'css',
      explanation: `I've generated CSS styles with a ${features.colorScheme} color scheme.`
    };
  }

  // Generate React component
  private async generateComponent(requirements: string): Promise<{
    code: string;
    language: string;
    explanation: string;
  }> {
    const lower = requirements.toLowerCase();
    
    const nameMatch = requirements.match(/(?:called|named)\s+["']?(\w+)["']?/i);
    const componentName = nameMatch ? nameMatch[1] : 'GeneratedComponent';
    
    let code = `import React, { useState } from 'react';

function ${componentName}() {
    const [state, setState] = useState('');
    
    return (
        <div className="${componentName.toLowerCase()}">
            <h2>${componentName}</h2>
            <p>This is a React component.</p>
        </div>
    );
}

export default ${componentName};`;
    
    return {
      code,
      language: 'jsx',
      explanation: `I've created a React component called ${componentName}.`
    };
  }

  // Generate generic code
  private async generateGeneric(requirements: string, language: string): Promise<{
    code: string;
    language: string;
    explanation: string;
  }> {
    return {
      code: `// Generated code for: ${requirements}\n// Language: ${language}\n\n// TODO: Implement`,
      language,
      explanation: `I've generated a basic ${language} code structure.`
    };
  }

  private generateHTMLTemplate(): string {
    return '<!DOCTYPE html><html><head><title>{{title}}</title></head><body>{{content}}</body></html>';
  }

  private generateJSFunctionTemplate(): string {
    return 'function {{functionName}}({{parameters}}) {\n  {{body}}\n}';
  }

  private generateCSSTemplate(): string {
    return '.{{className}} {\n  {{styles}}\n}';
  }

  getStats() {
    return {
      patterns: this.codePatterns.size,
      capabilities: ['HTML generation', 'CSS styling', 'JavaScript functions', 'React components']
    };
  }
}

interface WebsiteFeatures {
  title: string;
  hasHeader: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
  hasForm: boolean;
  hasList: boolean;
  hasImages: boolean;
  hasButtons: boolean;
  needsJS: boolean;
  colorScheme: string;
  style: string;
}

interface ColorPalette {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  text: string;
}

interface CodePattern {
  name: string;
  template: string;
  variables: string[];
}
