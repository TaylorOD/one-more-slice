import test from 'node:test';
import assert from 'node:assert/strict';
import { bakingPose, bakingDoneness, ovenLayout } from './oven-motion.js';

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

test('browning starts only after the whole pizza enters and finishes before exit', () => {
  for (let p = 0; p <= 0.27; p += 0.001) assert.equal(bakingDoneness(p), 0);
  for (let p = 0.271; p < 0.76; p += 0.001) {
    const pose = bakingPose(p);
    assert.ok(pose.z + ovenLayout.pizzaRadius * pose.scale < ovenLayout.mouthZ);
    assert.ok(bakingDoneness(p) > 0 && bakingDoneness(p) < 1);
  }
  assert.equal(bakingDoneness(0.76), 1);
  assert.equal(bakingDoneness(1), 1);
});
