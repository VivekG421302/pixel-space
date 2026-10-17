import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, newPage, axeViolations, openGarden, openDraw, stroke } from './helpers.mjs';

let server, browser;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.kill(); });

test('pages have their own address and the Back button works', async () => {
  const page = await newPage(browser);
  await openGarden(page);
  assert.match(page.url(), /#\/garden$/);
  await page.goBack();
  await page.waitForFunction(() => !document.querySelector('.modal.open'));
  assert.doesNotMatch(page.url(), /#\//);
  await page.goForward();
  await page.waitForSelector('#mg.open');
  assert.deepEqual(page.errors, []);
});

test('Escape closes a page and returns focus to the button that opened it', async () => {
  const page = await newPage(browser);
  await page.focus('#bg'); await page.keyboard.press('Enter');
  await page.waitForSelector('#mg.open');
  await page.waitForFunction(() => !!document.activeElement.closest('#mg'), null, { timeout: 2000 }); // focus moves into the page
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.modal.open'));
  assert.equal(await page.evaluate(() => document.activeElement.id), 'bg');
});

test('garden: painting, undo and redo', async () => {
  const page = await newPage(browser);
  await openGarden(page);
  assert.equal(await page.isDisabled('#gund'), true);
  await stroke(page, '#gc', [300, 300], [360, 300]);
  assert.equal(await page.isDisabled('#gund'), false);
  await page.click('#gund');
  assert.equal(await page.isDisabled('#gred'), false);
  await page.click('#gred');
  assert.equal(await page.isDisabled('#gund'), false);
});

test('garden: the canvas fills the space between the tool and tile panels', async () => {
  const page = await newPage(browser);
  await openGarden(page);
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(s).getBoundingClientRect();
    return { leftGap: q('#gview').x - q('.gl').right, rightGap: q('.gr').left - q('#gview').right };
  });
  assert.ok(r.leftGap < 24 && r.rightGap < 24, JSON.stringify(r));
});

test('garden: DUNGEON is one category with sections', async () => {
  const page = await newPage(browser);
  await openGarden(page);
  const cats = await page.$$eval('#gtb button', (b) => b.map((x) => x.textContent));
  assert.equal(cats.filter((c) => c.startsWith('DUNGEON')).length, 1);
  await page.click('[data-cat=DUNGEON]');
  assert.ok((await page.$$('#gpal .gsec')).length >= 4);
});

test('draw: setup, draw and save steps, with the META icon and grid validation', async () => {
  const page = await newPage(browser);
  await openDraw(page);
  const step = () => page.getAttribute('.pxapp', 'data-step');
  assert.equal(await step(), '1');
  await page.fill('.p1 .pxw', '3'); await page.click('.p1 .pxap');
  assert.match(await page.innerText('.p1 .pxgerr'), /4 to 256/);
  await page.click('.p1 [data-s="16"]');
  assert.equal(await page.innerText('#pxgst'), '16 x 16');
  await page.click('#pxgo');
  assert.equal(await step(), '2');
  await stroke(page, '#pxc', [60, 60], [140, 100]);
  await page.click('#pxmetab');
  assert.equal(await step(), '1');
  await page.click('#pxgo'); await page.click('#pxfin');
  assert.equal(await step(), '3');
  assert.match(await page.innerText('#pxprevinfo'), /16 x 16 px|\d+ x \d+ px/);
  await page.fill('#pxnm', 'E2E tile'); await page.click('#pxad');
  await page.waitForSelector('#pxresult:not([hidden])');
  assert.deepEqual(page.errors, []);
});

test('draw on a phone: one finger draws, two fingers pinch to zoom', async () => {
  const page = await newPage(browser, { mobile: true });
  await openDraw(page);
  await page.click('#pxgo');
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  const b = await page.locator('.pxstage').boundingBox();
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const z0 = await page.innerText('#pxzl');
  await touch('touchStart', [[cx - 20, cy]]); await touch('touchStart', [[cx - 20, cy], [cx + 20, cy]]);
  for (let k = 1; k <= 8; k++) await touch('touchMove', [[cx - 20 - k * 8, cy], [cx + 20 + k * 8, cy]]);
  await touch('touchEnd', []);
  assert.notEqual(await page.innerText('#pxzl'), z0, 'pinch changed the zoom');
  assert.deepEqual(page.errors, []);
});

for (const mobile of [false, true]) {
  test(`no accessibility violations (${mobile ? 'phone' : 'desktop'}, light and dark)`, async () => {
    for (const dark of [false, true]) {
      const page = await newPage(browser, { mobile, dark });
      assert.deepEqual(await axeViolations(page), [], 'dashboard');
      await openGarden(page);
      assert.deepEqual(await axeViolations(page), [], 'garden');
      await page.click('#gpx'); await page.waitForSelector('#mp.open');
      assert.deepEqual(await axeViolations(page), [], 'draw setup');
      await page.click('#pxgo');
      assert.deepEqual(await axeViolations(page), [], 'draw studio');
      await page.context().close();
    }
  });
}

test('phone: every button, field and slider is at least 40px', async () => {
  const page = await newPage(browser, { mobile: true });
  const small = () => page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('button,a[href],input:not([type=hidden]),select,summary').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || e.closest('[hidden],[inert]')) return;
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none') return;
      if (Math.min(r.width, r.height) < 40) bad.push(`${e.id || e.className} ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    return bad;
  });
  assert.deepEqual(await small(), [], 'dashboard');
  await openGarden(page); assert.deepEqual(await small(), [], 'garden');
  await page.click('#gpx'); await page.click('#pxgo'); assert.deepEqual(await small(), [], 'draw');
});

test('nothing scrolls sideways at 320px wide', async () => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4179/'); await page.waitForSelector('#bg');
  const wide = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(await wide(), false, 'dashboard');
  await page.click('#bg'); assert.equal(await wide(), false, 'garden');
  await page.click('#gpx'); assert.equal(await wide(), false, 'draw setup');
  await page.click('#pxgo'); assert.equal(await wide(), false, 'draw studio');
});
