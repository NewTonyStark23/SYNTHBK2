// Synthetic Neuron - The basic building block of Synth's AI
// Unlike traditional neurons, these are pattern-based and learn from atomic notes

export interface NeuronFeature {
  name: string;
  value: number;
  weight: number;
}

export interface ActivationPattern {
  features: NeuronFeature[];
  activation: number;
  timestamp: number;
}

export class SyntheticNeuron {
  id: string;
  pattern: string; // What this neuron recognizes
  features: Map<string, number>; // Feature weights
  threshold: number;
  activation: number;
  learningRate: number;
  history: ActivationPattern[];
  
  constructor(id: string, pattern: string, threshold: number = 0.5) {
    this.id = id;
    this.pattern = pattern;
    this.features = new Map();
    this.threshold = threshold;
    this.activation = 0;
    this.learningRate = 0.01;
    this.history = [];
  }

  // Activate neuron based on input features
  activate(inputFeatures: Map<string, number>): number {
    let weightedSum = 0;
    const activationPattern: NeuronFeature[] = [];

    // Calculate weighted sum of matching features
    for (const [featureName, featureValue] of inputFeatures) {
      const weight = this.features.get(featureName) || 0;
      weightedSum += featureValue * weight;
      
      activationPattern.push({
        name: featureName,
        value: featureValue,
        weight: weight
      });
    }

    // Apply activation function (sigmoid-like)
    this.activation = 1 / (1 + Math.exp(-weightedSum));

    // Store activation pattern
    this.history.push({
      features: activationPattern,
      activation: this.activation,
      timestamp: Date.now()
    });

    // Keep history manageable
    if (this.history.length > 100) {
      this.history.shift();
    }

    return this.activation;
  }

  // Check if neuron fires
  fires(): boolean {
    return this.activation >= this.threshold;
  }

  // Learn from feedback (synthetic backpropagation)
  learn(expectedActivation: number, actualInput: Map<string, number>): void {
    const error = expectedActivation - this.activation;
    
    // Adjust feature weights based on error
    for (const [featureName, featureValue] of actualInput) {
      const currentWeight = this.features.get(featureName) || 0;
      
      // Update weight: w = w + learning_rate * error * input
      const newWeight = currentWeight + (this.learningRate * error * featureValue);
      
      // Clamp weight to prevent explosion
      this.features.set(featureName, Math.max(-10, Math.min(10, newWeight)));
    }

    // Adjust threshold slightly based on error
    this.threshold += this.learningRate * error * 0.1;
    this.threshold = Math.max(0.1, Math.min(0.9, this.threshold));
  }

  // Add new feature to neuron
  addFeature(name: string, weight: number = 0): void {
    this.features.set(name, weight);
  }

  // Get neuron stats
  getStats(): any {
    const totalWeight = Array.from(this.features.values()).reduce((sum, w) => sum + Math.abs(w), 0);
    const avgActivation = this.history.length > 0 
      ? this.history.reduce((sum, h) => sum + h.activation, 0) / this.history.length
      : 0;

    return {
      id: this.id,
      pattern: this.pattern,
      featureCount: this.features.size,
      totalWeight: totalWeight,
      threshold: this.threshold,
      currentActivation: this.activation,
      avgActivation: avgActivation,
      historyLength: this.history.length,
      learningRate: this.learningRate
    };
  }

  // Serialize neuron state
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      pattern: this.pattern,
      features: Array.from(this.features.entries()),
      threshold: this.threshold,
      learningRate: this.learningRate
    });
  }

  // Deserialize neuron state
  static deserialize(data: string): SyntheticNeuron {
    const parsed = JSON.parse(data);
    const neuron = new SyntheticNeuron(parsed.id, parsed.pattern, parsed.threshold);
    neuron.features = new Map(parsed.features);
    neuron.learningRate = parsed.learningRate;
    return neuron;
  }
}

// Neuron Factory - Create neurons for different patterns
export class NeuronFactory {
  static createTextNeuron(id: string): SyntheticNeuron {
    const neuron = new SyntheticNeuron(id, 'text_pattern');
    // Add text-related features
    neuron.addFeature('length', 0.1);
    neuron.addFeature('word_count', 0.1);
    neuron.addFeature('has_numbers', 0.2);
    neuron.addFeature('has_questions', 0.2);
    neuron.addFeature('sentiment_positive', 0.15);
    neuron.addFeature('sentiment_negative', 0.15);
    return neuron;
  }

  static createIntentNeuron(id: string): SyntheticNeuron {
    const neuron = new SyntheticNeuron(id, 'intent_pattern');
    // Add intent-related features
    neuron.addFeature('is_question', 0.3);
    neuron.addFeature('is_command', 0.3);
    neuron.addFeature('is_statement', 0.2);
    neuron.addFeature('urgency', 0.1);
    neuron.addFeature('complexity', 0.1);
    return neuron;
  }

  static createEmotionNeuron(id: string): SyntheticNeuron {
    const neuron = new SyntheticNeuron(id, 'emotion_pattern');
    // Add emotion-related features
    neuron.addFeature('joy', 0.2);
    neuron.addFeature('sadness', 0.2);
    neuron.addFeature('anger', 0.2);
    neuron.addFeature('fear', 0.2);
    neuron.addFeature('surprise', 0.2);
    return neuron;
  }

  static createContextNeuron(id: string): SyntheticNeuron {
    const neuron = new SyntheticNeuron(id, 'context_pattern');
    // Add context-related features
    neuron.addFeature('conversation_length', 0.15);
    neuron.addFeature('topic_consistency', 0.25);
    neuron.addFeature('entity_mentions', 0.2);
    neuron.addFeature('temporal_proximity', 0.2);
    neuron.addFeature('semantic_similarity', 0.2);
    return neuron;
  }
}
