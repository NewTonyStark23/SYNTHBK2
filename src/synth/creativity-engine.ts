// ============================================
// EMERGENT CREATIVITY ENGINE — Cross-Domain Collision
// Creativity = forced combination of unrelated structures + evaluation
// The Post-it Note came from combining "weak adhesive" + "bookmark"
// ============================================

export interface Domain {
  name: string;
  structure: DomainStructure;
  principles: string[];
  examples: string[];
}

export interface DomainStructure {
  elements: string[];        // Key components
  relationships: string[];   // How elements connect
  dynamics: string[];        // How the system behaves
  constraints: string[];     // What limits it
}

export interface Collision {
  source: Domain;
  target: Domain;
  mappings: StructuralMapping[];
  novelty: number;
  usefulness: number;
  combinedInsight: string;
}

export interface StructuralMapping {
  sourceElement: string;
  targetElement: string;
  relationship: string;
  strength: number;
}

export interface CreativeOutput {
  input: string;
  collisions: Collision[];
  bestInsight: string;
  noveltyScore: number;
  applicability: string;
}

// Domain library — real domains with real structures
const DOMAINS: Domain[] = [
  {
    name: 'Biology — Mycelium Networks',
    structure: {
      elements: ['hyphae', 'nutrients', 'signals', 'nodes', 'connections'],
      relationships: ['resource sharing', 'signal propagation', 'mutual benefit', 'adaptive growth'],
      dynamics: ['decentralized decision making', 'emergent optimization', 'fault tolerance through redundancy'],
      constraints: ['energy limited', 'growth rate bounded', 'environment dependent'],
    },
    principles: ['Distributed intelligence', 'Resource optimization through sharing', 'Adapt without central control'],
    examples: ['Fungal networks find optimal paths', 'Forest ecosystems self-regulate', 'Immune system adapts to new threats'],
  },
  {
    name: 'Music — Jazz Improvisation',
    structure: {
      elements: ['melody', 'harmony', 'rhythm', 'tension', 'resolution'],
      relationships: ['call and response', 'theme and variation', 'tension and release'],
      dynamics: ['real-time creation', 'listening and adapting', 'building on what came before'],
      constraints: ['key signature', 'time signature', 'ensemble coordination'],
    },
    principles: ['Create within constraints', 'Build on others contributions', 'Tension creates interest'],
    examples: ['Musicians create novel melodies in real-time', 'Ensembles coordinate without explicit planning', 'Wrong notes become right notes with resolution'],
  },
  {
    name: 'Architecture — Tensegrity Structures',
    structure: {
      elements: ['compression members', 'tension cables', 'nodes', 'space'],
      relationships: ['balanced forces', 'mutual support', 'floating compression'],
      dynamics: ['self-stabilizing', 'lightweight strength', 'distributed load'],
      constraints: ['gravity', 'material strength', 'geometric feasibility'],
    },
    principles: ['Strength through tension balance', 'Minimal material, maximum structure', 'Each part supports all others'],
    examples: ['Suspension bridges', 'Geodesic domes', 'Human body skeletal-muscular system'],
  },
  {
    name: 'Ecology — Succession',
    structure: {
      elements: ['pioneer species', 'soil', 'climate', 'competition', 'niches'],
      relationships: ['facilitation', 'inhibition', 'tolerance', 'succession sequence'],
      dynamics: ['progressive complexity', 'niche creation', 'community stabilization'],
      constraints: ['climate envelope', 'soil depth', 'disturbance regime'],
    },
    principles: ['Start simple, build complexity', 'Each stage prepares the next', 'Disturbance creates opportunity'],
    examples: ['Bare rock → lichens → moss → grass → forest', 'After fire, ecosystem rebuilds stronger', 'Invasive species exploit disturbed niches'],
  },
  {
    name: 'Physics — Phase Transitions',
    structure: {
      elements: ['particles', 'energy', 'temperature', 'pressure', 'order parameter'],
      relationships: ['critical point', 'symmetry breaking', 'emergent order'],
      dynamics: ['sudden qualitative change from gradual quantitative change', 'cooperative behavior', 'tipping points'],
      constraints: ['conservation laws', 'thermodynamic limits', 'timescale separation'],
    },
    principles: ['Small changes can cause sudden large effects', 'Order emerges from chaos at critical points', 'The whole behaves differently than the parts'],
    examples: ['Water suddenly freezes at 0°C', 'Magnets suddenly align at Curie temperature', 'Markets suddenly crash or boom'],
  },
  {
    name: 'Linguistics — Grammar as Compression',
    structure: {
      elements: ['phonemes', 'morphemes', 'words', 'phrases', 'sentences'],
      relationships: ['composition', 'recursion', 'dependency', 'ambiguity'],
      dynamics: ['finite rules generate infinite expressions', 'context resolves ambiguity', 'meaning from structure'],
      constraints: ['working memory limits', 'processing time', 'communicative efficiency'],
    },
    principles: ['Recursive rules from finite elements', 'Context determines meaning', 'Efficiency drives structure'],
    examples: ['5-year-old produces sentences never heard before', 'Same words, different meaning in different contexts', 'Language evolves toward efficiency'],
  },
  {
    name: 'Economics — Market Dynamics',
    structure: {
      elements: ['supply', 'demand', 'price', 'information', 'agents'],
      relationships: ['equilibrium', 'feedback', 'competition', 'cooperation'],
      dynamics: ['self-organizing price discovery', 'invisible hand', 'creative destruction'],
      constraints: ['resource scarcity', 'information asymmetry', 'transaction costs'],
    },
    principles: ['Decentralized decisions produce coordinated outcomes', 'Prices encode information', 'Competition drives innovation'],
    examples: ['Markets allocate resources without central planning', 'Stock prices reflect collective wisdom', 'Innovation comes from competitive pressure'],
  },
  {
    name: 'Neuroscience — Neural Plasticity',
    structure: {
      elements: ['neurons', 'synapses', 'signals', 'pathways', 'regions'],
      relationships: ['hebbian learning', 'inhibition', 'excitation', 'pruning'],
      dynamics: ['use-dependent strengthening', 'critical periods', 'reorganization after damage'],
      constraints: ['metabolic cost', 'structural limits', 'developmental windows'],
    },
    principles: ['Neurons that fire together wire together', 'Unused connections are pruned', 'The brain rewires itself based on experience'],
    examples: ['London taxi drivers have larger hippocampi', 'Stroke patients recover function via rewiring', 'Practice changes brain structure'],
  },
];

