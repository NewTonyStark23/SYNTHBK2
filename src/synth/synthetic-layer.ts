// Synthetic Layer - Processing layer that coordinates multiple neurons
// Layers process information in parallel and pass results to next layer

import { SyntheticNeuron, NeuronFactory } from './synthetic-neuron';

export interface LayerInput {
  features: Map<string, number>;
  context?: any;
}

export interface LayerOutput {
  activations: Map<string, number>;
  firedNeurons: string[];
  layerStats: any;
}

export class SyntheticLayer {
  id: string;
  name: string;
  neurons: Map<string, SyntheticNeuron>;
  connections: Map<string, Map<string, number>>; // neuron_id -> connected_neuron_id -> weight
  layerIndex: number;
  
  constructor(id: string, name: string, layerIndex: number) {
    this.id = id;
    this.name = name;
    this.neurons = new Map();
    this.connections = new Map();
    this.layerIndex = layerIndex;
  }

  // Add neuron to layer
  addNeuron(neuron: SyntheticNeuron): void {
    this.neurons.set(neuron.id, neuron);
    this.connections.set(neuron.id, new Map());
  }

  // Connect neurons within layer (for lateral connections)
  connectNeurons(fromId: string, toId: string, weight: number): void {
    const connections = this.connections.get(fromId);
    if (connections) {
      connections.set(toId, weight);
    }
  }

  // Process input through layer
  process(input: LayerInput): LayerOutput {
    const activations = new Map<string, number>();
    const firedNeurons: string[] = [];

    // Activate all neurons in parallel
    for (const [neuronId, neuron] of this.neurons) {
      const activation = neuron.activate(input.features);
      activations.set(neuronId, activation);

      if (neuron.fires()) {
        firedNeurons.push(neuronId);
      }
    }

    // Apply lateral connections (neurons influence each other)
    for (const fromId of firedNeurons) {
      const connections = this.connections.get(fromId);
      if (connections) {
        for (const [toId, weight] of connections) {
          const currentActivation = activations.get(toId) || 0;
          // Lateral connection modifies activation
          activations.set(toId, currentActivation + weight * 0.1);
        }
      }
    }

    return {
      activations,
      firedNeurons,
      layerStats: this.getStats()
    };
  }

  // Learn from feedback
  learn(expectedActivations: Map<string, number>, input: LayerInput): void {
    for (const [neuronId, expectedActivation] of expectedActivations) {
      const neuron = this.neurons.get(neuronId);
      if (neuron) {
        neuron.learn(expectedActivation, input.features);
      }
    }
  }

  // Get layer statistics
  getStats(): any {
    const neuronStats = Array.from(this.neurons.values()).map(n => n.getStats());
    const avgActivation = neuronStats.reduce((sum, s) => sum + s.currentActivation, 0) / neuronStats.length;
    const totalConnections = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.size, 0);

    return {
      id: this.id,
      name: this.name,
      layerIndex: this.layerIndex,
      neuronCount: this.neurons.size,
      connectionCount: totalConnections,
      avgActivation: avgActivation || 0,
      neurons: neuronStats
    };
  }

  // Serialize layer
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      layerIndex: this.layerIndex,
      neurons: Array.from(this.neurons.entries()).map(([id, neuron]) => [id, neuron.serialize()]),
      connections: Array.from(this.connections.entries()).map(([id, conn]) => [id, Array.from(conn.entries())])
    });
  }

  // Deserialize layer
  static deserialize(data: string): SyntheticLayer {
    const parsed = JSON.parse(data);
    const layer = new SyntheticLayer(parsed.id, parsed.name, parsed.layerIndex);
    
    for (const [id, neuronData] of parsed.neurons) {
      layer.neurons.set(id, SyntheticNeuron.deserialize(neuronData));
    }
    
    for (const [id, connections] of parsed.connections) {
      layer.connections.set(id, new Map(connections));
    }
    
    return layer;
  }
}

// Layer Factory - Create specialized layers
export class LayerFactory {
  static createInputLayer(): SyntheticLayer {
    const layer = new SyntheticLayer('input', 'Input Processing Layer', 0);
    
    // Create neurons for different input types
    layer.addNeuron(NeuronFactory.createTextNeuron('text_neuron_1'));
    layer.addNeuron(NeuronFactory.createTextNeuron('text_neuron_2'));
    layer.addNeuron(NeuronFactory.createTextNeuron('text_neuron_3'));
    
    return layer;
  }

  static createFeatureLayer(): SyntheticLayer {
    const layer = new SyntheticLayer('features', 'Feature Extraction Layer', 1);
    
    // Create neurons for different features
    layer.addNeuron(NeuronFactory.createIntentNeuron('intent_neuron_1'));
    layer.addNeuron(NeuronFactory.createIntentNeuron('intent_neuron_2'));
    layer.addNeuron(NeuronFactory.createEmotionNeuron('emotion_neuron_1'));
    layer.addNeuron(NeuronFactory.createEmotionNeuron('emotion_neuron_2'));
    layer.addNeuron(NeuronFactory.createContextNeuron('context_neuron_1'));
    
    return layer;
  }

  static createProcessingLayer(): SyntheticLayer {
    const layer = new SyntheticLayer('processing', 'Deep Processing Layer', 2);
    
    // Create neurons for complex pattern recognition
    for (let i = 0; i < 10; i++) {
      layer.addNeuron(new SyntheticNeuron(`processing_neuron_${i}`, 'complex_pattern'));
    }
    
    return layer;
  }

  static createOutputLayer(): SyntheticLayer {
    const layer = new SyntheticLayer('output', 'Output Generation Layer', 3);
    
    // Create neurons for different output types
    for (let i = 0; i < 5; i++) {
      layer.addNeuron(new SyntheticNeuron(`output_neuron_${i}`, 'response_pattern'));
    }
    
    return layer;
  }
}
