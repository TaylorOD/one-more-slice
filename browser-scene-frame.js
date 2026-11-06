// Compare the rendered scene without its text overlays or the one pixel frame.
// The border can land on a fractional pixel when the sticky view scrolls.
export async function sceneFrame(page, { clock = false, path } = {}) {
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  if (clock) await page.clock.runFor(50);
  const box = await canvas.boundingBox();
  return page.screenshot({
    path,
    clip: { x: box.x + 2, y: box.y + 2, width: box.width - 4, height: box.height - 4 },
    style: '.stage-top, .scene-caption, .turn-controls { visibility: hidden !important; }'
  });
}
