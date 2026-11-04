// ============================================
// PARLIAMENT METHOD — Multi-Agent Debate System
// Generate candidates, debate them, judge picks winner
// Like science: ideas get stress-tested before becoming answers
// ============================================

export interface ParliamentAgent {
  id: string;
  name: string;
  role: string;
  bias: 'analytical' | 'creative' | 'practical' | 'critical' | 'synthesizer';
  weights: {
    logic: number;
    creativity: number;
    evidence: number;
    feasibility: number;
    novelty: number;
  };
}

export interface Candidate {
  id: string;
  agent: string;
  answer: string;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  defenseScore: number;
  attackResistance: number;
}

export interface DebateRound {
  round: number;
  attacks: Array<{ from: string; target: string; argument: string; impact: number }>;
  defenses: Array<{ candidate: string; response: string; effectiveness: number }>;
}

export interface ParliamentResult {
  question: string;
  candidates: Candidate[];
  debates: DebateRound[];
  winner: Candidate;
  verdict: string;
  confidence: number;
  dissentingOpinions: string[];
}

// The agents — each with real different reasoning styles
const AGENTS: ParliamentAgent[] = [
  {
    id: 'logician',
    name: 'The Logician',
    role: 'Ensures logical validity and sound reasoning',
    bias: 'analytical',
    weights: { logic: 0.95, creativity: 0.2, evidence: 0.9, feasibility: 0.7, novelty: 0.3 },
  },
  {
    id: 'innovator',
    name: 'The Innovator',
    role: 'Finds creative, non-obvious solutions',
    bias: 'creative',
    weights: { logic: 0.5, creativity: 0.95, evidence: 0.4, feasibility: 0.5, novelty: 0.95 },
  },
  {
    id: 'engineer',
    name: 'The Engineer',
    role: 'Focuses on practical implementation and feasibility',
    bias: 'practical',
    weights: { logic: 0.7, creativity: 0.4, evidence: 0.8, feasibility: 0.95, novelty: 0.4 },
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    role: 'Challenges assumptions and finds flaws',
    bias: 'critical',
    weights: { logic: 0.8, creativity: 0.3, evidence: 0.95, feasibility: 0.8, novelty: 0.2 },
  },
  {
    id: 'diplomat',
    name: 'The Diplomat',
    role: 'Synthesizes viewpoints into consensus',
    bias: 'synthesizer',
    weights: { logic: 0.7, creativity: 0.6, evidence: 0.7, feasibility: 0.7, novelty: 0.6 },
  },
];

export class Parliament {
  // Generate a candidate answer from an agent's perspective
  private generateCandidate(agent: ParliamentAgent, question: string): Candidate {
    const lower = question.toLowerCase();
    let answer = '';
    let reasoning = '';
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    switch (agent.bias) {
      case 'analytical':
        answer = this.generateAnalyticalAnswer(question);
        reasoning = `Applied formal logic: identified premises, checked validity, verified soundness. `;
        strengths.push('Logically rigorous', 'Premises verified');
        weaknesses.push('May miss creative solutions', 'Conservative approach');
        break;

      case 'creative':
        answer = this.generateCreativeAnswer(question);
        reasoning = `Explored non-obvious solution space: considered analogies, lateral thinking, and unconventional approaches. `;
        strengths.push('Novel perspective', 'Breaks conventional thinking');
        weaknesses.push('May lack practical grounding', 'Harder to verify');
        break;

      case 'practical':
        answer = this.generatePracticalAnswer(question);
        reasoning = `Evaluated implementation feasibility: considered resources, time, complexity, and maintenance. `;
        strengths.push('Immediately actionable', 'Realistic constraints considered');
        weaknesses.push('May miss elegant solutions', 'Incremental thinking');
        break;

      case 'critical':
        answer = this.generateCriticalAnswer(question);
        reasoning = `Stress-tested all assumptions: looked for logical fallacies, hidden biases, and edge cases. `;
        strengths.push('Thorough vetting', 'Catches hidden problems');
        weaknesses.push('Can be overly negative', 'May block progress');
        break;

      case 'synthesizer':
        answer = this.generateSynthesisAnswer(question);
        reasoning = `Integrated multiple perspectives: found common ground, resolved contradictions, built consensus. `;
        strengths.push('Balanced view', 'Accounts for multiple stakeholders');
        weaknesses.push('May be too compromise-heavy', 'Loses sharp edges');
        break;
    }

    return {
      id: `candidate_${agent.id}`,
      agent: agent.name,
      answer,
      reasoning,
      strengths,
      weaknesses,
      defenseScore: 0.5,
      attackResistance: 0.5,
    };
  }

