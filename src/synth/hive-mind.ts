// ============================================
// HIVE MIND — Multi-Agent Collaborative Synthesis
// 5 agents with different personalities collaborate
// Each generates a perspective, moderator synthesizes
// ============================================

export interface HiveAgent {
  id: string;
  name: string;
  personality: AgentPersonality;
  perspective: string;
  confidence: number;
}

export interface AgentPersonality {
  openness: number;        // 0-1, how open to new ideas
  conscientiousness: number; // 0-1, how detail-oriented
  extraversion: number;    // 0-1, how assertive in expressing views
  agreeableness: number;   // 0-1, how willing to compromise
  neuroticism: number;     // 0-1, how cautious/risk-averse
}

export interface AgentPerspective {
  agent: HiveAgent;
  viewpoint: string;
  keyInsights: string[];
  concerns: string[];
  recommendation: string;
  confidence: number;
}

export interface HiveResult {
  input: string;
  perspectives: AgentPerspective[];
  synthesis: string;
  consensusLevel: number;
  conflicts: string[];
  finalRecommendation: string;
}

// The agents — each with distinct personality
const AGENTS: Array<{ id: string; name: string; personality: AgentPersonality; role: string }> = [
  {
    id: 'skeptic',
    name: 'The Skeptic',
    role: 'Questions everything, finds flaws',
    personality: { openness: 0.3, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.3, neuroticism: 0.7 },
  },
  {
    id: 'optimist',
    name: 'The Optimist',
    role: 'Sees opportunities, encourages action',
    personality: { openness: 0.9, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.8, neuroticism: 0.2 },
  },
  {
    id: 'engineer',
    name: 'The Engineer',
    role: 'Focuses on practical implementation',
    personality: { openness: 0.5, conscientiousness: 0.95, extraversion: 0.4, agreeableness: 0.6, neuroticism: 0.4 },
  },
  {
    id: 'artist',
    name: 'The Artist',
    role: 'Thinks creatively, finds novel approaches',
    personality: { openness: 0.95, conscientiousness: 0.4, extraversion: 0.7, agreeableness: 0.7, neuroticism: 0.5 },
  },
  {
    id: 'historian',
    name: 'The Historian',
    role: 'Looks for precedents and patterns',
    personality: { openness: 0.6, conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.7, neuroticism: 0.3 },
  },
];

export class HiveMind {
  private agents: HiveAgent[];
  private history: HiveResult[] = [];

