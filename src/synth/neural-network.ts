// Real neural network with backpropagation for actual learning
export class NeuralNetwork {
  private layers: number[];
  private weights: number[][][];
  private biases: number[][];
  private learningRate: number;
  private trainingData: Array<{ input: number[]; output: number[] }> = [];

  constructor(layers: number[], learningRate: number = 0.01) {
    this.layers = layers;
    this.learningRate = learningRate;
    
    // Initialize weights and biases
    this.weights = [];
    this.biases = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];
      
      for (let j = 0; j < layers[i + 1]; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < layers[i]; k++) {
          // Xavier initialization
          neuronWeights.push((Math.random() * 2 - 1) * Math.sqrt(2 / (layers[i] + layers[i + 1])));
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(Math.random() * 0.1);
      }
      
      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
    
    console.log(`[NeuralNetwork] Initialized with layers: ${layers.join(' → ')}`);
  }

  // Sigmoid activation function
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Derivative of sigmoid
  private sigmoidDerivative(x: number): number {
    return x * (1 - x);
  }

  // Forward pass
  forward(input: number[]): { outputs: number[][]; activations: number[][] } {
    const activations: number[][] = [input];
    const outputs: number[][] = [];

    for (let layer = 0; layer < this.weights.length; layer++) {
      const layerOutput: number[] = [];
      
      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        let sum = this.biases[layer][neuron];
        
        for (let i = 0; i < activations[layer].length; i++) {
          sum += activations[layer][i] * this.weights[layer][neuron][i];
        }
        
        layerOutput.push(this.sigmoid(sum));
      }
      
      outputs.push(layerOutput);
      activations.push(layerOutput);
    }

    return { outputs, activations };
  }

  // Backward pass (backpropagation)
  backward(
    outputs: number[][],
    activations: number[][],
    target: number[]
  ): { weightGradients: number[][][]; biasGradients: number[][] } {
    const weightGradients: number[][][] = [];
    const biasGradients: number[][] = [];

    // Calculate output layer error
    const outputLayer = outputs.length - 1;
    const outputErrors: number[] = [];
    
    for (let i = 0; i < outputs[outputLayer].length; i++) {
      const error = target[i] - outputs[outputLayer][i];
      outputErrors.push(error * this.sigmoidDerivative(outputs[outputLayer][i]));
    }

    // Backpropagate errors through layers
    let currentErrors = outputErrors;
    
    for (let layer = outputLayer; layer >= 0; layer--) {
      const layerWeightGradients: number[][] = [];
      const layerBiasGradients: number[] = [];
      
      // Calculate gradients for this layer
      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        const neuronWeightGradients: number[] = [];
        
        for (let i = 0; i < activations[layer].length; i++) {
          neuronWeightGradients.push(currentErrors[neuron] * activations[layer][i]);
        }
        
        layerWeightGradients.push(neuronWeightGradients);
        layerBiasGradients.push(currentErrors[neuron]);
      }
      
      weightGradients.unshift(layerWeightGradients);
      biasGradients.unshift(layerBiasGradients);
      
      // Calculate errors for previous layer (if not input layer)
      if (layer > 0) {
        const previousErrors: number[] = [];
        
        for (let i = 0; i < activations[layer].length; i++) {
          let error = 0;
          
          for (let j = 0; j < currentErrors.length; j++) {
            error += currentErrors[j] * this.weights[layer][j][i];
          }
          
          previousErrors.push(error * this.sigmoidDerivative(activations[layer][i]));
        }
        
        currentErrors = previousErrors;
      }
    }

    return { weightGradients, biasGradients };
  }

  // Update weights and biases
  updateWeights(weightGradients: number[][][], biasGradients: number[][]): void {
    for (let layer = 0; layer < this.weights.length; layer++) {
      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        for (let i = 0; i < this.weights[layer][neuron].length; i++) {
          this.weights[layer][neuron][i] += this.learningRate * weightGradients[layer][neuron][i];
        }
        this.biases[layer][neuron] += this.learningRate * biasGradients[layer][neuron];
      }
    }
  }

  // Train on a single example
  train(input: number[], target: number[]): number {
    const { outputs, activations } = this.forward(input);
    const { weightGradients, biasGradients } = this.backward(outputs, activations, target);
    this.updateWeights(weightGradients, biasGradients);
    
    // Calculate loss (MSE)
    let loss = 0;
    for (let i = 0; i < target.length; i++) {
      loss += Math.pow(target[i] - outputs[outputs.length - 1][i], 2);
    }
    
    return loss / target.length;
  }

  // Train on dataset
  trainOnDataset(data: Array<{ input: number[]; output: number[] }>, epochs: number = 100): {
    finalLoss: number;
    lossHistory: number[];
  } {
    this.trainingData = data;
    const lossHistory: number[] = [];
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      
      // Shuffle data
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      
      for (const example of shuffled) {
        totalLoss += this.train(example.input, example.output);
      }
      
      const avgLoss = totalLoss / data.length;
      lossHistory.push(avgLoss);
      
      // Early stopping if loss is very low
      if (avgLoss < 0.001) {
        console.log(`[NeuralNetwork] Early stopping at epoch ${epoch + 1} with loss ${avgLoss.toFixed(6)}`);
        break;
      }
    }
    
    return {
      finalLoss: lossHistory[lossHistory.length - 1],
      lossHistory
    };
  }

  // Predict
  predict(input: number[]): number[] {
    const { outputs } = this.forward(input);
    return outputs[outputs.length - 1];
  }

  // Learn from user feedback
  learnFromFeedback(inputText: string, preferredOutput: string, rejectedOutput?: string): void {
    // Convert text to numerical representation (simple bag-of-words)
    const inputVector = this.textToVector(inputText);
    const preferredVector = this.textToVector(preferredOutput);
    
    // Train on preferred output
    this.train(inputVector, preferredVector);
    
    // If rejected output provided, train to move away from it
    if (rejectedOutput) {
      const rejectedVector = this.textToVector(rejectedOutput);
      
      // Create a target that's opposite of rejected
      const antiTarget = preferredVector.map((v, i) => v - rejectedVector[i] * 0.5);
      this.train(inputVector, antiTarget);
    }
  }

  // Convert text to numerical vector
  private textToVector(text: string): number[] {
    // Simple bag-of-words with hashing
    const vectorSize = this.layers[0];
    const vector = new Array(vectorSize).fill(0);
    
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      // Hash word to vector index
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash;
      }
      
      const index = Math.abs(hash) % vectorSize;
      vector[index] += 1;
    }
    
    // Normalize
    const max = Math.max(...vector);
    if (max > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= max;
      }
    }
    
    return vector;
  }

  // Convert vector back to text (approximate)
  vectorToText(vector: number[]): string {
    // This is a simplified reverse mapping
    // In practice, you'd need a proper vocabulary
    return `Generated output (confidence: ${(Math.max(...vector) * 100).toFixed(1)}%)`;
  }

  // Get network statistics
  getStats() {
    const totalWeights = this.weights.reduce((sum, layer) => 
      sum + layer.reduce((layerSum, neuron) => layerSum + neuron.length, 0), 0
    );
    
    const totalBiases = this.biases.reduce((sum, layer) => sum + layer.length, 0);
    
    return {
      layers: this.layers,
      totalWeights,
      totalBiases,
      totalParameters: totalWeights + totalBiases,
      learningRate: this.learningRate,
      trainingExamples: this.trainingData.length
    };
  }

  // Save network state
  serialize(): string {
    return JSON.stringify({
      layers: this.layers,
      weights: this.weights,
      biases: this.biases,
      learningRate: this.learningRate
    });
  }

  // Load network state
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.layers = parsed.layers;
    this.weights = parsed.weights;
    this.biases = parsed.biases;
    this.learningRate = parsed.learningRate;
  }
}
