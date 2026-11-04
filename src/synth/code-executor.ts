// Real code execution with iframe sandbox
export class CodeExecutor {
  private iframe: HTMLIFrameElement | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.setupSandbox();
  }

  private setupSandbox(): void {
    // Create hidden iframe for code execution
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = 'none';
    this.iframe.sandbox.add('allow-scripts');
    this.iframe.sandbox.add('allow-same-origin');
    
    // Set up sandbox content
    this.iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Capture console output
            const originalLog = console.log;
            const originalError = console.error;
            const logs = [];
            
            console.log = (...args) => {
              logs.push({ type: 'log', data: args.map(a => String(a)).join(' ') });
              originalLog.apply(console, args);
            };
            
            console.error = (...args) => {
              logs.push({ type: 'error', data: args.map(a => String(a)).join(' ') });
              originalError.apply(console, args);
            };
            
            // Listen for code execution requests
            window.addEventListener('message', async (event) => {
              if (event.data.type === 'execute') {
                try {
                  // Clear previous logs
                  logs.length = 0;
                  
                  // Execute the code
                  const result = eval(event.data.code);
                  
                  // Send result back
                  parent.postMessage({
                    type: 'result',
                    id: event.data.id,
                    success: true,
                    result: result,
                    logs: logs.slice()
                  }, '*');
                } catch (error) {
                  parent.postMessage({
                    type: 'result',
                    id: event.data.id,
                    success: false,
                    error: error.message,
                    logs: logs.slice()
                  }, '*');
                }
              }
            });
            
            // Notify parent that sandbox is ready
            parent.postMessage({ type: 'ready' }, '*');
          </script>
        </head>
        <body></body>
      </html>
    `;
    
    document.body.appendChild(this.iframe);
    
    // Listen for messages from sandbox
    window.addEventListener('message', (event) => {
      if (event.source === this.iframe?.contentWindow) {
        if (event.data.type === 'result') {
          const handler = this.messageHandlers.get(event.data.id);
          if (handler) {
            handler(event.data);
            this.messageHandlers.delete(event.data.id);
          }
        }
      }
    });
  }

  async execute(code: string, timeout: number = 5000): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    logs: Array<{ type: string; data: string }>;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.iframe?.contentWindow) {
        reject(new Error('Sandbox not initialized'));
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        this.messageHandlers.delete(id);
        resolve({
          success: false,
          error: 'Execution timeout',
          logs: []
        });
      }, timeout);

      // Register handler
      this.messageHandlers.set(id, (data) => {
        clearTimeout(timeoutId);
        resolve({
          success: data.success,
          result: data.result,
          error: data.error,
          logs: data.logs
        });
      });

      // Send code to sandbox
      this.iframe.contentWindow.postMessage({
        type: 'execute',
        id,
        code
      }, '*');
    });
  }

  // Execute and capture HTML output
  async executeAndRender(code: string): Promise<{
    success: boolean;
    html?: string;
    error?: string;
    logs: Array<{ type: string; data: string }>;
  }> {
    // Wrap code to capture document writes
    const wrappedCode = `
      (function() {
        const originalWrite = document.write;
        const originalWriteln = document.writeln;
        let output = '';
        
        document.write = (...args) => {
          output += args.join('');
        };
        
        document.writeln = (...args) => {
          output += args.join('') + '\\n';
        };
        
        try {
          ${code}
          return output || 'Code executed successfully';
        } finally {
          document.write = originalWrite;
          document.writeln = originalWriteln;
        }
      })()
    `;

    const result = await this.execute(wrappedCode);
    
    return {
      success: result.success,
      html: result.result,
      error: result.error,
      logs: result.logs
    };
  }

  // Generate preview iframe
  generatePreview(html: string): string {
    return `
      <div style="border: 1px solid #333; border-radius: 8px; overflow: hidden; margin: 1rem 0;">
        <div style="background: #1a1a1a; padding: 0.5rem 1rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #00d4ff; font-weight: 600;">📱 Preview</span>
          <button onclick="this.parentElement.parentElement.querySelector('iframe').style.height = this.parentElement.parentElement.querySelector('iframe').style.height === '500px' ? '200px' : '500px'" 
                  style="padding: 0.25rem 0.75rem; background: #2a2a2a; color: #00d4ff; border: 1px solid #00d4ff; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
            Toggle Size
          </button>
        </div>
        <iframe 
          srcdoc="${html.replace(/"/g, '&quot;')}" 
          style="width: 100%; height: 500px; border: none; background: white;"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    `;
  }

  destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
}
