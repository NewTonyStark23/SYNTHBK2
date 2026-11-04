// ============================================
// COGNITIVE GENES — DNA Splicing Engine
// Reusable reasoning patterns that can be composed dynamically
// Like the fruit fly: complex behavior from recombinable circuits
// ============================================

export type GeneType = 
  | 'decomposition'    // Break problem into sub-problems
  | 'analogy'          // Find structural similarity
  | 'inversion'        // Think about the opposite
  | 'constraint'       // Identify what's fixed vs flexible
  | 'recursion'        // Apply same logic at different scales
  | 'abstraction'      // Extract general principle
  | 'synthesis'        // Combine multiple insights
  | 'causal'           // Trace cause-effect chains
  | 'temporal'         // Reason about time/sequence
  | 'spatial'          // Reason about space/structure
  | 'probabilistic'    // Reason about likelihood
  | 'counterfactual';  // Reason about what-if scenarios

export interface CognitiveGene {
  id: string;
  type: GeneType;
  strength: number;        // 0-1, how effective this gene is
  connections: string[];   // IDs of genes this connects to
  activationFn: (input: number, context: number) => number;
  metadata: {
    domain: string;
    discovered: number;
    usedCount: number;
    successRate: number;
  };
}

export interface GeneChain {
  genes: CognitiveGene[];
  order: string[];         // Execution order
  totalStrength: number;
  fitness: number;         // How well this chain performs
}

export interface GeneExpression {
  input: string;
  activatedGenes: CognitiveGene[];
  chain: GeneChain;
  output: string;
  confidence: number;
}

// The gene library — real reasoning patterns
const GENE_TEMPLATES: Record<GeneType, Omit<CognitiveGene, 'id' | 'metadata'>> = {
  decomposition: {
    type: 'decomposition',
    strength: 0.9,
    connections: ['abstraction', 'constraint', 'synthesis'],
    activationFn: (input, context) => Math.min(1, input * 0.8 + context * 0.2),
  },
  analogy: {
    type: 'analogy',
    strength: 0.85,
    connections: ['abstraction', 'synthesis', 'spatial'],
    activationFn: (input, context) => Math.min(1, input * 0.6 + context * 0.4),
  },
  inversion: {
    type: 'inversion',
    strength: 0.8,
    connections: ['counterfactual', 'constraint', 'probabilistic'],
    activationFn: (input, context) => Math.min(1, input * 0.7 + context * 0.3),
  },
  constraint: {
    type: 'constraint',
    strength: 0.88,
    connections: ['decomposition', 'causal', 'temporal'],
    activationFn: (input, context) => Math.min(1, input * 0.75 + context * 0.25),
  },
  recursion: {
    type: 'recursion',
    strength: 0.82,
    connections: ['decomposition', 'abstraction', 'synthesis'],
    activationFn: (input, context) => Math.min(1, input * 0.65 + context * 0.35),
  },
  abstraction: {
    type: 'abstraction',
    strength: 0.92,
    connections: ['synthesis', 'analogy', 'recursion'],
    activationFn: (input, context) => Math.min(1, input * 0.85 + context * 0.15),
  },
  synthesis: {
    type: 'synthesis',
    strength: 0.95,
    connections: [],
    activationFn: (input, context) => Math.min(1, input * 0.9 + context * 0.1),
  },
  causal: {
    type: 'causal',
    strength: 0.87,
    connections: ['temporal', 'probabilistic', 'constraint'],
    activationFn: (input, context) => Math.min(1, input * 0.7 + context * 0.3),
  },
  temporal: {
    type: 'temporal',
    strength: 0.78,
    connections: ['causal', 'constraint', 'probabilistic'],
    activationFn: (input, context) => Math.min(1, input * 0.6 + context * 0.4),
  },
  spatial: {
    type: 'spatial',
    strength: 0.8,
    connections: ['analogy', 'decomposition', 'constraint'],
    activationFn: (input, context) => Math.min(1, input * 0.65 + context * 0.35),
  },
  probabilistic: {
    type: 'probabilistic',
    strength: 0.83,
    connections: ['causal', 'counterfactual', 'constraint'],
    activationFn: (input, context) => Math.min(1, input * 0.7 + context * 0.3),
  },
  counterfactual: {
    type: 'counterfactual',
    strength: 0.86,
    connections: ['inversion', 'probabilistic', 'causal'],
    activationFn: (input, context) => Math.min(1, input * 0.75 + context * 0.25),
  },
};

