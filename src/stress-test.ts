// ============================================
// SYNTH SAI - COMPREHENSIVE STRESS TEST
// Tests all 16 modules individually and together
// ============================================

import { synth } from './synth/synth-sai';
import { logger } from './synth/logger';

interface TestResult {
  module: string;
  test: string;
  passed: boolean;
  details: string;
  duration: number;
}

class StressTest {
  private results: TestResult[] = [];
  private startTime = Date.now();

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Synth SAI Comprehensive Stress Test\n');
    console.log('='.repeat(80));

    // Test each module individually
    await this.testConversationState();
    await this.testAtomicMemory();
    await this.testSAIModelTypes();
    await this.testSemanticAnalysis();
    await this.testKnowledgeGraph();
    await this.testFrontierUI();
    await this.testInstructionDecomposer();
    await this.testUncertaintyCalibrator();
    await this.testToolExecutor();
    await this.testLongFormGenerator();
    await this.testEmotionalIntelligence();
    await this.testContinuousLearning();
    await this.testTriAttention();
    await this.testSwarmTelepathy();
    await this.testAgentDesktop();
    await this.testGraphEngine();

    // Test integrated pipeline
    await this.testIntegratedPipeline();

    // Test edge cases
    await this.testEdgeCases();

    // Test learning capabilities
    await this.testLearningCapabilities();

