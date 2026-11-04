// Synthetic Learning Engine - Feedback-driven weight adjustment
// Allows Synth to learn from experience and improve over time

import { SyntheticNeuron } from './synthetic-neuron';
import { SyntheticLayer } from './synthetic-layer';

export interface TrainingExample {
  input: Map<string, number>;
  expected: Map<string, number>;
  output?: Map<string, number>;
  timestamp: number;
}

export interface LearningMetrics {
  totalExamples: number;
  averageError: number;
  learningRate: number;
  epochCount: number;
  convergenceHistory: number[];
}

export class SyntheticLearningEngine {
  private layers: SyntheticLayer[];
  private trainingData: TrainingExample[];
  private learningRate: number;
  private metrics: LearningMetrics;
  private batchSize: number;

  constructor(layers: SyntheticLayer[], learningRate: number = 0.01, batchSize: number = 32) {
    this.layers = layers;
    this.trainingData = [];
    this.learningRate = learningRate;
    this.batchSize = batchSize;
    this.metrics = {
      totalExamples: 0,
      averageError: 0,
      learningRate: learningRate,
      epochCount: 0,
      convergenceHistory: []
    };
  }

  // Add training example
  addTrainingExample(input: Map<string, number>, expected: Map<string, number>): void {
    this.trainingData.push({
      input,
      expected,
      timestamp: Date.now()
    });
  }

  // Forward pass through all layers
  forwardPass(input: Map<string, number>): Map<string, number> {
    let currentInput = { features: input };
    
    // Pass through each layer
    for (const layer of this.layers) {
      const output = layer.process(currentInput);
      
      // Convert layer output to next layer input
      currentInput = {
        features: output.activations
      };
    }
    
    return currentInput.features;
  }

  // Calculate error between expected and actual output
  calculateError(expected: Map<string, number>, actual: Map<string, number>): number {
    let totalError = 0;
    let count = 0;

    // Mean Squared Error
    for (const [key, expectedValue] of expected) {
      const actualValue = actual.get(key) || 0;
      totalError += Math.pow(expectedValue - actualValue, 2);
      count++;
    }

    return count > 0 ? totalError / count : 0;
  }

  // Backward pass - propagate error through layers
  backwardPass(expected: Map<string, number>, actual: Map<string, number>, input: Map<string, number>): void {
    // Calculate output layer error
    const outputError = new Map<string, number>();
    for (const [key, expectedValue] of expected) {
      const actualValue = actual.get(key) || 0;
      outputError.set(key, expectedValue - actualValue);
    }

    // Propagate error backwards through layers
    let currentError = outputError;
    
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      
      // Learn from current error
      layer.learn(currentError, { features: input });
      
      // For simplicity, we'll use the same error for all layers
      // In a real implementation, we'd compute gradients for each layer
      // This is a simplified version of backpropagation
    }
  }

  // Train on a single example
  trainOnExample(example: TrainingExample): number {
    // Forward pass
    const actual = this.forwardPass(example.input);
    
    // Calculate error
    const error = this.calculateError(example.expected, actual);
    
    // Backward pass
    this.backwardPass(example.expected, actual, example.input);
    
    // Store output for reference
    example.output = actual;
    
    return error;
  }

  // Train on batch of examples
  trainOnBatch(batch: TrainingExample[]): number {
    let totalError = 0;
    
    for (const example of batch) {
      const error = this.trainOnExample(example);
      totalError += error;
    }
    
    return totalError / batch.length;
  }

  // Train for one epoch
  trainEpoch(): number {
    let totalError = 0;
    let batchCount = 0;
    
    // Shuffle training data
    const shuffled = [...this.trainingData].sort(() => Math.random() - 0.5);
    
    // Process in batches
    for (let i = 0; i < shuffled.length; i += this.batchSize) {
      const batch = shuffled.slice(i, i + this.batchSize);
      const batchError = this.trainOnBatch(batch);
      totalError += batchError;
      batchCount++;
    }
    
    const avgError = batchCount > 0 ? totalError / batchCount : 0;
    
    // Update metrics
    this.metrics.epochCount++;
    this.metrics.averageError = avgError;
    this.metrics.convergenceHistory.push(avgError);
    
    // Keep convergence history manageable
    if (this.metrics.convergenceHistory.length > 100) {
      this.metrics.convergenceHistory.shift();
    }
    
    return avgError;
  }

  // Train for multiple epochs
  train(epochs: number, targetError: number = 0.01): { finalError: number; epochsCompleted: number } {
    let finalError = Infinity;
    let epochsCompleted = 0;
    
    for (let i = 0; i < epochs; i++) {
      finalError = this.trainEpoch();
      epochsCompleted++;
      
      // Early stopping if we reach target error
      if (finalError < targetError) {
        break;
      }
      
      // Adjust learning rate if not converging
      if (this.metrics.convergenceHistory.length > 10) {
        const recentErrors = this.metrics.convergenceHistory.slice(-10);
        const avgRecent = recentErrors.reduce((sum, e) => sum + e, 0) / recentErrors.length;
        
        // If error is increasing, reduce learning rate
        if (avgRecent > this.metrics.averageError * 1.1) {
          this.learningRate *= 0.9;
          this.metrics.learningRate = this.learningRate;
        }
      }
    }
    
    return { finalError, epochsCompleted };
  }

  // Learn from single feedback (online learning)
  learnFromFeedback(input: Map<string, number>, expected: Map<string, number>): number {
    // Add to training data
    this.addTrainingExample(input, expected);
    
    // Train on this single example
    const error = this.trainOnExample({
      input,
      expected,
      timestamp: Date.now()
    });
    
    // Update metrics
    this.metrics.totalExamples++;
    
    return error;
  }

  // Get learning metrics
  getMetrics(): LearningMetrics {
    return { ...this.metrics };
  }

  // Get training data statistics
  getTrainingStats(): any {
    return {
      totalExamples: this.trainingData.length,
      batchSize: this.batchSize,
      learningRate: this.learningRate,
      epochsCompleted: this.metrics.epochCount,
      averageError: this.metrics.averageError,
      convergenceTrend: this.getConvergenceTrend()
    };
  }

  // Get convergence trend (improving, stable, or worsening)
  getConvergenceTrend(): 'improving' | 'stable' | 'worsening' {
    if (this.metrics.convergenceHistory.length < 5) {
      return 'stable';
    }
    
    const recent = this.metrics.convergenceHistory.slice(-5);
    const older = this.metrics.convergenceHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e, 0) / older.length : recentAvg;
    
    if (recentAvg < olderAvg * 0.95) {
      return 'improving';
    } else if (recentAvg > olderAvg * 1.05) {
      return 'worsening';
    } else {
      return 'stable';
    }
  }

  // Clear training data
  clearTrainingData(): void {
    this.trainingData = [];
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      totalExamples: 0,
      averageError: 0,
      learningRate: this.learningRate,
      epochCount: 0,
      convergenceHistory: []
    };
  }

  // Adjust learning rate
  setLearningRate(rate: number): void {
    this.learningRate = rate;
    this.metrics.learningRate = rate;
  }

  // Adjust batch size
  setBatchSize(size: number): void {
    this.batchSize = size;
  }
}