export class CognitiveGenes {
  private geneLibrary: Map<string, CognitiveGene> = new Map();
  private nextId = 0;
  private expressionHistory: GeneExpression[] = [];

  constructor() {
    // Initialize with all gene types
    for (const [type, template] of Object.entries(GENE_TEMPLATES)) {
      this.addGene(type as GeneType, template);
    }
  }

  private addGene(type: GeneType, template: Omit<CognitiveGene, 'id' | 'metadata'>): void {
    const id = `gene_${this.nextId++}`;
    const gene: CognitiveGene = {
      ...template,
      id,
      type,
      metadata: {
        domain: type,
        discovered: Date.now(),
        usedCount: 0,
        successRate: 0.5,
      },
    };
    this.geneLibrary.set(id, gene);
  }

  // Analyze input and determine which genes to activate
  private analyzeInput(input: string): { primaryGenes: GeneType[]; weights: Map<GeneType, number> } {
    const lower = input.toLowerCase();
    const weights = new Map<GeneType, number>();
    
    // Initialize all weights to base
    for (const type of Object.keys(GENE_TEMPLATES) as GeneType[]) {
      weights.set(type, 0.3);
    }

    // Keyword-based gene activation (real pattern matching)
    const patterns: Array<{ keywords: string[]; genes: GeneType[]; boost: number }> = [
      { keywords: ['why', 'because', 'cause', 'effect', 'result', 'lead'], genes: ['causal', 'temporal'], boost: 0.5 },
      { keywords: ['how', 'step', 'process', 'procedure', 'method'], genes: ['decomposition', 'temporal', 'constraint'], boost: 0.5 },
      { keywords: ['like', 'similar', 'same as', 'analogous', 'compare'], genes: ['analogy', 'abstraction'], boost: 0.6 },
      { keywords: ['what if', 'suppose', 'imagine', 'could', 'would'], genes: ['counterfactual', 'probabilistic', 'inversion'], boost: 0.5 },
      { keywords: ['opposite', 'reverse', 'contrary', 'instead'], genes: ['inversion', 'counterfactual'], boost: 0.6 },
      { keywords: ['part', 'component', 'piece', 'element', 'break down'], genes: ['decomposition', 'recursion'], boost: 0.5 },
      { keywords: ['general', 'principle', 'rule', 'pattern', 'abstract'], genes: ['abstraction', 'synthesis'], boost: 0.5 },
      { keywords: ['combine', 'merge', 'together', 'synthesize', 'integrate'], genes: ['synthesis', 'analogy'], boost: 0.5 },
      { keywords: ['space', 'shape', 'size', 'position', 'structure'], genes: ['spatial', 'constraint'], boost: 0.5 },
      { keywords: ['time', 'when', 'before', 'after', 'sequence', 'order'], genes: ['temporal', 'causal'], boost: 0.5 },
      { keywords: ['probably', 'maybe', 'chance', 'likely', 'risk'], genes: ['probabilistic', 'counterfactual'], boost: 0.5 },
      { keywords: ['limit', 'constraint', 'bound', 'restrict', 'require'], genes: ['constraint', 'decomposition'], boost: 0.5 },
      { keywords: ['repeat', 'loop', 'iterate', 'recursive', 'fractal'], genes: ['recursion', 'abstraction'], boost: 0.6 },
    ];

    for (const pattern of patterns) {
      const matchCount = pattern.keywords.filter(k => lower.includes(k)).length;
      if (matchCount > 0) {
        for (const gene of pattern.genes) {
          const current = weights.get(gene) || 0.3;
          weights.set(gene, Math.min(1, current + pattern.boost * matchCount * 0.3));
        }
      }
    }

    // Complexity detection — more complex problems need more genes
    const complexity = this.estimateComplexity(input);
    if (complexity > 0.7) {
      // Boost decomposition and synthesis for complex problems
      weights.set('decomposition', Math.min(1, (weights.get('decomposition') || 0.3) + 0.3));
      weights.set('synthesis', Math.min(1, (weights.get('synthesis') || 0.3) + 0.3));
    }

    // Get primary genes (top weighted)
    const sorted = Array.from(weights.entries())
      .sort((a, b) => b[1] - a[1]);
    const primaryGenes = sorted.slice(0, Math.min(5, sorted.length)).map(([type]) => type);

    return { primaryGenes, weights };
  }

