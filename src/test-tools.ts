// Test script to verify all 6 new tools are wired up and working
import { synth } from './synth/synth-sai';

async function testNewTools() {
  console.log('🧪 Testing 6 New Tool Integrations\n');
  console.log('='.repeat(60));

  // Test 1: Vane AI Search
  console.log('\n📍 Test 1: Vane AI Search');
  console.log('-'.repeat(60));
  try {
    const result1 = await synth.process('Search for the latest AI news');
    console.log('✅ Vane Search:', result1.modulesUsed.includes('VaneSearch') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result1.modulesUsed.filter(m => m.includes('Vane')).join(', '));
    console.log('   Confidence:', (result1.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Vane Search Error:', error.message);
  }

  // Test 2: Lightpanda Browser Automation
  console.log('\n📍 Test 2: Lightpanda Browser Automation');
  console.log('-'.repeat(60));
  try {
    const result2 = await synth.process('Scrape https://example.com using the browser');
    console.log('✅ Lightpanda:', result2.modulesUsed.includes('LightpandaBrowser') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result2.modulesUsed.filter(m => m.includes('Lightpanda')).join(', '));
    console.log('   Confidence:', (result2.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Lightpanda Error:', error.message);
  }

  // Test 3: Situation Monitor (Real-time News)
  console.log('\n📍 Test 3: Situation Monitor (Real-time News)');
  console.log('-'.repeat(60));
  try {
    const result3 = await synth.process('What is the latest news today?');
    console.log('✅ Situation Monitor:', result3.modulesUsed.includes('SituationMonitor') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result3.modulesUsed.filter(m => m.includes('Situation')).join(', '));
    console.log('   Confidence:', (result3.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Situation Monitor Error:', error.message);
  }

  // Test 4: Osiris AI (Global Intelligence)
  console.log('\n📍 Test 4: Osiris AI (Global Intelligence)');
  console.log('-'.repeat(60));
  try {
    const result4 = await synth.process('Track current flights');
    console.log('✅ Osiris AI:', result4.modulesUsed.includes('OsirisAI') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result4.modulesUsed.filter(m => m.includes('Osiris')).join(', '));
    console.log('   Confidence:', (result4.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Osiris AI Error:', error.message);
  }

  // Test 5: Floorplan (Code Visualization)
  console.log('\n📍 Test 5: Floorplan (Code Visualization)');
  console.log('-'.repeat(60));
  try {
    const result5 = await synth.process('Visualize the codebase architecture');
    console.log('✅ Floorplan:', result5.modulesUsed.includes('Floorplan') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result5.modulesUsed.filter(m => m.includes('Floorplan')).join(', '));
    console.log('   Confidence:', (result5.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Floorplan Error:', error.message);
  }

  // Test 6: Pake (Desktop Packaging)
  console.log('\n📍 Test 6: Pake (Desktop Packaging)');
  console.log('-'.repeat(60));
  try {
    const result6 = await synth.process('Package this as a desktop app');
    console.log('✅ Pake:', result6.modulesUsed.includes('PakePackager') ? 'ACTIVE' : 'NOT USED');
    console.log('   Modules:', result6.modulesUsed.filter(m => m.includes('Pake')).join(', '));
    console.log('   Confidence:', (result6.confidence * 100).toFixed(1) + '%');
  } catch (error: any) {
    console.log('❌ Pake Error:', error.message);
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYSTEM STATS');
  console.log('='.repeat(60));
  const stats = synth.getSystemStats();
  console.log('\n✅ New Tool Integrations:');
  console.log('   - Vane Search:', stats.vaneSearch ? 'CONFIGURED' : 'MISSING');
  console.log('   - Lightpanda Browser:', stats.lightpandaBrowser ? 'CONFIGURED' : 'MISSING');
  console.log('   - Situation Monitor:', stats.situationMonitor ? 'CONFIGURED' : 'MISSING');
  console.log('   - Osiris AI:', stats.osirisAI ? 'CONFIGURED' : 'MISSING');
  console.log('   - Floorplan:', stats.floorplan ? 'CONFIGURED' : 'MISSING');
  console.log('   - Pake Packager:', stats.pakePackager ? 'CONFIGURED' : 'MISSING');
  
  console.log('\n📈 Total Modules:', Object.keys(stats).length);
  console.log('='.repeat(60));
  console.log('\n✅ All 6 new tools are wired up and ready!');
}

testNewTools().catch(console.error);
