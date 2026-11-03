// Advanced conversation with coreference resolution
export class AdvancedConversation {
  private entities: Map<string, Entity> = new Map();
  private mentions: Mention[] = [];
  private conversationHistory: ConversationTurn[] = [];

  constructor() {
    console.log('[AdvancedConversation] Initialized with coreference resolution');
  }

  // Process input and resolve references
  processInput(input: string, turnNumber: number): {
    resolvedInput: string;
    entities: Entity[];
    references: Reference[];
  } {
    // Extract entities from input
    const newEntities = this.extractEntities(input, turnNumber);
    
    // Detect mentions (pronouns, noun phrases)
    const newMentions = this.detectMentions(input, turnNumber);
    
    // Resolve coreferences
    const references = this.resolveCoreferences(newMentions);
    
    // Update entity tracking
    for (const entity of newEntities) {
      this.entities.set(entity.id, entity);
    }
    
    this.mentions.push(...newMentions);
    
    // Generate resolved input
    const resolvedInput = this.resolveInput(input, references);
    
    return {
      resolvedInput,
      entities: Array.from(this.entities.values()),
      references
    };
  }

  // Extract entities from text
  private extractEntities(text: string, turnNumber: number): Entity[] {
    const entities: Entity[] = [];
    
    // Extract named entities (simple pattern matching)
    const namedEntityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    let match;
    
    while ((match = namedEntityPattern.exec(text)) !== null) {
      const name = match[1];
      
      // Skip common words that aren't entities
      if (['The', 'This', 'That', 'It', 'They', 'We', 'You'].includes(name)) {
        continue;
      }
      
      const entityId = `entity_${name.toLowerCase().replace(/\s+/g, '_')}`;
      
      if (!this.entities.has(entityId)) {
        entities.push({
          id: entityId,
          name,
          type: this.inferEntityType(name),
          firstMention: turnNumber,
          lastMention: turnNumber,
          mentionCount: 1,
          properties: {}
        });
      } else {
        const existing = this.entities.get(entityId)!;
        existing.lastMention = turnNumber;
        existing.mentionCount++;
      }
    }
    
    // Extract noun phrases (simple heuristic)
    const nounPhrasePattern = /\b(the|a|an|this|that|my|your)\s+([a-z]+(?:\s+[a-z]+)*)\b/gi;
    
    while ((match = nounPhrasePattern.exec(text)) !== null) {
      const phrase = match[2];
      const entityId = `entity_${phrase.toLowerCase().replace(/\s+/g, '_')}`;
      
      if (!this.entities.has(entityId)) {
        entities.push({
          id: entityId,
          name: phrase,
          type: 'object',
          firstMention: turnNumber,
          lastMention: turnNumber,
          mentionCount: 1,
          properties: {}
        });
      } else {
        const existing = this.entities.get(entityId)!;
        existing.lastMention = turnNumber;
        existing.mentionCount++;
      }
    }
    
    return entities;
  }

  // Detect mentions (pronouns and noun phrases that might refer to entities)
  private detectMentions(text: string, turnNumber: number): Mention[] {
    const mentions: Mention[] = [];
    
    // Detect pronouns
    const pronounPattern = /\b(it|this|that|they|them|he|she|his|her|their|the one|the thing)\b/gi;
    let match;
    
    while ((match = pronounPattern.exec(text)) !== null) {
      mentions.push({
        text: match[1],
        type: 'pronoun',
        position: match.index,
        turnNumber
      });
    }
    
    // Detect definite noun phrases
    const definitePattern = /\b(the|that|this)\s+([a-z]+(?:\s+[a-z]+)*)\b/gi;
    
    while ((match = definitePattern.exec(text)) !== null) {
      mentions.push({
        text: match[0],
        type: 'noun_phrase',
        position: match.index,
        turnNumber
      });
    }
    
    return mentions;
  }

  // Resolve coreferences (match mentions to entities)
  private resolveCoreferences(mentions: Mention[]): Reference[] {
    const references: Reference[] = [];
    
    for (const mention of mentions) {
      const resolvedEntity = this.findBestEntityMatch(mention);
      
      if (resolvedEntity) {
        references.push({
          mention: mention.text,
          entityId: resolvedEntity.id,
          entityName: resolvedEntity.name,
          confidence: this.calculateConfidence(mention, resolvedEntity),
          turnNumber: mention.turnNumber
        });
      }
    }
    
    return references;
  }

