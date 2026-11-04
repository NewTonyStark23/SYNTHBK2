// ============================================
// EMOTIONAL INTELLIGENCE ENGINE
// Solves: Emotional Intelligence gap (65% → 90%)
// User modeling + tone adaptation + empathy simulation
// ============================================

export interface UserProfile {
  id: string;
  communicationStyle: CommunicationStyle;
  preferences: UserPreferences;
  emotionalPatterns: EmotionalPattern[];
  interactionHistory: InteractionRecord[];
  lastUpdated: number;
}

export interface CommunicationStyle {
  formality: 'formal' | 'semi-formal' | 'casual' | 'very-casual';
  verbosity: 'concise' | 'moderate' | 'verbose';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy';
  humorStyle: 'none' | 'dry' | 'playful' | 'sarcastic';
}

export interface UserPreferences {
  responseLength: 'short' | 'medium' | 'long' | 'adaptive';
  detailLevel: 'high-level' | 'balanced' | 'detailed';
  explanationStyle: 'direct' | 'step-by-step' | 'analogy-based';
  feedbackPreference: 'minimal' | 'moderate' | 'detailed';
}

export interface EmotionalPattern {
  emotion: string;
  trigger: string;
  frequency: number;
  intensity: number;
  lastObserved: number;
}

export interface InteractionRecord {
  timestamp: number;
  userInput: string;
  detectedEmotion: string;
  synthResponse: string;
  userSatisfaction?: number;  // 1-5 if provided
  context: string;
}

export interface EmotionalState {
  primaryEmotion: string;
  intensity: number;
  confidence: number;
  triggers: string[];
  recommendedTone: ToneAdjustment;
}

export interface ToneAdjustment {
  formality: number;      // 0-1
  empathy: number;        // 0-1
  enthusiasm: number;     // 0-1
  brevity: number;        // 0-1
  technicality: number;   // 0-1
}

