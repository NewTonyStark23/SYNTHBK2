// Real File System Access - Browser File API + Node.js fs
export class RealFileSystem {
  private isNodeEnvironment: boolean;
  private fs: any = null;
  private path: any = null;

  constructor() {
    this.isNodeEnvironment = typeof process !== 'undefined' && process.versions !== undefined && process.versions.node !== undefined;
    
    if (this.isNodeEnvironment) {
      // Node.js environment
      try {
        this.fs = require('fs');
        this.path = require('path');
        console.log('[RealFileSystem] Initialized with Node.js fs module');
      } catch (error) {
        console.error('[RealFileSystem] Failed to load fs module:', error);
      }
    } else {
      console.log('[RealFileSystem] Initialized with Browser File API');
    }
  }

  // Read file (Node.js or Browser)
  async readFile(filePath: string, encoding: string = 'utf-8'): Promise<string> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.readFile(filePath, encoding, (err: any, data: string) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    } else {
      // Browser - would need File API with file input
      throw new Error('Browser file reading requires user file selection');
    }
  }

  // Write file (Node.js)
  async writeFile(filePath: string, content: string, encoding: string = 'utf-8'): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.writeFile(filePath, content, encoding, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser file writing requires File System Access API');
    }
  }

  // Append to file (Node.js)
  async appendFile(filePath: string, content: string, encoding: string = 'utf-8'): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.appendFile(filePath, content, encoding, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser file appending requires File System Access API');
    }
  }

  // Delete file (Node.js)
  async deleteFile(filePath: string): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.unlink(filePath, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser file deletion requires File System Access API');
    }
  }

  // Check if file exists (Node.js)
  async fileExists(filePath: string): Promise<boolean> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve) => {
        this.fs.access(filePath, this.fs.constants.F_OK, (err: any) => {
          resolve(!err);
        });
      });
    } else {
      return false;
    }
  }

  // Read directory (Node.js)
  async readDirectory(dirPath: string): Promise<string[]> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.readdir(dirPath, (err: any, files: string[]) => {
          if (err) reject(err);
          else resolve(files);
        });
      });
    } else {
      throw new Error('Browser directory reading requires File System Access API');
    }
  }

  // Create directory (Node.js)
  async createDirectory(dirPath: string, recursive: boolean = true): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.mkdir(dirPath, { recursive }, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser directory creation requires File System Access API');
    }
  }

  // Get file stats (Node.js)
  async getFileStats(filePath: string): Promise<any> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.stat(filePath, (err: any, stats: any) => {
          if (err) reject(err);
          else resolve({
            size: stats.size,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            created: stats.birthtime,
            modified: stats.mtime,
            accessed: stats.atime
          });
        });
      });
    } else {
      throw new Error('Browser file stats require File System Access API');
    }
  }

  // Copy file (Node.js)
  async copyFile(source: string, destination: string): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.copyFile(source, destination, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser file copying requires File System Access API');
    }
  }

  // Move file (Node.js)
  async moveFile(source: string, destination: string): Promise<void> {
    if (this.isNodeEnvironment && this.fs) {
      return new Promise((resolve, reject) => {
        this.fs.rename(source, destination, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      throw new Error('Browser file moving requires File System Access API');
    }
  }

  // Read JSON file
  async readJSON<T>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    return JSON.parse(content);
  }

  // Write JSON file
  async writeJSON(filePath: string, data: any, pretty: boolean = true): Promise<void> {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    await this.writeFile(filePath, content);
  }

  // Watch file for changes (Node.js)
  watchFile(filePath: string, callback: (eventType: string, filename: string) => void): any {
    if (this.isNodeEnvironment && this.fs) {
      return this.fs.watch(filePath, callback);
    } else {
      throw new Error('Browser file watching requires File System Access API');
    }
  }

  // Get file extension
  getFileExtension(filePath: string): string {
    if (this.isNodeEnvironment && this.path) {
      return this.path.extname(filePath);
    } else {
      const parts = filePath.split('.');
      return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
    }
  }

  // Get file name without extension
  getFileName(filePath: string): string {
    if (this.isNodeEnvironment && this.path) {
      return this.path.basename(filePath, this.path.extname(filePath));
    } else {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      const nameParts = filename.split('.');
      return nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : filename;
    }
  }

  // Get directory name
  getDirectoryPath(filePath: string): string {
    if (this.isNodeEnvironment && this.path) {
      return this.path.dirname(filePath);
    } else {
      const parts = filePath.split('/');
      return parts.slice(0, -1).join('/');
    }
  }

  // Join paths
  joinPaths(...paths: string[]): string {
    if (this.isNodeEnvironment && this.path) {
      return this.path.join(...paths);
    } else {
      return paths.join('/');
    }
  }

  // Resolve absolute path
  resolvePath(...paths: string[]): string {
    if (this.isNodeEnvironment && this.path) {
      return this.path.resolve(...paths);
    } else {
      return paths.join('/');
    }
  }

  // Browser file download
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    if (typeof window !== 'undefined') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      throw new Error('Download only available in browser environment');
    }
  }

  // Browser file upload (requires file input element)
  async uploadFile(fileInput: HTMLInputElement): Promise<{ name: string; content: string; size: number } | null> {
    if (typeof window !== 'undefined' && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const content = await file.text();
      
      return {
        name: file.name,
        content,
        size: file.size
      };
    }
    
    return null;
  }

  getStats() {
    return {
      isNodeEnvironment: this.isNodeEnvironment,
      hasFs: !!this.fs,
      hasPath: !!this.path,
      capabilities: this.isNodeEnvironment ? [
        'readFile',
        'writeFile',
        'appendFile',
        'deleteFile',
        'fileExists',
        'readDirectory',
        'createDirectory',
        'getFileStats',
        'copyFile',
        'moveFile',
        'readJSON',
        'writeJSON',
        'watchFile',
        'getFileExtension',
        'getFileName',
        'getDirectoryPath',
        'joinPaths',
        'resolvePath'
      ] : [
        'downloadFile',
        'uploadFile'
      ]
    };
  }
}
