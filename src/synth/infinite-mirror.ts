// ============================================
// INFINITE MIRROR — Autonomous Self-Improvement Engine
// Every response → self-evaluate → root cause → adjust → improve
// Opus is frozen between updates. Synth improves EVERY day.
// ============================================

export type EvalDimension = 'accuracy' | 'completeness' | 'clarity' | 'relevance' | 'efficiency' | 'creativity';

export interface QualityScore {
  dimension: EvalDimension;
  score: number;        // 0-1
  evidence: string;     // Why this score
  suggestions: string[];// How to improve
}

export interface SelfEvaluation {
  input: string;
  output: string;
  scores: QualityScore[];
  overallScore: number;
  timestamp: number;
  passed: boolean;
}

export interface RootCause {
  dimension: EvalDimension;
  cause: string;
  module: string;       // Which module caused the issue
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix: string;
}

export interface Adjustment {
  module: string;
  parameter: string;
  oldValue: number;
  newValue: number;
  reason: string;
  timestamp: number;
}

export interface ImprovementReport {
  period: string;
  evaluationsCount: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
  adjustments: Adjustment[];
  topIssues: RootCause[];
  recommendations: string[];
}

export class InfiniteMirror {
  private evaluations: SelfEvaluation[] = [];
  private adjustments: Adjustment[] = [];
  private moduleWeights: Map<string, number> = new Map();
  private dimensionWeights: Map<EvalDimension, number> = new Map();
  private improvementHistory: Array<{ week: number; score: number }> = [];
  private weekCounter = 0;

  constructor() {
    // Initialize module weights
    const modules = [
      'intent_classifier', 'context_tracker', 'reasoning_engine',
      'code_generator', 'knowledge_base', 'creativity_engine',
      'parliament', 'code_forge', 'gene_splicer',
    ];
    for (const mod of modules) {
      this.moduleWeights.set(mod, 0.7); // Start at 70% — room to grow
    }

    // Initialize dimension weights
    const dimensions: EvalDimension[] = ['accuracy', 'completeness', 'clarity', 'relevance', 'efficiency', 'creativity'];
    for (const dim of dimensions) {
      this.dimensionWeights.set(dim, 1.0); // All dimensions equally important initially
    }
  }

  // Evaluate a response across 6 dimensions
  evaluate(input: string, output: string): SelfEvaluation {
    const scores: QualityScore[] = [];
    const lowerInput = input.toLowerCase();
    const lowerOutput = output.toLowerCase();

    // 1. ACCURACY — Is the output factually correct?
    const accuracyScore = this.evaluateAccuracy(lowerInput, lowerOutput);
    scores.push(accuracyScore);

    // 2. COMPLETENESS — Does it address all parts of the question?
    const completenessScore = this.evaluateCompleteness(lowerInput, lowerOutput);
    scores.push(completenessScore);

    // 3. CLARITY — Is it easy to understand?
    const clarityScore = this.evaluateClarity(lowerOutput);
    scores.push(clarityScore);

    // 4. RELEVANCE — Does it actually answer what was asked?
    const relevanceScore = this.evaluateRelevance(lowerInput, lowerOutput);
    scores.push(relevanceScore);

    // 5. EFFICIENCY — Is it concise without being sparse?
    const efficiencyScore = this.evaluateEfficiency(lowerInput, lowerOutput);
    scores.push(efficiencyScore);

    // 6. CREATIVITY — Does it offer novel insights?
    const creativityScore = this.evaluateCreativity(lowerInput, lowerOutput);
    scores.push(creativityScore);

    // Overall score (weighted average)
    const overallScore = scores.reduce((sum, s) => sum + s.score * (this.dimensionWeights.get(s.dimension) || 1), 0) 
      / scores.reduce((sum, s) => sum + (this.dimensionWeights.get(s.dimension) || 1), 0);

    const evaluation: SelfEvaluation = {
      input,
      output,
      scores,
      overallScore,
      timestamp: Date.now(),
      passed: overallScore >= 0.7,
    };

    this.evaluations.push(evaluation);
    
    // Keep last 500 evaluations
    if (this.evaluations.length > 500) {
      this.evaluations.shift();
    }

    return evaluation;
  }

