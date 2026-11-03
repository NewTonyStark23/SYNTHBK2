// Synthetic Brain - Main orchestrator for Synth's AI
// Ties together neurons, layers, embeddings, attention, and learning

import { SyntheticNeuron, NeuronFactory } from './synthetic-neuron';
import { SyntheticLayer, LayerFactory } from './synthetic-layer';
import { SemanticEmbedding, EmbeddingFactory } from './synthetic-embedding';
import { SyntheticAttention, AttentionFactory } from './synthetic-attention';
import { SyntheticLearningEngine } from './synthetic-learning';

export interface BrainInput {
  text: string;
  context?: any[];
  info: any;
}

export interface BrainOutput {
  response: string;
  confidence: number;
  reasoning: string[];
  attention: any;
  info: any;
}

export class SyntheticBrain {
  private layers: SyntheticLayer[];
  private embedding: SemanticEmbedding;
  private attention: SyntheticAttention;
  private learning: SyntheticLearningEngine;
  private initialized: boolean;

  constructor() {
    this.layers = [];
    this.embedding = EmbeddingFactory.createMediumEmbedding();
    this.attention = AttentionFactory.createMediumAttention(this.embedding);
    this.learning = new SyntheticLearningEngine([], 0.01, 32);
    this.initialized = false;
  }

  // Initialize the brain with layers
  initialize(): void {
    if (this.initialized) return;

    // Create processing layers
    this.layers = [
      LayerFactory.createInputLayer(),
      LayerFactory.createFeatureLayer(),
      LayerFactory.createProcessingLayer(),
      LayerFactory.createOutputLayer()
    ];

    // Connect layers (create inter-layer connections)
    this.connectLayers();

    // Update learning engine with layers
    this.learning = new SyntheticLearningEngine(this.layers, 0.01, 32);

    this.initialized = true;
    console.log('[SyntheticBrain] Initialized with', this.layers.length, 'layers');
  }

  // Connect neurons between layers
  private connectLayers(): void {
    for (let i = 0; i < this.layers.length - 1; i++) {
      const currentLayer = this.layers[i];
      const nextLayer = this.layers[i + 1];

      // Connect each neuron in current layer to neurons in next layer
      for (const [currentId] of currentLayer.neurons) {
        for (const [nextId] of nextLayer.neurons) {
          // Initialize with small random weights
          const weight = (Math.random() - 0.5) * 0.1;
          currentLayer.connectNeurons(currentId, nextId, weight);
        }
      }
    }
  }

  // Process input through the brain
  async process(input: BrainInput): Promise<BrainOutput> {
    if (!this.initialized) {
      this.initialize();
    }

    const reasoning: string[] = [];

    // Step 1: Embed input
    reasoning.push('Embedding input...');
    const inputEmbedding = this.embedding.embed(input.text);

    // Step 2: Add context to attention
    if (input.context) {
      reasoning.push('Adding context to attention...');
      for (const ctx of input.context) {
        this.attention.addContext(ctx, typeof ctx === 'string' ? ctx : JSON.stringify(ctx));
      }
    }

    // Step 3: Apply attention to focus on relevant context
    reasoning.push('Applying attention mechanism...');
    const attentionOutput = this.attention.attend(input.text, 5);

    // Step 4: Convert input to features
    reasoning.push('Converting to features...');
    const features = this.extractFeatures(input.text, inputEmbedding, attentionOutput);

    // Step 5: Forward pass through layers
    reasoning.push('Processing through layers...');
    const layerOutputs = this.forwardPass(features);

    // Step 6: Generate response
    reasoning.push('Generating response...');
    const response = this.generateResponse(layerOutputs, input);

    // Step 7: Calculate confidence
    reasoning.push('Calculating confidence...');
    const confidence = this.calculateConfidence(layerOutputs);

    return {
      response,
      confidence,
      reasoning,
      attention: attentionOutput,
      info: {
        inputEmbedding: inputEmbedding.info,
        layerOutputs: layerOutputs,
        timestamp: Date.now()
      }
    };
  }

  // Extract features from input
  private extractFeatures(
    text: string,
    embedding: any,
    attention: any
  ): Map<string, number> {
    const features = new Map<string, number>();

    // Text features
    const words = text.toLowerCase().split(/\s+/);
    features.set('length', text.length / 100);
    features.set('word_count', words.length / 20);
    features.set('has_numbers', /\d/.test(text) ? 1 : 0);
    features.set('has_questions', /\?/.test(text) ? 1 : 0);
    features.set('has_exclamation', /!/.test(text) ? 1 : 0);

    // Sentiment features (simple heuristic)
    const positiveWords = ['good', 'great', 'awesome', 'happy', 'love', 'excellent'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'poor'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }
    
    features.set('sentiment_positive', positiveCount / Math.max(1, words.length));
    features.set('sentiment_negative', negativeCount / Math.max(1, words.length));

    // Intent features
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const commandWords = ['create', 'build', 'make', 'do', 'fix', 'help'];
    
    let isQuestion = false;
    let isCommand = false;
    
    for (const word of words) {
      if (questionWords.includes(word)) isQuestion = true;
      if (commandWords.includes(word)) isCommand = true;
    }
    
    features.set('is_question', isQuestion ? 1 : 0);
    features.set('is_command', isCommand ? 1 : 0);
    features.set('is_statement', (!isQuestion && !isCommand) ? 1 : 0);

    // Embedding features (use first 10 dimensions)
    for (let i = 0; i < Math.min(10, embedding.dimensions.length); i++) {
      features.set(`embedding_${i}`, embedding.dimensions[i]);
    }

    // Attention features
    if (attention.focusedContext.length > 0) {
      features.set('attention_focus', attention.attentionWeights[0] || 0);
      features.set('context_relevance', attention.attentionWeights.reduce((sum: number, w: number) => sum + w, 0) / attention.attentionWeights.length);
    }

    return features;
  }

