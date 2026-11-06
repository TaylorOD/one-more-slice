import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function checkSauce(page, baseUrl) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto(baseUrl);
  // Compare against a fully initialized fresh order, not the startup frame.
  await page.locator('#reset').click();
  await expect(page.locator('body')).toHaveAttribute('data-toppings', '0');
  await page.clock.runFor(50);
  const plain = await page.locator('canvas').screenshot();
  await page.locator('[data-topping="sauce"]').click();
  await page.locator('#sprinkle').click();
  await page.clock.runFor(50);
  const covered = await page.locator('canvas').screenshot();
  assert.ok(!covered.equals(plain), 'sauce must visibly cover the pizza');
  await page.locator('#share').click();
  const recipe = await page.locator('#share-url').inputValue();
  await page.keyboard.press('Escape');
  await page.locator('#undo').click();
  await page.clock.runFor(50);
  assert.ok(
    (await page.locator('canvas').screenshot()).equals(plain),
    'undo must remove all sauce'
  );
  await page.goto(recipe);
  await page.clock.runFor(50);
  assert.ok(
    (await page.locator('canvas').screenshot()).equals(covered),
    'shared sauce must restore the same coverage'
  );
  page.on('dialog', (dialog) => dialog.accept());
  await page.locator('#reset').click();
  await expect(page.locator('body')).toHaveAttribute('data-toppings', '0');
  await page.clock.runFor(50);
  const cleared = await page.locator('canvas').screenshot({ path: 'screenshots/sauce-reset.png' });
  assert.ok(cleared.equals(plain), 'reset must clear sauce');
  await page.close();
}
