import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viewport = { width: 1920, height: 1080 };

  // Set viewport size
  await page.setViewportSize(viewport);

  console.log('Navigating to hub-client...');

  // Navigate to the hub-client (assuming dev server is running)
  await page.goto('http://localhost:5173', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Waiting for page to load...');
  // Wait a bit for any animations
  await page.waitForTimeout(2000);

  // Take screenshot
  const screenshotPath = path.resolve(__dirname, '../docs/hub-client-screenshot.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
})();
