import { expect } from '@playwright/test';

export async function checkCustomerOrder(page, baseUrl, name) {
  page.on('dialog', (dialog) => dialog.accept());
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto(baseUrl);
  await expect(page.locator('#caller-name')).not.toBeEmpty();
  await expect(page.locator('#order-clock')).toHaveText('2:00 left');
  await page.clock.fastForward(5000);
  await expect(page.locator('#order-clock')).toHaveText('2:00 left');
  await page.screenshot({
    path: `artifacts/screenshots/customer-call-${name}.png`,
    fullPage: true
  });
  const requested = await page
    .locator('[data-requested]')
    .evaluateAll((items) =>
      items.map((item) => ({ type: item.dataset.requested, count: Number(item.dataset.count) }))
    );
  for (const { type, count } of requested) {
    await page.locator(`[data-topping="${type}"]`).click();
    for (let i = 0; i < count; i += type === 'sauce' ? 1 : 5)
      await page.locator('#sprinkle').click();
  }
  await expect(page.locator('#requested-toppings .matched')).toHaveCount(requested.length);
  await page.clock.fastForward(name === 'mobile' ? 121000 : 1000);
  if (name === 'mobile') await expect(page.locator('#order-clock')).toContainText('late');
  await page.locator('#primary').click();
  await page.clock.fastForward(8100);
  if (name === 'mobile') {
    await page.locator('#primary').click();
    await page.locator('#bite').click();
  }
  await page.locator('#dispatch').click();
  await page.clock.fastForward(5400);
  await expect(page.locator('#order-score')).toHaveText(name === 'mobile' ? '90' : '100');
  await expect(page.locator('#order-receipt')).toBeVisible();
  await expect(page.locator('#receipt-time')).toContainText(
    name === 'mobile' ? 'Late arrival.' : 'On time.'
  );
  await page.locator('#order-receipt').scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `artifacts/screenshots/order-receipt-${name}.png`,
    fullPage: true
  });
  const time = await page.locator('#order-clock').textContent();
  await page.locator('#replay').click();
  await page.clock.fastForward(10000);
  await expect(page.locator('#order-clock')).toHaveText(time);
  await expect(page.locator('#order-score')).toHaveText(name === 'mobile' ? '90' : '100');
  const caller = await page.locator('#caller-name').textContent();
  await page.locator('#primary').click();
  await expect(page.locator('#caller-name')).not.toHaveText(caller);
  await expect(page.locator('#order-clock')).toHaveText('2:00 left');
  await expect(page.locator('#order-receipt')).toBeHidden();
  await page.locator('#sprinkle').click();
  await page.clock.fastForward(3000);
  await page.locator('#reset').click();
  await expect(page.locator('#order-clock')).toHaveText('2:00 left');
  await expect(page.locator('body')).toHaveAttribute('data-toppings', '0');
  await expect(page.locator('#share')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.close();
}
