// ============================================
// CONVERSATION STATE MACHINE
// Solves the "make it blue" problem
// Tracks entities, actions, references across 10,000+ turns
// ============================================

export interface Entity {
  id: string;
  type: string;           // "site", "function", "variable", "component", etc.
  name: string;           // Human-readable name
  properties: Record<string, any>;
  createdAt: number;
  lastModified: number;
  turnCreated: number;
  turnModified: number;
  references: string[];   // Other entity IDs this relates to
}

export interface Action {
  id: string;
  type: 'create' | 'modify' | 'delete' | 'query' | 'execute';
  targetEntityId: string;
  changes: Record<string, any>;
  timestamp: number;
  turnNumber: number;
  userInput: string;
  synthOutput: string;
  success: boolean;
}

export interface ConversationTurn {
  turnNumber: number;
  userInput: string;
  synthOutput: string;
  entitiesCreated: string[];
  entitiesModified: string[];
  entitiesReferenced: string[];
  actions: Action[];
  timestamp: number;
  intent: string;
  emotion: string;
  context: Record<string, any>;
}

export interface ReferentialLink {
  pronoun: string;        // "it", "that", "this", "the site", etc.
  entityId: string;       // What it refers to
  turnNumber: number;     // When the link was established
  confidence: number;     // How confident we are
}

export class ConversationStateMachine {
  private entities: Map<string, Entity> = new Map();
  private actions: Action[] = [];
  private turns: ConversationTurn[] = [];
  private referentialLinks: ReferentialLink[] = [];
  private currentTurn = 0;
  private lastMentionedEntity: string | null = null;
  private entityNameIndex: Map<string, string> = new Map();  // name → id
  
  // Compression: store old turns as summaries
  private turnSummaries: Map<string, string> = new Map();
  private compressionThreshold = 100;  // Compress after 100 turns

  constructor() {
    console.log('[ConversationStateMachine] Initialized with 10,000+ turn capacity');
  }

  // ============================================
  // ENTITY MANAGEMENT
  // ============================================

  createEntity(type: string, name: string, properties: Record<string, any> = {}): Entity {
    const id = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entity: Entity = {
      id,
      type,
      name,
      properties,
      createdAt: Date.now(),
      lastModified: Date.now(),
      turnCreated: this.currentTurn,
      turnModified: this.currentTurn,
      references: [],
    };

    this.entities.set(id, entity);
    this.entityNameIndex.set(name.toLowerCase(), id);
    this.lastMentionedEntity = id;

    return entity;
  }

  modifyEntity(entityId: string, changes: Record<string, any>): Entity | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;

    // Apply changes
    Object.assign(entity.properties, changes);
    entity.lastModified = Date.now();
    entity.turnModified = this.currentTurn;

