import { expect } from '@playwright/test';

export async function checkSauce(page, baseUrl) {
  // Reduced motion keeps the scene still. Wait for actual GPU frames rather
  // than advancing a mocked clock that can leave screenshots one frame behind.
  await page.goto(baseUrl);
  await page.locator('#reset').click();
  await expect(page.locator('body')).toHaveAttribute('data-toppings', '0');
  const canvas = page.locator('canvas');
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  );
  const plain = await canvas.screenshot({ path: 'screenshots/sauce-plain.png' });
  await page.locator('[data-topping="sauce"]').click();
  await page.locator('#sprinkle').click();
  await expect
    .poll(
      async () =>
        (await canvas.screenshot({ path: 'screenshots/sauce-comparison.png' })).equals(plain),
      {
        timeout: 30000,
        message: 'sauce must visibly cover the pizza'
      }
    )
    .toBe(false);
  const covered = await canvas.screenshot({ path: 'screenshots/sauce-covered.png' });
  const recipe =
    baseUrl + '#recipe=' + encodeURIComponent(JSON.stringify({ v: 1, t: [['sauce', 0, 0, 0]] }));
  await page.locator('#undo').click();
  await expect
    .poll(
      async () =>
        (await canvas.screenshot({ path: 'screenshots/sauce-comparison.png' })).equals(plain),
      {
        timeout: 30000,
        message: 'undo must remove all sauce'
      }
    )
    .toBe(true);
  await page.goto(recipe);
  await expect
    .poll(async () => (await canvas.screenshot()).equals(covered), {
      timeout: 30000,
      message: 'shared sauce must restore the same coverage'
    })
    .toBe(true);
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#reset').click();
  await expect(page.locator('body')).toHaveAttribute('data-toppings', '0');
  await expect
    .poll(
      async () => (await canvas.screenshot({ path: 'screenshots/sauce-reset.png' })).equals(plain),
      {
        timeout: 30000,
        message: 'reset must clear sauce'
      }
    )
    .toBe(true);
  await page.close();
}
