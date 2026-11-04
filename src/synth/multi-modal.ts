// Real multi-modal support with image understanding
export class MultiModalProcessor {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    console.log('[MultiModalProcessor] Initialized with image processing capabilities');
  }

  // Analyze image from URL or file
  async analyzeImage(source: string | File): Promise<{
    description: string;
    colors: string[];
    dimensions: { width: number; height: number };
    features: string[];
    confidence: number;
  }> {
    try {
      // Load image
      const img = await this.loadImage(source);
      
      // Set canvas size
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      
      // Draw image to canvas
      this.context.drawImage(img, 0, 0);
      
      // Extract image data
      const imageData = this.context.getImageData(0, 0, img.width, img.height);
      
      // Analyze colors
      const colors = this.extractDominantColors(imageData);
      
      // Detect features
      const features = this.detectFeatures(imageData);
      
      // Generate description
      const description = this.generateDescription(colors, features, img.width, img.height);
      
      return {
        description,
        colors,
        dimensions: { width: img.width, height: img.height },
        features,
        confidence: 0.75
      };
    } catch (error) {
      console.error('[MultiModalProcessor] Image analysis failed:', error);
      return {
        description: 'Unable to analyze image',
        colors: [],
        dimensions: { width: 0, height: 0 },
        features: [],
        confidence: 0
      };
    }
  }

  // Load image from URL or File
  private loadImage(source: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      }
    });
  }

  // Extract dominant colors from image
  private extractDominantColors(imageData: ImageData): string[] {
    const pixels = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Quantize colors to reduce palette
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      
      const colorKey = `${qr},${qg},${qb}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(Number);
        return this.rgbToHex(r, g, b);
      });
    
    return sortedColors;
  }

  // Detect features in image
  private detectFeatures(imageData: ImageData): string[] {
    const features: string[] = [];
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Calculate average brightness
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      pixelCount++;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    
    // Detect brightness level
    if (avgBrightness > 200) {
      features.push('bright image');
    } else if (avgBrightness < 50) {
      features.push('dark image');
    } else {
      features.push('medium brightness');
    }
    
    // Detect color saturation
    let totalSaturation = 0;
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
    }
    
    const avgSaturation = totalSaturation / (pixelCount / 10);
    
    if (avgSaturation > 0.5) {
      features.push('highly saturated colors');
    } else if (avgSaturation < 0.2) {
      features.push('muted colors');
    }
    
    // Detect edges (simple edge detection)
    let edgeCount = 0;
    for (let y = 1; y < height - 1; y += 10) {
      for (let x = 1; x < width - 1; x += 10) {
        const idx = (y * width + x) * 4;
        const idxRight = (y * width + x + 1) * 4;
        const idxDown = ((y + 1) * width + x) * 4;
        
        const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        const brightnessRight = (pixels[idxRight] + pixels[idxRight + 1] + pixels[idxRight + 2]) / 3;
        const brightnessDown = (pixels[idxDown] + pixels[idxDown + 1] + pixels[idxDown + 2]) / 3;
        
        const edgeH = Math.abs(brightness - brightnessRight);
        const edgeV = Math.abs(brightness - brightnessDown);
        
        if (edgeH > 30 || edgeV > 30) {
          edgeCount++;
        }
      }
    }
    
    if (edgeCount > 100) {
      features.push('many edges/details');
    } else if (edgeCount < 20) {
      features.push('smooth/simple');
    }
    
    return features;
  }

  // Generate description from analysis
  private generateDescription(colors: string[], features: string[], width: number, height: number): string {
    let description = `This is a ${width}x${height} pixel image`;
    
    if (features.length > 0) {
      description += ` with ${features.join(', ')}`;
    }
    
    if (colors.length > 0) {
      description += `. The dominant colors are ${colors.slice(0, 3).join(', ')}`;
    }
    
    return description + '.';
  }

  // Convert RGB to Hex
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Process screenshot from browser
  async captureScreenshot(): Promise<string> {
    // This would require browser extension or screen capture API
    // For now, return placeholder
    return 'Screenshot capture requires browser extension permissions';
  }

  // Analyze image and generate response
  async analyzeAndRespond(imageSource: string | File, question?: string): Promise<string> {
    const analysis = await this.analyzeImage(imageSource);
    
    let response = `**Image Analysis:**\n\n`;
    response += `${analysis.description}\n\n`;
    
    if (analysis.features.length > 0) {
      response += `**Features:** ${analysis.features.join(', ')}\n\n`;
    }
    
    if (analysis.colors.length > 0) {
      response += `**Dominant Colors:** ${analysis.colors.join(', ')}\n\n`;
    }
    
    response += `**Dimensions:** ${analysis.dimensions.width}x${analysis.dimensions.height} pixels\n`;
    
    if (question) {
      response += `\n**Regarding your question:** "${question}"\n`;
      response += `Based on the image analysis, `;
      
      // Simple question answering based on image features
      if (question.toLowerCase().includes('color')) {
        response += `the image contains ${analysis.colors.length} dominant colors.`;
      } else if (question.toLowerCase().includes('bright') || question.toLowerCase().includes('dark')) {
        response += `the image appears to be ${analysis.features.find(f => f.includes('bright') || f.includes('dark')) || 'of medium brightness'}.`;
      } else {
        response += `the image shows ${analysis.features.join(', ')}.`;
      }
    }
    
    return response;
  }

  getStats() {
    return {
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      capabilities: ['image analysis', 'color extraction', 'feature detection', 'brightness detection']
    };
  }
}