  private evaluateAccuracy(input: string, output: string): QualityScore {
    let score = 0.7; // Base score
    const evidence: string[] = [];
    const suggestions: string[] = [];

    // Check for hedging language (indicates uncertainty)
    const hedges = (output.match(/\b(maybe|perhaps|possibly|might|could be|not sure|i think)\b/g) || []).length;
    if (hedges > 2) {
      score -= 0.1;
      evidence.push('Multiple hedging phrases detected — may indicate uncertainty');
      suggestions.push('Strengthen claims with evidence or explicitly state confidence level');
    }

    // Check for contradiction markers
    if (output.includes('however') && output.includes('but') && output.includes('contradict')) {
      score -= 0.15;
      evidence.push('Internal contradictions detected');
      suggestions.push('Resolve contradictions before outputting');
    }

    // Check for specificity (specific = more likely accurate)
    const numbers = (output.match(/\d+/g) || []).length;
    const specificTerms = (output.match(/\b(specifically|exactly|precisely|defined as)\b/g) || []).length;
    if (numbers > 0 || specificTerms > 0) {
      score += 0.1;
      evidence.push('Contains specific details — higher accuracy signal');
    }

    // Check if output addresses the input topic
    const inputWords = input.split(/\s+/).filter(w => w.length > 4);
    const outputWords = new Set(output.split(/\s+/));
    const topicOverlap = inputWords.filter(w => outputWords.has(w)).length / Math.max(1, inputWords.length);
    if (topicOverlap > 0.3) {
      score += 0.05;
      evidence.push('Output stays on topic');
    } else {
      score -= 0.1;
      evidence.push('Output may drift from topic');
      suggestions.push('Ensure response directly addresses the question');
    }

    return {
      dimension: 'accuracy',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'No specific accuracy signals detected',
      suggestions,
    };
  }

  private evaluateCompleteness(input: string, output: string): QualityScore {
    let score = 0.6;
    const evidence: string[] = [];
    const suggestions: string[] = [];

    // Count question marks / sub-questions in input
    const subQuestions = (input.match(/\?/g) || []).length;
    const inputParts = input.split(/[?!.]/).filter(s => s.trim().length > 5);
    
    // Check if output addresses each part
    let addressedParts = 0;
    for (const part of inputParts) {
      const keywords = part.split(/\s+/).filter(w => w.length > 4);
      const matchCount = keywords.filter(w => output.toLowerCase().includes(w.toLowerCase())).length;
      if (matchCount / Math.max(1, keywords.length) > 0.3) {
        addressedParts++;
      }
    }

    const coverageRatio = addressedParts / Math.max(1, inputParts.length);
    score = 0.4 + coverageRatio * 0.5;

    if (coverageRatio < 0.5) {
      evidence.push(`Only ${addressedParts}/${inputParts.length} parts of the question addressed`);
      suggestions.push('Break down the question and ensure each part gets a response');
    } else if (coverageRatio >= 0.8) {
      evidence.push(`Comprehensive coverage: ${addressedParts}/${inputParts.length} parts addressed`);
      score += 0.1;
    }

    // Check output length relative to input complexity
    const inputComplexity = input.split(/\s+/).length;
    const outputLength = output.split(/\s+/).length;
    if (outputLength < inputComplexity * 0.5 && inputComplexity > 10) {
      score -= 0.1;
      evidence.push('Output may be too brief for the complexity of the question');
      suggestions.push('Expand on key points for complex questions');
    }

    return {
      dimension: 'completeness',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'Adequate coverage detected',
      suggestions,
    };
  }

  private evaluateClarity(output: string): QualityScore {
    let score = 0.7;
    const evidence: string[] = [];
    const suggestions: string[] = [];

    // Sentence length analysis
    const sentences = output.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length);
    
    if (avgSentenceLength > 30) {
      score -= 0.15;
      evidence.push(`Average sentence length is ${avgSentenceLength.toFixed(0)} words — too long`);
      suggestions.push('Break long sentences into shorter ones');
    } else if (avgSentenceLength < 8 && sentences.length > 3) {
      score -= 0.05;
      evidence.push('Very short sentences — may feel choppy');
      suggestions.push('Vary sentence length for better flow');
    } else {
      score += 0.1;
      evidence.push(`Good sentence length: avg ${avgSentenceLength.toFixed(0)} words`);
    }

