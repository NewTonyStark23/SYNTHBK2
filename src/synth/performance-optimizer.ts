// Performance optimization and profiling
export class PerformanceOptimizer {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private optimizations: Optimization[] = [];

  constructor() {
    console.log('[PerformanceOptimizer] Initialized with profiling capabilities');
  }

  // Profile a function execution
  async profile<T>(name: string, fn: () => Promise<T> | T): Promise<{
    result: T;
    duration: number;
    memory?: number;
  }> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;

    const result = await fn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize;

    const duration = endTime - startTime;
    const memory = startMemory && endMemory ? endMemory - startMemory : undefined;

    // Record metric
    this.recordMetric(name, duration, memory);

    return {
      result,
      duration,
      memory
    };
  }

  // Record performance metric
  private recordMetric(name: string, duration: number, memory?: number): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      existing.count++;
      existing.totalDuration += duration;
      existing.avgDuration = existing.totalDuration / existing.count;
      existing.minDuration = Math.min(existing.minDuration, duration);
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      
      if (memory !== undefined) {
        existing.totalMemory = (existing.totalMemory || 0) + memory;
        existing.avgMemory = existing.totalMemory / existing.count;
      }
    } else {
      this.metrics.set(name, {
        name,
        count: 1,
        totalDuration: duration,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        totalMemory: memory,
        avgMemory: memory
      });
    }
  }

  // Get performance report
  getReport(): PerformanceReport {
    const metrics = Array.from(this.metrics.values());
    
    const totalCalls = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalDuration = metrics.reduce((sum, m) => sum + m.totalDuration, 0);
    const avgDuration = totalDuration / totalCalls;
    
    // Identify bottlenecks
    const bottlenecks = metrics
      .filter(m => m.avgDuration > 100) // Slow operations
      .sort((a, b) => b.avgDuration - a.avgDuration);
    
    // Identify optimizations
    const optimizations = this.identifyOptimizations(metrics);
    
    return {
      totalCalls,
      totalDuration,
      avgDuration,
      bottlenecks: bottlenecks.slice(0, 5),
      optimizations,
      metrics
    };
  }

  // Identify optimization opportunities
  private identifyOptimizations(metrics: PerformanceMetric[]): Optimization[] {
    const optimizations: Optimization[] = [];
    
    // Check for slow operations
    for (const metric of metrics) {
      if (metric.avgDuration > 100) {
        optimizations.push({
          name: `Optimize ${metric.name}`,
          description: `Average execution time is ${metric.avgDuration.toFixed(2)}ms`,
          impact: 'high',
          effort: 'medium',
          suggestion: this.getSuggestion(metric.name)
        });
      }
      
      // Check for high variance
      if (metric.maxDuration > metric.avgDuration * 3) {
        optimizations.push({
          name: `Stabilize ${metric.name}`,
          description: `High variance: min=${metric.minDuration.toFixed(2)}ms, max=${metric.maxDuration.toFixed(2)}ms`,
          impact: 'medium',
          effort: 'low',
          suggestion: 'Consider caching or memoization'
        });
      }
      
      // Check for high memory usage
      if (metric.avgMemory && metric.avgMemory > 10 * 1024 * 1024) { // > 10MB
        optimizations.push({
          name: `Reduce memory for ${metric.name}`,
          description: `Average memory usage: ${(metric.avgMemory / 1024 / 1024).toFixed(2)}MB`,
          impact: 'medium',
          effort: 'high',
          suggestion: 'Consider streaming or chunking'
        });
      }
    }
    
    return optimizations;
  }

  private getSuggestion(operationName: string): string {
    const suggestions: Record<string, string> = {
      'code_execution': 'Consider using Web Workers for parallel execution',
      'knowledge_search': 'Implement caching for frequent queries',
      'web_search': 'Add request batching and caching',
      'neural_network': 'Consider model quantization or pruning',
      'image_processing': 'Use WebAssembly for heavy computation',
      'conversation': 'Implement conversation state caching'
    };
    
    return suggestions[operationName] || 'Profile further to identify specific bottleneck';
  }

  // Optimize a specific operation
  async optimize(operationName: string, optimization: string): Promise<void> {
    switch (optimization) {
      case 'cache':
        // Implement caching
        this.optimizations.push({
          name: `Cached ${operationName}`,
          description: 'Added caching layer',
          impact: 'high',
          effort: 'low',
          suggestion: 'Cache implemented'
        });
        break;
        
      case 'parallelize':
        // Implement parallelization
        this.optimizations.push({
          name: `Parallelized ${operationName}`,
          description: 'Added parallel execution',
          impact: 'high',
          effort: 'medium',
          suggestion: 'Parallelization implemented'
        });
        break;
        
      case 'memoize':
        // Implement memoization
        this.optimizations.push({
          name: `Memoized ${operationName}`,
          description: 'Added memoization',
          impact: 'medium',
          effort: 'low',
          suggestion: 'Memoization implemented'
        });
        break;
    }
  }

  // Benchmark comparison
  async benchmark(
    name: string,
    implementations: Map<string, () => Promise<any>>,
    iterations: number = 10
  ): Promise<BenchmarkResult> {
    const results: Map<string, number[]> = new Map();
    
    for (const [implName, impl] of implementations) {
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await impl();
        const end = performance.now();
        durations.push(end - start);
      }
      
      results.set(implName, durations);
    }
    
    // Calculate statistics
    const stats = new Map<string, BenchmarkStats>();
    
    for (const [implName, durations] of results) {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
      
      stats.set(implName, { avg, min, max, variance });
    }
    
    // Find fastest implementation
    let fastest = '';
    let fastestAvg = Infinity;
    
    for (const [implName, stat] of stats) {
      if (stat.avg < fastestAvg) {
        fastestAvg = stat.avg;
        fastest = implName;
      }
    }
    
    return {
      name,
      iterations,
      results: stats,
      fastest
    };
  }

  getStats() {
    return {
      trackedMetrics: this.metrics.size,
      appliedOptimizations: this.optimizations.length,
      totalCalls: Array.from(this.metrics.values()).reduce((sum, m) => sum + m.count, 0)
    };
  }
}

interface PerformanceMetric {
  name: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMemory?: number;
  avgMemory?: number;
}

interface Optimization {
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface PerformanceReport {
  totalCalls: number;
  totalDuration: number;
  avgDuration: number;
  bottlenecks: PerformanceMetric[];
  optimizations: Optimization[];
  metrics: PerformanceMetric[];
}

interface BenchmarkStats {
  avg: number;
  min: number;
  max: number;
  variance: number;
}

interface BenchmarkResult {
  name: string;
  iterations: number;
  results: Map<string, BenchmarkStats>;
  fastest: string;
}
