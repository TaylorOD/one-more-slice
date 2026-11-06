import test from 'node:test';
import assert from 'node:assert/strict';
import { bakingPose, ovenLayout } from './oven-motion.js';

test('the peel clears the fire and stone throughout entry and exit', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = bakingPose(i / 1000);
    const radius = ovenLayout.peelRadius * pose.scale;
    if (pose.z - radius < ovenLayout.mouthZ) {
      const bottom = pose.y + ovenLayout.peelBottom * pose.scale;
      assert.ok(bottom >= ovenLayout.deckTop, 'lift before crossing the oven mouth');
      assert.ok(bottom > ovenLayout.flameTop, 'keep the fire below the pizza');
      assert.ok(radius < ovenLayout.openingHalfWidth, 'fit through the opening');
    }
  }
});

test('baking rests inside the oven and returns to the same counter position', () => {
  assert.deepEqual(bakingPose(0), { y: 0, z: 0, scale: 1 });
  assert.deepEqual(bakingPose(1), { y: 0, z: 0, scale: 1 });
  assert.equal(bakingPose(0.5).z, ovenLayout.centerZ);
  assert.equal(bakingPose(0.5).y, ovenLayout.bakingHeight);
});
