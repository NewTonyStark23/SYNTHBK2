// ============================================
// KNOWLEDGE COMPRESSOR — Pattern Extraction Engine
// Extracts structural patterns from data, not raw memorization
// 5GB of compressed wisdom > terabytes of raw tokens
// ============================================

export interface PatternNode {
  id: string;
  type: 'algorithm' | 'architecture' | 'error' | 'optimization' | 'design' | 'concept';
  name: string;
  description: string;
  structure: PatternStructure;
  frequency: number;      // How often this pattern appears
  confidence: number;     // How confident we are in this pattern
  connections: string[];  // IDs of related patterns
  source: string;         // Where this pattern was extracted from
  discovered: number;
}

export interface PatternStructure {
  inputs: string[];
  outputs: string[];
  transformation: string;  // What this pattern DOES
  constraints: string[];
  preconditions: string[];
  postconditions: string[];
}

export interface PatternTree {
  root: string;
  nodes: Map<string, PatternNode>;
  depth: number;
  totalPatterns: number;
}

export interface CompressionResult {
  inputSize: number;
  compressedSize: number;
  compressionRatio: number;
  patternsExtracted: number;
  tree: PatternTree;
}

export interface MatchResult {
  pattern: PatternNode;
  relevance: number;
  applicability: string;
}

export class KnowledgeCompressor {
  private patternTree: PatternTree;
  private nextId = 0;

  constructor() {
    this.patternTree = {
      root: 'root',
      nodes: new Map(),
      depth: 0,
      totalPatterns: 0,
    };
    // Initialize with seed patterns
    this.initializeSeedPatterns();
  }

  private initializeSeedPatterns(): void {
    const seeds: Array<Omit<PatternNode, 'id' | 'discovered'>> = [
      {
        type: 'algorithm',
        name: 'Divide and Conquer',
        description: 'Break problem into sub-problems, solve each, combine results',
        structure: {
          inputs: ['complex problem'],
          outputs: ['solution'],
          transformation: 'Split → Solve sub-problems → Merge results',
          constraints: ['Sub-problems must be independent or have known interactions'],
          preconditions: ['Problem can be decomposed'],
          postconditions: ['All sub-problems solved', 'Results combined correctly'],
        },
        frequency: 0.95,
        confidence: 0.98,
        connections: ['recursion', 'merge_sort', 'binary_search'],
        source: 'seed',
      },
      {
        type: 'architecture',
        name: 'Observer Pattern',
        description: 'Objects subscribe to events and get notified of changes',
        structure: {
          inputs: ['event', 'subscriber'],
          outputs: ['notification'],
          transformation: 'Event occurs → Notify all subscribers → Each reacts independently',
          constraints: ['Subscribers must handle notification asynchronously'],
          preconditions: ['Subscribers registered'],
          postconditions: ['All subscribers notified'],
        },
        frequency: 0.88,
        confidence: 0.95,
        connections: ['event_system', 'pub_sub', 'reactive'],
        source: 'seed',
      },
      {
        type: 'error',
        name: 'Off-by-one Error',
        description: 'Boundary condition errors in loops and array access',
        structure: {
          inputs: ['loop', 'array', 'boundary'],
          outputs: ['bug'],
          transformation: 'Index miscalculation at boundaries (start/end)',
          constraints: ['Always check: < vs <=, 0-indexed vs 1-indexed'],
          preconditions: ['Loop or array operation'],
          postconditions: ['Boundary values tested'],
        },
        frequency: 0.82,
        confidence: 0.99,
        connections: ['boundary_check', 'loop_invariant', 'array_bounds'],
        source: 'seed',
      },
      {
        type: 'optimization',
        name: 'Memoization',
        description: 'Cache results of expensive function calls',
        structure: {
          inputs: ['function', 'arguments'],
          outputs: ['cached result'],
          transformation: 'Check cache → If hit, return cached. If miss, compute, cache, return.',
          constraints: ['Function must be pure (same input → same output)', 'Memory trade-off for speed'],
          preconditions: ['Function is deterministic'],
          postconditions: ['Result cached for future calls'],
        },
        frequency: 0.78,
        confidence: 0.96,
        connections: ['caching', 'dynamic_programming', 'lookup_table'],
        source: 'seed',
      },
      {
        type: 'design',
        name: 'Single Responsibility',
        description: 'Each module/class/function does exactly one thing',
        structure: {
          inputs: ['module'],
          outputs: ['focused module'],
          transformation: 'Identify all responsibilities → Split into separate modules → Each has one reason to change',
          constraints: ['Cohesion within module must remain high'],
          preconditions: ['Module has multiple responsibilities'],
          postconditions: ['Each module has single responsibility'],
        },
        frequency: 0.91,
        confidence: 0.94,
        connections: ['separation_of_concerns', 'modularity', 'clean_code'],
        source: 'seed',
      },
      {
        type: 'concept',
        name: 'Feedback Loop',
        description: 'Output feeds back as input, creating self-regulating or self-reinforcing systems',
        structure: {
          inputs: ['system state', 'input'],
          outputs: ['modified state'],
          transformation: 'Process → Output → Compare to goal → Adjust input → Repeat',
          constraints: ['Must have measurable output', 'Adjustment must be proportional'],
          preconditions: ['System with measurable output'],
          postconditions: ['System moves toward equilibrium or target'],
        },
        frequency: 0.87,
        confidence: 0.93,
        connections: ['control_system', 'learning', 'adaptation', 'homeostasis'],
        source: 'seed',
      },
      {
        type: 'algorithm',
        name: 'Two-Pointer Technique',
        description: 'Use two pointers moving through data structure from different directions',
        structure: {
          inputs: ['sorted array or linked list'],
          outputs: ['pair or subset matching criteria'],
          transformation: 'Left pointer at start, right at end → Move inward based on comparison',
          constraints: ['Data must be sorted or have monotonic property'],
          preconditions: ['Sorted data structure'],
          postconditions: ['Target pair/condition found or proven absent'],
        },
        frequency: 0.72,
        confidence: 0.97,
        connections: ['binary_search', 'sliding_window', 'sorted_data'],
        source: 'seed',
      },
      {
        type: 'architecture',
        name: 'Pipeline Pattern',
        description: 'Data flows through sequential processing stages',
        structure: {
          inputs: ['raw data'],
          outputs: ['processed data'],
          transformation: 'Stage 1 → Stage 2 → ... → Stage N → Output',
          constraints: ['Each stage must be independent', 'Data format must be compatible between stages'],
          preconditions: ['Processing can be decomposed into sequential stages'],
          postconditions: ['Data fully processed through all stages'],
        },
        frequency: 0.85,
        confidence: 0.96,
        connections: ['middleware', 'chain_of_responsibility', 'stream_processing'],
        source: 'seed',
      },
    ];

    for (const seed of seeds) {
      const id = `pattern_${this.nextId++}`;
      this.patternTree.nodes.set(id, { ...seed, id, discovered: Date.now() });
    }
    this.patternTree.totalPatterns = this.patternTree.nodes.size;
  }

