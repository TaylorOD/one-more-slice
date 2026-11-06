import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('screenshots', {recursive:true});
const browser = await chromium.launch({headless:true, args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page = await browser.newPage({viewport:{width:1440,height:1050}});
const errors = [];
const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5177';
page.on('pageerror', e => errors.push(e.message));
await page.goto(baseUrl);
await page.waitForSelector('canvas');
assert.equal(await page.locator('#pickup-clock').textContent(), '01:30');
const canvas = await page.locator('canvas').boundingBox();
await page.mouse.click(canvas.x + canvas.width * .47, canvas.y + canvas.height * .55);
assert.equal(await page.locator('body').getAttribute('data-toppings'), '1');
await page.mouse.move(canvas.x + canvas.width * .47, canvas.y + canvas.height * .55);
await page.mouse.down();
await page.mouse.move(canvas.x + canvas.width * .60, canvas.y + canvas.height * .55, {steps:8});
await page.mouse.up();
assert.equal(await page.locator('body').getAttribute('data-toppings'), '1');
await page.locator('#special').click();
await page.waitForTimeout(1500);
assert.equal(await page.locator('body').getAttribute('data-toppings'), '23');
await page.screenshot({path:'screenshots/desktop.png',fullPage:true});
await page.locator('#share').click();
const shared = await page.locator('#share-url').inputValue();
await page.keyboard.press('Escape');
await page.goto(shared);
assert.equal(await page.locator('body').getAttribute('data-toppings'), '23');
await page.locator('#undo').click();
assert.equal(await page.locator('body').getAttribute('data-toppings'), '22');
await page.locator('#primary').click();
await page.waitForTimeout(8500);
assert.equal(await page.locator('body').getAttribute('data-mode'), 'baked');
assert.equal(await page.locator('#clock-label').textContent(), 'ready for pickup');
const stoppedClock = await page.locator('#pickup-clock').textContent();
await page.locator('#primary').click();
await page.waitForTimeout(500);
assert.equal(await page.locator('#pickup-clock').textContent(), stoppedClock);
assert.equal(await page.locator('body').getAttribute('data-mode'), 'sliced');
await page.screenshot({path:'screenshots/baked.png',fullPage:true});
await page.locator('#dispatch').click();
assert.equal(await page.locator('body').getAttribute('data-mode'), 'pickup');
await page.waitForTimeout(1400);
await page.screenshot({path:'screenshots/collection.png',fullPage:true});
await page.waitForTimeout(3400);
await page.screenshot({path:'screenshots/courier.png',fullPage:true});
await page.waitForTimeout(1600);
await page.screenshot({path:'screenshots/departure.png',fullPage:true});
await page.waitForTimeout(2900);
assert.equal(await page.locator('body').getAttribute('data-mode'), 'dispatched');
assert.ok(await page.locator('#replay').isVisible());
await page.locator('#primary').click();
assert.equal(await page.locator('body').getAttribute('data-mode'), 'prep');
page.on('dialog', d => d.accept());
await page.locator('#reset').click();
assert.equal(await page.locator('body').getAttribute('data-toppings'), '0');
await page.waitForTimeout(100);
assert.equal(await page.locator('#pickup-clock').textContent(), '01:30');
await page.setViewportSize({width:390,height:844});
await page.locator('#special').click();
await page.waitForTimeout(1200);
await page.screenshot({path:'screenshots/mobile.png',fullPage:true});
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
await page.locator('#primary').click();
await page.waitForTimeout(1200);
await page.locator('#reset').click();
assert.equal(await page.locator('body').getAttribute('data-mode'), 'prep');
assert.equal(await page.locator('body').getAttribute('data-toppings'), '0');
assert.deepEqual(errors, []);
const timerPage = await browser.newPage();
await timerPage.clock.install({time: new Date('2026-01-01T00:00:00Z')});
await timerPage.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
await timerPage.goto(baseUrl);
await timerPage.locator('#special').click();
await timerPage.clock.fastForward(91000);
assert.equal(await timerPage.locator('#pickup-clock').textContent(), '00:00');
assert.equal(await timerPage.locator('#clock-label').textContent(), 'courier waiting');
await timerPage.locator('#primary').click();
await timerPage.clock.fastForward(9000);
assert.equal(await timerPage.locator('body').getAttribute('data-mode'), 'baked');
await timerPage.close();
const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
await reduced.clock.install({time: new Date('2026-01-01T00:00:00Z')});
await reduced.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
await reduced.goto(baseUrl);
await reduced.locator('#primary').click();
await reduced.clock.fastForward(9000);
await reduced.locator('#dispatch').click();
await reduced.clock.fastForward(1000);
await reduced.screenshot({path:'screenshots/courier-mobile.png',fullPage:true});
await reduced.clock.fastForward(9000);
assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'dispatched');
await reduced.locator('#replay').click();
assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'pickup');
await reduced.clock.fastForward(1000);
assert.equal(await reduced.locator('body').getAttribute('data-courier-phase'), 'ride');
reduced.on('dialog',d=>d.accept());
await reduced.locator('#reset').click();
assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'prep');
await reduced.locator('#primary').click();
await reduced.clock.fastForward(9000);
await reduced.locator('#dispatch').click();
await reduced.locator('#reset').click();
await reduced.clock.fastForward(10000);
assert.equal(await reduced.locator('body').getAttribute('data-mode'), 'prep');
await reduced.close();
const phases=await browser.newPage();
await phases.clock.install({time: new Date('2026-01-01T00:00:00Z')});
await phases.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
await phases.goto(baseUrl);
await phases.locator('#primary').click();
await phases.clock.fastForward(9000);
await phases.locator('#dispatch').click();
await phases.clock.fastForward(500);
assert.equal(await phases.locator('body').getAttribute('data-courier-phase'),'collect');
await phases.clock.fastForward(1800);
assert.equal(await phases.locator('body').getAttribute('data-courier-phase'),'approach');
await phases.clock.fastForward(2200);
assert.equal(await phases.locator('body').getAttribute('data-courier-phase'),'ride');
await phases.clock.fastForward(6000);
assert.equal(await phases.locator('body').getAttribute('data-mode'),'dispatched');
await phases.locator('#primary').click();
await phases.locator('#primary').click();
await phases.clock.fastForward(9000);
await phases.locator('#dispatch').click();
await phases.clock.fastForward(500);
assert.equal(await phases.locator('body').getAttribute('data-courier-phase'),'collect');
await phases.close();
// Count actual GPU buffers across repeated orders, rather than only checking
// that meshes disappear. The old basil and mushroom geometry leaked here.
const memoryPage = await browser.newPage();
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
memoryPage.on('dialog', dialog => dialog.accept());
async function renderOrder() {
  await memoryPage.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
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
  assert.equal(await memoryPage.evaluate(() => window.liveBuffers), warmBuffers,
    'replacing and resetting orders must reuse GPU buffers');
}
await memoryPage.close();
} finally {
  await browser.close();
}
console.log('desktop, mobile, share, bake, slice, undo, reset, pickup clock, courier, interrupted pickup and reduced motion passed');

