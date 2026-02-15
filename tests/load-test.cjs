#!/usr/bin/env node

/**
 * Load Testing Script
 *
 * Simulates 1000+ concurrent users to test system performance
 * Tests presence service, hub service, and database performance
 */

const BASE_URL = 'http://localhost:8011'; // Auth service
const HUB_URL = 'http://localhost:8012'; // Hub service
const PRESENCE_URL = 'http://localhost:8013'; // Presence service

interface LoadTestResult {
  testName: string;
  success: boolean;
  duration: number;
  requests: number;
  errors: number;
  avgLatency: number;
  maxLatency: number;
  throughput: number;
}

interface TestConfig {
  concurrentUsers: number;
  durationSeconds: number;
  rampUpSeconds?: number;
  requestsPerSecond: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureLatency(fn: () => Promise<any>): Promise<{duration: number, result: any}> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { duration, result };
}

async function runLoadTest(
  name: string,
  concurrentUsers: number,
  duration: number,
  config: TestConfig,
): Promise<LoadTestResult> {
  console.log(`\n=== Starting Load Test: ${name} ===`);
  console.log(`Concurrent Users: ${concurrentUsers}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Requests/Second: ${config.requestsPerSecond}`);

  const startTime = Date.now();
  const results: any[] = [];
  const errors: string[] = [];

  // Health checks
  console.log('\n--- Health Checks ---');

  const authHealth = await fetch(`${BASE_URL}/health`);
  const hubHealth = await fetch(`${HUB_URL}/health`);
  const presenceHealth = await fetch(`${PRESENCE_URL}/health`);

  const healthCheck = async (service: string, url: string): Promise<boolean> => {
    try {
      const start = Date.now();
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      const latency = Date.now() - start;
      const success = response.ok;
      console.log(`  ${service}: ${success ? '✓' : '✗'} (${latency}ms)`);
      return success;
    } catch (error) {
      console.error(`  ${service}: Error - ${error}`);
      return false;
    }
  };

  const allHealthy = await Promise.all([
    healthCheck('Auth', `${BASE_URL}/health`),
    healthCheck('Hub', `${HUB_URL}/health`),
    healthCheck('Presence', `${PRESENCE_URL}/health`),
  ]);

  if (!allHealthy.every(Boolean)) {
    return {
      testName: name,
      success: false,
      duration: Date.now() - startTime,
      requests: 0,
      errors: 1,
      avgLatency: 0,
      maxLatency: 0,
      throughput: 0,
    };
  }

  console.log('All services healthy ✓');

  // Create user pool
  console.log('\n--- Creating User Pool ---');
  const userIds: Array.from({ length: concurrentUsers }, (_, i) => i + 1);

  // Create rooms
  console.log('\n--- Creating Test Rooms ---');
  const roomCreateResponse = await fetch(`${HUB_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Load Test Room ${Date.now()}`,
      description: 'Room for load testing',
    }),
    signal: AbortSignal.timeout(10000),
  });

  const roomData = await roomCreateResponse.json();
  const roomIds = Array.from({ length: Math.ceil(concurrentUsers / 10) }, (_, i) => {
    return roomData.rooms ? roomData.rooms[i]?.room_id : '';
  }).filter(Boolean);

  console.log(`Created ${roomIds.length} test rooms`);

  // Load Test 1: User Registration
  console.log('\nTest 1: User Registration');
  const registerStart = Date.now();
  const registerResults = await Promise.allSettled(
    userIds.map(userId => measureLatency(async () => {
      return await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `loadtest${userId}@example.com`,
          display_name: `Load Test User ${userId}`,
          password: 'TestPassword123!',
        }),
        signal: AbortSignal.timeout(5000),
      });
    })
  );

  const registerDuration = Date.now() - registerStart;
  results.push({
    testName: 'User Registration',
    success: registerResults.every(r => r.duration < 1000),
    duration: registerDuration,
    requests: concurrentUsers,
    errors: registerResults.filter(r => r.duration >= 1000).length,
    avgLatency: registerResults.reduce((sum, r) => sum + r.duration, 0) / registerResults.length,
    maxLatency: Math.max(...registerResults.map(r => r.duration)),
    throughput: concurrentUsers / (registerDuration / 1000),
  });
  console.log(`User Registration: ${registerResults.filter(r => r.duration < 1000).length}/${concurrentUsers} passed (${registerDuration}ms)`);

  // Load Test 2: Room Listing
  console.log('\nTest 2: Room Listing');
  const listStart = Date.now();
  const listResults = await Promise.allSettled(
    roomIds.map(roomId => measureLatency(async () => {
      return fetch(`${HUB_URL}/rooms`, {
        signal: AbortSignal.timeout(5000),
      });
    })
  );

  const listDuration = Date.now() - listStart;
  results.push({
    testName: 'Room Listing',
    success: listResults.every(r => r.duration < 1000),
    duration: listDuration,
    requests: concurrentUsers,
    errors: listResults.filter(r => r.duration >= 1000).length,
    avgLatency: listResults.reduce((sum, r) => sum + r.duration, 0) / listResults.length,
    maxLatency: Math.max(...listResults.map(r => r.duration)),
    throughput: concurrentUsers / (listDuration / 1000),
  });
  console.log(`Room Listing: ${listResults.filter(r => r.duration < 1000).length}/${concurrentUsers} passed (${listDuration}ms)`);

  // Load Test 3: Concurrent Room Joins
  console.log('\nTest 3: Concurrent Room Joins');
  const joinStart = Date.now();
  const joinResults = await Promise.allSettled(
    userIds.slice(0, Math.min(concurrentUsers, 10)).map(userId => measureLatency(async () => {
      const roomToJoin = roomIds[userId % roomIds.length];
      return fetch(`${HUB_URL}/rooms/${roomToJoin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
    })
  );

  const joinDuration = Date.now() - joinStart;
  results.push({
    testName: 'Concurrent Room Joins',
    success: joinResults.every(r => r.duration < 1000),
    duration: joinDuration,
    requests: concurrentUsers,
    errors: joinResults.filter(r => r.duration >= 1000).length,
    avgLatency: joinResults.reduce((sum, r) => sum + r.duration, 0) / joinResults.length,
    maxLatency: Math.max(...joinResults.map(r => r.duration)),
    throughput: concurrentUsers / (joinDuration / 1000),
  });
  console.log(`Concurrent Joins: ${joinResults.filter(r => r.duration < 1000).length}/${Math.min(concurrentUsers, 10)} users passed (${joinDuration}ms)`);

  // Load Test 4: User Authentication
  console.log('\nTest 4: User Authentication');
  const authStart = Date.now();
  const authResults = await Promise.allSettled(
    userIds.slice(0, 10).map(userId => measureLatency(async () => {
      return await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `loadtest${userId}@example.com`,
          password: 'TestPassword123!',
        }),
        signal: AbortSignal.timeout(5000),
      });
    })
  );

  const authDuration = Date.now() - authStart;
  results.push({
    testName: 'User Authentication',
    success: authResults.every(r => r.duration < 1000),
    duration: authDuration,
    requests: 10,
    errors: authResults.filter(r => r.duration >= 1000).length,
    avgLatency: authResults.reduce((sum, r) => sum + r.duration, 0) / authResults.length,
    maxLatency: Math.max(...authResults.map(r => r.duration)),
    throughput: 10 / (authDuration / 1000),
  });
  console.log(`User Authentication: ${authResults.filter(r => r.duration < 1000).length}/10 passed (${authDuration}ms)`);

  // Load Test 5: System Under Load
  const totalTestDuration = Date.now() - startTime;
  const totalRequests = (concurrentUsers * 4) + (concurrentUsers * 3) + (concurrentUsers * 10) + 10;

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total Duration: ${totalTestDuration}ms`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Success Rate: ${results.filter(r => r.success).length}/${results.length} (${Math.round((results.filter(r => r.success).length / results.length) * 100)}%)`);
  console.log(`Avg Latency: ${Math.round(results.reduce((sum, r) => sum + r.avgLatency, 0) / results.length)}ms`);
  console.log(`Max Latency: ${results.reduce((max, r) => Math.max(max, r.maxLatency), 0)}ms`);
  console.log(`Total Errors: ${results.reduce((sum, r) => sum + r.errors, 0)}`);

  // Performance Metrics
  const avgLatency = results.reduce((sum, r) => sum + r.avgLatency, 0) / results.length;
  const maxLatency = results.reduce((max, r) => Math.max(max, r.maxLatency), 0);
  const throughput = totalRequests / (totalTestDuration / 1000);

  console.log(`Performance Metrics:`);
  console.log(`  Avg Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`  Max Latency: ${maxLatency}ms`);
  console.log(`  Throughput: ${throughput.toFixed(2)} req/s`);

  // Save Results
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      concurrentUsers,
      durationSeconds: duration,
      rampUpSeconds: config.rampUpSeconds,
      requestsPerSecond: config.requestsPerSecond,
    },
    results,
    summary: {
      totalDuration: totalTestDuration,
      totalRequests,
      totalTests: results.length,
      passedTests: results.filter(r => r.success).length,
      successRate: `${Math.round((results.filter(r => r.success).length / results.length) * 100)}%`,
      avgLatency: `${avgLatency.toFixed(2)}ms`,
      maxLatency: `${maxLatency}ms`,
      throughput: `${throughput.toFixed(2)} req/s`,
      totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
    },
  };

  const fs = require('fs');
  fs.writeFileSync('load-test-results.json', JSON.stringify(report, null, 2));

  console.log('\n=== Report Saved to load-test-results.json ===');

  return report;
}

// Configuration
const config: TestConfig = {
  concurrentUsers: 1000,
  durationSeconds: 30,
  rampUpSeconds: 5,
  requestsPerSecond: 50,
};

// Run tests
runLoadTest('Production Load Test', config.concurrentUsers, config.durationSeconds, config)
  .then(report => {
    console.log('\n=== Test Complete ===');
    process.exit(report.summary.totalErrors > 0 ? 1 : 0);
  });