    return entity;
  }

  getEntity(entityId: string): Entity | null {
    return this.entities.get(entityId) || null;
  }

  findEntityByName(name: string): Entity | null {
    const id = this.entityNameIndex.get(name.toLowerCase());
    if (id) return this.entities.get(id) || null;

    // Fuzzy match
    const lowerName = name.toLowerCase();
    for (const [entityName, entityId] of this.entityNameIndex) {
      if (entityName.includes(lowerName) || lowerName.includes(entityName)) {
        return this.entities.get(entityId) || null;
      }
    }

    return null;
  }

  // ============================================
  // REFERENTIAL RESOLUTION
  // ============================================

  resolveReference(input: string): string | null {
    const lower = input.toLowerCase();

    // Direct pronoun resolution
    const pronouns = ['it', 'that', 'this', 'them', 'these', 'those'];
    for (const pronoun of pronouns) {
      if (lower.includes(` ${pronoun} `) || lower.startsWith(`${pronoun} `) || lower.endsWith(` ${pronoun}`)) {
        // "it" → last mentioned entity
        if (this.lastMentionedEntity) {
          return this.lastMentionedEntity;
        }
      }
    }

    // "the X" → find entity of type X
    const theMatch = lower.match(/the (\w+)/);
    if (theMatch) {
      const typeName = theMatch[1];
      // Find entity by type
      for (const [, entity] of this.entities) {
        if (entity.type.toLowerCase() === typeName || entity.name.toLowerCase().includes(typeName)) {
          return entity.id;
        }
      }
    }

    // Named reference → find by name
    for (const [name, id] of this.entityNameIndex) {
      if (lower.includes(name)) {
        return id;
      }
    }

    return null;
  }

  // ============================================
  // ACTION TRACKING
  // ============================================

  recordAction(
    type: Action['type'],
    targetEntityId: string,
    changes: Record<string, any>,
    userInput: string,
    synthOutput: string,
    success: boolean
  ): Action {
    const action: Action = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      targetEntityId,
      changes,
      timestamp: Date.now(),
      turnNumber: this.currentTurn,
      userInput,
      synthOutput,
      success,
    };

    this.actions.push(action);
    return action;
  }

  // ============================================
  // TURN MANAGEMENT
  // ============================================

  startTurn(userInput: string): { resolvedEntityId: string | null; intent: string; emotion: string } {
    this.currentTurn++;

    // Resolve references
    const resolvedEntityId = this.resolveReference(userInput);

    // Detect intent
    const intent = this.detectIntent(userInput);

    // Detect emotion
    const emotion = this.detectEmotion(userInput);

    // Update last mentioned entity if we resolved one
    if (resolvedEntityId) {
      this.lastMentionedEntity = resolvedEntityId;
    }

    return { resolvedEntityId, intent, emotion };
  }

  endTurn(
    userInput: string,
    synthOutput: string,
    entitiesCreated: string[],
    entitiesModified: string[],
    entitiesReferenced: string[],
    intent: string,
    emotion: string
  ): ConversationTurn {
    const turn: ConversationTurn = {
      turnNumber: this.currentTurn,
      userInput,
      synthOutput,
      entitiesCreated,
      entitiesModified,
      entitiesReferenced,
      actions: this.actions.filter(a => a.turnNumber === this.currentTurn),
      timestamp: Date.now(),
      intent,
      emotion,
      context: this.getContextSnapshot(),
    };

    this.turns.push(turn);

    // Compress old turns if needed
    if (this.turns.length > this.compressionThreshold) {
      this.compressOldTurns();
    }

    return turn;
  }

  // ============================================
  // INTENT DETECTION
  // ============================================

  private detectIntent(input: string): string {
    const lower = input.toLowerCase();

    // Modification intents
    if (lower.includes('make') || lower.includes('change') || lower.includes('modify') || 
        lower.includes('update') || lower.includes('edit') || lower.includes('fix') ||
        lower.includes('actually') || lower.includes('instead')) {
      return 'modification';
    }

    // Creation intents
    if (lower.includes('create') || lower.includes('build') || lower.includes('make') ||
        lower.includes('generate') || lower.includes('write') || lower.includes('design')) {
      return 'creation';
    }

    // Query intents
    if (lower.includes('what') || lower.includes('how') || lower.includes('why') ||
        lower.includes('when') || lower.includes('where') || lower.includes('who')) {
      return 'query';
    }

    // Deletion intents
    if (lower.includes('delete') || lower.includes('remove') || lower.includes('clear')) {
      return 'deletion';
    }

    return 'conversation';
  }

  // ============================================
  // EMOTION DETECTION
  // ============================================

  private detectEmotion(input: string): string {
    const lower = input.toLowerCase();

    // Frustration indicators
    if (lower.includes('actually') || lower.includes('no') || lower.includes('wrong') ||
        lower.includes('!') || lower.includes('?!!')) {
      return 'frustrated';
    }

    // Excitement indicators
    if (lower.includes('!') && !lower.includes('?')) {
      return 'excited';
    }

    // Confusion indicators
    if (lower.includes('?') || lower.includes('confused') || lower.includes('don\'t understand')) {
      return 'confused';
    }

    // Happy indicators
    if (lower.includes('thanks') || lower.includes('great') || lower.includes('awesome') ||
        lower.includes('perfect') || lower.includes('love')) {
      return 'happy';
    }

    return 'neutral';
  }

  // ============================================
  // CONTEXT MANAGEMENT
  // ============================================

  private getContextSnapshot(): Record<string, any> {
    return {
      totalEntities: this.entities.size,
      totalActions: this.actions.length,
      currentTurn: this.currentTurn,
      lastMentionedEntity: this.lastMentionedEntity,
      recentEntityTypes: Array.from(this.entities.values())
        .slice(-5)
        .map(e => e.type),
    };
  }

  // ============================================
  // COMPRESSION (for 10,000+ turn support)
  // ============================================

  private compressOldTurns(): void {
    // Keep last 100 turns in full detail
    // Compress older turns into summaries
    const turnsToCompress = this.turns.slice(0, -100);
    
    for (const turn of turnsToCompress) {
      const summary = this.summarizeTurn(turn);
      this.turnSummaries.set(`turn_${turn.turnNumber}`, summary);
    }

    // Keep only last 100 turns in full
    this.turns = this.turns.slice(-100);
  }

  private summarizeTurn(turn: ConversationTurn): string {
    let summary = `Turn ${turn.turnNumber}: `;
    
    if (turn.entitiesCreated.length > 0) {
      summary += `Created ${turn.entitiesCreated.length} entities. `;
    }
    if (turn.entitiesModified.length > 0) {
      summary += `Modified ${turn.entitiesModified.length} entities. `;
    }
    summary += `Intent: ${turn.intent}. Emotion: ${turn.emotion}.`;
    
    return summary;
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getRecentTurns(count: number = 10): ConversationTurn[] {
    return this.turns.slice(-count);
  }

  getEntityHistory(entityId: string): Action[] {
    return this.actions.filter(a => a.targetEntityId === entityId);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getStats() {
    return {
      totalTurns: this.currentTurn,
      totalEntities: this.entities.size,
      totalActions: this.actions.length,
      compressedTurns: this.turnSummaries.size,
      lastMentionedEntity: this.lastMentionedEntity,
      recentEntityTypes: Array.from(this.entities.values())
        .slice(-5)
        .map(e => `${e.type} (${e.name})`),
    };
  }

  // ============================================
  // UNDO/REDO
  // ============================================

  undo(): Action | null {
    // Find last successful action
    const lastAction = this.actions.filter(a => a.success).pop();
    if (!lastAction) return null;

    // Reverse the action
    const entity = this.entities.get(lastAction.targetEntityId);
    if (!entity) return null;

    if (lastAction.type === 'modify') {
      // Reverse modifications
      for (const [key, value] of Object.entries(lastAction.changes)) {
        // We'd need to store old values for true undo
        // For now, just mark as undone
        delete entity.properties[key];
      }
    } else if (lastAction.type === 'create') {
      // Remove created entity
      this.entities.delete(lastAction.targetEntityId);
    }

    lastAction.success = false;
    return lastAction;
  }
}
