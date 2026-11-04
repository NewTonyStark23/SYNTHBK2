// TOOL EXECUTOR - REAL implementation using browser APIs
// Uses File System Access API, Web Workers, and real execution
export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<ToolResult>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  description: string;
}

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  result?: ToolResult;
  timestamp: number;
}

export class ToolExecutor {
  private tools: Map<string, Tool> = new Map();
  private executionHistory: ToolCall[] = [];
  private fileHandles: Map<string, FileSystemFileHandle> = new Map();
  private dirHandles: Map<string, FileSystemDirectoryHandle> = new Map();

  constructor() {
    console.log('[ToolExecutor] Initialized with real browser APIs');
    this.initializeCoreTools();
  }

  private initializeCoreTools(): void {
    // Tool 1: read_file - Uses File System Access API or file input
    this.registerTool({
      name: 'read_file',
      description: 'Read the contents of a file (uses File System Access API)',
      parameters: [
        { name: 'path', type: 'string', required: true, description: 'File path or handle key' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          // Check if we have a stored handle
          const handle = this.fileHandles.get(params.path);
          if (handle) {
            const file = await handle.getFile();
            const content = await file.text();
            return {
              success: true,
              output: content,
              executionTime: Date.now() - startTime,
            };
          }
          
          // Otherwise, use the virtual filesystem (in-memory)
          const vfsContent = this.virtualFS.get(params.path);
          if (vfsContent !== undefined) {
            return {
              success: true,
              output: vfsContent,
              executionTime: Date.now() - startTime,
            };
          }

          return {
            success: false,
            output: null,
            error: `File not found: ${params.path}. Use pick_file to select a file first.`,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 2: write_file - Uses File System Access API or virtual FS
    this.registerTool({
      name: 'write_file',
      description: 'Write content to a file (uses File System Access API or virtual FS)',
      parameters: [
        { name: 'path', type: 'string', required: true, description: 'File path or handle key' },
        { name: 'content', type: 'string', required: true, description: 'Content to write' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          // Check if we have a stored writable handle
          const handle = this.fileHandles.get(params.path);
          if (handle) {
            const writable = await handle.createWritable();
            await writable.write(params.content);
            await writable.close();
            return {
              success: true,
              output: `Wrote ${params.content.length} bytes to ${params.path}`,
              executionTime: Date.now() - startTime,
            };
          }
          
          // Fall back to virtual filesystem
          this.virtualFS.set(params.path, params.content);
          return {
            success: true,
            output: `Wrote ${params.content.length} bytes to virtual FS: ${params.path}`,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 3: replace - Real text replacement in virtual FS or file handles
    this.registerTool({
      name: 'replace',
      description: 'Replace text in a file',
      parameters: [
        { name: 'path', type: 'string', required: true, description: 'File path' },
        { name: 'search', type: 'string', required: true, description: 'Text to search for' },
        { name: 'replace', type: 'string', required: true, description: 'Text to replace with' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          // Read current content
          const handle = this.fileHandles.get(params.path);
          let content: string;
          
          if (handle) {
            const file = await handle.getFile();
            content = await file.text();
          } else {
            content = this.virtualFS.get(params.path) || '';
          }
          
          if (!content) {
            return {
              success: false,
              output: null,
              error: `File not found: ${params.path}`,
              executionTime: Date.now() - startTime,
            };
          }

          // Perform real replacement
          const escaped = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const newContent = content.split(params.search).join(params.replace);
          const replacements = (content.match(new RegExp(escaped, 'g')) || []).length;
          
          // Write back
          if (handle) {
            const writable = await handle.createWritable();
            await writable.write(newContent);
            await writable.close();
          } else {
            this.virtualFS.set(params.path, newContent);
          }

          return {
            success: true,
            output: `Replaced ${replacements} occurrence(s) of "${params.search}" with "${params.replace}" in ${params.path}`,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 4: run_command - REAL JavaScript execution in sandboxed iframe
    this.registerTool({
      name: 'run_command',
      description: 'Execute JavaScript code in a sandboxed environment',
      parameters: [
        { name: 'command', type: 'string', required: true, description: 'JavaScript code to execute' },
        { name: 'cwd', type: 'string', required: false, description: 'Context/virtual directory' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          // Execute in sandboxed iframe for safety
          const result = await this.executeInSandbox(params.command);
          return {
            success: true,
            output: result,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Execution error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 5: pick_file - Opens real file picker (File System Access API)
    this.registerTool({
      name: 'pick_file',
      description: 'Open file picker to select a real file from disk',
      parameters: [
        { name: 'types', type: 'object', required: false, description: 'File type filters' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          if (!('showOpenFilePicker' in window)) {
            return {
              success: false,
              output: null,
              error: 'File System Access API not supported in this browser. Use Chrome/Edge.',
              executionTime: Date.now() - startTime,
            };
          }

          const options: any = {};
          if (params.types) {
            options.types = [{
              description: 'Files',
              accept: params.types
            }];
          }

          const [fileHandle] = await (window as any).showOpenFilePicker(options);
          const file = await fileHandle.getFile();
          const content = await file.text();
          
          // Store the handle for future read/write operations
          this.fileHandles.set(file.name, fileHandle);
          
          return {
            success: true,
            output: {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              content: content.substring(0, 10000), // First 10KB
              handleKey: file.name
            },
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          if ((error as any).name === 'AbortError') {
            return {
              success: false,
              output: null,
              error: 'File selection cancelled',
              executionTime: Date.now() - startTime,
            };
          }
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'File picker error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 6: save_file - Save to real disk via File System Access API
    this.registerTool({
      name: 'save_file',
      description: 'Save content to a real file on disk (File System Access API)',
      parameters: [
        { name: 'content', type: 'string', required: true, description: 'Content to save' },
        { name: 'suggestedName', type: 'string', required: false, description: 'Suggested filename' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          if (!('showSaveFilePicker' in window)) {
            // Fallback: download as blob
            const blob = new Blob([params.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = params.suggestedName || 'output.txt';
            a.click();
            URL.revokeObjectURL(url);
            
            return {
              success: true,
              output: `Downloaded ${params.content.length} bytes as ${params.suggestedName || 'output.txt'}`,
              executionTime: Date.now() - startTime,
            };
          }

          const handle = await (window as any).showSaveFilePicker({
            suggestedName: params.suggestedName || 'output.txt',
          });
          
          const writable = await handle.createWritable();
          await writable.write(params.content);
          await writable.close();
          
          this.fileHandles.set(handle.name, handle);
          
          return {
            success: true,
            output: `Saved ${params.content.length} bytes to ${handle.name}`,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          if ((error as any).name === 'AbortError') {
            return {
              success: false,
              output: null,
              error: 'Save cancelled',
              executionTime: Date.now() - startTime,
            };
          }
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Save error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    // Tool 7: search_knowledge - Uses real Wikipedia + DuckDuckGo
    this.registerTool({
      name: 'search_knowledge',
      description: 'Search real knowledge sources (Wikipedia, DuckDuckGo)',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Search query' },
        { name: 'limit', type: 'number', required: false, description: 'Max results' },
      ],
      execute: async (params) => {
        const startTime = Date.now();
        try {
          const results: any[] = [];
          
          // Real Wikipedia search
          try {
            const wikiResponse = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(params.query)}&srlimit=${params.limit || 5}&format=json&origin=*`
            );
            if (wikiResponse.ok) {
              const wikiData = await wikiResponse.json();
              const wikiResults = (wikiData.query?.search || []).map((item: any) => ({
                title: item.title,
                snippet: item.snippet.replace(/<[^>]*>/g, ''),
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                source: 'Wikipedia'
              }));
              results.push(...wikiResults);
            }
          } catch (e) { /* continue */ }

          // Real DuckDuckGo search
          try {
            const ddgResponse = await fetch(
              `https://api.duckduckgo.com/?q=${encodeURIComponent(params.query)}&format=json&no_html=1&skip_disambig=1`
            );
            if (ddgResponse.ok) {
              const ddgData = await ddgResponse.json();
              if (ddgData.Abstract) {
                results.unshift({
                  title: ddgData.Heading || params.query,
                  snippet: ddgData.Abstract,
                  url: ddgData.AbstractURL || '',
                  source: 'DuckDuckGo'
                });
              }
            }
          } catch (e) { /* continue */ }

          return {
            success: true,
            output: results,
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            success: false,
            output: null,
            error: error instanceof Error ? error.message : 'Search error',
            executionTime: Date.now() - startTime,
          };
        }
      },
    });

    console.log(`[ToolExecutor] ${this.tools.size} tools registered (all real implementations)`);
  }

  // Virtual filesystem (in-memory, persists during session)
  private virtualFS: Map<string, string> = new Map();

  // Execute JavaScript in sandboxed iframe
  private async executeInSandbox(code: string, timeout: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-scripts');
      
      const id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      iframe.srcdoc = `
        <!DOCTYPE html><html><body><script>
          try {
            const logs = [];
            const origLog = console.log;
            console.log = (...args) => logs.push(args.map(a => String(a)).join(' '));
            
            const result = (function() { ${code} })();
            
            parent.postMessage({
              id: '${id}',
              success: true,
              result: result !== undefined ? String(result) : 'undefined',
              logs: logs
            }, '*');
          } catch (e) {
            parent.postMessage({
              id: '${id}',
              success: false,
              error: e.message,
              logs: []
            }, '*');
          }
        </script></body></html>
      `;

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Execution timeout'));
      }, timeout);

      const handler = (event: MessageEvent) => {
        if (event.data?.id === id) {
          clearTimeout(timeoutId);
          cleanup();
          if (event.data.success) {
            const output = event.data.logs.length > 0 
              ? event.data.logs.join('\n') + '\n=> ' + event.data.result
              : event.data.result;
            resolve(output);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      const cleanup = () => {
        window.removeEventListener('message', handler);
        iframe.remove();
      };

      window.addEventListener('message', handler);
      document.body.appendChild(iframe);
    });
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async executeTool(name: string, params: Record<string, any>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        output: null,
        error: `Tool "${name}" not found. Available: ${Array.from(this.tools.keys()).join(', ')}`,
        executionTime: 0,
      };
    }

    const startTime = Date.now();
    try {
      const result = await tool.execute(params);
      
      this.executionHistory.push({
        toolName: name,
        parameters: params,
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Tool execution failed',
        executionTime: Date.now() - startTime,
      };
    }
  }

  getAvailableTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getStats() {
    return {
      toolsRegistered: this.tools.size,
      toolsAvailable: Array.from(this.tools.keys()),
      executionCount: this.executionHistory.length,
      fileHandlesStored: this.fileHandles.size,
      virtualFSFiles: this.virtualFS.size,
    };
  }
}
