#!/usr/bin/env node

/**
 * Media Player Integration Test
 *
 * Tests media player with WebSocket connection wait
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3002';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

async function testMediaPlayerWithWait() {
  let browser;
  let page;

  try {
    console.log(`\n🧪 Media Player Integration Test`);
    console.log(`📍 URL: ${TEST_URL}\n`);

    browser = await chromium.launch({
      headless: true, // Run headless for CI/server environment
      args: ['--disable-web-security']
    });

    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    // Collect all console messages
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('[MediaPlayer]') || text.includes('[MediaDemoScene]') ||
          text.includes('[WebSocket') || text.includes('[App]')) {
        console.log(`   📝 ${text}`);
      }
    });

    // Navigate to page
    console.log(`⏳ Navigating to ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for initial render
    await page.waitForTimeout(3000);

    console.log(`\n⏳ Waiting for WebSocket connection...`);

    // Wait for WebSocket connection (up to 15 seconds)
    let wsConnected = false;
    let myClientId = null;

    for (let i = 0; i < 15; i++) {
      const state = await page.evaluate(() => {
        return {
          hasClient: typeof window !== 'undefined',
          console: window.consoleLogs || []
        };
      });

      // Check console logs for connection success
      const connectionLog = consoleLogs.find(log =>
        log.includes('WebSocket connected') ||
        log.includes('SERVER_HELLO') ||
        log.includes('My client ID:')
      );

      if (connectionLog) {
        console.log(`   ✅ WebSocket connection detected`);
        wsConnected = true;

        // Extract client ID
        const match = connectionLog.match(/My client ID: ([a-f0-9-]+)/i);
        if (match) {
          myClientId = match[1];
          console.log(`   📋 Client ID: ${myClientId}`);
        }
        break;
      }

      await page.waitForTimeout(1000);
      console.log(`   ⏳ Waiting... (${i + 1}/15)`);
    }

    if (!wsConnected) {
      console.log(`   ⚠️  WebSocket not connected, continuing anyway...`);
    }

    // Wait a bit more for components to initialize
    await page.waitForTimeout(3000);

    console.log(`\n⏳ Checking for media elements...`);

    // Check for media elements
    const mediaCheck = await page.evaluate(() => {
      const video = document.querySelectorAll('video');
      const audio = document.querySelectorAll('audio');
      return {
        videoCount: video.length,
        audioCount: audio.length,
        videoDetails: Array.from(video).map(v => ({
          src: v.src,
          readyState: v.readyState,
          networkState: v.networkState,
          paused: v.paused
        })),
        audioDetails: Array.from(audio).map(a => ({
          src: a.src,
          readyState: a.readyState,
          paused: a.paused
        }))
      };
    });

    console.log(`\n📊 Media Elements Found:`);
    console.log(`   Video: ${mediaCheck.videoCount}`);
    console.log(`   Audio: ${mediaCheck.audioCount}`);

    if (mediaCheck.videoCount > 0) {
      console.log(`\n✅ Video Element Details:`);
      mediaCheck.videoDetails.forEach((v, i) => {
        console.log(`   Video ${i + 1}:`);
        console.log(`     - Source: ${v.src.substring(0, 60)}...`);
        console.log(`     - Ready State: ${v.readyState}`);
        console.log(`     - Paused: ${v.paused}`);
      });
    }

    if (mediaCheck.audioCount > 0) {
      console.log(`\n✅ Audio Element Details:`);
      mediaCheck.audioDetails.forEach((a, i) => {
        console.log(`   Audio ${i + 1}:`);
        console.log(`     - Source: ${a.src.substring(0, 60)}...`);
        console.log(`     - Ready State: ${a.readyState}`);
        console.log(`     - Paused: ${a.paused}`);
      });
    }

    // Take screenshots
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const screenshot1 = path.join(SCREENSHOT_DIR, '01-page-loaded.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${screenshot1}`);

    // Wait for media to potentially load
    console.log(`\n⏳ Waiting for media to load...`);
    await page.waitForTimeout(5000);

    const screenshot2 = path.join(SCREENSHOT_DIR, '02-after-wait.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshot2}`);

    // Try to interact with page - check if we can see the demo scene text
    const canvasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        hasCanvas: !!canvas,
        width: canvas?.width,
        height: canvas?.height
      };
    });

    console.log(`\n📊 Canvas Info:`);
    console.log(`   Has Canvas: ${canvasContent.hasCanvas}`);
    console.log(`   Size: ${canvasContent.width}x${canvasContent.height}`);

    // Check React state
    const reactState = await page.evaluate(() => {
      // Try to access React DevTools or internal state
      const rootElement = document.querySelector('#root');
      return {
        hasRoot: !!rootElement,
        children: rootElement?.childElementCount || 0
      };
    });

    console.log(`\n📊 React State:`);
    console.log(`   Root Element: ${reactState.hasRoot}`);
    console.log(`   Children: ${reactState.children}`);

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);

    if (wsConnected) {
      console.log(`✅ WebSocket: Connected`);
    } else {
      console.log(`⚠️  WebSocket: Not connected`);
    }

    if (mediaCheck.videoCount > 0) {
      console.log(`✅ Video Player: Present (${mediaCheck.videoCount} element(s))`);
    } else {
      console.log(`❌ Video Player: Not found`);
    }

    if (mediaCheck.audioCount > 0) {
      console.log(`✅ Audio Player: Present (${mediaCheck.audioCount} element(s))`);
    } else {
      console.log(`❌ Audio Player: Not found`);
    }

    if (canvasContent.hasCanvas) {
      console.log(`✅ Canvas Rendering: Active`);
    } else {
      console.log(`❌ Canvas Rendering: Not active`);
    }

    console.log(`\n💡 Note: If media elements are not found, it may be because:`);
    console.log(`   - WebSocket connection not established`);
    console.log(`   - myClientId is null (preventing MediaDemoScene render)`);
    console.log(`   - Component initialization delayed`);
    console.log(`   - Check browser console for errors`);

    console.log(`\n📸 Check screenshots in: ${SCREENSHOT_DIR}`);
    console.log(`   Screenshot 1: Initial load`);
    console.log(`   Screenshot 2: After 5 seconds`);

    await browser.close();
    console.log(`\n✅ Test completed`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);

    if (browser) {
      await browser.close();
    }
  }
}

testMediaPlayerWithWait()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
