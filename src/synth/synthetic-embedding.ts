// Synthetic Embedding - Vector representations of meaning
// Converts patterns, concepts, and text into semantic vectors

export interface EmbeddingVector {
  dimensions: number[];
  info: any;
}

export class SemanticEmbedding {
  private dimensionSize: number;
  private vocabulary: Map<string, number[]>; // word -> base vector
  private cache: Map<string, EmbeddingVector>; // text -> embedding

  constructor(dimensionSize: number = 128) {
    this.dimensionSize = dimensionSize;
    this.vocabulary = new Map();
    this.cache = new Map();
    this.initializeVocabulary();
  }

  // Initialize base vocabulary with semantic vectors
  private initializeVocabulary(): void {
    // Common words with semantic meanings
    const words = [
      'good', 'bad', 'happy', 'sad', 'fast', 'slow', 'big', 'small',
      'question', 'answer', 'help', 'create', 'build', 'make', 'do',
      'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'code', 'program', 'function', 'variable', 'class', 'object',
      'website', 'page', 'site', 'app', 'application', 'software',
      'data', 'information', 'knowledge', 'learn', 'understand',
      'user', 'person', 'human', 'client', 'customer',
      'error', 'bug', 'problem', 'issue', 'fix', 'solve',
      'time', 'date', 'day', 'week', 'month', 'year',
      'number', 'count', 'amount', 'quantity', 'measure'
    ];

    // Generate semantic vectors for each word
    for (const word of words) {
      const vector = this.generateSemanticVector(word);
      this.vocabulary.set(word, vector);
    }
  }

  // Generate semantic vector based on word characteristics
  private generateSemanticVector(word: string): number[] {
    const vector = new Array(this.dimensionSize).fill(0);
    
    // Use word characteristics to create semantic meaning
    const charSum = word.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const length = word.length;
    
    // Create deterministic but meaningful vectors
    for (let i = 0; i < this.dimensionSize; i++) {
      // Use different aspects of the word for different dimensions
      const seed = (charSum * (i + 1) + length) % 1000;
      vector[i] = Math.sin(seed) * 0.5 + 0.5; // Normalize to 0-1
    }

    // Add semantic clustering
    if (word.includes('good') || word.includes('happy')) {
      vector[0] = 0.9; // Positive sentiment dimension
    }
    if (word.includes('bad') || word.includes('sad')) {
      vector[1] = 0.9; // Negative sentiment dimension
    }
    if (word.includes('fast') || word.includes('quick')) {
      vector[2] = 0.9; // Speed dimension
    }
    if (word.includes('big') || word.includes('large')) {
      vector[3] = 0.9; // Size dimension
    }
    if (word.includes('question') || word.includes('how') || word.includes('what')) {
      vector[4] = 0.9; // Question dimension
    }
    if (word.includes('code') || word.includes('program')) {
      vector[5] = 0.9; // Technical dimension
    }

    return vector;
  }

  // Convert text to embedding
  embed(text: string): EmbeddingVector {
    // Check cache first
    const cached = this.cache.get(text);
    if (cached) {
      return cached;
    }

    // Tokenize text
    const words = text.toLowerCase().split(/\s+/);
    
    // Initialize result vector
    const result = new Array(this.dimensionSize).fill(0);
    let wordCount = 0;

    // Combine word embeddings
    for (const word of words) {
      const wordVector = this.vocabulary.get(word);
      if (wordVector) {
        for (let i = 0; i < this.dimensionSize; i++) {
          result[i] += wordVector[i];
        }
        wordCount++;
      } else {
        // Generate vector for unknown words
        const unknownVector = this.generateSemanticVector(word);
        for (let i = 0; i < this.dimensionSize; i++) {
          result[i] += unknownVector[i];
        }
        wordCount++;
      }
    }

    // Average the vectors
    if (wordCount > 0) {
      for (let i = 0; i < this.dimensionSize; i++) {
        result[i] /= wordCount;
      }
    }

    const embedding: EmbeddingVector = {
      dimensions: result,
      info: {
        text: text,
        wordCount: wordCount,
        timestamp: Date.now()
      }
    };

    // Cache the result
    this.cache.set(text, embedding);

    // Keep cache manageable
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    return embedding;
  }

  // Calculate cosine similarity between two embeddings
  similarity(embedding1: EmbeddingVector, embedding2: EmbeddingVector): number {
    const vec1 = embedding1.dimensions;
    const vec2 = embedding2.dimensions;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < this.dimensionSize; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  // Find most similar text from a list
  findMostSimilar(target: string, candidates: string[]): { text: string; similarity: number } {
    const targetEmbedding = this.embed(target);
    
    let bestMatch = { text: '', similarity: -1 };
    
    for (const candidate of candidates) {
      const candidateEmbedding = this.embed(candidate);
      const similarity = this.similarity(targetEmbedding, candidateEmbedding);
      
      if (similarity > bestMatch.similarity) {
        bestMatch = { text: candidate, similarity };
      }
    }
    
    return bestMatch;
  }

  // Combine multiple embeddings (for concept blending)
  combine(embeddings: EmbeddingVector[], weights?: number[]): EmbeddingVector {
    const result = new Array(this.dimensionSize).fill(0);
    const actualWeights = weights || embeddings.map(() => 1 / embeddings.length);
    
    for (let i = 0; i < embeddings.length; i++) {
      const embedding = embeddings[i];
      const weight = actualWeights[i];
      
      for (let j = 0; j < this.dimensionSize; j++) {
        result[j] += embedding.dimensions[j] * weight;
      }
    }
    
    return {
      dimensions: result,
      info: {
        combinedFrom: embeddings.length,
        timestamp: Date.now()
      }
    };
  }

  // Get embedding statistics
  getStats(): any {
    return {
      dimensionSize: this.dimensionSize,
      vocabularySize: this.vocabulary.size,
      cacheSize: this.cache.size,
      cacheHitRate: this.cache.size > 0 ? 'active' : 'empty'
    };
  }

  // Add custom word to vocabulary
  addWord(word: string, vector?: number[]): void {
    const wordVector = vector || this.generateSemanticVector(word);
    this.vocabulary.set(word.toLowerCase(), wordVector);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Embedding Factory - Create specialized embeddings
export class EmbeddingFactory {
  static createSmallEmbedding(): SemanticEmbedding {
    return new SemanticEmbedding(64);
  }

  static createMediumEmbedding(): SemanticEmbedding {
    return new SemanticEmbedding(128);
  }

  static createLargeEmbedding(): SemanticEmbedding {
    return new SemanticEmbedding(256);
  }

  static createExtraLargeEmbedding(): SemanticEmbedding {
    return new SemanticEmbedding(512);
  }
}