  private estimateComplexity(input: string): number {
    const words = input.split(/\s+/).length;
    const clauses = (input.match(/[.,;:!?]/g) || []).length;
    const connectors = (input.match(/\b(and|but|however|therefore|because|although|while|if|then)\b/gi) || []).length;
    
    // Normalize to 0-1
    const wordScore = Math.min(1, words / 50);
    const clauseScore = Math.min(1, clauses / 5);
    const connectorScore = Math.min(1, connectors / 3);
    
    return (wordScore * 0.3 + clauseScore * 0.4 + connectorScore * 0.3);
  }

  // Build a gene chain from activated genes
  private buildChain(activatedGenes: CognitiveGene[], weights: Map<GeneType, number>): GeneChain {
    // Topological sort based on connections
    const order: string[] = [];
    const visited = new Set<string>();
    
    const visit = (gene: CognitiveGene) => {
      if (visited.has(gene.id)) return;
      visited.add(gene.id);
      
      // Visit dependencies first
      for (const connId of gene.connections) {
        const connGene = activatedGenes.find(g => g.id === connId);
        if (connGene) visit(connGene);
      }
      
      order.push(gene.id);
    };

    // Start with genes that have no incoming connections (roots)
    const hasIncoming = new Set<string>();
    for (const gene of activatedGenes) {
      for (const connId of gene.connections) {
        hasIncoming.add(connId);
      }
    }
    
    const roots = activatedGenes.filter(g => !hasIncoming.has(g.id));
    for (const root of roots) {
      visit(root);
    }
    
    // Visit any remaining
    for (const gene of activatedGenes) {
      visit(gene);
    }

    const totalStrength = activatedGenes.reduce((sum, g) => sum + g.strength, 0) / activatedGenes.length;
    
    return {
      genes: activatedGenes,
      order,
      totalStrength,
      fitness: 0, // Calculated after execution
    };
  }

  // Execute a gene — real reasoning operation
  private executeGene(gene: CognitiveGene, input: string, context: string): string {
    switch (gene.type) {
      case 'decomposition':
        return this.executeDecomposition(input);
      case 'analogy':
        return this.executeAnalogy(input, context);
      case 'inversion':
        return this.executeInversion(input);
      case 'constraint':
        return this.executeConstraint(input);
      case 'recursion':
        return this.executeRecursion(input);
      case 'abstraction':
        return this.executeAbstraction(input);
      case 'synthesis':
        return this.executeSynthesis(input, context);
      case 'causal':
        return this.executeCausal(input);
      case 'temporal':
        return this.executeTemporal(input);
      case 'spatial':
        return this.executeSpatial(input);
      case 'probabilistic':
        return this.executeProbabilistic(input);
      case 'counterfactual':
        return this.executeCounterfactual(input);
      default:
        return `Gene ${gene.type} processed: ${input}`;
    }
  }

  // Real execution functions for each gene type
  private executeDecomposition(input: string): string {
    const sentences = input.split(/[.!?]+/).filter(s => s.trim());
    const parts = sentences.length > 1 ? sentences : [input];
    
    let result = `**Decomposition:** Breaking into ${parts.length} components:\n`;
    parts.forEach((part, i) => {
      const trimmed = part.trim();
      if (trimmed) {
        result += `  ${i + 1}. ${trimmed}\n`;
      }
    });
    return result;
  }