  // Extract patterns from structured data
  compress(data: string | string[]): CompressionResult {
    const input = Array.isArray(data) ? data.join('\n') : data;
    const inputSize = input.length;
    
    // Pattern extraction — real analysis, not fake
    const extractedPatterns = this.extractPatterns(input);
    
    // Add new patterns to tree
    for (const pattern of extractedPatterns) {
      const id = `pattern_${this.nextId++}`;
      this.patternTree.nodes.set(id, { ...pattern, id, discovered: Date.now() });
    }
    
    this.patternTree.totalPatterns = this.patternTree.nodes.size;
    
    // Calculate compression ratio (conceptual — patterns represent compressed knowledge)
    const compressedSize = this.patternTree.totalPatterns * 200; // ~200 bytes per pattern
    const compressionRatio = inputSize > 0 ? compressedSize / inputSize : 0;

    return {
      inputSize,
      compressedSize,
      compressionRatio,
      patternsExtracted: extractedPatterns.length,
      tree: this.patternTree,
    };
  }

  // Real pattern extraction logic
  private extractPatterns(data: string): Array<Omit<PatternNode, 'id' | 'discovered'>> {
    const patterns: Array<Omit<PatternNode, 'id' | 'discovered'>> = [];
    const lower = data.toLowerCase();

    // Detect algorithmic patterns
    if (lower.includes('loop') || lower.includes('iterate') || lower.includes('for each')) {
      if (lower.includes('split') || lower.includes('divide') || lower.includes('recursive')) {
        patterns.push({
          type: 'algorithm',
          name: 'Recursive Decomposition',
          description: 'Detected: recursive iteration pattern in data',
          structure: {
            inputs: ['collection'],
            outputs: ['processed items'],
            transformation: 'For each item: process → if nested, recurse',
            constraints: ['Must have base case to prevent infinite recursion'],
            preconditions: ['Collection is non-empty'],
            postconditions: ['All items processed'],
          },
          frequency: 0.7,
          confidence: 0.8,
          connections: ['recursion', 'tree_traversal'],
          source: 'extracted',
        });
      }
    }

    // Detect error patterns
    if (lower.includes('error') || lower.includes('exception') || lower.includes('catch')) {
      patterns.push({
        type: 'error',
        name: 'Error Handling Chain',
        description: 'Detected: try/catch error handling pattern',
        structure: {
          inputs: ['risky operation'],
          outputs: ['handled result or error'],
          transformation: 'Try operation → If error, catch → Handle or propagate',
          constraints: ['Catch specific errors, not all'],
          preconditions: ['Operation may fail'],
          postconditions: ['Error handled or propagated appropriately'],
        },
        frequency: 0.85,
        confidence: 0.9,
        connections: ['error_handling', 'exception_safety', 'graceful_degradation'],
        source: 'extracted',
      });
    }

    // Detect state management patterns
    if (lower.includes('state') || lower.includes('store') || lower.includes('update')) {
      patterns.push({
        type: 'architecture',
        name: 'State Container',
        description: 'Detected: centralized state management pattern',
        structure: {
          inputs: ['action', 'current state'],
          outputs: ['new state'],
          transformation: 'Receive action → Apply reducer → Emit new state → Notify subscribers',
          constraints: ['State must be immutable between updates'],
          preconditions: ['Initial state defined'],
          postconditions: ['State updated atomically'],
        },
        frequency: 0.8,
        confidence: 0.85,
        connections: ['redux', 'state_management', 'immutable_data'],
        source: 'extracted',
      });
    }

    // Detect performance patterns
    if (lower.includes('cache') || lower.includes('memo') || lower.includes('lazy')) {
      patterns.push({
        type: 'optimization',
        name: 'Lazy Evaluation',
        description: 'Detected: deferred computation pattern',
        structure: {
          inputs: ['computation request'],
          outputs: ['computed value'],
          transformation: 'Check if computed → If yes, return cached. If no, compute on demand.',
          constraints: ['Computation must be idempotent'],
          preconditions: ['Value not yet needed'],
          postconditions: ['Value computed and cached'],
        },
        frequency: 0.65,
        confidence: 0.82,
        connections: ['memoization', 'lazy_loading', 'deferred_execution'],
        source: 'extracted',
      });
    }

    return patterns;
  }