  // Forward pass through all layers
  private forwardPass(features: Map<string, number>): Map<string, number> {
    let currentFeatures = features;

    for (const layer of this.layers) {
      const output = layer.process({ features: currentFeatures });
      currentFeatures = output.activations;
    }

    return currentFeatures;
  }

  // Generate response from layer outputs
  private generateResponse(outputs: Map<string, number>, input: BrainInput): string {
    // Find most activated output neurons
    const sortedOutputs = Array.from(outputs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Generate response based on activated patterns
    const responsePatterns: string[] = [];

    for (const [neuronId, activation] of sortedOutputs) {
      if (activation > 0.5) {
        // Map neuron to response pattern
        if (neuronId.includes('output_neuron_0')) {
          responsePatterns.push('I understand your request.');
        } else if (neuronId.includes('output_neuron_1')) {
          responsePatterns.push('Let me help you with that.');
        } else if (neuronId.includes('output_neuron_2')) {
          responsePatterns.push('Here\'s what I can do:');
        } else if (neuronId.includes('output_neuron_3')) {
          responsePatterns.push('Based on my analysis:');
        } else if (neuronId.includes('output_neuron_4')) {
          responsePatterns.push('I\'ve processed your input.');
        }
      }
    }

    // Combine response patterns
    if (responsePatterns.length > 0) {
      return responsePatterns.join(' ') + ` You asked: "${input.text}"`;
    }

    // Default response
    return `I've analyzed your input: "${input.text}". How can I assist you further?`;
  }

  // Calculate confidence from outputs
  private calculateConfidence(outputs: Map<string, number>): number {
    const values = Array.from(outputs.values());
    if (values.length === 0) return 0;

    // Confidence is based on how strongly neurons are activated
    const maxActivation = Math.max(...values);
    const avgActivation = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Combine max and average activation
    return (maxActivation * 0.6 + avgActivation * 0.4);
  }

  // Learn from feedback
  learnFromFeedback(input: BrainInput, expectedOutput: string, success: boolean): void {
    if (!this.initialized) {
      this.initialize();
    }

    // Extract features from input
    const inputEmbedding = this.embedding.embed(input.text);
    const features = this.extractFeatures(input.text, inputEmbedding, { focusedContext: [], attentionWeights: [] });

    // Create expected output features
    const expectedFeatures = new Map<string, number>();
    
    // Map expected output to neuron activations
    if (expectedOutput.includes('understand')) {
      expectedFeatures.set('output_neuron_0', 1.0);
    }
    if (expectedOutput.includes('help')) {
      expectedFeatures.set('output_neuron_1', 1.0);
    }
    if (expectedOutput.includes('can do')) {
      expectedFeatures.set('output_neuron_2', 1.0);
    }
    if (expectedOutput.includes('analysis')) {
      expectedFeatures.set('output_neuron_3', 1.0);
    }
    if (expectedOutput.includes('processed')) {
      expectedFeatures.set('output_neuron_4', 1.0);
    }

    // Learn from this example
    this.learning.learnFromFeedback(features, expectedFeatures);
  }

  // Train on dataset
  train(trainingData: Array<{ input: string; expected: string }>, epochs: number = 10): void {
    if (!this.initialized) {
      this.initialize();
    }

    console.log(`[SyntheticBrain] Training on ${trainingData.length} examples for ${epochs} epochs...`);

    // Convert training data to features
    for (const data of trainingData) {
      const inputEmbedding = this.embedding.embed(data.input);
      const features = this.extractFeatures(data.input, inputEmbedding, { focusedContext: [], attentionWeights: [] });
      
      const expectedFeatures = new Map<string, number>();
      if (data.expected.includes('understand')) expectedFeatures.set('output_neuron_0', 1.0);
      if (data.expected.includes('help')) expectedFeatures.set('output_neuron_1', 1.0);
      if (data.expected.includes('can do')) expectedFeatures.set('output_neuron_2', 1.0);
      if (data.expected.includes('analysis')) expectedFeatures.set('output_neuron_3', 1.0);
      if (data.expected.includes('processed')) expectedFeatures.set('output_neuron_4', 1.0);

      this.learning.addTrainingExample(features, expectedFeatures);
    }

    // Train
    const result = this.learning.train(epochs, 0.01);
    console.log(`[SyntheticBrain] Training complete. Final error: ${result.finalError.toFixed(4)}, Epochs: ${result.epochsCompleted}`);
  }

  // Get brain statistics
  getStats(): any {
    return {
      initialized: this.initialized,
      layerCount: this.layers.length,
      totalNeurons: this.layers.reduce((sum, layer) => sum + layer.neurons.size, 0),
      embeddingStats: this.embedding.getStats(),
      attentionStats: this.attention.getStats(),
      learningStats: this.learning.getTrainingStats(),
      learningMetrics: this.learning.getMetrics()
    };
  }

  // Get embedding instance
  getEmbedding(): SemanticEmbedding {
    return this.embedding;
  }

  // Get attention instance
  getAttention(): SyntheticAttention {
    return this.attention;
  }

  // Get learning instance
  getLearning(): SyntheticLearningEngine {
    return this.learning;
  }

  // Get layers
  getLayers(): SyntheticLayer[] {
    return this.layers;
  }
}

// Singleton instance
export const syntheticBrain = new SyntheticBrain();