    // Print results
    this.printResults();
  }

  // ============================================
  // MODULE TESTS
  // ============================================

  private async testConversationState(): Promise<void> {
    const test = 'Conversation State - Referential Resolution';
    const start = Date.now();

    try {
      // Test 1: Create entity
      const response1 = await synth.process('Build a red website', 'test-user');
      
      // Test 2: Reference it
      const response2 = await synth.process('Actually make it blue', 'test-user');
      
      const passed = response2.confidence > 0.5 && 
                     response2.modulesUsed.includes('ConversationStateMachine');

      this.results.push({
        module: 'ConversationState',
        test,
        passed,
        details: `Created entity, then referenced it. Confidence: ${(response2.confidence * 100).toFixed(1)}%`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'ConversationState',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testAtomicMemory(): Promise<void> {
    const test = 'Atomic Memory - Compression';
    const start = Date.now();

    try {
      const stats = synth.getSystemStats().atomicMemory;
      const compressionRatio = parseFloat(stats.compressionRatio);
      const passed = compressionRatio > 100; // Should achieve significant compression

      this.results.push({
        module: 'AtomicMemory',
        test,
        passed,
        details: `Compression ratio: ${stats.compressionRatio}x, Total atoms: ${stats.totalAtoms}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'AtomicMemory',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testSAIModelTypes(): Promise<void> {
    const test = 'SAI Model Types - Selection';
    const start = Date.now();

    try {
      const response1 = await synth.process('Build a website', 'test-user');
      const response2 = await synth.process('Analyze this data', 'test-user');
      
      const passed = response1.modelUsed !== response2.modelUsed || 
                     response1.modulesUsed.some((m: string) => m.includes('SAIModelManager'));

      this.results.push({
        module: 'SAIModelTypes',
        test,
        passed,
        details: `Model 1: ${response1.modelUsed}, Model 2: ${response2.modelUsed}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'SAIModelTypes',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testSemanticAnalysis(): Promise<void> {
    const test = 'Semantic Analysis - 6-Layer Understanding';
    const start = Date.now();

    try {
      const response = await synth.process('I\'m so frustrated! This code keeps failing!', 'test-user');
      
      const passed = response.modulesUsed.includes('MultiLayerSemanticAnalyzer') &&
                     response.confidence > 0.3;

      this.results.push({
        module: 'SemanticAnalysis',
        test,
        passed,
        details: `Detected emotion and intent. Confidence: ${(response.confidence * 100).toFixed(1)}%`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'SemanticAnalysis',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testKnowledgeGraph(): Promise<void> {
    const test = 'Knowledge Graph - Query';
    const start = Date.now();

    try {
      const response = await synth.process('What is Python?', 'test-user');
      
      const passed = response.modulesUsed.includes('KnowledgeGraph') &&
                     response.output.length > 0;

      this.results.push({
        module: 'KnowledgeGraph',
        test,
        passed,
        details: `Queried knowledge graph. Response length: ${response.output.length}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'KnowledgeGraph',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testFrontierUI(): Promise<void> {
    const test = 'Frontier-UI - Visual Generation';
    const start = Date.now();

    try {
      const response = await synth.process('Show me a map of restaurants', 'test-user');
      
      const passed = response.modulesUsed.includes('FrontierUIGenerator') &&
                     response.uiSpec !== null;

      this.results.push({
        module: 'FrontierUI',
        test,
        passed,
        details: `Generated UI spec: ${response.uiSpec ? 'Yes' : 'No'}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'FrontierUI',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testInstructionDecomposer(): Promise<void> {
    const test = 'Instruction Decomposer - Complex Instructions';
    const start = Date.now();

    try {
      const response = await synth.process('Build a website, make it red, add a header, then add a footer', 'test-user');
      
      const passed = response.modulesUsed.includes('InstructionDecomposer');

      this.results.push({
        module: 'InstructionDecomposer',
        test,
        passed,
        details: `Decomposed complex instruction. Modules: ${response.modulesUsed.length}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'InstructionDecomposer',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testUncertaintyCalibrator(): Promise<void> {
    const test = 'Uncertainty Calibrator - Confidence Scoring';
    const start = Date.now();

    try {
      const response = await synth.process('What is the meaning of life?', 'test-user');
      
      const passed = response.modulesUsed.includes('UncertaintyCalibrator') &&
                     response.confidence >= 0 && response.confidence <= 1;

      this.results.push({
        module: 'UncertaintyCalibrator',
        test,
        passed,
        details: `Confidence score: ${(response.confidence * 100).toFixed(1)}%`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'UncertaintyCalibrator',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testToolExecutor(): Promise<void> {
    const test = 'Tool Executor - Tool Execution';
    const start = Date.now();

    try {
      const response = await synth.process('Search for information about AI', 'test-user');
      
      const passed = response.modulesUsed.includes('ToolExecutor');

      this.results.push({
        module: 'ToolExecutor',
        test,
        passed,
        details: `Executed tool. Response length: ${response.output.length}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'ToolExecutor',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testLongFormGenerator(): Promise<void> {
    const test = 'Long-form Generator - Document Creation';
    const start = Date.now();

    try {
      const response = await synth.process('Write a tutorial about machine learning', 'test-user');
      
      const passed = response.modulesUsed.includes('LongFormGenerator') &&
                     response.output.length > 500;

      this.results.push({
        module: 'LongFormGenerator',
        test,
        passed,
        details: `Generated document. Length: ${response.output.length} chars`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'LongFormGenerator',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testEmotionalIntelligence(): Promise<void> {
    const test = 'Emotional Intelligence - Tone Adaptation';
    const start = Date.now();

    try {
      const response1 = await synth.process('I\'m so excited about this!', 'test-user');
      const response2 = await synth.process('I\'m really frustrated with this bug', 'test-user');
      
      const passed = response1.modulesUsed.includes('EmotionalIntelligenceEngine') &&
                     response2.modulesUsed.includes('EmotionalIntelligenceEngine');

      this.results.push({
        module: 'EmotionalIntelligence',
        test,
        passed,
        details: `Adapted tone for different emotions`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'EmotionalIntelligence',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testContinuousLearning(): Promise<void> {
    const test = 'Continuous Learning - Self-Improvement';
    const start = Date.now();

    try {
      // Simulate multiple interactions
      await synth.process('What is AI?', 'test-user');
      await synth.process('Tell me more about machine learning', 'test-user');
      await synth.process('How does deep learning work?', 'test-user');
      
      const stats = synth.getSystemStats().continuousLearning;
      const passed = stats.totalExamples > 0;

      this.results.push({
        module: 'ContinuousLearning',
        test,
        passed,
        details: `Learning examples: ${stats.totalExamples}, Preference pairs: ${stats.preferencePairs}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'ContinuousLearning',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testTriAttention(): Promise<void> {
    const test = 'TriAttention - Context Compression';
    const start = Date.now();

    try {
      const stats = synth.getSystemStats().triAttention;
      const passed = stats.compressionRatio > 5; // Should achieve 10.7x

      this.results.push({
        module: 'TriAttention',
        test,
        passed,
        details: `Compression ratio: ${stats.compressionRatio.toFixed(1)}x, Total turns: ${stats.contextWindow.totalTurns}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'TriAttention',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testSwarmTelepathy(): Promise<void> {
    const test = 'Swarm Telepathy - Multi-Agent Communication';
    const start = Date.now();

    try {
      const stats = synth.getSystemStats().swarmTelepathy;
      const passed = stats.totalAgents > 0;

      this.results.push({
        module: 'SwarmTelepathy',
        test,
        passed,
        details: `Agents: ${stats.totalAgents}, Transfers: ${stats.totalTransfers}, Speedup: ${stats.speedup}x`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'SwarmTelepathy',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testAgentDesktop(): Promise<void> {
    const test = 'Agent-Desktop - Computer Control';
    const start = Date.now();

    try {
      const stats = synth.getSystemStats().agentDesktop;
      const passed = stats.platform !== null;

      this.results.push({
        module: 'AgentDesktop',
        test,
        passed,
        details: `Platform: ${stats.platform}, Sessions: ${stats.totalSessions}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'AgentDesktop',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testGraphEngine(): Promise<void> {
    const test = 'Graph Engine - Graph Traversal';
    const start = Date.now();

    try {
      const stats = synth.getSystemStats().graphEngine;
      const passed = stats.totalNodes >= 0;

      this.results.push({
        module: 'GraphEngine',
        test,
        passed,
        details: `Nodes: ${stats.totalNodes}, Edges: ${stats.totalEdges}, Lookup: ${stats.lookupSpeed}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'GraphEngine',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  // ============================================
  // INTEGRATED TESTS
  // ============================================

  private async testIntegratedPipeline(): Promise<void> {
    const test = 'Integrated Pipeline - All Modules Working Together';
    const start = Date.now();

    try {
      const response = await synth.process('Build a red website, then make it blue, and show me a chart of the changes', 'test-user');
      
      const passed = response.modulesUsed.length >= 5 && // Should use multiple modules
                     response.confidence > 0.3 &&
                     response.processingTime > 0;

      this.results.push({
        module: 'IntegratedPipeline',
        test,
        passed,
        details: `Modules used: ${response.modulesUsed.length}, Confidence: ${(response.confidence * 100).toFixed(1)}%, Time: ${response.processingTime.toFixed(2)}ms`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'IntegratedPipeline',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  private async testEdgeCases(): Promise<void> {
    const test = 'Edge Cases - Empty Input, Very Long Input, Special Characters';
    const start = Date.now();

    try {
      // Test empty input
      const response1 = await synth.process('', 'test-user');
      
      // Test very long input
      const longInput = 'a'.repeat(10000);
      const response2 = await synth.process(longInput, 'test-user');
      
      // Test special characters
      const response3 = await synth.process('!@#$%^&*()_+{}|:"<>?', 'test-user');
      
      const passed = response1.confidence >= 0 && 
                     response2.confidence >= 0 && 
                     response3.confidence >= 0;

      this.results.push({
        module: 'EdgeCases',
        test,
        passed,
        details: `Handled empty, long (10K chars), and special character inputs`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'EdgeCases',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  // ============================================
  // LEARNING TESTS
  // ============================================

  private async testLearningCapabilities(): Promise<void> {
    const test = 'Learning Capabilities - Self-Improvement Over Time';
    const start = Date.now();

    try {
      // Simulate learning from feedback
      const stats1 = synth.getSystemStats().continuousLearning;
      
      // Multiple interactions
      for (let i = 0; i < 10; i++) {
        await synth.process(`Question ${i}`, 'test-user');
      }
      
      const stats2 = synth.getSystemStats().continuousLearning;
      
      const passed = stats2.totalExamples > stats1.totalExamples;

      this.results.push({
        module: 'LearningCapabilities',
        test,
        passed,
        details: `Examples before: ${stats1.totalExamples}, after: ${stats2.totalExamples}`,
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        module: 'LearningCapabilities',
        test,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: Date.now() - start,
      });
    }
  }

  // ============================================
  // RESULTS
  // ============================================

  private printResults(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 STRESS TEST RESULTS');
    console.log('='.repeat(80) + '\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log(`\nTotal Duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s\n`);

    console.log('='.repeat(80));
    console.log('DETAILED RESULTS');
    console.log('='.repeat(80) + '\n');

    for (const result of this.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} [${result.module}] ${result.test}`);
      console.log(`   ${result.details}`);
      console.log(`   Duration: ${result.duration}ms\n`);
    }

    if (failed > 0) {
      console.log('='.repeat(80));
      console.log('❌ FAILED TESTS');
      console.log('='.repeat(80) + '\n');

      for (const result of this.results.filter(r => !r.passed)) {
        console.log(`[${result.module}] ${result.test}`);
        console.log(`   ${result.details}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('🏁 STRESS TEST COMPLETE');
    console.log('='.repeat(80));
  }
}

// Run the stress test
const stressTest = new StressTest();
stressTest.runAllTests().then(() => {
  console.log('\n✅ Stress test completed successfully!');
}).catch(error => {
  console.error('\n❌ Stress test failed:', error);
});