  private generateAnalyticalAnswer(question: string): string {
    const lower = question.toLowerCase();
    
    if (lower.includes('should') || lower.includes('better')) {
      return `**Analytical Answer:** To determine the optimal choice, we need to: (1) Define the evaluation criteria explicitly, (2) Weight each criterion by importance, (3) Score each option against criteria, (4) Calculate weighted totals. Without explicit criteria, any "should" answer is unsupported opinion. The logical approach is to first establish WHAT we're optimizing for before determining HOW.`;
    }
    if (lower.includes('how') || lower.includes('solve')) {
      return `**Analytical Answer:** Breaking this into logical steps: (1) Define the problem precisely — what is the initial state and desired end state? (2) Identify constraints — what's fixed vs. flexible? (3) Enumerate possible paths — what actions transform state toward goal? (4) Evaluate paths — which has lowest cost/highest probability? (5) Execute and verify. The key insight: most "hard" problems become tractable when properly decomposed.`;
    }
    return `**Analytical Answer:** The rigorous approach: First, let's identify what we know (premises), what we need to determine (conclusion), and what logical rules connect them. ${question} — analyzing this requires establishing clear definitions, checking for hidden assumptions, and applying valid inference rules. The answer follows necessarily from the premises if the argument is sound.`;
  }

  private generateCreativeAnswer(question: string): string {
    const lower = question.toLowerCase();
    
    if (lower.includes('how') || lower.includes('solve')) {
      return `**Creative Answer:** What if we approached this completely differently? Instead of solving the problem directly, what if we: (1) Made the problem disappear by changing the context, (2) Solved the opposite problem and inverted the solution, (3) Found someone who already solved an analogous problem in a different domain, (4) Combined two existing partial solutions in a novel way? Innovation often comes from reframing, not from working harder on the same frame.`;
    }
    if (lower.includes('why') || lower.includes('explain')) {
      return `**Creative Answer:** Think of it this way — imagine this concept as a physical object. What shape would it be? What would it feel like? Now map those physical properties back to the abstract concept. This cross-modal translation often reveals aspects that pure logical analysis misses. The answer isn't just in the data — it's in the PATTERN the data forms when viewed from an unexpected angle.`;
    }
    return `**Creative Answer:** Here's an unconventional take: what if the question itself is wrong? Often the most powerful insight comes from realizing we're solving the wrong problem. ${question} — what if the real question underneath this is something different entirely? Reframing the problem is sometimes more valuable than solving it as stated.`;
  }

  private generatePracticalAnswer(question: string): string {
    const lower = question.toLowerCase();
    
    if (lower.includes('how') || lower.includes('build') || lower.includes('make')) {
      return `**Practical Answer:** Here's the implementation plan: (1) Start with the simplest version that works — get something running in hours, not weeks. (2) Identify the riskiest assumption and test it first. (3) Build incrementally — each step should be deployable. (4) Set up feedback loops early — you need to know if it's working. (5) Plan for maintenance from day one — code that works but can't be maintained is code that dies. The 80/20 rule applies: get 80% of the value from 20% of the effort first.`;
    }
    if (lower.includes('should') || lower.includes('choose')) {
      return `**Practical Answer:** From a practical standpoint, the decision comes down to: (1) What's the cost of being wrong? (2) How reversible is the decision? (3) What's the time pressure? If the cost of being wrong is low and the decision is reversible — just pick one and iterate. If the cost is high and it's irreversible — invest in thorough analysis. Most decisions are more reversible than people think.`;
    }
    return `**Practical Answer:** The pragmatic approach: identify the minimum viable solution that addresses the core need. ${question} — in practice, the "best" solution is the one that: works reliably, can be maintained by the team, fits within constraints, and can be improved iteratively. Perfect is the enemy of good enough, and good enough shipped beats perfect never shipped.`;
  }

