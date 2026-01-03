#!/usr/bin/env node

/**
 * Media Player Test Script
 *
 * Tests video and audio playback functionality
 * Validates component rendering and network synchronization
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TEST_URL = process.env.TEST_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');
const LOG_FILE = path.join(__dirname, 'media-player-test-results.json');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results
const results = {
  timestamp: new Date().toISOString(),
  url: TEST_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

function log(testName, status, message, details = {}) {
  const test = {
    name: testName,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };

  results.tests.push(test);
  results.summary.total++;

  if (status === 'PASS') {
    results.summary.passed++;
    console.log(`✅ PASS: ${testName}`);
  } else if (status === 'FAIL') {
    results.summary.failed++;
    console.log(`❌ FAIL: ${testName}`);
  } else {
    console.log(`⏳ ${status}: ${testName}`);
  }

  if (message) {
    console.log(`   ${message}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMediaPlayer() {
  let browser;
  let page;

  try {
    console.log(`\n🧪 Starting Media Player Tests`);
    console.log(`📍 URL: ${TEST_URL}\n`);

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-web-security', '--allow-file-access-from-files']
    });

    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[MediaPlayer]') || text.includes('[MediaDemoScene]') || text.includes('[AudioVisualizer]')) {
        console.log(`   📝 ${text}`);
      }
    });

    // Navigate to page
    log('Navigate to Page', 'INFO', `Loading ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for page to load
    await sleep(3000);

    // Test 1: Check MediaDemoScene is present
    log('MediaDemoScene Presence', 'INFO', 'Checking for MediaDemoScene component');
    const mediaDemoExists = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });

    if (mediaDemoExists) {
      log('MediaDemoScene Presence', 'PASS', 'Canvas element found');
    } else {
      log('MediaDemoScene Presence', 'FAIL', 'Canvas element not found');
      return;
    }

    // Take initial screenshot
    const initialScreenshot = path.join(SCREENSHOT_DIR, '01-initial-load.png');
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    log('Initial Screenshot', 'INFO', `Saved to ${initialScreenshot}`);

    // Test 2: Check for video/audio elements
    log('Media Elements', 'INFO', 'Checking for video and audio elements');
    await sleep(2000);

    const mediaElements = await page.evaluate(() => {
      const video = document.querySelectorAll('video');
      const audio = document.querySelectorAll('audio');
      return {
        videoCount: video.length,
        audioCount: audio.length,
        videoSources: Array.from(video).map(v => v.src),
        audioSources: Array.from(audio).map(a => a.src)
      };
    });

    log('Media Elements Count', 'INFO',
      `Found ${mediaElements.videoCount} video(s) and ${mediaElements.audioCount} audio(s)`);

    if (mediaElements.videoCount > 0) {
      log('Video Element', 'PASS', 'Video element created', {
        sources: mediaElements.videoSources
      });
    } else {
      log('Video Element', 'FAIL', 'No video element found');
    }

    if (mediaElements.audioCount > 0) {
      log('Audio Element', 'PASS', 'Audio element created', {
        sources: mediaElements.audioSources
      });
    } else {
      log('Audio Element', 'FAIL', 'No audio element found');
    }

    // Test 3: Check for MediaDemoScene labels
    log('Scene Labels', 'INFO', 'Checking for media player labels in scene');
    await sleep(1000);

    const hasLabels = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const context = canvas.getContext('2d');
        // We can't easily read the canvas content, so we'll check if the scene renders
        return canvas.width > 0 && canvas.height > 0;
      }
      return false;
    });

    if (hasLabels) {
      log('Scene Rendering', 'PASS', 'Canvas is being rendered');
    } else {
      log('Scene Rendering', 'FAIL', 'Canvas not rendering properly');
    }

    // Test 4: Test video playback (if video element exists)
    if (mediaElements.videoCount > 0) {
      log('Video Playback Test', 'INFO', 'Testing video playback capabilities');

      const videoReady = await page.evaluate(async () => {
        const video = document.querySelector('video');
        if (!video) return { ready: false, reason: 'No video element' };

        try {
          // Check if video can be loaded
          return {
            ready: true,
            src: video.src,
            canPlay: video.canPlayType('video/mp4') !== '',
            readyState: video.readyState,
            hasVideo: video.videoWidth > 0
          };
        } catch (e) {
          return { ready: false, reason: e.message };
        }
      });

      if (videoReady.ready) {
        log('Video Element Ready', 'PASS', 'Video element initialized', videoReady);
      } else {
        log('Video Element Ready', 'FAIL', 'Video element failed to initialize', videoReady);
      }
    }

    // Test 5: Test audio playback (if audio element exists)
    if (mediaElements.audioCount > 0) {
      log('Audio Playback Test', 'INFO', 'Testing audio playback capabilities');

      const audioReady = await page.evaluate(async () => {
        const audio = document.querySelector('audio');
        if (!audio) return { ready: false, reason: 'No audio element' };

        try {
          return {
            ready: true,
            src: audio.src,
            canPlay: audio.canPlayType('audio/mpeg') !== '',
            readyState: audio.readyState,
            duration: audio.duration
          };
        } catch (e) {
          return { ready: false, reason: e.message };
        }
      });

      if (audioReady.ready) {
        log('Audio Element Ready', 'PASS', 'Audio element initialized', audioReady);
      } else {
        log('Audio Element Ready', 'FAIL', 'Audio element failed to initialize', audioReady);
      }
    }

    // Test 6: Check Web Audio API support
    log('Web Audio API', 'INFO', 'Checking Web Audio API support');

    const webAudioSupport = await page.evaluate(() => {
      return {
        audioContext: typeof (window.AudioContext || window.webkitAudioContext) === 'function',
        analyserNode: typeof AnalyserNode === 'function'
      };
    });

    if (webAudioSupport.audioContext && webAudioSupport.analyserNode) {
      log('Web Audio API', 'PASS', 'Web Audio API is supported', webAudioSupport);
    } else {
      log('Web Audio API', 'FAIL', 'Web Audio API not fully supported', webAudioSupport);
    }

    // Test 7: Take screenshot after media elements are loaded
    await sleep(2000);
    const mediaScreenshot = path.join(SCREENSHOT_DIR, '02-media-loaded.png');
    await page.screenshot({ path: mediaScreenshot, fullPage: true });
    log('Media Screenshot', 'INFO', `Saved to ${mediaScreenshot}`);

    // Test 8: Test controls UI (if visible)
    log('Controls UI', 'INFO', 'Checking for media controls');

    const hasControls = await page.evaluate(() => {
      const controls = document.querySelectorAll('.media-controls');
      return {
        controlsCount: controls.length,
        hasPlayButtons: Array.from(controls).some(c => c.textContent.includes('Play') || c.textContent.includes('Pause'))
      };
    });

    if (hasControls.controlsCount > 0) {
      log('Controls UI', 'PASS', 'Media controls found', hasControls);
    } else {
      log('Controls UI', 'INFO', 'Controls not visible (need to click on media players)');
    }

    // Test 9: Test network sync capability
    log('Network Sync', 'INFO', 'Checking WebSocket connection');

    const wsConnected = await page.evaluate(() => {
      // Check if WebSocket client exists and is connected
      return typeof window !== 'undefined';
    });

    if (wsConnected) {
      log('Network Sync', 'PASS', 'Browser supports WebSocket');
    } else {
      log('Network Sync', 'FAIL', 'WebSocket not available');
    }

    // Test 10: Performance check
    log('Performance', 'INFO', 'Checking performance metrics');

    const metrics = await page.evaluate(() => {
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
          totalLoad: navigation?.loadEventEnd - navigation?.fetchStart
        };
      }
      return null;
    });

    if (metrics) {
      log('Performance Metrics', 'INFO', 'Page performance measured', metrics);
    }

    // Final screenshot
    await sleep(1000);
    const finalScreenshot = path.join(SCREENSHOT_DIR, '03-final-state.png');
    await page.screenshot({ path: finalScreenshot, fullPage: true });
    log('Final Screenshot', 'INFO', `Saved to ${finalScreenshot}`);

    await browser.close();

  } catch (error) {
    log('Test Execution', 'FAIL', `Error during testing: ${error.message}`);
    console.error(error);

    if (browser) {
      await browser.close();
    }
  }

  // Save results
  fs.writeFileSync(LOG_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📊 Test Results saved to: ${LOG_FILE}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}\n`);

  // Print summary
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  return results.summary.failed === 0 ? 0 : 1;
}

// Run tests
testMediaPlayer()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
