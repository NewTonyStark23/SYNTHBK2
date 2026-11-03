// ============================================
// SYNTH SAI LOGGING SYSTEM
// Records all interactions and behind-the-scenes activity
// ============================================

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug' | 'trace';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  duration?: number;
}

export interface ConversationLog {
  id: string;
  timestamp: number;
  userInput: string;
  synthOutput: string;
  modulesUsed: string[];
  confidence: number;
  processingTime: number;
  emotionalState?: string;
  intent?: string;
  errors?: string[];
}

class SynthLogger {
  private logs: LogEntry[] = [];
  private conversations: ConversationLog[] = [];
  private maxLogs = 10000;
  private maxConversations = 1000;
  private enabled = true;
  private debugMode = false;

  constructor() {
    console.log('[SynthLogger] Logging system initialized');
  }

  // ============================================
  // LOGGING METHODS
  // ============================================

  log(level: LogLevel, module: string, message: string, data?: any): void {
    if (!this.enabled) return;
    if (level === 'debug' && !this.debugMode) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for important levels
    if (level === 'error' || level === 'warning') {
      console.warn(`[${level.toUpperCase()}] [${module}] ${message}`, data || '');
    }
  }

  info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  success(module: string, message: string, data?: any): void {
    this.log('success', module, message, data);
  }

  warning(module: string, message: string, data?: any): void {
    this.log('warning', module, message, data);
  }

  error(module: string, message: string, data?: any): void {
    this.log('error', module, message, data);
  }

  debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  trace(module: string, message: string, data?: any): void {
    this.log('trace', module, message, data);
  }

  // ============================================
  // CONVERSATION LOGGING
  // ============================================

  logConversation(conversation: Omit<ConversationLog, 'id' | 'timestamp'>): void {
    const entry: ConversationLog = {
      ...conversation,
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.conversations.push(entry);

    // Keep only last maxConversations
    if (this.conversations.length > this.maxConversations) {
      this.conversations = this.conversations.slice(-this.maxConversations);
    }

    this.info('ConversationLogger', 'Conversation logged', {
      id: entry.id,
      modulesUsed: entry.modulesUsed.length,
      confidence: entry.confidence,
      processingTime: entry.processingTime,
    });
  }

  // ============================================
  // EXPORT METHODS
  // ============================================

  exportLogs(): string {
    const header = `# Synth SAI System Logs\n`;
    const generated = `# Generated: ${new Date().toISOString()}\n`;
    const totalLogs = `# Total Logs: ${this.logs.length}\n`;
    const totalConversations = `# Total Conversations: ${this.conversations.length}\n`;
    const separator = `${'='.repeat(80)}\n\n`;

    let content = header + generated + totalLogs + totalConversations + separator;

    // System logs
    content += `## System Logs\n\n`;
    for (const log of this.logs) {
      const time = new Date(log.timestamp).toISOString();
      const level = log.level.toUpperCase().padEnd(7);
      const module = log.module.padEnd(20);
      content += `[${time}] [${level}] [${module}] ${log.message}\n`;
      if (log.data) {
        content += `  Data: ${JSON.stringify(log.data, null, 2)}\n`;
      }
    }

    content += `\n${separator}\n`;

    // Conversation logs
    content += `## Conversation Logs\n\n`;
    for (const conv of this.conversations) {
      const time = new Date(conv.timestamp).toISOString();
      content += `### Conversation ${conv.id}\n`;
      content += `Time: ${time}\n`;
      content += `User: ${conv.userInput}\n`;
      content += `Synth: ${conv.synthOutput}\n`;
      content += `Modules: ${conv.modulesUsed.join(', ')}\n`;
      content += `Confidence: ${(conv.confidence * 100).toFixed(1)}%\n`;
      content += `Processing Time: ${conv.processingTime.toFixed(2)}ms\n`;
      if (conv.emotionalState) content += `Emotion: ${conv.emotionalState}\n`;
      if (conv.intent) content += `Intent: ${conv.intent}\n`;
      if (conv.errors && conv.errors.length > 0) {
        content += `Errors: ${conv.errors.join(', ')}\n`;
      }
      content += `\n---\n\n`;
    }

    return content;
  }

  exportConversations(): string {
    const header = `# Synth SAI Conversation History\n`;
    const generated = `# Generated: ${new Date().toISOString()}\n`;
    const total = `# Total Conversations: ${this.conversations.length}\n`;
    const separator = `${'='.repeat(80)}\n\n`;

    let content = header + generated + total + separator;

    for (const conv of this.conversations) {
      const time = new Date(conv.timestamp).toISOString();
      content += `## ${time}\n\n`;
      content += `**User:** ${conv.userInput}\n\n`;
      content += `**Synth:** ${conv.synthOutput}\n\n`;
      content += `*Modules: ${conv.modulesUsed.join(', ')}*\n`;
      content += `*Confidence: ${(conv.confidence * 100).toFixed(1)}% | Time: ${conv.processingTime.toFixed(2)}ms*\n`;
      content += `\n---\n\n`;
    }

    return content;
  }

  exportCode(output: string, filename: string = 'synth-output'): void {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.info('Logger', 'Code exported', { filename });
  }

  // ============================================
  // RETRIEVAL METHODS
  // ============================================

  getLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter(l => l.level === level);
    }
    return filtered.slice(-limit);
  }

  getConversations(limit: number = 50): ConversationLog[] {
    return this.conversations.slice(-limit);
  }

  getRecentConversations(count: number = 5): ConversationLog[] {
    return this.conversations.slice(-count);
  }

  // ============================================
  // STATS
  // ============================================

  getStats() {
    const errors = this.logs.filter(l => l.level === 'error').length;
    const warnings = this.logs.filter(l => l.level === 'warning').length;

    const avgConfidence = this.conversations.length > 0
      ? this.conversations.reduce((sum, c) => sum + c.confidence, 0) / this.conversations.length
      : 0;

    const avgProcessingTime = this.conversations.length > 0
      ? this.conversations.reduce((sum, c) => sum + c.processingTime, 0) / this.conversations.length
      : 0;

    return {
      totalLogs: this.logs.length,
      totalConversations: this.conversations.length,
      errors,
      warnings,
      averageConfidence: avgConfidence,
      averageProcessingTime: avgProcessingTime,
      debugMode: this.debugMode,
    };
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.info('Logger', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logger', 'Logs cleared');
  }

  clearConversations(): void {
    this.conversations = [];
    this.info('Logger', 'Conversations cleared');
  }
}

// Export singleton instance
export const logger = new SynthLogger();
