// Real File System Access - Browser File System Access API + Virtual FS
// Works in browser using File System Access API (Chrome/Edge) or falls back to virtual FS
export class RealFileSystem {
  private virtualFS: Map<string, string> = new Map();
  private fileHandles: Map<string, FileSystemFileHandle> = new Map();
  private dirHandles: Map<string, FileSystemDirectoryHandle> = new Map();
  private hasFSAccess: boolean;

  constructor() {
    this.hasFSAccess = 'showOpenFilePicker' in window;
    console.log(`[RealFileSystem] Initialized - File System Access API: ${this.hasFSAccess ? 'available' : 'not available, using virtual FS'}`);
  }

  // Read file from virtual FS or stored handle
  async readFile(filePath: string): Promise<string> {
    // Check stored handles first
    const handle = this.fileHandles.get(filePath);
    if (handle) {
      const file = await handle.getFile();
      return file.text();
    }
    
    // Check virtual FS
    const content = this.virtualFS.get(filePath);
    if (content !== undefined) return content;
    
    throw new Error(`File not found: ${filePath}. Use pickFile() to select a file.`);
  }

  // Write file to virtual FS or stored handle
  async writeFile(filePath: string, content: string): Promise<void> {
    const handle = this.fileHandles.get(filePath);
    if (handle) {
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    }
    
    this.virtualFS.set(filePath, content);
  }

  // Append to file
  async appendFile(filePath: string, content: string): Promise<void> {
    const existing = await this.readFile(filePath).catch(() => '');
    await this.writeFile(filePath, existing + content);
  }

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    this.virtualFS.delete(filePath);
    this.fileHandles.delete(filePath);
  }

  // Check if file exists
  async fileExists(filePath: string): Promise<boolean> {
    return this.virtualFS.has(filePath) || this.fileHandles.has(filePath);
  }

  // List files in virtual FS
  async readDirectory(_dirPath: string): Promise<string[]> {
    return Array.from(this.virtualFS.keys());
  }

  // Pick a real file from disk (File System Access API)
  async pickFile(types?: Record<string, string[]>): Promise<{ name: string; content: string; handle: string }> {
    if (!this.hasFSAccess) {
      throw new Error('File System Access API not supported. Use Chrome or Edge.');
    }

    const options: any = {};
    if (types) {
      options.types = [{ description: 'Files', accept: types }];
    }

    const [handle] = await (window as any).showOpenFilePicker(options);
    const file = await handle.getFile();
    const content = await file.text();
    
    this.fileHandles.set(file.name, handle);
    
    return { name: file.name, content, handle: file.name };
  }

  // Save file to disk
  async saveFile(content: string, suggestedName: string = 'output.txt'): Promise<string> {
    if (!this.hasFSAccess) {
      // Fallback: download as blob
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedName;
      a.click();
      URL.revokeObjectURL(url);
      return `Downloaded as ${suggestedName}`;
    }

    const handle = await (window as any).showSaveFilePicker({ suggestedName });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    this.fileHandles.set(handle.name, handle);
    return `Saved to ${handle.name}`;
  }

  // Pick directory
  async pickDirectory(): Promise<string> {
    if (!this.hasFSAccess) {
      throw new Error('File System Access API not supported.');
    }

    const handle = await (window as any).showDirectoryPicker();
    this.dirHandles.set(handle.name, handle);
    return handle.name;
  }

  getStats() {
    return {
      virtualFiles: this.virtualFS.size,
      fileHandles: this.fileHandles.size,
      dirHandles: this.dirHandles.size,
      hasFSAccess: this.hasFSAccess
    };
  }
}