export class CreativityEngine {
  private domains: Domain[] = DOMAINS;
  private collisionHistory: CreativeOutput[] = [];

  // Find the structure of the input problem
  private analyzeProblemStructure(input: string): DomainStructure {
    const lower = input.toLowerCase();
    const words = lower.split(/\s+/);
    
    // Extract elements (nouns/key concepts)
    const elements = words.filter(w => w.length > 4).slice(0, 5);
    
    // Detect relationships
    const relationships: string[] = [];
    if (lower.includes('connect') || lower.includes('link') || lower.includes('relate')) relationships.push('connection');
    if (lower.includes('change') || lower.includes('transform') || lower.includes('convert')) relationships.push('transformation');
    if (lower.includes('depend') || lower.includes('require') || lower.includes('need')) relationships.push('dependency');
    if (lower.includes('improve') || lower.includes('optimize') || lower.includes('better')) relationships.push('optimization');
    if (lower.includes('create') || lower.includes('build') || lower.includes('make')) relationships.push('creation');
    if (relationships.length === 0) relationships.push('general interaction');

    // Detect dynamics
    const dynamics: string[] = [];
    if (lower.includes('grow') || lower.includes('expand') || lower.includes('scale')) dynamics.push('growth');
    if (lower.includes('cycle') || lower.includes('repeat') || lower.includes('loop')) dynamics.push('cyclical behavior');
    if (lower.includes('compete') || lower.includes('choose') || lower.includes('select')) dynamics.push('selection');
    if (dynamics.length === 0) dynamics.push('linear progression');

    // Detect constraints
    const constraints: string[] = [];
    if (lower.includes('limit') || lower.includes('fast') || lower.includes('time')) constraints.push('time pressure');
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('free')) constraints.push('resource limits');
    if (lower.includes('must') || lower.includes('required') || lower.includes('rule')) constraints.push('hard constraints');
    if (constraints.length === 0) constraints.push('implicit quality requirements');

