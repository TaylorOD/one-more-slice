import { chromium, expect } from '@playwright/test';
import { checkSauce } from './browser-sauce-check.js';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
const errors = [];
async function checkedPage(options) {
  const page = await browser.newPage(options);
  page.on('pageerror', (error) => errors.push(error.message));
  return page;
}
try {
  const page = await checkedPage({ viewport: { width: 1440, height: 1050 } });
  const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5177';
  await page.goto(baseUrl);
  await page.waitForSelector('canvas');
  const canvas = await page.locator('canvas').boundingBox();
  await page.mouse.click(canvas.x + canvas.width * 0.47, canvas.y + canvas.height * 0.55);
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '1');
  await page.mouse.move(canvas.x + canvas.width * 0.47, canvas.y + canvas.height * 0.55);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width * 0.6, canvas.y + canvas.height * 0.55, {
    steps: 8
  });
  await page.mouse.up();
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '1');
  await page.locator('#special').click();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '23');
  await page.screenshot({ path: 'screenshots/desktop.png', fullPage: true });
  await page.locator('#share').click();
  const shared = await page.locator('#share-url').inputValue();
  await page.keyboard.press('Escape');
  await page.goto(shared);
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '23');
  await page.locator('#undo').click();
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '22');
  await page.locator('#primary').click();
  await page.waitForTimeout(8500);
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'baked');
  await page.locator('#primary').click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('body').getAttribute('data-mode'), 'sliced');
  await expect(page.locator('#bite')).toBeVisible();
  await page.locator('#bite').click();
  await expect(page.locator('body')).toHaveAttribute('data-bitten', 'true');
  await expect(page.locator('#bite')).toBeDisabled();
  await page.screenshot({ path: 'screenshots/baked.png', fullPage: true });
  await page.locator('#dispatch').click();
  assert.equal(await page.locator('body').getAttribute('data-mode'), 'pickup');
  await expect(page.locator('#delivery-comment')).toBeVisible();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'screenshots/collection.png', fullPage: true });
  await page.waitForTimeout(3400);
  await page.screenshot({ path: 'screenshots/courier.png', fullPage: true });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'screenshots/departure.png', fullPage: true });
  await page.waitForTimeout(2900);
  assert.equal(await page.locator('body').getAttribute('data-mode'), 'dispatched');
  assert.ok(await page.locator('#replay').isVisible());
  await page.locator('#primary').click();
  assert.equal(await page.locator('body').getAttribute('data-mode'), 'prep');
  await expect(page.locator('body')).toHaveAttribute('data-bitten', 'false');
  await expect(page.locator('#delivery-comment')).toBeHidden();
  page.on('dialog', (d) => d.accept());
  await page.locator('#reset').click();
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '0');
  await page.waitForTimeout(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#special').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'screenshots/mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.locator('#primary').click();
  await page.waitForTimeout(1200);
  await page.locator('#reset').click();
  assert.equal(await page.locator('body').getAttribute('data-mode'), 'prep');
  assert.equal(await page.locator('body').getAttribute('data-toppings'), '0');
  assert.deepEqual(errors, []);
  await page.close();
  const untimed = await checkedPage();
  await untimed.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await untimed.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await untimed.goto(baseUrl);
  await untimed.locator('#special').click();
  await untimed.clock.fastForward(600000);
  assert.equal(await untimed.locator('body').getAttribute('data-mode'), 'prep');
  assert.equal(await untimed.locator('[id*="clock"], [role="timer"]').count(), 0);
  await untimed.close();
  const reduced = await checkedPage({
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 }
  });
  await reduced.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await reduced.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await reduced.goto(baseUrl);
  await reduced.locator('#primary').click();
  await reduced.clock.fastForward(9000);
  await reduced.locator('#dispatch').click();
  await reduced.clock.fastForward(1000);
  await reduced.screenshot({ path: 'screenshots/courier-mobile.png', fullPage: true });
  await reduced.clock.fastForward(9000);
  assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'dispatched');
  await reduced.locator('#replay').click();
  assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'pickup');
  await reduced.clock.fastForward(1000);
  assert.equal(await reduced.locator('body').getAttribute('data-courier-phase'), 'ride');
  reduced.on('dialog', (d) => d.accept());
  await reduced.locator('#reset').click();
  assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'prep');
  await reduced.locator('#primary').click();
  await reduced.clock.fastForward(9000);
  await reduced.locator('#dispatch').click();
  await reduced.locator('#reset').click();
  await reduced.clock.fastForward(10000);
  assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'prep');
  await reduced.close();
  const phases = await checkedPage();
  await phases.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await phases.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await phases.goto(baseUrl);
  await phases.locator('#primary').click();
  await phases.clock.fastForward(9000);
  await phases.locator('#dispatch').click();
  await phases.clock.fastForward(500);
  assert.equal(await phases.locator('body').getAttribute('data-courier-phase'), 'collect');
  await phases.clock.fastForward(1800);
  assert.equal(await phases.locator('body').getAttribute('data-courier-phase'), 'approach');
  await phases.clock.fastForward(2200);
  assert.equal(await phases.locator('body').getAttribute('data-courier-phase'), 'ride');
  await phases.clock.fastForward(6000);
  assert.equal(await phases.locator('body').getAttribute('data-mode'), 'dispatched');
  await phases.locator('#primary').click();
  await phases.locator('#primary').click();
  await phases.clock.fastForward(9000);
  await phases.locator('#dispatch').click();
  await phases.clock.fastForward(500);
  assert.equal(await phases.locator('body').getAttribute('data-courier-phase'), 'collect');
  await phases.close();
  // Count actual GPU buffers across repeated orders, rather than only checking
  // that meshes disappear. The old basil and mushroom geometry leaked here.
  const memoryPage = await checkedPage();
  await memoryPage.addInitScript(() => {
    window.liveBuffers = 0;
    for (const Context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const create = Context.prototype.createBuffer;
      const remove = Context.prototype.deleteBuffer;
      Context.prototype.createBuffer = function () {
        const buffer = create.call(this);
        if (buffer) window.liveBuffers++;
        return buffer;
      };
      Context.prototype.deleteBuffer = function (buffer) {
        if (buffer) window.liveBuffers--;
        return remove.call(this, buffer);
      };
    }
  });
  await memoryPage.goto(baseUrl);
  memoryPage.on('dialog', (dialog) => dialog.accept());
  async function renderOrder() {
    await memoryPage.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        })
    );
  }
  await memoryPage.locator('#special').click();
  await renderOrder();
  const warmBuffers = await memoryPage.evaluate(() => window.liveBuffers);
  assert.ok(warmBuffers > 0, 'the test must observe real WebGL buffers');
  for (let i = 0; i < 8; i++) {
    await memoryPage.locator('#special').click();
    await renderOrder();
    await memoryPage.locator('#undo').click();
    await memoryPage.locator('#reset').click();
    await memoryPage.locator('#special').click();
    await renderOrder();
    assert.equal(
      await memoryPage.evaluate(() => window.liveBuffers),
      warmBuffers,
      'replacing and resetting orders must reuse GPU buffers'
    );
  }
  await memoryPage.close();
  const ingredientsPage = await checkedPage({ reducedMotion: 'reduce' });
  await ingredientsPage.goto(baseUrl);
  for (const type of ['cheese', 'sausage', 'sauce', 'chicken']) {
    await ingredientsPage.locator(`[data-topping="${type}"]`).click();
    await ingredientsPage.locator('#sprinkle').click();
  }
  assert.equal(await ingredientsPage.locator('body').getAttribute('data-toppings'), '16');
  await ingredientsPage.locator('#share').click();
  const ingredientsLink = await ingredientsPage.locator('#share-url').inputValue();
  await ingredientsPage.keyboard.press('Escape');
  await ingredientsPage.goto(ingredientsLink);
  await ingredientsPage.reload();
  assert.equal(await ingredientsPage.locator('body').getAttribute('data-toppings'), '16');
  await ingredientsPage.screenshot({ path: 'screenshots/new-toppings.png', fullPage: true });
  await ingredientsPage.setViewportSize({ width: 390, height: 844 });
  await ingredientsPage.screenshot({ path: 'screenshots/new-toppings-mobile.png', fullPage: true });
  assert.ok(
    await ingredientsPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  );
  await ingredientsPage.close();

  for (const [name, width, height] of [
    ['desktop', 1440, 1300],
    ['mobile', 390, 1700]
  ]) {
    const ovenPage = await checkedPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await ovenPage.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await ovenPage.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    await ovenPage.goto(baseUrl);
    await ovenPage.locator('#special').click();
    await ovenPage.locator('#primary').click();
    await ovenPage.clock.fastForward(750);
    await ovenPage.screenshot({ path: `screenshots/oven-${name}-lift.png` });
    await ovenPage.clock.fastForward(3250);
    assert.equal(await ovenPage.locator('body').getAttribute('data-mode'), 'baking');
    await ovenPage.screenshot({ path: `screenshots/oven-${name}-baking.png` });
    await ovenPage.clock.fastForward(2700);
    await ovenPage.screenshot({ path: `screenshots/oven-${name}-out.png` });
    await ovenPage.clock.fastForward(1400);
    assert.equal(await ovenPage.locator('body').getAttribute('data-mode'), 'baked');
    await ovenPage.screenshot({ path: `screenshots/oven-${name}-done.png` });
    await ovenPage.close();
  }

  // A recipe opened mid order must render exactly like a fresh recipe.
  // Comparing the canvas catches stale rotation, slice offsets and oven scale.
  const recipePage = await checkedPage({
    reducedMotion: 'reduce',
    viewport: { width: 1200, height: 900 }
  });
  await recipePage.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await recipePage.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await recipePage.goto(baseUrl);
  const recipeHash =
    '#recipe=' + encodeURIComponent(JSON.stringify({ v: 1, t: [['olive', 0.7, -0.4, 0]] }));
  async function loadRecipe() {
    await recipePage.evaluate((hash) => {
      history.replaceState(null, '', location.pathname);
      location.hash = hash;
    }, recipeHash);
    await expect(recipePage.locator('body')).toHaveAttribute('data-mode', 'prep');
    await expect(recipePage.locator('body')).toHaveAttribute('data-toppings', '1');
    await recipePage.clock.runFor(100);
  }
  await loadRecipe();
  const freshRecipe = await recipePage.locator('canvas').screenshot();
  for (const mode of ['baking', 'sliced', 'pickup']) {
    await recipePage.locator('#turn-left').click();
    await recipePage.clock.runFor(100);
    await recipePage.locator('#primary').click();
    await recipePage.clock.fastForward(mode === 'baking' ? 4000 : 9000);
    if (mode === 'sliced') await recipePage.locator('#primary').click();
    if (mode === 'pickup') await recipePage.locator('#dispatch').click();
    await loadRecipe();
    assert.ok(
      (await recipePage.locator('canvas').screenshot()).equals(freshRecipe),
      `opening a recipe during ${mode} must clear the old pose`
    );
  }
  await recipePage.screenshot({ path: 'screenshots/recipe-reset.png', fullPage: true });
  await recipePage.evaluate(() => {
    location.hash = '#recipe=broken';
  });
  await expect(recipePage.locator('#status')).toHaveText(
    'That recipe link looks broken. Your current order is unchanged.'
  );
  assert.equal(await recipePage.locator('body').getAttribute('data-toppings'), '1');
  await recipePage.close();
  await checkSauce(await checkedPage({ reducedMotion: 'reduce' }), baseUrl);
  assert.deepEqual(errors, [], 'all browser pages must be free of runtime errors');
} finally {
  await browser.close();
}
console.log(
  'desktop, mobile, share, bake, slice, undo, reset, untimed preparation, courier, interrupted pickup, reduced motion, gpu memory and recipe loading passed'
);