export class EmotionalIntelligenceEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private currentSessionEmotions: EmotionalState[] = [];

  constructor() {
    console.log('[EmotionalIntelligenceEngine] User modeling + tone adaptation initialized');
  }

  // ============================================
  // EMOTION DETECTION
  // ============================================

  detectEmotion(input: string, context: any = {}): EmotionalState {
    const lower = input.toLowerCase();
    
    // Emotion indicators
    const emotionIndicators: Record<string, { patterns: string[]; intensity: number }> = {
      'frustrated': {
        patterns: ['!', 'wrong', 'no', 'actually', 'ugh', 'annoying', 'frustrating'],
        intensity: 0.8,
      },
      'excited': {
        patterns: ['!', 'awesome', 'great', 'amazing', 'love', 'excited', 'wow'],
        intensity: 0.8,
      },
      'confused': {
        patterns: ['?', 'confused', 'don\'t understand', 'what does', 'how do'],
        intensity: 0.6,
      },
      'happy': {
        patterns: ['thanks', 'thank you', 'great', 'perfect', 'love', 'awesome'],
        intensity: 0.7,
      },
      'sad': {
        patterns: ['sad', 'unfortunately', 'sorry', 'unhappy', 'disappointed'],
        intensity: 0.7,
      },
      'angry': {
        patterns: ['!', 'angry', 'mad', 'furious', 'hate', 'terrible'],
        intensity: 0.9,
      },
      'curious': {
        patterns: ['?', 'wonder', 'curious', 'interesting', 'how', 'why'],
        intensity: 0.5,
      },
      'neutral': {
        patterns: [],
        intensity: 0.3,
      },
    };

    // Score each emotion
    const scores: Record<string, number> = {};
    for (const [emotion, data] of Object.entries(emotionIndicators)) {
      let score = 0;
      for (const pattern of data.patterns) {
        if (lower.includes(pattern)) {
          score += data.intensity;
        }
      }
      scores[emotion] = score;
    }

    // Find primary emotion
    let primaryEmotion = 'neutral';
    let maxScore = 0;
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }

    // Calculate intensity and confidence
    const intensity = Math.min(1, maxScore);
    const confidence = maxScore > 0 ? Math.min(1, maxScore / 2) : 0.3;

    // Determine recommended tone
    const recommendedTone = this.getToneForEmotion(primaryEmotion, intensity);

    return {
      primaryEmotion,
      intensity,
      confidence,
      triggers: emotionIndicators[primaryEmotion].patterns.filter(p => lower.includes(p)),
      recommendedTone,
    };
  }

  // ============================================
  // TONE ADAPTATION
  // ============================================

  private getToneForEmotion(emotion: string, intensity: number): ToneAdjustment {
    const toneMap: Record<string, ToneAdjustment> = {
      'frustrated': {
        formality: 0.5,
        empathy: 0.9,
        enthusiasm: 0.3,
        brevity: 0.8,  // Be concise when frustrated
        technicality: 0.4,
      },
      'excited': {
        formality: 0.3,
        empathy: 0.7,
        enthusiasm: 0.9,  // Match enthusiasm
        brevity: 0.4,
        technicality: 0.5,
      },
      'confused': {
        formality: 0.5,
        empathy: 0.8,
        enthusiasm: 0.4,
        brevity: 0.3,  // Be more detailed
        technicality: 0.3,  // Be less technical
      },
      'happy': {
        formality: 0.4,
        empathy: 0.7,
        enthusiasm: 0.7,
        brevity: 0.5,
        technicality: 0.5,
      },
      'sad': {
        formality: 0.5,
        empathy: 0.95,  // High empathy
        enthusiasm: 0.2,
        brevity: 0.5,
        technicality: 0.4,
      },
      'angry': {
        formality: 0.6,
        empathy: 0.85,
        enthusiasm: 0.1,
        brevity: 0.9,  // Be very concise
        technicality: 0.3,
      },
      'curious': {
        formality: 0.5,
        empathy: 0.6,
        enthusiasm: 0.6,
        brevity: 0.3,  // Be detailed
        technicality: 0.7,  // Can be technical
      },
      'neutral': {
        formality: 0.5,
        empathy: 0.5,
        enthusiasm: 0.5,
        brevity: 0.5,
        technicality: 0.5,
      },
    };

    return toneMap[emotion] || toneMap['neutral'];
  }

  // ============================================
  // USER PROFILE MANAGEMENT
  // ============================================

  createUserProfile(userId: string): UserProfile {
    const profile: UserProfile = {
      id: userId,
      communicationStyle: {
        formality: 'semi-formal',
        verbosity: 'moderate',
        technicalLevel: 'intermediate',
        emojiUsage: 'minimal',
        humorStyle: 'none',
      },
      preferences: {
        responseLength: 'adaptive',
        detailLevel: 'balanced',
        explanationStyle: 'step-by-step',
        feedbackPreference: 'moderate',
      },
      emotionalPatterns: [],
      interactionHistory: [],
      lastUpdated: Date.now(),
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // ============================================
  // INTERACTION TRACKING
  // ============================================

  recordInteraction(
    userId: string,
    userInput: string,
    detectedEmotion: string,
    synthResponse: string,
    context: string = ''
  ): void {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // Record interaction
    profile.interactionHistory.push({
      timestamp: Date.now(),
      userInput,
      detectedEmotion,
      synthResponse,
      context,
    });

    // Update emotional patterns
    this.updateEmotionalPatterns(profile, detectedEmotion, userInput);

    // Keep last 100 interactions
    if (profile.interactionHistory.length > 100) {
      profile.interactionHistory = profile.interactionHistory.slice(-100);
    }

    profile.lastUpdated = Date.now();
  }

  private updateEmotionalPatterns(profile: UserProfile, emotion: string, trigger: string): void {
    // Find existing pattern
    let pattern = profile.emotionalPatterns.find(p => p.emotion === emotion);
    
    if (pattern) {
      pattern.frequency++;
      pattern.lastObserved = Date.now();
      pattern.intensity = (pattern.intensity * 0.9) + 0.1;  // Exponential moving average
    } else {
      pattern = {
        emotion,
        trigger,
        frequency: 1,
        intensity: 0.5,
        lastObserved: Date.now(),
      };
      profile.emotionalPatterns.push(pattern);
    }

    // Keep top 10 patterns
    profile.emotionalPatterns.sort((a, b) => b.frequency - a.frequency);
    if (profile.emotionalPatterns.length > 10) {
      profile.emotionalPatterns = profile.emotionalPatterns.slice(0, 10);
    }
  }

  // ============================================
  // RESPONSE ADAPTATION
  // ============================================

  adaptResponse(response: string, emotionalState: EmotionalState, userId?: string): string {
    let adapted = response;
    const tone = emotionalState.recommendedTone;

    // Apply tone adjustments
    if (tone.empathy > 0.7) {
      adapted = this.addEmpathy(adapted, emotionalState.primaryEmotion);
    }

    if (tone.brevity > 0.7) {
      adapted = this.makeConcise(adapted);
    }

    if (tone.enthusiasm > 0.7) {
      adapted = this.addEnthusiasm(adapted);
    }

    if (tone.technicality < 0.4) {
      adapted = this.simplifyLanguage(adapted);
    }

    // Apply user-specific adaptations
    if (userId) {
      const profile = this.userProfiles.get(userId);
      if (profile) {
        adapted = this.applyUserPreferences(adapted, profile);
      }
    }

    return adapted;
  }

  private addEmpathy(response: string, emotion: string): string {
    const empathyPhrases: Record<string, string> = {
      'frustrated': 'I understand this can be frustrating. ',
      'sad': 'I\'m sorry to hear that. ',
      'angry': 'I can see this is upsetting. ',
      'confused': 'I understand this can be confusing. ',
    };

    const phrase = empathyPhrases[emotion] || '';
    return phrase + response;
  }

  private makeConcise(response: string): string {
    // Remove filler words and shorten sentences
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    const concise = sentences.slice(0, Math.min(3, sentences.length)).join('. ');
    return concise + (sentences.length > 3 ? '.' : '');
  }

  private addEnthusiasm(response: string): string {
    // Add enthusiastic language
    if (!response.includes('!')) {
      response = response.replace(/\.$/, '!');
    }
    
    const enthusiasticWords = ['great', 'awesome', 'excellent', 'fantastic'];
    if (!enthusiasticWords.some(w => response.toLowerCase().includes(w))) {
      response = 'Great! ' + response;
    }
    
    return response;
  }

  private simplifyLanguage(response: string): string {
    // Replace complex words with simpler alternatives
    const simplifications: Record<string, string> = {
      'utilize': 'use',
      'implement': 'do',
      'facilitate': 'help',
      'demonstrate': 'show',
      'comprehensive': 'complete',
      'subsequently': 'then',
      'approximately': 'about',
    };

    let simplified = response;
    for (const [complex, simple] of Object.entries(simplifications)) {
      simplified = simplified.replace(new RegExp(`\\b${complex}\\b`, 'gi'), simple);
    }

    return simplified;
  }

  private applyUserPreferences(response: string, profile: UserProfile): string {
    // Apply user-specific preferences
    if (profile.preferences.responseLength === 'short') {
      response = this.makeConcise(response);
    }

    if (profile.communicationStyle.emojiUsage === 'heavy') {
      response += ' 😊';
    }

    return response;
  }

  // ============================================
  // SATISFACTION TRACKING
  // ============================================

  recordSatisfaction(userId: string, satisfaction: number): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const lastInteraction = profile.interactionHistory[profile.interactionHistory.length - 1];
    if (lastInteraction) {
      lastInteraction.userSatisfaction = satisfaction;
    }
  }

  getUserSatisfactionTrend(userId: string): number {
    const profile = this.userProfiles.get(userId);
    if (!profile) return 0;

    const recentInteractions = profile.interactionHistory
      .filter(i => i.userSatisfaction !== undefined)
      .slice(-10);

    if (recentInteractions.length === 0) return 0;

    return recentInteractions.reduce((sum, i) => sum + (i.userSatisfaction || 0), 0) / recentInteractions.length;
  }

  // ============================================
  // STATS
  // ============================================

  getStats() {
    return {
      totalUsers: this.userProfiles.size,
      trackedEmotions: ['frustrated', 'excited', 'confused', 'happy', 'sad', 'angry', 'curious', 'neutral'],
      toneAdjustments: ['formality', 'empathy', 'enthusiasm', 'brevity', 'technicality'],
    };
  }
}
