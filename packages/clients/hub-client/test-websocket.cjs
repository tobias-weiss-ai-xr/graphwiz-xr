#!/usr/bin/env node

/**
 * Simple WebSocket Connection Test
 */

const WebSocket = require('ws');

const wsUrl = 'ws://localhost:4000/ws/lobby';
const userId = 'test-user-' + Date.now();
const clientId = 'test-client-' + Date.now();

console.log(`\n🔌 Testing WebSocket Connection`);
console.log(`📍 URL: ${wsUrl}`);
console.log(`👤 User: ${userId}`);
console.log(`🔑 Client: ${clientId}\n`);

const ws = new WebSocket(`${wsUrl}?user_id=${userId}&client_id=${clientId}`);

ws.on('open', () => {
  console.log(`✅ WebSocket connected successfully!`);
  console.log(`   Connection established to ${wsUrl}`);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log(`\n📨 Received message:`);
    console.log(`   Type: ${message.type || 'unknown'}`);
    console.log(`   Data:`, JSON.stringify(message, null, 2).split('\n').map(l => '   ' + l).join('\n'));
  } catch (e) {
    console.log(`\n📨 Received raw message:`, data.toString());
  }
});

ws.on('error', (error) => {
  console.error(`❌ WebSocket error:`, error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket closed:`);
  console.log(`   Code: ${code}`);
  console.log(`   Reason: ${reason.toString() || 'none'}`);
  process.exit(0);
});

// Close after 5 seconds
setTimeout(() => {
  console.log(`\n⏱️  Test timeout - closing connection...`);
  ws.close();
}, 5000);