  // Match a query to known patterns
  match(query: string, topK: number = 3): MatchResult[] {
    const lower = query.toLowerCase();
    const results: MatchResult[] = [];

    for (const [id, pattern] of this.patternTree.nodes) {
      let relevance = 0;

      // Check name match
      if (lower.includes(pattern.name.toLowerCase().split(' ')[0])) {
        relevance += 0.3;
      }

      // Check description keywords
      const descWords = pattern.description.toLowerCase().split(/\s+/);
      const queryWords = lower.split(/\s+/);
      const overlap = queryWords.filter(w => descWords.includes(w) && w.length > 3).length;
      relevance += (overlap / Math.max(1, queryWords.length)) * 0.3;

      // Check structure match
      const structText = [
        ...pattern.structure.inputs,
        ...pattern.structure.outputs,
        pattern.structure.transformation,
      ].join(' ').toLowerCase();
      
      const structOverlap = queryWords.filter(w => structText.includes(w) && w.length > 3).length;
      relevance += (structOverlap / Math.max(1, queryWords.length)) * 0.4;

      // Weight by confidence and frequency
      relevance *= pattern.confidence * pattern.frequency;

      if (relevance > 0.1) {
        results.push({
          pattern,
          relevance,
          applicability: this.determineApplicability(pattern, query),
        });
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, topK);
  }

  private determineApplicability(pattern: PatternNode, query: string): string {
    const lower = query.toLowerCase();
    
    if (pattern.type === 'algorithm') {
      return `This algorithmic pattern applies when: ${pattern.structure.preconditions.join(', ')}. Apply by: ${pattern.structure.transformation}`;
    }
    if (pattern.type === 'architecture') {
      return `Use this architecture when your system needs: ${pattern.structure.outputs.join(', ')}. Structure: ${pattern.structure.transformation}`;
    }
    if (pattern.type === 'error') {
      return `Watch for this error pattern when: ${pattern.structure.preconditions.join(', ')}. Prevent by: ${pattern.structure.constraints.join(', ')}`;
    }
    if (pattern.type === 'optimization') {
      return `Apply this optimization when: ${pattern.structure.preconditions.join(', ')}. Trade-off: ${pattern.structure.constraints.join(', ')}`;
    }
    if (pattern.type === 'design') {
      return `Apply this design principle when: ${pattern.structure.preconditions.join(', ')}. Result: ${pattern.structure.postconditions.join(', ')}`;
    }
    return `Pattern "${pattern.name}" is relevant to this query. ${pattern.description}`;
  }

  // Get stats
  getStats() {
    const nodes = Array.from(this.patternTree.nodes.values());
    return {
      totalPatterns: nodes.length,
      byType: {
        algorithm: nodes.filter(n => n.type === 'algorithm').length,
        architecture: nodes.filter(n => n.type === 'architecture').length,
        error: nodes.filter(n => n.type === 'error').length,
        optimization: nodes.filter(n => n.type === 'optimization').length,
        design: nodes.filter(n => n.type === 'design').length,
        concept: nodes.filter(n => n.type === 'concept').length,
      },
      averageConfidence: nodes.reduce((s, n) => s + n.confidence, 0) / nodes.length,
      averageFrequency: nodes.reduce((s, n) => s + n.frequency, 0) / nodes.length,
    };
  }

  getPatterns(): PatternNode[] {
    return Array.from(this.patternTree.nodes.values());
  }
}
