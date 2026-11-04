// Synthetic Attention - Focus mechanism for relevant context
// Allows Synth to prioritize important information like transformer attention

import { SemanticEmbedding, EmbeddingVector } from './synthetic-embedding';

export interface AttentionHead {
  id: string;
  queryEmbedding: EmbeddingVector;
  keyEmbeddings: EmbeddingVector[];
  valueEmbeddings: any[];
  attentionScores: number[];
}

export interface AttentionOutput {
  focusedContext: any[];
  attentionWeights: number[];
  headOutputs: any[];
}

export class SyntheticAttention {
  private embedding: SemanticEmbedding;
  private heads: Map<string, AttentionHead>;
  private contextWindow: any[];
  private maxContextSize: number;

  constructor(embedding: SemanticEmbedding, maxContextSize: number = 100) {
    this.embedding = embedding;
    this.heads = new Map();
    this.contextWindow = [];
    this.maxContextSize = maxContextSize;
  }

  // Add context item to attention window
  addContext(item: any, text?: string): void {
    this.contextWindow.push({
      data: item,
      text: text || JSON.stringify(item),
      timestamp: Date.now()
    });

    // Keep context window manageable
    if (this.contextWindow.length > this.maxContextSize) {
      this.contextWindow.shift();
    }
  }

  // Create attention head for specific query
  createHead(query: string, headId?: string): AttentionHead {
    const id = headId || `head_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queryEmbedding = this.embedding.embed(query);
    
    const keyEmbeddings: EmbeddingVector[] = [];
    const valueEmbeddings: any[] = [];
    const attentionScores: number[] = [];

    // Compute attention for all context items
    for (const contextItem of this.contextWindow) {
      const keyEmbedding = this.embedding.embed(contextItem.text);
      keyEmbeddings.push(keyEmbedding);
      valueEmbeddings.push(contextItem.data);
      
      // Calculate attention score (similarity between query and context)
      const score = this.embedding.similarity(queryEmbedding, keyEmbedding);
      attentionScores.push(score);
    }

    const head: AttentionHead = {
      id,
      queryEmbedding,
      keyEmbeddings,
      valueEmbeddings,
      attentionScores
    };

    this.heads.set(id, head);
    return head;
  }

  // Apply attention and get focused context
  attend(query: string, topK: number = 5): AttentionOutput {
    const head = this.createHead(query);
    
    // Sort context by attention score
    const indexed = head.attentionScores.map((score, index) => ({ score, index }));
    indexed.sort((a, b) => b.score - a.score);
    
    // Get top K most relevant items
    const topIndices = indexed.slice(0, topK).map(i => i.index);
    const focusedContext = topIndices.map(i => head.valueEmbeddings[i]);
    const attentionWeights = topIndices.map(i => head.attentionScores[i]);
    
    // Normalize attention weights
    const totalWeight = attentionWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = attentionWeights.map(w => w / totalWeight);

    return {
      focusedContext,
      attentionWeights: normalizedWeights,
      headOutputs: focusedContext
    };
  }

  // Multi-head attention (combine multiple attention heads)
  multiHeadAttend(query: string, numHeads: number = 4, topK: number = 3): AttentionOutput {
    const allOutputs: any[] = [];
    const allWeights: number[] = [];
    
    // Create multiple attention heads with slight variations
    for (let i = 0; i < numHeads; i++) {
      // Slightly modify query for each head
      const modifiedQuery = i === 0 ? query : `${query} [head_${i}]`;
      const headOutput = this.attend(modifiedQuery, topK);
      
      allOutputs.push(...headOutput.focusedContext);
      allWeights.push(...headOutput.attentionWeights);
    }
    
    // Remove duplicates and re-normalize
    const uniqueOutputs: any[] = [];
    const uniqueWeights: number[] = [];
    const seen = new Set<string>();
    
    for (let i = 0; i < allOutputs.length; i++) {
      const key = JSON.stringify(allOutputs[i]);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueOutputs.push(allOutputs[i]);
        uniqueWeights.push(allWeights[i]);
      }
    }
    
    // Re-normalize weights
    const totalWeight = uniqueWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = uniqueWeights.map(w => w / totalWeight);
    
    return {
      focusedContext: uniqueOutputs,
      attentionWeights: normalizedWeights,
      headOutputs: uniqueOutputs
    };
  }

  // Get attention statistics
  getStats(): any {
    const contextTexts = this.contextWindow.map(c => c.text);
    const avgContextLength = contextTexts.reduce((sum, t) => sum + t.length, 0) / Math.max(1, contextTexts.length);
    
    return {
      headCount: this.heads.size,
      contextWindowSize: this.contextWindow.length,
      maxContextSize: this.maxContextSize,
      avgContextLength: avgContextLength,
      embeddingStats: this.embedding.getStats()
    };
  }

  // Clear context window
  clearContext(): void {
    this.contextWindow = [];
  }

  // Clear all attention heads
  clearHeads(): void {
    this.heads.clear();
  }

  // Get context window
  getContextWindow(): any[] {
    return this.contextWindow;
  }

  // Get attention head by ID
  getHead(headId: string): AttentionHead | undefined {
    return this.heads.get(headId);
  }
}

// Attention Factory - Create specialized attention mechanisms
export class AttentionFactory {
  static createSmallAttention(embedding: SemanticEmbedding): SyntheticAttention {
    return new SyntheticAttention(embedding, 50);
  }

  static createMediumAttention(embedding: SemanticEmbedding): SyntheticAttention {
    return new SyntheticAttention(embedding, 100);
  }

  static createLargeAttention(embedding: SemanticEmbedding): SyntheticAttention {
    return new SyntheticAttention(embedding, 200);
  }

  static createExtraLargeAttention(embedding: SemanticEmbedding): SyntheticAttention {
    return new SyntheticAttention(embedding, 500);
  }
}