    // Check for structure (headers, lists, paragraphs)
    const hasStructure = output.includes('**') || output.includes('- ') || output.includes('\n\n');
    if (hasStructure) {
      score += 0.1;
      evidence.push('Uses formatting structure — improves readability');
    }

    // Jargon check
    const jargon = (output.match(/\b(paradigm|utilize|leverage|synergy|holistic|robust|scalable)\b/g) || []).length;
    if (jargon > 2) {
      score -= 0.1;
      evidence.push('Heavy jargon usage may reduce accessibility');
      suggestions.push('Replace jargon with simpler alternatives where possible');
    }

    return {
      dimension: 'clarity',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'Standard clarity',
      suggestions,
    };
  }

  private evaluateRelevance(input: string, output: string): QualityScore {
    let score = 0.6;
    const evidence: string[] = [];
    const suggestions: string[] = [];

    // Topic word overlap
    const inputWords = new Set(input.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const outputWords = output.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const overlap = outputWords.filter(w => inputWords.has(w)).length;
    const relevanceRatio = overlap / Math.max(1, inputWords.size);

    if (relevanceRatio > 0.3) {
      score += 0.2;
      evidence.push(`High topic overlap: ${overlap} shared keywords`);
    } else if (relevanceRatio < 0.1) {
      score -= 0.2;
      evidence.push('Low topic overlap — response may be off-topic');
      suggestions.push('Ensure response directly addresses the question topic');
    }

    // Check for irrelevant content (generic filler)
    const fillerPhrases = (output.match(/\b(in today's world|it is important to note|as we all know|needless to say)\b/g) || []).length;
    if (fillerPhrases > 0) {
      score -= 0.1 * fillerPhrases;
      evidence.push('Contains filler phrases that add no value');
      suggestions.push('Remove generic filler — every sentence should add value');
    }

    // Check if output starts by addressing the question
    const firstSentence = output.split(/[.!?]/)[0] || '';
    const firstWords = firstSentence.split(/\s+/).filter(w => w.length > 3);
    const firstRelevance = firstWords.filter(w => inputWords.has(w.toLowerCase())).length;
    if (firstRelevance > 0) {
      score += 0.1;
      evidence.push('Opens by addressing the question directly');
    }

    return {
      dimension: 'relevance',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'Moderate relevance',
      suggestions,
    };
  }

  private evaluateEfficiency(input: string, output: string): QualityScore {
    let score = 0.7;
    const evidence: string[] = [];
    const suggestions: string[] = [];

    const inputWords = input.split(/\s+/).length;
    const outputWords = output.split(/\s+/).length;
    const ratio = outputWords / Math.max(1, inputWords);

    // Ideal ratio: 1-3x input length for simple questions, 3-5x for complex
    if (ratio > 5) {
      score -= 0.15;
      evidence.push(`Output is ${ratio.toFixed(1)}x input length — may be verbose`);
      suggestions.push('Condense — aim for maximum information density');
    } else if (ratio < 0.5 && inputWords > 10) {
      score -= 0.1;
      evidence.push(`Output is only ${ratio.toFixed(1)}x input — may be too brief`);
      suggestions.push('Expand on key points');
    } else {
      score += 0.1;
      evidence.push(`Good length ratio: ${ratio.toFixed(1)}x`);
    }

    // Check for repetition
    const words = output.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    for (const w of words) {
      if (w.length > 4) wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }
    const repeated = Array.from(wordFreq.entries()).filter(([, count]) => count > 3);
    if (repeated.length > 2) {
      score -= 0.1;
      evidence.push('Repeated words/phrases detected — possible redundancy');
      suggestions.push('Use synonyms or restructure to avoid repetition');
    }

    return {
      dimension: 'efficiency',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'Efficient output',
      suggestions,
    };
  }

  private evaluateCreativity(input: string, output: string): QualityScore {
    let score = 0.5;
    const evidence: string[] = [];
    const suggestions: string[] = [];

    // Check for novel combinations (words from different domains appearing together)
    const technicalWords = (output.match(/\b(algorithm|function|variable|data|structure|pattern|system)\b/g) || []).length;
    const creativeWords = (output.match(/\b(imagine|what if|consider|perhaps|unexpected|novel|creative|unique)\b/g) || []).length;
    
    if (technicalWords > 0 && creativeWords > 0) {
      score += 0.15;
      evidence.push('Combines technical and creative language — cross-domain thinking');
    }

    // Check for analogies/metaphors
    const analogyMarkers = (output.match(/\b(like|similar to|analogous to|just as|think of it as)\b/g) || []).length;
    if (analogyMarkers > 0) {
      score += 0.15;
      evidence.push('Uses analogies — indicates creative thinking');
    }

    // Check for multiple perspectives
    const perspectiveMarkers = (output.match(/\b(from another angle|alternatively|on the other hand|conversely|another way)\b/g) || []).length;
    if (perspectiveMarkers > 0) {
      score += 0.1;
      evidence.push('Presents multiple perspectives');
    }

    // Penalize generic/template responses
    if (output.length < 50 && input.length > 20) {
      score -= 0.1;
      evidence.push('Short generic response to complex input');
      suggestions.push('Provide more specific, tailored response');
    }

    return {
      dimension: 'creativity',
      score: Math.max(0, Math.min(1, score)),
      evidence: evidence.join('; ') || 'Standard response',
      suggestions,
    };
  }

  // Root cause analysis — trace failures to specific modules
  analyzeRootCause(evaluation: SelfEvaluation): RootCause[] {
    const causes: RootCause[] = [];

    for (const score of evaluation.scores) {
      if (score.score < 0.6) {
        // Map low dimension scores to responsible modules
        const moduleMap: Record<EvalDimension, string> = {
          accuracy: 'reasoning_engine',
          completeness: 'context_tracker',
          clarity: 'intent_classifier',
          relevance: 'intent_classifier',
          efficiency: 'code_generator',
          creativity: 'creativity_engine',
        };

        const severity: RootCause['severity'] = 
          score.score < 0.3 ? 'critical' :
          score.score < 0.4 ? 'high' :
          score.score < 0.5 ? 'medium' : 'low';

        causes.push({
          dimension: score.dimension,
          cause: score.evidence,
          module: moduleMap[score.dimension],
          severity,
          fix: score.suggestions[0] || `Improve ${score.dimension} scoring`,
        });
      }
    }

    return causes;
  }

  // Adjust module weights based on root cause analysis
  adjustWeights(causes: RootCause[]): Adjustment[] {
    const adjustments: Adjustment[] = [];

    for (const cause of causes) {
      const currentWeight = this.moduleWeights.get(cause.module) || 0.7;
      let newWeight = currentWeight;

      // Reduce weight for modules causing problems
      switch (cause.severity) {
        case 'critical': newWeight = Math.max(0.1, currentWeight - 0.15); break;
        case 'high': newWeight = Math.max(0.1, currentWeight - 0.1); break;
        case 'medium': newWeight = Math.max(0.1, currentWeight - 0.05); break;
        case 'low': newWeight = Math.max(0.1, currentWeight - 0.02); break;
      }

      if (newWeight !== currentWeight) {
        this.moduleWeights.set(cause.module, newWeight);
        adjustments.push({
          module: cause.module,
          parameter: 'weight',
          oldValue: currentWeight,
          newValue: newWeight,
          reason: `${cause.severity} issue in ${cause.dimension}: ${cause.cause.substring(0, 50)}`,
          timestamp: Date.now(),
        });
      }
    }

    // Boost modules that are performing well
    const recentEvals = this.evaluations.slice(-10);
    if (recentEvals.length >= 5) {
      const avgScore = recentEvals.reduce((s, e) => s + e.overallScore, 0) / recentEvals.length;
      if (avgScore > 0.8) {
        // Things are going well — slightly boost all modules
        for (const [mod, weight] of this.moduleWeights) {
          const newWeight = Math.min(1, weight + 0.01);
          if (newWeight !== weight) {
            this.moduleWeights.set(mod, newWeight);
          }
        }
      }
    }

    this.adjustments.push(...adjustments);
    return adjustments;
  }

  // Run the full improvement cycle
  improve(input: string, output: string): { evaluation: SelfEvaluation; causes: RootCause[]; adjustments: Adjustment[] } {
    // Step 1: Evaluate
    const evaluation = this.evaluate(input, output);

    // Step 2: Root cause analysis (only if failed)
    let causes: RootCause[] = [];
    let adjustments: Adjustment[] = [];
    
    if (!evaluation.passed) {
      causes = this.analyzeRootCause(evaluation);
      adjustments = this.adjustWeights(causes);
    }

    return { evaluation, causes, adjustments };
  }

  // Weekly self-audit
  weeklyAudit(): ImprovementReport {
    this.weekCounter++;
    const recentEvals = this.evaluations.slice(-50); // Last 50 evaluations
    
    if (recentEvals.length === 0) {
      return {
        period: `Week ${this.weekCounter}`,
        evaluationsCount: 0,
        averageScore: 0,
        trend: 'stable',
        adjustments: [],
        topIssues: [],
        recommendations: ['No evaluations yet — system needs interactions to improve'],
      };
    }

    const avgScore = recentEvals.reduce((s, e) => s + e.overallScore, 0) / recentEvals.length;
    
    // Determine trend
    const firstHalf = recentEvals.slice(0, Math.floor(recentEvals.length / 2));
    const secondHalf = recentEvals.slice(Math.floor(recentEvals.length / 2));
    const firstAvg = firstHalf.reduce((s, e) => s + e.overallScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, e) => s + e.overallScore, 0) / secondHalf.length;
    
    const trend: ImprovementReport['trend'] = 
      secondAvg > firstAvg + 0.02 ? 'improving' :
      secondAvg < firstAvg - 0.02 ? 'declining' : 'stable';

    this.improvementHistory.push({ week: this.weekCounter, score: avgScore });

    // Find top issues
    const allCauses: RootCause[] = [];
    for (const eval_ of recentEvals.filter(e => !e.passed)) {
      allCauses.push(...this.analyzeRootCause(eval_));
    }
    const topIssues = allCauses.slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    if (trend === 'declining') {
      recommendations.push('Performance declining — review recent adjustments for overcorrection');
    }
    if (avgScore < 0.6) {
      recommendations.push('Overall quality below target — prioritize accuracy and completeness improvements');
    }
    if (topIssues.length > 0) {
      const mostCommonModule = topIssues.reduce((best, c) => {
        const count = topIssues.filter(i => i.module === c.module).length;
        return count > best.count ? { module: c.module, count } : best;
      }, { module: '', count: 0 });
      recommendations.push(`Module "${mostCommonModule.module}" needs attention — appears in ${mostCommonModule.count} recent issues`);
    }
    if (trend === 'improving') {
      recommendations.push('System improving — continue current trajectory. Consider increasing challenge level.');
    }

    return {
      period: `Week ${this.weekCounter}`,
      evaluationsCount: recentEvals.length,
      averageScore: avgScore,
      trend,
      adjustments: this.adjustments.slice(-10),
      topIssues,
      recommendations,
    };
  }

  // Get current state
  getState() {
    const recentEvals = this.evaluations.slice(-20);
    const avgScore = recentEvals.length > 0 
      ? recentEvals.reduce((s, e) => s + e.overallScore, 0) / recentEvals.length 
      : 0;

    return {
      totalEvaluations: this.evaluations.length,
      recentAverage: avgScore,
      passRate: this.evaluations.length > 0 
        ? this.evaluations.filter(e => e.passed).length / this.evaluations.length 
        : 0,
      moduleWeights: Object.fromEntries(this.moduleWeights),
      totalAdjustments: this.adjustments.length,
      trend: this.improvementHistory.length >= 2 
        ? (this.improvementHistory[this.improvementHistory.length - 1].score > this.improvementHistory[this.improvementHistory.length - 2].score ? 'improving' : 'stable')
        : 'insufficient_data',
    };
  }
}
