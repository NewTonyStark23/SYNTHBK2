// Comprehensive stress test for all Synth SAI modules
import { SynthSAI } from './synth/synth-sai';

class StressTest {
  private synth: SynthSAI;
  private results: Array<{
    test: string;
    input: string;
    passed: boolean;
    details: string;
    duration: number;
  }> = [];

  constructor() {
    this.synth = new SynthSAI();
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Stress Test...\n');

    // Test 1: Conversational Responses
    await this.testConversationalResponses();

    // Test 2: Code Generation
    await this.testCodeGeneration();

    // Test 3: Knowledge Retrieval
    await this.testKnowledgeRetrieval();

    // Test 4: Web Search
    await this.testWebSearch();

    // Test 5: Creative Writing
    await this.testCreativeWriting();

    // Test 6: Chain of Thought Reasoning
    await this.testReasoning();

    // Test 7: Multi-Modal (if image provided)
    await this.testMultiModal();

    // Test 8: Learning Capabilities
    await this.testLearning();

    // Print results
    this.printResults();
  }

  private async testConversationalResponses() {
    console.log('📝 Testing Conversational Responses...');

    const tests = [
      { input: 'yo whats up bro', expected: 'greeting' },
      { input: 'hello there', expected: 'greeting' },
      { input: 'how are you doing', expected: 'smalltalk' },
      { input: 'thanks for helping', expected: 'gratitude' },
      { input: 'bye see you later', expected: 'farewell' },
      { input: 'good morning', expected: 'greeting' },
    ];

    for (const test of tests) {
      const start = Date.now();
      const response = await this.synth.process(test.input);
      const duration = Date.now() - start;

      // Check that response is natural language (not JSON)
      const isNatural = !response.output.startsWith('{') && 
                       !response.output.startsWith('[') &&
                       response.output.length > 10;

      // Check that ConversationalResponder was used
      const usedResponder = response.modulesUsed.includes('ConversationalResponder');

      const passed = isNatural && usedResponder;

      this.results.push({
        test: 'Conversational Response',
        input: test.input,
        passed,
        details: passed 
          ? `Natural response: "${response.output.substring(0, 50)}..."`
          : `Failed: Output is ${isNatural ? 'natural' : 'JSON'}, Responder ${usedResponder ? 'used' : 'NOT used'}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${test.input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testCodeGeneration() {
    console.log('\n💻 Testing Code Generation...');

    const tests = [
      'build a red website',
      'create a todo list app',
      'make a calculator',
    ];

    for (const input of tests) {
      const start = Date.now();
      const response = await this.synth.process(input);
      const duration = Date.now() - start;

      // Check for code blocks
      const hasCode = response.output.includes('```');
      
      // Check for preview
      const hasPreview = response.output.includes('Preview') || 
                        response.output.includes('<iframe') ||
                        response.output.includes('<!DOCTYPE');

      // Check modules used
      const usedCodeGenerator = response.modulesUsed.includes('EnhancedCodeGenerator');

      const passed = hasCode && usedCodeGenerator;

      this.results.push({
        test: 'Code Generation',
        input,
        passed,
        details: passed
          ? `Generated code with ${hasPreview ? 'preview' : 'no preview'}`
          : `Failed: Code=${hasCode}, Preview=${hasPreview}, Generator=${usedCodeGenerator}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testKnowledgeRetrieval() {
    console.log('\n📚 Testing Knowledge Retrieval...');

    const tests = [
      'what is artificial intelligence',
      'tell me about quantum computing',
      'explain machine learning',
    ];

    for (const input of tests) {
      const start = Date.now();
      const response = await this.synth.process(input);
      const duration = Date.now() - start;

      // Check for knowledge sources
      const usedKnowledge = response.modulesUsed.includes('RealKnowledgeBase') ||
                           response.modulesUsed.includes('KnowledgeGraph');

      // Check for natural language (not JSON)
      const isNatural = !response.output.startsWith('{');

      // Check for sources
      const hasSources = response.output.includes('Source') || 
                        response.output.includes('source') ||
                        response.output.includes('Wikipedia');

      const passed = usedKnowledge && isNatural;

      this.results.push({
        test: 'Knowledge Retrieval',
        input,
        passed,
        details: passed
          ? `Retrieved knowledge${hasSources ? ' with sources' : ''}`
          : `Failed: Knowledge=${usedKnowledge}, Natural=${isNatural}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testWebSearch() {
    console.log('\n🔍 Testing Web Search...');

    const tests = [
      'search for latest AI news',
      'find information about space exploration',
    ];

    for (const input of tests) {
      const start = Date.now();
      const response = await this.synth.process(input);
      const duration = Date.now() - start;

      // Check for web search usage
      const usedWebSearch = response.modulesUsed.includes('WebSearch');

      // Check for natural language
      const isNatural = !response.output.startsWith('{');

      const passed = usedWebSearch && isNatural;

      this.results.push({
        test: 'Web Search',
        input,
        passed,
        details: passed
          ? 'Web search executed and converted to natural language'
          : `Failed: WebSearch=${usedWebSearch}, Natural=${isNatural}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testCreativeWriting() {
    console.log('\n✍️ Testing Creative Writing...');

    const tests = [
      'write a short story about adventure',
      'write a poem about nature',
    ];

    for (const input of tests) {
      const start = Date.now();
      const response = await this.synth.process(input);
      const duration = Date.now() - start;

      // Check for creative writing module
      const usedCreative = response.modulesUsed.includes('CreativeWritingEngine');

      // Check for substantial content
      const hasContent = response.output.length > 200;

      const passed = usedCreative && hasContent;

      this.results.push({
        test: 'Creative Writing',
        input,
        passed,
        details: passed
          ? `Generated ${response.output.length} characters of creative content`
          : `Failed: Creative=${usedCreative}, Content=${hasContent}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testReasoning() {
    console.log('\n🧠 Testing Chain-of-Thought Reasoning...');

    const tests = [
      'if all cats are animals and some animals are pets, are all cats pets?',
      'solve: 2x + 5 = 15',
    ];

    for (const input of tests) {
      const start = Date.now();
      const response = await this.synth.process(input);
      const duration = Date.now() - start;

      // Check for reasoning module
      const usedReasoning = response.modulesUsed.includes('ChainOfThoughtReasoner');

      // Check for reasoning steps
      const hasSteps = response.output.includes('Reasoning Steps') ||
                      response.output.includes('Step');

      const passed = usedReasoning;

      this.results.push({
        test: 'Chain-of-Thought Reasoning',
        input,
        passed,
        details: passed
          ? `Reasoning applied${hasSteps ? ' with visible steps' : ''}`
          : `Failed: Reasoning=${usedReasoning}`,
        duration,
      });

      console.log(`  ${passed ? '✅' : '❌'} "${input}" → ${passed ? 'PASS' : 'FAIL'}`);
    }
  }

  private async testMultiModal() {
    console.log('\n🖼️ Testing Multi-Modal Capabilities...');

    // Note: This test requires an actual image to be provided
    // For now, we'll just check if the module is available
    const stats = this.synth.getSystemStats();
    const hasMultiModal = stats.multiModalProcessor !== undefined;

    this.results.push({
      test: 'Multi-Modal',
      input: 'N/A (requires image)',
      passed: hasMultiModal,
      details: hasMultiModal 
        ? 'Multi-modal processor available'
        : 'Multi-modal processor not available',
      duration: 0,
    });

    console.log(`  ${hasMultiModal ? '✅' : '❌'} Multi-modal module ${hasMultiModal ? 'available' : 'NOT available'}`);
  }

  private async testLearning() {
    console.log('\n🎓 Testing Learning Capabilities...');

    // Test that learning modules are active
    const stats = this.synth.getSystemStats();
    const hasNeuralNetwork = stats.neuralNetwork !== undefined;
    const hasContinuousLearning = stats.continuousLearning !== undefined;

    const passed = hasNeuralNetwork && hasContinuousLearning;

    this.results.push({
      test: 'Learning Capabilities',
      input: 'N/A (system check)',
      passed,
      details: passed
        ? 'Neural network and continuous learning active'
        : `Failed: NeuralNet=${hasNeuralNetwork}, ContinuousLearning=${hasContinuousLearning}`,
      duration: 0,
    });

    console.log(`  ${passed ? '✅' : '❌'} Learning systems ${passed ? 'active' : 'NOT active'}`);
  }

  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 STRESS TEST RESULTS');
    console.log('='.repeat(60));

    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ❌ ${r.test}: "${r.input}"`);
          console.log(`     ${r.details}\n`);
        });
    }

    console.log('='.repeat(60));
    console.log(failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('='.repeat(60));
  }
}

// Run the stress test
const stressTest = new StressTest();
stressTest.runAllTests().catch(console.error);
