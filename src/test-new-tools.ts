// Test if Synth SAI can use the new tools
import { SynthSAI } from './synth/synth-sai';

const synth = new SynthSAI();

async function testNewTools() {
  console.log('🧪 Testing if Synth SAI can use new tools...\n');

  // Test 1: Can it use Vane for web search?
  console.log('Test 1: Web Search with Vane');
  try {
    const result = await synth.process('Search for latest AI news using Vane');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Vane integration:', result.modulesUsed.includes('VaneSearch') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Test 2: Can it use Lightpanda for browser automation?
  console.log('Test 2: Browser Automation with Lightpanda');
  try {
    const result = await synth.process('Use Lightpanda to scrape https://example.com');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Lightpanda integration:', result.modulesUsed.includes('LightpandaBrowser') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Test 3: Can it use Situation Monitor for real-time news?
  console.log('Test 3: Real-Time News with Situation Monitor');
  try {
    const result = await synth.process('Get latest news from Situation Monitor');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Situation Monitor integration:', result.modulesUsed.includes('SituationMonitor') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Test 4: Can it use Osiris AI for global intelligence?
  console.log('Test 4: Global Intelligence with Osiris AI');
  try {
    const result = await synth.process('Track flights using Osiris AI');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Osiris AI integration:', result.modulesUsed.includes('OsirisAI') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Test 5: Can it use Floorplan for code visualization?
  console.log('Test 5: Code Visualization with Floorplan');
  try {
    const result = await synth.process('Visualize the codebase using Floorplan');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Floorplan integration:', result.modulesUsed.includes('Floorplan') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Test 6: Can it use Pake for desktop packaging?
  console.log('Test 6: Desktop Packaging with Pake');
  try {
    const result = await synth.process('Package this app as desktop using Pake');
    console.log('Result:', result.output.substring(0, 200));
    console.log('Modules used:', result.modulesUsed);
    console.log('Has Pake integration:', result.modulesUsed.includes('Pake') ? '✅ YES' : '❌ NO');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  console.log('🏁 Test Complete');
}

testNewTools().catch(console.error);