  constructor() {
    this.agents = AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      personality: a.personality,
      perspective: '',
      confidence: 0.5,
    }));
  }

  // Generate a perspective from an agent based on their personality
  private generatePerspective(agent: HiveAgent, input: string, role: string): AgentPerspective {
    const lower = input.toLowerCase();
    const p = agent.personality;
    let viewpoint = '';
    const keyInsights: string[] = [];
    const concerns: string[] = [];
    let recommendation = '';
    let confidence = 0.5;

    // Base viewpoint on personality
    switch (agent.id) {
      case 'skeptic':
        viewpoint = this.generateSkepticView(input, p);
        keyInsights.push('Challenges underlying assumptions');
        keyInsights.push('Identifies hidden risks');
        concerns.push('May be overly cautious');
        concerns.push('Could block progress with excessive analysis');
        confidence = p.conscientiousness * 0.8 + (1 - p.agreeableness) * 0.2;
        recommendation = `Before proceeding, verify: ${this.generateVerificationQuestions(input)}`;
        break;

      case 'optimist':
        viewpoint = this.generateOptimistView(input, p);
        keyInsights.push('Identifies untapped opportunities');
        keyInsights.push('Sees potential for positive outcomes');
        concerns.push('May underestimate risks');
        concerns.push('Could overlook practical constraints');
        confidence = p.openness * 0.6 + p.extraversion * 0.4;
        recommendation = `Move forward with: ${this.generateActionPlan(input)}`;
        break;

      case 'engineer':
        viewpoint = this.generateEngineerView(input, p);
        keyInsights.push('Provides concrete implementation path');
        keyInsights.push('Identifies technical requirements');
        concerns.push('May miss strategic considerations');
        concerns.push('Could over-optimize locally');
        confidence = p.conscientiousness * 0.9;
        recommendation = `Implementation approach: ${this.generateTechnicalPlan(input)}`;
        break;

      case 'artist':
        viewpoint = this.generateArtistView(input, p);
        keyInsights.push('Offers novel framing of the problem');
        keyInsights.push('Suggests unconventional solutions');
        concerns.push('May lack practical grounding');
        concerns.push('Ideas may be hard to implement');
        confidence = p.openness * 0.7 + (1 - p.conscientiousness) * 0.3;
        recommendation = `Creative direction: ${this.generateCreativeDirection(input)}`;
        break;

      case 'historian':
        viewpoint = this.generateHistorianView(input, p);
        keyInsights.push('Identifies relevant precedents');
        keyInsights.push('Draws lessons from past patterns');
        concerns.push('Past may not predict future');
        concerns.push('May be too conservative');
        confidence = p.conscientiousness * 0.7 + (1 - p.neuroticism) * 0.3;
        recommendation = `Based on precedent: ${this.generateHistoricalLesson(input)}`;
        break;
    }

    return {
      agent,
      viewpoint,
      keyInsights,
      concerns,
      recommendation,
      confidence: Math.min(0.95, confidence),
    };
  }

  private generateSkepticView(input: string, p: AgentPersonality): string {
    return `**Critical Analysis:** Before accepting the premise of "${input.substring(0, 50)}...", let me identify potential issues:\n\n` +
      `1. **Hidden assumption:** The question assumes the current framing is correct. What if we're solving the wrong problem?\n` +
      `2. **Survivorship bias:** Are we only seeing successful cases? What about failures?\n` +
      `3. **Second-order effects:** What unintended consequences might this create?\n` +
      `4. **Reversibility:** If this goes wrong, can we undo it?\n\n` +
      `The cautious approach: validate assumptions before committing resources.`;
  }

  private generateOptimistView(input: string, p: AgentPersonality): string {
    return `**Opportunity Analysis:** "${input.substring(0, 50)}..." presents exciting possibilities:\n\n` +
      `1. **Growth potential:** This opens doors to ${this.identifyOpportunities(input)}\n` +
      `2. **Competitive advantage:** Early movers in this space gain significant benefits\n` +
      `3. **Network effects:** Success here could create positive feedback loops\n` +
      `4. **Learning opportunity:** Even if imperfect, attempting this teaches valuable lessons\n\n` +
      `The bold approach: move fast, iterate, and capture the opportunity before others do.`;
  }

  private generateEngineerView(input: string, p: AgentPersonality): string {
    return `**Technical Assessment:** For "${input.substring(0, 50)}...", here's the implementation reality:\n\n` +
      `1. **Requirements:** ${this.identifyRequirements(input)}\n` +
      `2. **Architecture:** Need to consider scalability, maintainability, and testability\n` +
      `3. **Timeline:** Realistic estimate depends on team size and existing infrastructure\n` +
      `4. **Risk mitigation:** Build incrementally, test at each stage, have rollback plans\n\n` +
      `The practical approach: start with MVP, validate core assumptions, then scale.`;
  }

  private generateArtistView(input: string, p: AgentPersonality): string {
    return `**Creative Reframing:** What if "${input.substring(0, 50)}..." isn't what it seems?\n\n` +
      `1. **What if we inverted it?** Instead of solving the stated problem, what if we made it disappear?\n` +
      `2. **What if we combined it?** This problem + [unrelated domain] = novel solution\n` +
      `3. **What if we scaled it?** At 1000x scale, the problem transforms entirely\n` +
      `4. **What if we simplified it?** Strip away everything non-essential — what remains?\n\n` +
      `The creative approach: don't solve the problem as stated — solve the problem that SHOULD have been asked.`;
  }

  private generateHistorianView(input: string, p: AgentPersonality): string {
    return `**Historical Pattern:** "${input.substring(0, 50)}..." echoes past situations:\n\n` +
      `1. **Precedent:** Similar challenges have been faced before in ${this.identifyDomain(input)}\n` +
      `2. **Pattern:** The typical trajectory is: initial enthusiasm → unexpected obstacles → adaptation → success (or failure)\n` +
      `3. **Lesson:** Those who succeeded focused on ${this.identifySuccessFactor(input)}\n` +
      `4. **Warning:** Those who failed ignored ${this.identifyFailureMode(input)}\n\n` +
      `The wisdom approach: learn from those who've walked this path before.`;
  }

  // Helper methods for generating specific content
  private identifyOpportunities(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('build') || lower.includes('create')) return 'new markets and user bases';
    if (lower.includes('improve') || lower.includes('optimize')) return 'efficiency gains and competitive advantage';
    if (lower.includes('learn') || lower.includes('understand')) return 'deeper expertise and novel applications';
    return 'untapped potential and first-mover advantage';
  }

  private identifyRequirements(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('code') || lower.includes('software')) return 'Technical stack, architecture decisions, testing strategy';
    if (lower.includes('business') || lower.includes('market')) return 'Market research, value proposition, go-to-market strategy';
    if (lower.includes('learn') || lower.includes('study')) return 'Curriculum design, practice schedule, feedback mechanisms';
    return 'Clear goals, resource allocation, timeline, success metrics';
  }

  private generateVerificationQuestions(input: string): string {
    return `(1) What evidence supports the core assumption? (2) What would disprove it? (3) Who disagrees and why?`;
  }

  private generateActionPlan(input: string): string {
    return `Start small → validate → scale. The first step is always the most important — begin today with the minimum viable action.`;
  }

  private generateTechnicalPlan(input: string): string {
    return `Define requirements → design architecture → implement incrementally → test continuously → deploy iteratively.`;
  }

  private generateCreativeDirection(input: string): string {
    return `Reframe the problem entirely. The best solution might not solve the stated problem — it might make it irrelevant.`;
  }

  private generateHistoricalLesson(input: string): string {
    return `Study what worked AND what failed in similar situations. The pattern is usually: success comes to those who adapt fastest.`;
  }

  private identifyDomain(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('tech') || lower.includes('software') || lower.includes('code')) return 'technology and software development';
    if (lower.includes('business') || lower.includes('market') || lower.includes('startup')) return 'business and entrepreneurship';
    if (lower.includes('science') || lower.includes('research')) return 'scientific research and discovery';
    return 'various domains throughout history';
  }

  private identifySuccessFactor(input: string): string {
    return 'adaptability, relentless execution, and willingness to pivot based on feedback';
  }

  private identifyFailureMode(input: string): string {
    return 'rigid adherence to initial plans, ignoring warning signs, and underestimating complexity';
  }

  // Synthesize all perspectives into a unified recommendation
  private synthesize(perspectives: AgentPerspective[], input: string): { synthesis: string; consensus: number; conflicts: string[]; recommendation: string } {
    const conflicts: string[] = [];
    
    // Identify conflicts (where agents disagree)
    if (perspectives.some(p => p.agent.id === 'skeptic') && perspectives.some(p => p.agent.id === 'optimist')) {
      conflicts.push('Risk tolerance: Skeptic urges caution while Optimist urges action');
    }
    if (perspectives.some(p => p.agent.id === 'engineer') && perspectives.some(p => p.agent.id === 'artist')) {
      conflicts.push('Approach: Engineer favors proven methods while Artist favors novel approaches');
    }

    // Calculate consensus level
    const recommendations = perspectives.map(p => p.recommendation);
    const uniqueKeywords = new Set<string>();
    for (const rec of recommendations) {
      const words = rec.toLowerCase().split(/\s+/).filter(w => w.length > 5);
      words.forEach(w => uniqueKeywords.add(w));
    }
    
    // Consensus = how much overlap in recommendations
    let totalOverlap = 0;
    for (let i = 0; i < recommendations.length; i++) {
      for (let j = i + 1; j < recommendations.length; j++) {
        const words1 = new Set(recommendations[i].toLowerCase().split(/\s+/).filter(w => w.length > 5));
        const words2 = new Set(recommendations[j].toLowerCase().split(/\s+/).filter(w => w.length > 5));
        const overlap = [...words1].filter(w => words2.has(w)).length;
        totalOverlap += overlap / Math.max(1, Math.min(words1.size, words2.size));
      }
    }
    const maxPairs = recommendations.length * (recommendations.length - 1) / 2;
    const consensus = Math.min(0.95, totalOverlap / Math.max(1, maxPairs) + 0.3);

    // Generate synthesis
    let synthesis = `**Hive Mind Synthesis:**\n\n`;
    synthesis += `**Question:** ${input}\n\n`;
    synthesis += `**Perspectives Considered:** ${perspectives.length}\n`;
    synthesis += `**Consensus Level:** ${(consensus * 100).toFixed(0)}%\n\n`;
    
    synthesis += `**Key Insights (aggregated):**\n`;
    const allInsights = perspectives.flatMap(p => p.keyInsights);
    const uniqueInsights = [...new Set(allInsights)];
    uniqueInsights.forEach((insight, i) => {
      synthesis += `  ${i + 1}. ${insight}\n`;
    });

    synthesis += `\n**Concerns Raised:**\n`;
    const allConcerns = perspectives.flatMap(p => p.concerns);
    const uniqueConcerns = [...new Set(allConcerns)];
    uniqueConcerns.forEach((concern, i) => {
      synthesis += `  ${i + 1}. ${concern}\n`;
    });

    if (conflicts.length > 0) {
      synthesis += `\n**Conflicts to Resolve:**\n`;
      conflicts.forEach((conflict, i) => {
        synthesis += `  ${i + 1}. ${conflict}\n`;
      });
    }

    // Generate final recommendation
    const recommendation = this.generateFinalRecommendation(perspectives, consensus);

    return { synthesis, consensus, conflicts, recommendation };
  }

  private generateFinalRecommendation(perspectives: AgentPerspective[], consensus: number): string {
    let rec = `**Final Recommendation:**\n\n`;
    
    if (consensus > 0.7) {
      rec += `Strong consensus among all perspectives. `;
    } else if (consensus > 0.5) {
      rec += `Moderate consensus with some disagreement. `;
    } else {
      rec += `Significant disagreement — multiple valid approaches exist. `;
    }

    rec += `Based on the collective wisdom of ${perspectives.length} perspectives:\n\n`;
    rec += `1. **Start with:** ${perspectives.find(p => p.agent.id === 'engineer')?.recommendation.split(': ')[1] || 'Clear planning'}\n`;
    rec += `2. **Watch for:** ${perspectives.find(p => p.agent.id === 'skeptic')?.concerns[0] || 'Hidden risks'}\n`;
    rec += `3. **Opportunity:** ${perspectives.find(p => p.agent.id === 'optimist')?.keyInsights[0] || 'Growth potential'}\n`;
    rec += `4. **Innovation:** ${perspectives.find(p => p.agent.id === 'artist')?.keyInsights[0] || 'Novel approaches'}\n`;
    rec += `5. **Wisdom:** ${perspectives.find(p => p.agent.id === 'historian')?.recommendation.split(': ')[1] || 'Learn from precedent'}\n`;

    return rec;
  }

  // Main hive function
  consult(input: string): HiveResult {
    // Each agent generates their perspective
    const perspectives: AgentPerspective[] = this.agents.map(agent => {
      const role = AGENTS.find(a => a.id === agent.id)?.role || '';
      return this.generatePerspective(agent, input, role);
    });

    // Synthesize all perspectives
    const { synthesis, consensus, conflicts, recommendation } = this.synthesize(perspectives, input);

    const result: HiveResult = {
      input,
      perspectives,
      synthesis,
      consensusLevel: consensus,
      conflicts,
      finalRecommendation: recommendation,
    };

    this.history.push(result);
    return result;
  }

  getStats() {
    return {
      agents: this.agents.length,
      consultations: this.history.length,
      averageConsensus: this.history.length > 0
        ? this.history.reduce((s, h) => s + h.consensusLevel, 0) / this.history.length
        : 0,
    };
  }
}
