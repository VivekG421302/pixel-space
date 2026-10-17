// Shared helpers for the end-to-end tests: start the built app, open a browser, run axe.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
export const PORT = 4179;
export const URL = `http://localhost:${PORT}/`;
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export async function startServer() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(URL)).ok) return proc; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  proc.kill();
  throw new Error('vite preview did not start (run `npm run build` first)');
}

export const launch = () => chromium.launch();

export async function newPage(browser, { mobile = false, dark = false } = {}) {
  const ctx = await browser.newContext(
    mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width: 1280, height: 800 } },
  );
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForSelector('#bg');
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-scheme', 'dark'));
  return page;
}

export async function axeViolations(page) {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
    return r.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`);
  });
}

export const openGarden = async (page) => { await page.click('#bg'); await page.waitForSelector('#mg.open'); };
export const openDraw = async (page) => { await openGarden(page); await page.click('#gpx'); await page.waitForSelector('#mp.open'); };
export const stroke = async (page, sel, [x1, y1], [x2, y2]) => {
  const b = await page.locator(sel).boundingBox();
  await page.mouse.move(b.x + x1, b.y + y1); await page.mouse.down();
  await page.mouse.move(b.x + x2, b.y + y2, { steps: 6 }); await page.mouse.up();
};
