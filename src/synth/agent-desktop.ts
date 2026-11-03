// ============================================
// AGENT-DESKTOP INTEGRATION
// Solves: Computer Control (browser + OS automation)
// Accessibility tree-based control (no screenshots needed)
// ============================================

export interface AccessibilityNode {
  id: string;
  role: string;           // "button", "textbox", "link", etc.
  name: string;           // Accessible name
  value?: string;         // Current value (for inputs)
  bounds: { x: number; y: number; width: number; height: number };
  children: AccessibilityNode[];
  properties: Record<string, any>;
}

export interface DesktopAction {
  type: 'click' | 'type' | 'scroll' | 'keypress' | 'select' | 'drag';
  target: string;         // Node ID or selector
  parameters: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  action: DesktopAction;
  timestamp: number;
  error?: string;
  newState?: AccessibilityNode;
}

export interface DesktopSession {
  id: string;
  platform: 'macos' | 'windows' | 'linux' | 'browser';
  root: AccessibilityNode | null;
  actions: ActionResult[];
  startTime: number;
}

export class AgentDesktop {
  private sessions: Map<string, DesktopSession> = new Map();
  private currentSession: DesktopSession | null = null;
  private platform: 'macos' | 'windows' | 'linux' | 'browser' = 'browser';

  constructor() {
    console.log('[AgentDesktop] Computer control initialized (accessibility tree-based)');
    this.detectPlatform();
  }

  // ============================================
  // PLATFORM DETECTION
  // ============================================

  private detectPlatform(): void {
    if (typeof window !== 'undefined') {
      this.platform = 'browser';
    } else if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const proc = (globalThis as any).process;
      if (proc) {
        const platform = proc.platform;
        if (platform === 'darwin') this.platform = 'macos';
        else if (platform === 'win32') this.platform = 'windows';
        else this.platform = 'linux';
      }
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  startSession(): DesktopSession {
    const session: DesktopSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: this.platform,
      root: null,
      actions: [],
      startTime: Date.now(),
    };

    this.sessions.set(session.id, session);
    this.currentSession = session;

    // Capture initial accessibility tree
    session.root = this.captureAccessibilityTree();

    return session;
  }

  endSession(sessionId?: string): void {
    const session = sessionId 
      ? this.sessions.get(sessionId)
      : this.currentSession;
    
    if (session) {
      console.log(`[AgentDesktop] Session ${session.id} ended with ${session.actions.length} actions`);
    }
    
    this.currentSession = null;
  }

  // ============================================
  // ACCESSIBILITY TREE CAPTURE
  // ============================================

  captureAccessibilityTree(): AccessibilityNode {
    if (this.platform === 'browser' && typeof document !== 'undefined') {
      return this.captureBrowserTree();
    }
    
    // For other platforms, this would integrate with OS accessibility APIs
    // For now, return a mock tree
    return this.createMockTree();
  }

  private captureBrowserTree(): AccessibilityNode {
    // Capture DOM as accessibility tree
    const root: AccessibilityNode = {
      id: 'root',
      role: 'document',
      name: document.title || 'Browser',
      bounds: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
      children: [],
      properties: {},
    };

    // Traverse DOM and build accessibility tree
    const traverse = (element: Element, parent: AccessibilityNode): void => {
      const role = this.getAccessibilityRole(element);
      const name = this.getAccessibilityName(element);
      
      if (role && name) {
        const node: AccessibilityNode = {
          id: element.id || `node_${Math.random().toString(36).substr(2, 9)}`,
          role,
          name,
          value: (element as HTMLInputElement).value,
          bounds: this.getElementBounds(element),
          children: [],
          properties: this.getElementProperties(element),
        };

        parent.children.push(node);

        // Traverse children
        for (const child of Array.from(element.children)) {
          traverse(child, node);
        }
      } else {
        // Skip this element but traverse children
        for (const child of Array.from(element.children)) {
          traverse(child, parent);
        }
      }
    };

    if (document.body) {
      traverse(document.body, root);
    }

    return root;
  }

  private getAccessibilityRole(element: Element): string | null {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (role) return role;
    
    const roleMap: Record<string, string> = {
      'button': 'button',
      'input': element.getAttribute('type') === 'checkbox' ? 'checkbox' : 'textbox',
      'a': 'link',
      'img': 'image',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'p': 'paragraph',
      'select': 'combobox',
      'textarea': 'textbox',
    };
    
    return roleMap[tagName] || null;
  }

  private getAccessibilityName(element: Element): string {
    return element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.textContent?.trim().substring(0, 50) ||
           element.id ||
           '';
  }

