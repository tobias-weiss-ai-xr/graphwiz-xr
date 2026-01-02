/**
 * Browser-based Multi-Client Avatar Testing
 *
 * This script automates browser testing of the avatar system
 * using Playwright to simulate multiple concurrent clients.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';

interface TestClient {
  id: string;
  context: BrowserContext;
  page: Page;
  avatarConfig?: any;
}

interface TestResult {
  clientId: string;
  test: string;
  passed: boolean;
  duration: number;
  errors?: string[];
  screenshot?: string;
}

class BrowserAvatarTester {
  private baseUrl: string;
  private clients: Map<string, TestClient> = new Map();
  private results: TestResult[] = [];
  private browser?: Browser;

  constructor(baseUrl: string = 'https://xr.graphwiz.ai') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize browser
   */
  async init() {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('✅ Browser launched');
  }

  /**
   * Create a new test client (browser context)
   */
  async createClient(clientId: string): Promise<TestClient> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    console.log(`  👤 Creating client: ${clientId}`);

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: `TestClient/${clientId}`,
    });

    const page = await context.newPage();

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`    [${clientId}] Console Error: ${msg.text()}`);
      }
    });

    // Navigate to site
    await page.goto(this.baseUrl, { waitUntil: 'networkidle' });

    const client: TestClient = {
      id: clientId,
      context,
      page,
    };

    this.clients.set(clientId, client);
    return client;
  }

  /**
   * Create multiple clients
   */
  async createMultipleClients(count: number): Promise<TestClient[]> {
    console.log(`\n👥 Creating ${count} test clients...`);
    const clients: TestClient[] = [];

    for (let i = 0; i < count; i++) {
      const clientId = `client-${Date.now()}-${i}`;
      const client = await this.createClient(clientId);
      clients.push(client);

      // Small delay between clients
      await this.delay(500);
    }

    console.log(`✅ Created ${clients.length} clients`);
    return clients;
  }

  /**
   * Test avatar button visibility
   */
  async testAvatarButton(client: TestClient): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const button = await client.page.waitForSelector('button:has-text("Avatar")', {
        timeout: 5000,
      });

      const passed = button !== null;

      return {
        clientId: client.id,
        test: 'avatar-button-visible',
        passed,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        clientId: client.id,
        test: 'avatar-button-visible',
        passed: false,
        duration: Date.now() - startTime,
        errors: [String(error)],
      };
    }
  }

  /**
   * Open avatar configurator
   */
  async openAvatarConfigurator(client: TestClient): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Click avatar button
      await client.page.click('button:has-text("Avatar")');

      // Wait for modal to appear
      await client.page.waitForSelector('[role="dialog"]', { timeout: 3000 });

      return {
        clientId: client.id,
        test: 'open-configurator',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        clientId: client.id,
        test: 'open-configurator',
        passed: false,
        duration: Date.now() - startTime,
        errors: [String(error)],
      };
    }
  }

  /**
   * Test avatar customization
   */
  async testAvatarCustomization(
    client: TestClient,
    config: {
      bodyType: string;
      primaryColor: string;
      secondaryColor: string;
      height: number;
    }
  ): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Open configurator
      await client.page.click('button:has-text("Avatar")');
      await client.page.waitForSelector('[role="dialog"]', { timeout: 3000 });

      // Select body type
      const bodyTypeSelector = `[data-body-type="${config.bodyType}"]`;
      const bodyTypeExists = await client.page.$(bodyTypeSelector);
      if (bodyTypeExists) {
        await client.page.click(bodyTypeSelector);
      } else {
        errors.push(`Body type ${config.bodyType} not found`);
      }

      // Set primary color
      await client.page.fill('input[type="color"]:nth-of-type(1)', config.primaryColor);

      // Set secondary color
      await client.page.fill('input[type="color"]:nth-of-type(2)', config.secondaryColor);

      // Set height
      const heightSlider = await client.page.$('input[type="range"]');
      if (heightSlider) {
        await heightSlider.evaluate((el: any, val: number) => (el.value = val), config.height);
      }

      // Save
      await client.page.click('button:has-text("Save Changes")');

      // Wait for save confirmation
      await client.page.waitForSelector('text=/✓ Saved/i', { timeout: 5000 });

      // Wait for modal to close
      await this.delay(2000);

      return {
        clientId: client.id,
        test: 'avatar-customization',
        passed: errors.length === 0,
        duration: Date.now() - startTime,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        clientId: client.id,
        test: 'avatar-customization',
        passed: false,
        duration: Date.now() - startTime,
        errors: [String(error)],
      };
    }
  }

  /**
   * Test persistence (refresh and verify)
   */
  async testAvatarPersistence(client: TestClient): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Reload page
      await client.page.reload({ waitUntil: 'networkidle' });

      // Open configurator
      await client.page.click('button:has-text("Avatar")');
      await client.page.waitForSelector('[role="dialog"]', { timeout: 3000 });

      // Check if values persisted (check selected body type)
      const selectedBodyType = await client.page
        .locator('[data-selected="true"]')
        .getAttribute('data-body-type');

      return {
        clientId: client.id,
        test: 'avatar-persistence',
        passed: selectedBodyType !== null,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        clientId: client.id,
        test: 'avatar-persistence',
        passed: false,
        duration: Date.now() - startTime,
        errors: [String(error)],
      };
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(client: TestClient, filename: string): Promise<string> {
    const screenshotPath = `/tmp/avatar-tests/${filename}`;
    await client.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Run comprehensive test suite for a client
   */
  async runClientTests(client: TestClient): Promise<TestResult[]> {
    console.log(`\n🧪 Running tests for ${client.id}...`);
    const results: TestResult[] = [];

    // Test 1: Avatar button visible
    console.log(`  🔍 Testing avatar button...`);
    const buttonResult = await this.testAvatarButton(client);
    results.push(buttonResult);
    console.log(`    ${buttonResult.passed ? '✅' : '❌'} Avatar button visible`);

    // Test 2: Open configurator
    console.log(`  🔲 Opening configurator...`);
    const openResult = await this.openAvatarConfigurator(client);
    results.push(openResult);
    console.log(`    ${openResult.passed ? '✅' : '❌'} Configurator opened`);

    // Test 3: Customize avatar
    console.log(`  🎨 Customizing avatar...`);
    const config = {
      bodyType: 'robot',
      primaryColor: '#FF5722',
      secondaryColor: '#9C27B0',
      height: 2.0,
    };
    const customizeResult = await this.testAvatarCustomization(client, config);
    results.push(customizeResult);
    console.log(`    ${customizeResult.passed ? '✅' : '❌'} Avatar customized`);

    // Take screenshot
    const screenshot = await this.takeScreenshot(client, `${client.id}-after-customize.png`);

    // Test 4: Persistence
    console.log(`  💾 Testing persistence...`);
    const persistenceResult = await this.testAvatarPersistence(client);
    results.push(persistenceResult);
    console.log(`    ${persistenceResult.passed ? '✅' : '❌'} Avatar persisted`);

    // Close configurator
    await client.page.click('button:has-text("Cancel")');
    await this.delay(500);

    return results;
  }

  /**
   * Run multi-client test
   */
  async runMultiClientTest(clientCount: number): Promise<void> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 MULTI-CLIENT AVATAR TEST (${clientCount} clients)`);
    console.log('='.repeat(80));

    // Create clients
    const clients = await this.createMultipleClients(clientCount);
    this.results = [];

    // Run tests for each client
    for (const client of clients) {
      const results = await this.runClientTests(client);
      this.results.push(...results);

      // Delay between clients
      await this.delay(1000);
    }

    // Generate report
    this.generateReport();
  }

  /**
   * Generate test report
   */
  generateReport(): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(80));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);

    // Group by test type
    const byTest: Record<string, TestResult[]> = {};
    this.results.forEach(r => {
      if (!byTest[r.test]) {
        byTest[r.test] = [];
      }
      byTest[r.test].push(r);
    });

    console.log('\nResults by Test Type:');
    console.log('-'.repeat(80));
    for (const [test, results] of Object.entries(byTest)) {
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      console.log(
        `  ${test}: ${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)`
      );
    }

    // Show failed tests
    const failedResults = this.results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('-'.repeat(80));
      failedResults.forEach(r => {
        console.log(`  ${r.clientId} - ${r.test}`);
        if (r.errors) {
          r.errors.forEach(e => console.log(`    Error: ${e}`));
        }
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');

    for (const [_, client] of this.clients) {
      await client.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Cleanup complete');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main test runner
 */
async function main() {
  const tester = new BrowserAvatarTester('https://xr.graphwiz.ai');

  try {
    await tester.init();
    await tester.runMultiClientTest(3); // Test with 3 clients
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BrowserAvatarTester };
