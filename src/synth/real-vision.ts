// Real Vision - TensorFlow.js with MobileNet and COCO-SSD
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class RealVision {
  private mobilenetModel: any = null;
  private cocoModel: any = null;
  private modelsLoaded = false;

  constructor() {
    console.log('[RealVision] Initialized with TensorFlow.js');
  }

  // Load models
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      console.log('[RealVision] Loading MobileNet...');
      this.mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
      
      console.log('[RealVision] Loading COCO-SSD...');
      this.cocoModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      
      this.modelsLoaded = true;
      console.log('[RealVision] Models loaded successfully');
    } catch (error) {
      console.error('[RealVision] Model loading failed:', error);
      throw error;
    }
  }

  // Classify image with MobileNet
  async classifyImage(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<any[]> {
    if (!this.modelsLoaded) await this.loadModels();

    try {
      const predictions = await this.mobilenetModel.classify(imageElement, 5);
      
      return predictions.map((pred: any) => ({
        className: pred.className,
        probability: pred.probability,
        confidence: (pred.probability * 100).toFixed(2) + '%'
      }));
    } catch (error) {
      console.error('[RealVision] Classification failed:', error);
      return [];
    }
  }

  // Detect objects with COCO-SSD
  async detectObjects(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<any[]> {
    if (!this.modelsLoaded) await this.loadModels();

    try {
      const predictions = await this.cocoModel.detect(imageElement);
      
      return predictions.map((pred: any) => ({
        class: pred.class,
        score: pred.score,
        confidence: (pred.score * 100).toFixed(2) + '%',
        bbox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3]
        }
      }));
    } catch (error) {
      console.error('[RealVision] Object detection failed:', error);
      return [];
    }
  }

  // Analyze image (combined classification + detection)
  async analyzeImage(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<any> {
    const [classifications, objects] = await Promise.all([
      this.classifyImage(imageElement),
      this.detectObjects(imageElement)
    ]);

    return {
      classifications,
      objects,
      summary: this.generateSummary(classifications, objects)
    };
  }

  // Generate human-readable summary
  private generateSummary(classifications: any[], objects: any[]): string {
    const parts: string[] = [];

    // Add main classification
    if (classifications.length > 0) {
      const main = classifications[0];
      parts.push(`This appears to be ${main.className} (${main.confidence} confidence)`);
    }

    // Add detected objects
    if (objects.length > 0) {
      const objectNames = objects.map((obj: any) => obj.class);
      const uniqueObjects = [...new Set(objectNames)];
      
      if (uniqueObjects.length > 0) {
        parts.push(`Detected: ${uniqueObjects.join(', ')}`);
      }
    }

    return parts.join('. ') || 'Unable to analyze image';
  }

  // Extract text from image (OCR simulation - would need Tesseract.js for real OCR)
  async extractText(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<string> {
    // This is a placeholder - real OCR would require Tesseract.js
    console.warn('[RealVision] OCR not implemented - requires Tesseract.js');
    return '[OCR not available - requires Tesseract.js integration]';
  }

  // Compare two images
  async compareImages(
    image1: HTMLImageElement | HTMLCanvasElement,
    image2: HTMLImageElement | HTMLCanvasElement
  ): Promise<any> {
    if (!this.modelsLoaded) await this.loadModels();

    try {
      // Get classifications for both images
      const [classifications1, classifications2] = await Promise.all([
        this.classifyImage(image1),
        this.classifyImage(image2)
      ]);

      // Calculate similarity based on top classifications
      const top1 = classifications1[0]?.className || '';
      const top2 = classifications2[0]?.className || '';
      
      const similarity = top1 === top2 ? 1.0 : 0.0;

      return {
        image1: {
          topClassification: top1,
          confidence: classifications1[0]?.probability || 0
        },
        image2: {
          topClassification: top2,
          confidence: classifications2[0]?.probability || 0
        },
        similarity,
        sameCategory: top1 === top2
      };
    } catch (error) {
      console.error('[RealVision] Image comparison failed:', error);
      return { similarity: 0, sameCategory: false };
    }
  }

  // Get image embeddings for similarity search
  async getImageEmbedding(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<number[]> {
    if (!this.modelsLoaded) await this.loadModels();

    try {
      // MobileNet can return embeddings (infer method)
      const logits = this.mobilenetModel.infer(imageElement, true);
      const embedding = await logits.data();
      
      return Array.from(embedding);
    } catch (error) {
      console.error('[RealVision] Embedding extraction failed:', error);
      return [];
    }
  }

  // Calculate cosine similarity between embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  // Process video frame
  async processVideoFrame(videoElement: HTMLVideoElement): Promise<any> {
    return await this.analyzeImage(videoElement);
  }

  // Real-time object detection on video stream
  async startVideoDetection(
    videoElement: HTMLVideoElement,
    callback: (objects: any[]) => void,
    interval: number = 1000
  ): Promise<NodeJS.Timeout> {
    if (!this.modelsLoaded) await this.loadModels();

    const intervalId = setInterval(async () => {
      try {
        const objects = await this.detectObjects(videoElement);
        callback(objects);
      } catch (error) {
        console.error('[RealVision] Video detection error:', error);
      }
    }, interval);

    return intervalId;
  }

  // Stop video detection
  stopVideoDetection(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }

  getStats() {
    return {
      modelsLoaded: this.modelsLoaded,
      mobilenetLoaded: !!this.mobilenetModel,
      cocoLoaded: !!this.cocoModel,
      capabilities: [
        'classifyImage',
        'detectObjects',
        'analyzeImage',
        'compareImages',
        'getImageEmbedding',
        'processVideoFrame',
        'startVideoDetection'
      ],
      models: ['MobileNet v2', 'COCO-SSD']
    };
  }
}