  // Find best matching entity for a mention
  private findBestEntityMatch(mention: Mention): Entity | null {
    const entities = Array.from(this.entities.values());
    
    if (entities.length === 0) return null;
    
    // For pronouns, use recency and salience
    if (mention.type === 'pronoun') {
      // Sort by recency and mention count
      const sorted = entities
        .filter(e => e.lastMention <= mention.turnNumber)
        .sort((a, b) => {
          // Prefer more recent entities
          if (b.lastMention !== a.lastMention) {
            return b.lastMention - a.lastMention;
          }
          // Then prefer more frequently mentioned
          return b.mentionCount - a.mentionCount;
        });
      
      return sorted[0] || null;
    }
    
    // For noun phrases, use string matching
    if (mention.type === 'noun_phrase') {
      const mentionText = mention.text.toLowerCase().replace(/\b(the|that|this)\s+/, '');
      
      let bestMatch: Entity | null = null;
      let bestScore = 0;
      
      for (const entity of entities) {
        const entityName = entity.name.toLowerCase();
        
        // Check for exact match
        if (entityName === mentionText) {
          return entity;
        }
        
        // Check for partial match
        if (entityName.includes(mentionText) || mentionText.includes(entityName)) {
          const score = Math.min(entityName.length, mentionText.length) / 
                       Math.max(entityName.length, mentionText.length);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = entity;
          }
        }
      }
      
      return bestMatch;
    }
    
    return null;
  }

  // Calculate confidence of coreference resolution
  private calculateConfidence(mention: Mention, entity: Entity): number {
    let confidence = 0.5;
    
    // Boost confidence for recent entities
    const recencyBoost = Math.max(0, 1 - (mention.turnNumber - entity.lastMention) * 0.1);
    confidence += recencyBoost * 0.3;
    
    // Boost confidence for frequently mentioned entities
    const frequencyBoost = Math.min(1, entity.mentionCount / 5);
    confidence += frequencyBoost * 0.2;
    
    return Math.min(1, confidence);
  }

  // Infer entity type from name
  private inferEntityType(name: string): string {
    const lower = name.toLowerCase();
    
    // Person names
    if (/^(john|jane|alice|bob|charlie|david|emma|sarah|michael)\b/i.test(lower)) {
      return 'person';
    }
    
    // Locations
    if (/\b(city|country|state|street|avenue|road|park|river|mountain)\b/i.test(lower)) {
      return 'location';
    }
    
    // Organizations
    if (/\b(inc|corp|ltd|llc|company|organization|university|school)\b/i.test(lower)) {
      return 'organization';
    }
    
    return 'object';
  }

  // Resolve input by replacing mentions with entity names
  private resolveInput(input: string, references: Reference[]): string {
    let resolved = input;
    
    // Sort references by position (descending) to avoid offset issues
    const sortedRefs = references
      .filter(r => r.confidence > 0.6)
      .sort((a, b) => {
        const aPos = input.toLowerCase().indexOf(a.mention.toLowerCase());
        const bPos = input.toLowerCase().indexOf(b.mention.toLowerCase());
        return bPos - aPos;
      });
    
    for (const ref of sortedRefs) {
      const pattern = new RegExp(`\\b${ref.mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      resolved = resolved.replace(pattern, ref.entityName);
    }
    
    return resolved;
  }

  // Record conversation turn
  recordTurn(userInput: string, synthOutput: string, turnNumber: number): void {
    this.conversationHistory.push({
      turnNumber,
      userInput,
      synthOutput,
      timestamp: Date.now()
    });
    
    // Keep only last 100 turns
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100);
    }
  }

  // Get conversation context
  getContext(turnNumber: number, lookback: number = 5): string {
    const startTurn = Math.max(0, turnNumber - lookback);
    const relevantTurns = this.conversationHistory.filter(
      t => t.turnNumber >= startTurn && t.turnNumber < turnNumber
    );
    
    return relevantTurns
      .map(t => `User: ${t.userInput}\nSynth: ${t.synthOutput}`)
      .join('\n\n');
  }

  getStats() {
    return {
      totalEntities: this.entities.size,
      totalMentions: this.mentions.length,
      totalTurns: this.conversationHistory.length,
      entityTypes: {
        person: Array.from(this.entities.values()).filter(e => e.type === 'person').length,
        location: Array.from(this.entities.values()).filter(e => e.type === 'location').length,
        organization: Array.from(this.entities.values()).filter(e => e.type === 'organization').length,
        object: Array.from(this.entities.values()).filter(e => e.type === 'object').length
      }
    };
  }
}

interface Entity {
  id: string;
  name: string;
  type: string;
  firstMention: number;
  lastMention: number;
  mentionCount: number;
  properties: Record<string, any>;
}

interface Mention {
  text: string;
  type: 'pronoun' | 'noun_phrase';
  position: number;
  turnNumber: number;
}

interface Reference {
  mention: string;
  entityId: string;
  entityName: string;
  confidence: number;
  turnNumber: number;
}

interface ConversationTurn {
  turnNumber: number;
  userInput: string;
  synthOutput: string;
  timestamp: number;
}