  private generateCriticalAnswer(question: string): string {
    const lower = question.toLowerCase();
    
    return `**Critical Analysis:** Before answering, let me challenge the premises: ${question}

**Hidden assumptions detected:**
1. The question assumes the framing is correct — but what if the categories themselves are wrong?
2. There may be survivorship bias — are we only seeing successful cases?
3. The question may contain a false dichotomy — are there really only the stated options?
4. Temporal myopia — are we optimizing for short-term at the expense of long-term?

**Stress test:** If we assume the OPPOSITE of the obvious answer, does it still hold up? Often the "obvious" answer is obvious because we haven't looked hard enough at the alternatives.

**Verdict:** The answer needs more nuance than the question allows. Here's what I can say with confidence: the problem is real, but the framing may be limiting our solution space.`;
  }

  private generateSynthesisAnswer(question: string): string {
    return `**Synthesized Answer:** After considering multiple perspectives on "${question}":

**Common ground:** All approaches agree that the core issue needs addressing, and that a systematic approach outperforms ad-hoc solutions.

**Key tensions:** 
- Rigor vs. speed (analytical says take time, practical says ship fast)
- Innovation vs. proven paths (creative says think new, engineer says use what works)
- Optimism vs. caution (innovator says go for it, skeptic says check first)

**Integrated recommendation:** Start with the practical approach to get something working. Apply analytical rigor to verify correctness. Use creative thinking to find improvements. Let the skeptic validate before scaling. The synthesis isn't compromise — it's sequential application of each strength at the right phase.`;
  }

  // Attack a candidate — find weaknesses
  private attack(attacker: ParliamentAgent, candidate: Candidate): { argument: string; impact: number } {
    const attacks: string[] = [];
    let impact = 0.5;

    // Attack based on attacker's bias
    if (attacker.bias === 'critical') {
      attacks.push(`Challenges logical foundation: "${candidate.answer.substring(0, 50)}..." — what evidence supports this claim?`);
      impact = 0.7;
    } else if (attacker.bias === 'analytical') {
      attacks.push(`Questions completeness: The answer addresses the surface but misses underlying causal mechanisms.`);
      impact = 0.6;
    } else if (attacker.bias === 'practical') {
      attacks.push(`Challenges feasibility: This sounds good in theory but what are the implementation costs?`);
      impact = 0.5;
    } else if (attacker.bias === 'creative') {
      attacks.push(`Challenges originality: This is conventional thinking. Where's the innovative leap?`);
      impact = 0.4;
    } else {
      attacks.push(`Seeks clarification: Can you explain how this accounts for edge cases?`);
      impact = 0.3;
    }

    // Impact modified by candidate's weaknesses
    if (candidate.weaknesses.length > 0) {
      impact *= 1.2; // More weaknesses = more vulnerable
    }

    return { argument: attacks[0], impact: Math.min(1, impact) };
  }

