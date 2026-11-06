import test from 'node:test';
import assert from 'node:assert/strict';
import { bakingPose, ovenLayout } from './oven-motion.js';

test('the pizza clears the fire and stone throughout entry and exit', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = bakingPose(i / 1000);
    const radius = ovenLayout.pizzaRadius * pose.scale;
    if (pose.z - radius < ovenLayout.mouthZ) {
      const bottom = pose.y + ovenLayout.pizzaBottom * pose.scale;
      assert.ok(bottom >= ovenLayout.deckTop, 'lift before crossing the oven mouth');
      assert.ok(bottom > ovenLayout.flameTop, 'keep the fire below the pizza');
      assert.ok(radius < ovenLayout.openingHalfWidth, 'fit through the opening');
    }
  }
});

test('baking rests inside the oven and returns to the same hovering position', () => {
  assert.deepEqual(bakingPose(0), { y: ovenLayout.prepHeight, z: 0, scale: 1 });
  assert.deepEqual(bakingPose(1), { y: ovenLayout.prepHeight, z: 0, scale: 1 });
  assert.equal(bakingPose(0.5).z, ovenLayout.centerZ);
  assert.equal(bakingPose(0.5).y, ovenLayout.bakingHeight);
});