    return { elements, relationships, dynamics, constraints };
  }

  // Map structure between two domains
  private mapStructures(source: Domain, target: Domain): StructuralMapping[] {
    const mappings: StructuralMapping[] = [];

    // Map elements by functional similarity
    for (const srcElement of source.structure.elements) {
      for (const tgtElement of target.structure.elements) {
        // Check if elements serve similar functions
        const similarity = this.calculateElementSimilarity(srcElement, tgtElement);
        if (similarity > 0.3) {
          mappings.push({
            sourceElement: srcElement,
            targetElement: tgtElement,
            relationship: this.inferRelationship(srcElement, tgtElement),
            strength: similarity,
          });
        }
      }
    }

    // Map by principle similarity
    for (const srcPrinciple of source.principles) {
      for (const tgtPrinciple of target.principles) {
        const words1 = new Set(srcPrinciple.toLowerCase().split(/\s+/));
        const words2 = new Set(tgtPrinciple.toLowerCase().split(/\s+/));
        const overlap = [...words1].filter(w => words2.has(w) && w.length > 3).length;
        if (overlap > 0 || this.arePrinciplesStructurallySimilar(srcPrinciple, tgtPrinciple)) {
          mappings.push({
            sourceElement: srcPrinciple,
            targetElement: tgtPrinciple,
            relationship: 'structural analogy',
            strength: 0.5 + overlap * 0.1,
          });
        }
      }
    }

    return mappings.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  private calculateElementSimilarity(a: string, b: string): number {
    // Functional similarity — do they play similar roles?
    const roles: Record<string, string[]> = {
      'processor': ['neurons', 'signals', 'hyphae', 'agents', 'words'],
      'connector': ['synapses', 'connections', 'relationships', 'morphemes', 'cables'],
      'resource': ['nutrients', 'energy', 'supply', 'soil', 'information'],
      'structure': ['nodes', 'regions', 'elements', 'phonemes', 'particles'],
      'regulator': ['inhibition', 'constraints', 'price', 'pressure', 'pruning'],
    };

    let similarity = 0;
    for (const [, members] of Object.entries(roles)) {
      const aMatch = members.includes(a.toLowerCase());
      const bMatch = members.includes(b.toLowerCase());
      if (aMatch && bMatch) similarity = 0.7;
      else if (aMatch || bMatch) similarity = 0.2;
    }

    // Also check direct string similarity
    if (a === b) similarity = 1;
    
    return similarity;
  }

  private inferRelationship(source: string, target: string): string {
    // Infer what kind of relationship exists
    const processWords = ['signal', 'neuron', 'process', 'compute', 'analyze'];
    const structureWords = ['node', 'element', 'component', 'part', 'member'];
    const flowWords = ['flow', 'resource', 'energy', 'nutrient', 'data'];

    const srcIsProcess = processWords.some(w => source.toLowerCase().includes(w));
    const tgtIsProcess = processWords.some(w => target.toLowerCase().includes(w));
    const srcIsStructure = structureWords.some(w => source.toLowerCase().includes(w));
    const tgtIsStructure = structureWords.some(w => target.toLowerCase().includes(w));

    if (srcIsProcess && tgtIsProcess) return 'functional equivalent';
    if (srcIsStructure && tgtIsStructure) return 'structural analog';
    if (flowWords.some(w => source.toLowerCase().includes(w))) return 'resource flow';
    return 'conceptual parallel';
  }

  private arePrinciplesStructurallySimilar(a: string, b: string): boolean {
    // Check if principles have the same abstract structure
    const patterns = [
      { pattern: /small.*large|local.*global|part.*whole/i, type: 'scale_emergence' },
      { pattern: /together.*wire|connect.*strengthen|use.*grow/i, type: 'use_dependent' },
      { pattern: /decentralized|distributed|without central/i, type: 'decentralization' },
      { pattern: /tension.*release|constraint.*creative|limit.*innovation/i, type: 'constraint_drives' },
      { pattern: /sudden|critical|tipping|phase/i, type: 'phase_transition' },
    ];

    const aTypes = patterns.filter(p => p.pattern.test(a)).map(p => p.type);
    const bTypes = patterns.filter(p => p.pattern.test(b)).map(p => p.type);
    
    return aTypes.some(t => bTypes.includes(t));
  }

  // Generate creative insight from collision
  private generateInsight(problem: string, problemStructure: DomainStructure, collision: Collision): string {
    const source = collision.source.name.split(' — ')[0];
    const target = collision.target.name.split(' — ')[0];
    
    let insight = `**Creative Insight from ${source} × ${target} collision:**\n\n`;
    
    // Map problem elements to domain elements
    insight += `Your problem involves: ${problemStructure.elements.join(', ')}\n`;
    insight += `In ${source}, the equivalent structure is: ${collision.source.structure.elements.slice(0, 3).join(', ')}\n`;
    insight += `In ${target}, the equivalent structure is: ${collision.target.structure.elements.slice(0, 3).join(', ')}\n\n`;
    
    // Generate the creative leap
    const sourcePrinciple = collision.source.principles[Math.floor(Math.random() * collision.source.principles.length)];
    const targetPrinciple = collision.target.principles[Math.floor(Math.random() * collision.target.principles.length)];
    
    insight += `**The Creative Leap:**\n`;
    insight += `"${sourcePrinciple}" (from ${source}) combined with "${targetPrinciple}" (from ${target}) suggests:\n\n`;
    
    // Apply to the actual problem
    insight += `**Applied to your problem:** What if you approached "${problem.substring(0, 60)}..." `;
    insight += `the way ${source} handles ${collision.source.structure.dynamics[0]}? `;
    insight += `Specifically: ${collision.source.examples[0]}. `;
    insight += `Now combine that with how ${target} achieves ${collision.target.structure.dynamics[0]}: `;
    insight += `${collision.target.examples[0]}.\n\n`;
    
    insight += `**Novel Solution Direction:** The intersection suggests a solution that is both `;
    insight += `${collision.source.structure.dynamics[0]} AND ${collision.target.structure.dynamics[0]} — `;
    insight += `something neither domain achieves alone, but their combination enables.`;

    return insight;
  }

  // Main creativity function — force collisions between domains
  create(input: string, numCollisions: number = 3): CreativeOutput {
    const problemStructure = this.analyzeProblemStructure(input);
    const collisions: Collision[] = [];

    // Select diverse domain pairs
    const usedDomains = new Set<string>();
    
    for (let i = 0; i < numCollisions && i < this.domains.length * (this.domains.length - 1) / 2; i++) {
      // Pick two domains that haven't been used yet
      let source: Domain, target: Domain;
      let attempts = 0;
      
      do {
        source = this.domains[Math.floor(Math.random() * this.domains.length)];
        target = this.domains[Math.floor(Math.random() * this.domains.length)];
        attempts++;
      } while ((source.name === target.name || usedDomains.has(source.name + target.name)) && attempts < 20);
      
      usedDomains.add(source.name + target.name);
      usedDomains.add(target.name + source.name);

      // Map structures between domains
      const mappings = this.mapStructures(source, target);
      
      // Calculate novelty (how different are the domains?)
      const elementOverlap = source.structure.elements.filter(e => 
        target.structure.elements.some(te => this.calculateElementSimilarity(e, te) > 0.5)
      ).length;
      const novelty = 1 - (elementOverlap / Math.max(1, source.structure.elements.length));

      // Calculate usefulness (how relevant to the problem?)
      const problemMatch = problemStructure.elements.filter(e => 
        source.structure.elements.some(se => se.includes(e)) || 
        target.structure.elements.some(te => te.includes(e))
      ).length;
      const usefulness = problemMatch / Math.max(1, problemStructure.elements.length);

      const collision: Collision = {
        source,
        target,
        mappings,
        novelty: Math.min(1, novelty + 0.3), // Boost novelty — cross-domain is inherently novel
        usefulness: Math.max(0.2, usefulness), // Minimum usefulness threshold
        combinedInsight: '',
      };

      collision.combinedInsight = this.generateInsight(input, problemStructure, collision);
      collisions.push(collision);
    }

    // Find best insight (highest novelty × usefulness)
    collisions.sort((a, b) => (b.novelty * b.usefulness) - (a.novelty * a.usefulness));
    const best = collisions[0];

    const output: CreativeOutput = {
      input,
      collisions,
      bestInsight: best?.combinedInsight || 'No strong creative insights generated — problem may be too domain-specific for cross-domain transfer.',
      noveltyScore: collisions.reduce((s, c) => s + c.novelty, 0) / collisions.length,
      applicability: best ? `Most applicable collision: ${best.source.name.split(' — ')[0]} × ${best.target.name.split(' — ')[0]} (novelty: ${(best.novelty * 100).toFixed(0)}%, usefulness: ${(best.usefulness * 100).toFixed(0)}%)` : 'N/A',
    };

    this.collisionHistory.push(output);
    return output;
  }

  getStats() {
    return {
      domains: this.domains.length,
      possibleCollisions: this.domains.length * (this.domains.length - 1) / 2,
      collisionsGenerated: this.collisionHistory.length,
      averageNovelty: this.collisionHistory.length > 0
        ? this.collisionHistory.reduce((s, c) => s + c.noveltyScore, 0) / this.collisionHistory.length
        : 0,
    };
  }
}
