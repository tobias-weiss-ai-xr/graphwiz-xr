#!/usr/bin/env node
/**
 * Avatar System Automated Test Runner
 *
 * Runs fuzzy tests, multi-client tests, and stress tests
 * on the avatar system.
 */

import { AvatarFuzzer, FuzzyTestRunner, MultiClientFuzzer, AvatarFuzzer as AF } from './avatar-fuzzy-test';

interface TestSuite {
  name: string;
  run: () => Promise<void>;
}

class AvatarTestSuite {
  private testSuites: TestSuite[] = [];
  private startTime: number = 0;

  /**
   * Register a test suite
   */
  addSuite(name: string, runFn: () => Promise<void>) {
    this.testSuites.push({ name, run: runFn });
  }

  /**
   * Run all test suites
   */
  async runAll() {
    this.startTime = Date.now();
    console.log('\n' + '='.repeat(80));
    console.log('🧪 AVATAR SYSTEM TEST SUITE');
    console.log('='.repeat(80) + '\n');

    for (const suite of this.testSuites) {
      try {
        console.log(`\n📋 Running: ${suite.name}`);
        console.log('-'.repeat(80));
        await suite.run();
        console.log(`✅ ${suite.name} - PASSED\n`);
      } catch (error) {
        console.error(`❌ ${suite.name} - FAILED`);
        console.error(error);
        console.log('');
      }
    }

    const duration = Date.now() - this.startTime;
    console.log('='.repeat(80));
    console.log(`✨ All tests completed in ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(80) + '\n');
  }
}

// Create test suite
const suite = new AvatarTestSuite();

// Test 1: Basic validation tests
suite.addSuite('Basic Validation Tests', async () => {
  const runner = new FuzzyTestRunner();
  const fuzzer = new AvatarFuzzer();

  console.log('  Testing valid avatar configs...');

  // Test 10 valid configs
  for (let i = 0; i < 10; i++) {
    const config = fuzzer.randomValid();
    const result = await runner.runTest(config);

    if (!result.passed) {
      console.log(`    ❌ Test ${i + 1}: FAILED`);
      console.log(`       Config: ${JSON.stringify(config)}`);
      console.log(`       Errors: ${result.errors.join(', ')}`);
    } else {
      console.log(`    ✅ Test ${i + 1}: PASSED (${result.duration.toFixed(2)}ms)`);
    }
  }

  const stats = runner.getStats();
  console.log(`\n  📊 Validation Stats: ${stats.passed}/${stats.total} passed (${stats.passRate.toFixed(1)}%)`);
});

// Test 2: Edge case tests
suite.addSuite('Edge Case Tests', async () => {
  const runner = new FuzzyTestRunner();

  console.log('  Testing edge cases...');
  const results = await runner.runEdgeCases();

  results.forEach(result => {
    if (result.passed) {
      console.log(`    ✅ ${result.testId}: PASSED`);
    } else {
      console.log(`    ❌ ${result.testId}: FAILED`);
      console.log(`       Config: ${JSON.stringify(result.config)}`);
      console.log(`       Errors: ${result.errors.join(', ')}`);
    }

    if (result.warnings.length > 0) {
      console.log(`       ⚠️  Warnings: ${result.warnings.join(', ')}`);
    }
  });

  const stats = runner.getStats();
  console.log(`\n  📊 Edge Case Stats: ${stats.passed}/${stats.total} passed (${stats.passRate.toFixed(1)}%)`);
});

// Test 3: Random fuzzy tests
suite.addSuite('Random Fuzzy Tests (100 iterations)', async () => {
  const runner = new FuzzyTestRunner();
  const fuzzer = new AvatarFuzzer();

  console.log('  Running 100 random fuzzy tests...');

  const results = await runner.runBatch(100, () => fuzzer.randomFuzzy());

  const stats = runner.getStats();
  console.log(`  📊 Fuzzy Test Stats:`);
  console.log(`     Total: ${stats.total}`);
  console.log(`     Passed: ${stats.passed} (${stats.passRate.toFixed(1)}%)`);
  console.log(`     Failed: ${stats.failed}`);
  console.log(`     Warnings: ${stats.warnings}`);
  console.log(`     Duration: ${stats.totalDuration.toFixed(2)}ms`);
  console.log(`     Avg: ${stats.avgDuration.toFixed(2)}ms per test`);

  // Show some failed examples
  const failed = results.filter(r => !r.passed).slice(0, 5);
  if (failed.length > 0) {
    console.log('\n  ❌ Sample Failures:');
    failed.forEach(f => {
      console.log(`     ${f.testId}: ${f.errors[0]}`);
    });
  }
});

// Test 4: Color validation tests
suite.addSuite('Color Format Tests', async () => {
  const runner = new FuzzyTestRunner();

  console.log('  Testing various color formats...');

  const colorTests = [
    { primary: '#FF0000', secondary: '#0000FF', name: 'valid hex' },
    { primary: '#F00', secondary: '#00F', name: 'short hex' },
    { primary: '#FF0000FF', secondary: '#0000FFAA', name: 'hex with alpha' },
    { primary: 'red', secondary: 'blue', name: 'named colors' },
    { primary: '', secondary: '#000000', name: 'empty primary' },
    { primary: '#', secondary: '#000000', name: 'incomplete hex' },
    { primary: '#GGGGGG', secondary: '#000000', name: 'invalid hex chars' },
    { primary: 'rgb(255,0,0)', secondary: '#000000', name: 'rgb format' },
  ];

  for (const test of colorTests) {
    const config = {
      body_type: 'human' as const,
      primary_color: test.primary,
      secondary_color: test.secondary,
      height: 1.7,
    };

    const result = await runner.runTest(config);
    const status = result.passed ? '✅' : '❌';
    const warnings = result.warnings.length > 0 ? ' ⚠️' : '';
    console.log(`    ${status} ${test.name}${warnings}`);

    if (result.warnings.length > 0) {
      console.log(`       Warning: ${result.warnings[0]}`);
    }
  }

  const stats = runner.getStats();
  console.log(`\n  📊 Color Stats: ${stats.passed}/${stats.total} passed`);
});

// Test 5: Height boundary tests
suite.addSuite('Height Boundary Tests', async () => {
  const runner = new FuzzyTestRunner();

  console.log('  Testing height boundaries...');

  const heightTests = [
    { height: 0.5, name: 'minimum (0.5m)', shouldPass: true },
    { height: 1.7, name: 'default (1.7m)', shouldPass: true },
    { height: 3.0, name: 'maximum (3.0m)', shouldPass: true },
    { height: 0.1, name: 'below minimum (0.1m)', shouldPass: false },
    { height: 5.0, name: 'above maximum (5.0m)', shouldPass: false },
    { height: -1.0, name: 'negative (-1.0m)', shouldPass: false },
    { height: 0, name: 'zero', shouldPass: false },
    { height: NaN, name: 'NaN', shouldPass: false },
    { height: Infinity, name: 'Infinity', shouldPass: false },
    { height: -Infinity, name: '-Infinity', shouldPass: false },
  ];

  for (const test of heightTests) {
    const config = {
      body_type: 'robot' as const,
      primary_color: '#4CAF50',
      secondary_color: '#2196F3',
      height: test.height,
    };

    const result = await runner.runTest(config);
    const passed = result.passed === test.shouldPass;
    const status = passed ? '✅' : '❌';
    const expectation = test.shouldPass ? 'should pass' : 'should fail';
    const actual = result.passed ? 'passed' : 'failed';

    console.log(`    ${status} ${test.name} (${expectation}, ${actual})`);

    if (!passed) {
      console.log(`       Errors: ${result.errors.join(', ')}`);
    }
  }

  const stats = runner.getStats();
  console.log(`\n  📊 Height Stats: ${stats.passed}/${stats.total} passed`);
});

// Test 6: Body type tests
suite.addSuite('Body Type Validation Tests', async () => {
  const runner = new FuzzyTestRunner();

  console.log('  Testing body type validation...');

  const bodyTypeTests = [
    { type: 'human', shouldPass: true },
    { type: 'robot', shouldPass: true },
    { type: 'alien', shouldPass: true },
    { type: 'animal', shouldPass: true },
    { type: 'abstract', shouldPass: true },
    { type: 'HUMAN', shouldPass: false }, // Case sensitive
    { type: ' Human ', shouldPass: false }, // Whitespace
    { type: '', shouldPass: false },
    { type: 'invalid', shouldPass: false },
    { type: null, shouldPass: false },
    { type: undefined, shouldPass: false },
    { type: 123, shouldPass: false },
  ];

  for (const test of bodyTypeTests) {
    const config = {
      body_type: test.type as any,
      primary_color: '#4CAF50',
      secondary_color: '#2196F3',
      height: 1.7,
    };

    const result = await runner.runTest(config);
    const passed = result.passed === test.shouldPass;
    const status = passed ? '✅' : '❌';
    const expectation = test.shouldPass ? 'should pass' : 'should fail';
    const actual = result.passed ? 'passed' : 'failed';
    const typeStr = String(test.type);

    console.log(`    ${status} "${typeStr}" (${expectation}, ${actual})`);

    if (!passed && result.errors.length > 0) {
      console.log(`       Error: ${result.errors[0]}`);
    }
  }

  const stats = runner.getStats();
  console.log(`\n  📊 Body Type Stats: ${stats.passed}/${stats.total} passed`);
});

// Test 7: Multi-client simulation
suite.addSuite('Multi-Client Simulation (10 clients, 5 updates each)', async () => {
  const fuzzer = new MultiClientFuzzer();

  console.log('  Simulating multiple clients...');

  const clients = await fuzzer.simulateMultipleClients(10);
  console.log(`    ✅ Created ${clients.size} clients`);

  const results = await fuzzer.testConcurrentUpdates(10, 5);
  console.log(`    ✅ Performed ${results.length} total updates`);

  const stats = fuzzer.getStats();
  console.log(`\n  📊 Multi-Client Stats:`);
  console.log(`     Total Updates: ${stats.total}`);
  console.log(`     Valid: ${stats.passed} (${stats.passRate.toFixed(1)}%)`);
  console.log(`     Invalid: ${stats.failed}`);
  console.log(`     Duration: ${stats.totalDuration.toFixed(2)}ms`);
});

// Test 8: Stress test
suite.addSuite('Stress Test (1000 concurrent operations)', async () => {
  const runner = new FuzzyTestRunner();
  const fuzzer = new AvatarFuzzer();

  console.log('  Running stress test...');

  const startTime = Date.now();
  const results = await runner.runBatch(1000, () => fuzzer.randomFuzzy());
  const duration = Date.now() - startTime;

  const stats = runner.getStats();
  console.log(`  📊 Stress Test Results:`);
  console.log(`     Operations: ${stats.total}`);
  console.log(`     Passed: ${stats.passed} (${stats.passRate.toFixed(1)}%)`);
  console.log(`     Failed: ${stats.failed}`);
  console.log(`     Warnings: ${stats.warnings}`);
  console.log(`     Total Duration: ${duration}ms`);
  console.log(`     Throughput: ${(stats.total / (duration / 1000)).toFixed(2)} ops/sec`);
  console.log(`     Avg Latency: ${stats.avgDuration.toFixed(3)}ms`);
});

// Test 9: Data integrity tests
suite.addSuite('Data Integrity Tests', async () => {
  const runner = new FuzzyTestRunner();

  console.log('  Testing data integrity...');

  // Test round-trip serialization
  const originalConfig = {
    body_type: 'robot' as const,
    primary_color: '#FF5722',
    secondary_color: '#9C27B0',
    height: 2.0,
  };

  // Serialize
  const serialized = JSON.stringify(originalConfig);

  // Deserialize
  const deserialized = JSON.parse(serialized);

  // Test deserialized config
  const result = await runner.runTest(deserialized);

  const integrityCheck =
    deserialized.body_type === originalConfig.body_type &&
    deserialized.primary_color === originalConfig.primary_color &&
    deserialized.secondary_color === originalConfig.secondary_color &&
    deserialized.height === originalConfig.height;

  console.log(`    ${integrityCheck ? '✅' : '❌'} Round-trip serialization`);
  console.log(`    ${result.passed ? '✅' : '❌'} Deserialized config valid`);
});

// Test 10: Performance benchmarks
suite.addSuite('Performance Benchmarks', async () => {
  const runner = new FuzzyTestRunner();
  const fuzzer = new AvatarFuzzer();

  console.log('  Running performance benchmarks...');

  const iterations = [100, 500, 1000, 5000];

  for (const iter of iterations) {
    const startTime = Date.now();
    const results = await runner.runBatch(iter, () => fuzzer.randomValid());
    const duration = Date.now() - startTime;
    const opsPerSec = iter / (duration / 1000);

    console.log(`    ${iter} ops: ${(duration)}ms (${opsPerSec.toFixed(0)} ops/sec)`);

    runner.clear();
  }
});

// Run all tests
suite.runAll().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