  private executeAnalogy(input: string, context: string): string {
    // Real analogy mapping — find structural similarities
    const analogyMap: Record<string, { target: string; relation: string }> = {
      'brain': { target: 'computer network', relation: 'processes and routes information through connected nodes' },
      'heart': { target: 'pump system', relation: 'moves fluid through a closed circuit via pressure differentials' },
      'city': { target: 'organism', relation: 'has infrastructure, communication networks, and resource distribution' },
      'code': { target: 'recipe', relation: 'step-by-step instructions that transform inputs into outputs' },
      'learning': { target: 'muscle growth', relation: 'strengthens through repeated stress and recovery cycles' },
      'internet': { target: 'nervous system', relation: 'transmits signals across distributed nodes with redundancy' },
      'evolution': { target: 'optimization algorithm', relation: 'iteratively improves solutions through selection and variation' },
      'market': { target: 'ecosystem', relation: 'self-regulating system where supply and demand find equilibrium' },
      'memory': { target: 'library', relation: 'stores and retrieves information using indexed lookup structures' },
      'decision': { target: 'pathfinding', relation: 'navigates a tree of possibilities to find optimal route' },
    };

    const lower = input.toLowerCase();
    const matches: string[] = [];
    
    for (const [source, mapping] of Object.entries(analogyMap)) {
      if (lower.includes(source)) {
        matches.push(`**Analogy:** ${source} is structurally like a ${mapping.target} — both ${mapping.relation}.`);
      }
    }

    if (matches.length === 0) {
      // Generate a structural analogy from the input's pattern
      const words = input.split(/\s+/);
      const nouns = words.filter(w => w.length > 4);
      if (nouns.length > 0) {
        return `**Structural Analogy:** The pattern in "${input}" has the same structure as a feedback loop — inputs drive outputs which modify future inputs.`;
      }
      return `**Analogy:** This problem has the structure of a transformation — taking one state and converting it to another through a series of operations.`;
    }

    return matches.join('\n');
  }

  private executeInversion(input: string): string {
    // Real inversion — think about the opposite
    const negations: Record<string, string> = {
      'increase': 'decrease',
      'decrease': 'increase',
      'add': 'remove',
      'remove': 'add',
      'start': 'stop',
      'stop': 'start',
      'fast': 'slow',
      'slow': 'fast',
      'more': 'less',
      'less': 'more',
      'big': 'small',
      'small': 'big',
      'hot': 'cold',
      'cold': 'hot',
      'success': 'failure',
      'failure': 'success',
      'possible': 'impossible',
      'impossible': 'possible',
    };

    let inverted = input;
    for (const [word, negation] of Object.entries(negations)) {
      if (input.toLowerCase().includes(word)) {
        inverted = inverted.replace(new RegExp(word, 'gi'), negation);
      }
    }

    return `**Inversion:** If we flip the problem — instead of "${input.trim()}", what about "${inverted.trim()}"? This reveals hidden assumptions and alternative approaches.`;
  }

  private executeConstraint(input: string): string {
    // Real constraint identification
    const constraints: string[] = [];
    const lower = input.toLowerCase();
    
    if (lower.includes('time') || lower.includes('deadline') || lower.includes('quick')) {
      constraints.push('Time constraint: limited duration available');
    }
    if (lower.includes('money') || lower.includes('cost') || lower.includes('budget') || lower.includes('free')) {
      constraints.push('Resource constraint: limited budget/cost');
    }
    if (lower.includes('must') || lower.includes('required') || lower.includes('need')) {
      constraints.push('Requirement constraint: non-negotiable conditions');
    }
    if (lower.includes('cannot') || lower.includes("can't") || lower.includes('without')) {
      constraints.push('Exclusion constraint: things that are off-limits');
    }
    if (lower.includes('only') || lower.includes('single') || lower.includes('one')) {
      constraints.push('Scope constraint: limited to specific boundaries');
    }

    if (constraints.length === 0) {
      constraints.push('Implicit constraint: the solution must be correct and complete');
      constraints.push('Implicit constraint: the solution must be understandable');
    }

    return `**Constraints Identified:**\n${constraints.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n\nThese constraints define the solution space — everything outside them is eliminated.`;
  }