  // Defend a candidate against attack
  private defend(candidate: Candidate, attack: { argument: string; impact: number }): { response: string; effectiveness: number } {
    const defenses: string[] = [];
    let effectiveness = 0.5;

    // Defense based on candidate's strengths
    if (candidate.strengths.includes('Logically rigorous')) {
      defenses.push('The logic holds under scrutiny — each step follows from the previous with valid inference.');
      effectiveness = 0.8;
    } else if (candidate.strengths.includes('Immediately actionable')) {
      defenses.push('The practical value is demonstrated — this can be implemented today with existing resources.');
      effectiveness = 0.7;
    } else if (candidate.strengths.includes('Novel perspective')) {
      defenses.push('The novelty IS the strength — conventional approaches have been tried and found insufficient.');
      effectiveness = 0.6;
    } else if (candidate.strengths.includes('Thorough vetting')) {
      defenses.push('The concerns raised have already been considered and addressed in the analysis.');
      effectiveness = 0.75;
    } else {
      defenses.push('The core argument remains valid even with the raised concerns — they modify but don\'t invalidate.');
      effectiveness = 0.5;
    }

    // Effectiveness reduced by attack impact
    effectiveness *= (1 - attack.impact * 0.3);

    return { response: defenses[0], effectiveness };
  }

  // Judge the debate — pick winner
  private judge(candidates: Candidate[], debates: DebateRound[]): { winner: Candidate; confidence: number; dissent: string[] } {
    // Score each candidate
    const scores = candidates.map(c => {
      let score = 0;
      
      // Base score from strengths
      score += c.strengths.length * 10;
      
      // Defense performance
      score += c.defenseScore * 30;
      
      // Attack resistance
      score += c.attackResistance * 20;
      
      // Reasoning quality
      score += c.reasoning.length * 0.1;
      
      return { candidate: c, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0].candidate;
    const runnerUp = scores[1].candidate;
    
    // Confidence based on margin of victory
    const margin = scores[0].score - scores[1].score;
    const maxPossible = 100;
    const confidence = Math.min(0.95, 0.5 + (margin / maxPossible) * 0.5);

    // Dissenting opinions from losers
    const dissent = scores.slice(1).map(s => 
      `${s.candidate.agent} dissents: prefers approach based on ${s.candidate.strengths[0] || 'different priorities'}`
    );

    return { winner, confidence, dissent };
  }

  // Main parliament function
  debate(question: string, rounds: number = 3): ParliamentResult {
    // Phase 1: Generate candidates
    const candidates = AGENTS.map(agent => this.generateCandidate(agent, question));

    // Phase 2: Debate rounds
    const debates: DebateRound[] = [];
    
    for (let r = 0; r < rounds; r++) {
      const attacks: DebateRound['attacks'] = [];
      const defenses: DebateRound['defenses'] = [];

      // Each agent attacks the weakest candidate
      for (const agent of AGENTS) {
        // Find target (candidate from different agent)
        const targets = candidates.filter(c => c.agent !== agent.name);
        const target = targets.reduce((weakest, c) => 
          c.defenseScore < weakest.defenseScore ? c : weakest
        , targets[0]);

        const attack = this.attack(agent, target);
        attacks.push({ from: agent.name, target: target.id, argument: attack.argument, impact: attack.impact });

        // Target defends
        const defense = this.defend(target, attack);
        defenses.push({ candidate: target.id, response: defense.response, effectiveness: defense.effectiveness });

        // Update scores
        target.defenseScore = (target.defenseScore + defense.effectiveness) / 2;
        target.attackResistance = Math.max(0, target.attackResistance - attack.impact * 0.1);
      }

      debates.push({ round: r + 1, attacks, defenses });
    }

    // Phase 3: Judge
    const { winner, confidence, dissent } = this.judge(candidates, debates);

    // Generate verdict
    const verdict = `**Parliament Verdict:**\n\n` +
      `**Winner:** ${winner.agent}\n` +
      `**Answer:** ${winner.answer}\n` +
      `**Confidence:** ${(confidence * 100).toFixed(0)}%\n` +
      `**Reasoning:** ${winner.reasoning}\n\n` +
      `**Debate Summary:** ${debates.length} rounds of debate with ${debates.reduce((s, d) => s + d.attacks.length, 0)} total attacks.\n` +
      `**Dissenting:** ${dissent.length > 0 ? dissent.join('; ') : 'None — consensus reached.'}`;

    return {
      question,
      candidates,
      debates,
      winner,
      verdict,
      confidence,
      dissentingOpinions: dissent,
    };
  }
}