  private getElementBounds(element: Element): { x: number; y: number; width: number; height: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  private getElementProperties(element: Element): Record<string, any> {
    return {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      disabled: element.hasAttribute('disabled'),
      checked: (element as HTMLInputElement).checked,
      href: element.getAttribute('href'),
    };
  }

  private createMockTree(): AccessibilityNode {
    return {
      id: 'root',
      role: 'document',
      name: 'Desktop',
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      children: [
        {
          id: 'taskbar',
          role: 'toolbar',
          name: 'Taskbar',
          bounds: { x: 0, y: 1040, width: 1920, height: 40 },
          children: [],
          properties: {},
        },
      ],
      properties: {},
    };
  }

  // ============================================
  // ACTION EXECUTION
  // ============================================

  async executeAction(action: DesktopAction): Promise<ActionResult> {
    const startTime = Date.now();
    
    try {
      let success = false;
      let newState: AccessibilityNode | undefined;

      switch (action.type) {
        case 'click':
          success = await this.handleClick(action.target, action.parameters);
          break;
        case 'type':
          success = await this.handleType(action.target, action.parameters);
          break;
        case 'scroll':
          success = await this.handleScroll(action.target, action.parameters);
          break;
        case 'keypress':
          success = await this.handleKeypress(action.target, action.parameters);
          break;
        case 'select':
          success = await this.handleSelect(action.target, action.parameters);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Capture new state after action
      if (success) {
        newState = this.captureAccessibilityTree();
      }

      const result: ActionResult = {
        success,
        action,
        timestamp: startTime,
        newState,
      };

      // Record in session
      if (this.currentSession) {
        this.currentSession.actions.push(result);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        action,
        timestamp: startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async handleClick(target: string, params: Record<string, any>): Promise<boolean> {
    if (this.platform === 'browser' && typeof document !== 'undefined') {
      const element = this.findElement(target);
      if (element && element instanceof HTMLElement) {
        element.click();
        return true;
      }
    }
    
    // For other platforms, this would use OS automation APIs
    console.log(`[AgentDesktop] Click on ${target}`);
    return true;
  }

  private async handleType(target: string, params: Record<string, any>): Promise<boolean> {
    const text = params.text as string;
    
    if (this.platform === 'browser' && typeof document !== 'undefined') {
      const element = this.findElement(target) as HTMLInputElement;
      if (element) {
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    
    console.log(`[AgentDesktop] Type "${text}" into ${target}`);
    return true;
  }

  private async handleScroll(target: string, params: Record<string, any>): Promise<boolean> {
    const direction = params.direction as string;
    const amount = params.amount as number || 100;
    
    if (this.platform === 'browser' && typeof window !== 'undefined') {
      if (direction === 'down') {
        window.scrollBy(0, amount);
      } else if (direction === 'up') {
        window.scrollBy(0, -amount);
      }
      return true;
    }
    
    console.log(`[AgentDesktop] Scroll ${direction} by ${amount}px`);
    return true;
  }

  private async handleKeypress(target: string, params: Record<string, any>): Promise<boolean> {
    const key = params.key as string;
    
    if (this.platform === 'browser' && typeof document !== 'undefined') {
      const element = this.findElement(target);
      if (element) {
        element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
        return true;
      }
    }
    
    console.log(`[AgentDesktop] Press key "${key}" on ${target}`);
    return true;
  }

  private async handleSelect(target: string, params: Record<string, any>): Promise<boolean> {
    const value = params.value as string;
    
    if (this.platform === 'browser' && typeof document !== 'undefined') {
      const element = this.findElement(target) as HTMLSelectElement;
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    
    console.log(`[AgentDesktop] Select "${value}" in ${target}`);
    return true;
  }

  private findElement(target: string): Element | null {
    // Try ID selector
    if (target.startsWith('#')) {
      return document.getElementById(target.substring(1));
    }
    
    // Try query selector
    try {
      return document.querySelector(target);
    } catch {
      // Fall back to finding by accessible name
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => {
        const name = this.getAccessibilityName(el);
        return name.toLowerCase().includes(target.toLowerCase());
      }) || null;
    }
  }

  // ============================================
  // HIGH-LEVEL COMMANDS
  // ============================================

  async clickButton(buttonName: string): Promise<ActionResult> {
    return this.executeAction({
      type: 'click',
      target: buttonName,
      parameters: {},
    });
  }

  async typeIntoField(fieldName: string, text: string): Promise<ActionResult> {
    return this.executeAction({
      type: 'type',
      target: fieldName,
      parameters: { text },
    });
  }

  async scrollTo(direction: 'up' | 'down', amount: number = 300): Promise<ActionResult> {
    return this.executeAction({
      type: 'scroll',
      target: 'window',
      parameters: { direction, amount },
    });
  }

  async pressKey(key: string): Promise<ActionResult> {
    return this.executeAction({
      type: 'keypress',
      target: 'document',
      parameters: { key },
    });
  }

  // ============================================
  // STATS
  // ============================================

  getStats() {
    const totalActions = Array.from(this.sessions.values())
      .reduce((sum, s) => sum + s.actions.length, 0);
    
    const successRate = totalActions > 0
      ? Array.from(this.sessions.values())
          .flatMap(s => s.actions)
          .filter(a => a.success).length / totalActions
      : 0;

    return {
      platform: this.platform,
      totalSessions: this.sessions.size,
      totalActions,
      successRate,
      currentSession: this.currentSession?.id || null,
    };
  }

  getSessionHistory(sessionId?: string): ActionResult[] {
    const session = sessionId 
      ? this.sessions.get(sessionId)
      : this.currentSession;
    
    return session?.actions || [];
  }
}