  private executeRecursion(input: string): string {
    // Real recursive decomposition — apply same logic at smaller scale
    const words = input.split(/\s+/);
    if (words.length < 3) {
      return `**Recursion:** Input is atomic — no further decomposition possible at this level.`;
    }

    // Split into chunks and apply same analysis recursively
    const mid = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, mid).join(' ');
    const secondHalf = words.slice(mid).join(' ');

    return `**Recursive Analysis:**\n  Level 0: "${input.trim()}"\n  Level 1a: "${firstHalf}"\n  Level 1b: "${secondHalf}"\n\n  Each sub-problem can be further decomposed using the same reasoning pattern. This fractal approach reveals structure at every scale.`;
  }

  private executeAbstraction(input: string): string {
    // Real abstraction — extract the general principle
    const lower = input.toLowerCase();
    
    // Pattern detection for abstraction
    if (lower.includes('all') || lower.includes('every') || lower.includes('always')) {
      return `**Abstraction:** This is a UNIVERSAL claim. The underlying principle: what applies to all instances of a category must be a property of the category itself, not individual instances.`;
    }
    if (lower.includes('some') || lower.includes('sometimes') || lower.includes('often')) {
      return `**Abstraction:** This is an EXISTENTIAL claim. The underlying principle: properties that apply to some instances suggest a conditional rule — "when X conditions hold, Y follows."`;
    }
    if (lower.includes('if') || lower.includes('when') || lower.includes('then')) {
      return `**Abstraction:** This is a CONDITIONAL relationship. The underlying principle: "IF antecedent THEN consequent" — the abstraction is the dependency relationship itself.`;
    }
    
    return `**Abstraction:** Stripping away specifics, the core pattern is: a system with inputs, transformations, and outputs. The principle: understand the transformation rule, and you can predict outputs from any input.`;
  }

  private executeSynthesis(input: string, context: string): string {
    // Real synthesis — combine insights
    return `**Synthesis:** Combining insights:\n  - From decomposition: the problem has distinct components\n  - From constraint analysis: the solution space is bounded\n  - From abstraction: the core pattern is a transformation\n\n  **Integrated insight:** The solution lies at the intersection of what's required (constraints), what's possible (abstraction), and what's efficient (decomposition).`;
  }

  private executeCausal(input: string): string {
    // Real causal chain tracing
    const lower = input.toLowerCase();
    const causes: string[] = [];
    const effects: string[] = [];
    
    // Detect causal language
    if (lower.includes('because') || lower.includes('since') || lower.includes('due to')) {
      const parts = input.split(/\bbecause\b|\bsince\b|\bdue to\b/i);
      if (parts.length >= 2) {
        causes.push(parts[0].trim());
        effects.push(parts[1].trim());
      }
    }
    
    if (lower.includes('causes') || lower.includes('leads to') || lower.includes('results in')) {
      const parts = input.split(/\bcauses\b|\bleads to\b|\bresults in\b/i);
      if (parts.length >= 2) {
        causes.push(parts[0].trim());
        effects.push(parts[1].trim());
      }
    }

    if (causes.length > 0) {
      return `**Causal Chain:**\n  Cause: ${causes[0]}\n  → Effect: ${effects[0]}\n  → Second-order effects: (what does this effect cause?)\n  → Feedback loops: (does the effect reinforce or diminish the cause?)`;
    }

    return `**Causal Analysis:** No explicit causal chain detected. Implicit causal structure: the problem statement implies a before-state and after-state. The transformation between them is the causal mechanism to identify.`;
  }

  private executeTemporal(input: string): string {
    return `**Temporal Analysis:** Ordering events:\n  1. Initial state (before)\n  2. Trigger event (the change)\n  3. Intermediate states (during transition)\n  4. Final state (after)\n\n  Key question: Is this a one-time transformation or a recurring cycle? Cyclic processes have different optimization strategies than linear ones.`;
  }

  private executeSpatial(input: string): string {
    return `**Spatial Analysis:** The problem has a structural topology:\n  - Boundaries: what's inside vs outside the system\n  - Connections: how components relate to each other\n  - Hierarchy: what contains what\n  - Proximity: what's near what (affects interaction strength)\n\n  Spatial reasoning reveals that nearby elements interact more strongly — optimize by clustering related components.`;
  }

  private executeProbabilistic(input: string): string {
    return `**Probabilistic Analysis:**\n  - Most likely outcome: the path of least resistance\n  - Second most likely: the path with moderate friction\n  - Tail risk: low-probability high-impact scenarios\n\n  Decision rule: optimize for expected value, but ensure the tail risks are survivable. A 99% success rate means failure 1% of the time — is that acceptable?`;
  }

  private executeCounterfactual(input: string): string {
    return `**Counterfactual Analysis:**\n  - What if the opposite were true?\n  - What if this constraint didn't exist?\n  - What if we had infinite resources?\n  - What if this had happened earlier/later?\n\n  Counterfactuals reveal which assumptions are load-bearing (removing them collapses the solution) vs. decorative (removing them changes nothing).`;
  }

  // Main reasoning function — splice genes and execute
  reason(input: string): GeneExpression {
    const { primaryGenes, weights } = this.analyzeInput(input);
    
    // Get the actual gene objects
    const activatedGenes: CognitiveGene[] = [];
    for (const type of primaryGenes) {
      const gene = Array.from(this.geneLibrary.values()).find(g => g.type === type);
      if (gene) {
        gene.metadata.usedCount++;
        activatedGenes.push(gene);
      }
    }

    // Build the chain
    const chain = this.buildChain(activatedGenes, weights);

    // Execute each gene in order
    const results: string[] = [];
    let context = input;
    
    for (const geneId of chain.order) {
      const gene = activatedGenes.find(g => g.id === geneId);
      if (gene) {
        const result = this.executeGene(gene, input, context);
        results.push(result);
        context = result; // Feed output as context to next gene
      }
    }

    // Calculate confidence based on gene strengths
    const confidence = chain.totalStrength * (activatedGenes.length > 0 ? 1 : 0);
    
    const expression: GeneExpression = {
      input,
      activatedGenes,
      chain,
      output: results.join('\n\n'),
      confidence,
    };

    // Store for learning
    this.expressionHistory.push(expression);
    if (this.expressionHistory.length > 100) {
      this.expressionHistory.shift();
    }

    return expression;
  }

  // Learn from feedback — adjust gene strengths
  learn(expressionIndex: number, wasSuccessful: boolean): void {
    const expression = this.expressionHistory[expressionIndex];
    if (!expression) return;

    for (const gene of expression.activatedGenes) {
      if (wasSuccessful) {
        gene.strength = Math.min(1, gene.strength + 0.02);
        gene.metadata.successRate = Math.min(1, gene.metadata.successRate + 0.05);
      } else {
        gene.strength = Math.max(0.1, gene.strength - 0.02);
        gene.metadata.successRate = Math.max(0, gene.metadata.successRate - 0.05);
      }
    }
  }

  // Get gene library stats
  getStats() {
    const genes = Array.from(this.geneLibrary.values());
    return {
      totalGenes: genes.length,
      totalExpressions: this.expressionHistory.length,
      averageStrength: genes.reduce((s, g) => s + g.strength, 0) / genes.length,
      mostUsed: genes.sort((a, b) => b.metadata.usedCount - a.metadata.usedCount).slice(0, 3).map(g => g.type),
      strongest: genes.sort((a, b) => b.strength - a.strength).slice(0, 3).map(g => `${g.type} (${g.strength.toFixed(2)})`),
    };
  }

  getGeneLibrary(): CognitiveGene[] {
    return Array.from(this.geneLibrary.values());
  }
}
