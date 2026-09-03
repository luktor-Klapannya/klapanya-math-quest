import puppeteer from 'puppeteer';
import path from 'path';

const artifactsDir = 'C:/Users/NUN/.gemini/antigravity/brain/ef2d7859-9626-4f7a-9d98-55723c3c59b2';

async function capture() {
  console.log('Launching browser for Sprint 7.5 visual verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Landing (1440x900)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_desktop_landing_v75.png') });
  console.log('Captured: screenshot_desktop_landing_v75.png');

  // 2. Mobile Landing (390x844)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_mobile_landing_v75.png') });
  console.log('Captured: screenshot_mobile_landing_v75.png');

  // 3. Desktop Learner Battle (1440x900)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/#/battle', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_desktop_battle_v75.png') });
  console.log('Captured: screenshot_desktop_battle_v75.png');

  // 4. Mobile Learner Battle (390x844)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/#/battle', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_mobile_battle_v75.png') });
  console.log('Captured: screenshot_mobile_battle_v75.png');

  // 5. Desktop Professor Console (1440x900)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/#/professor-console', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_desktop_prof_console_v75.png') });
  console.log('Captured: screenshot_desktop_prof_console_v75.png');

  // 6. Mobile Professor Console (390x844)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/#/professor-console', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_mobile_prof_console_v75.png') });
  console.log('Captured: screenshot_mobile_prof_console_v75.png');

  await browser.close();
  console.log('All Sprint 7.5 screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
});
