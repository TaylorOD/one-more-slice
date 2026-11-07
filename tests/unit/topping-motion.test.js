import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toppingPose,
  toppingFallSeconds,
  toppingSettleSeconds
} from '../../src/kitchen/topping-motion.js';

test('toppings land, rebound slightly and settle above the pizza', () => {
  assert.equal(toppingPose(0).offset, 2);
  assert.equal(toppingPose(toppingFallSeconds).offset, 0);
  assert.ok(toppingPose(toppingFallSeconds + 0.11).offset > 0.08);
  assert.ok(toppingPose(toppingFallSeconds + 0.26).offset < 0.02);
  for (let t = toppingFallSeconds; t < toppingSettleSeconds; t += 0.001) {
    const pose = toppingPose(t);
    assert.ok(pose.offset >= 0 && pose.offset <= 0.091);
    assert.ok(pose.scaleY >= 0.9 && pose.scaleY <= 1);
  }
  assert.deepEqual(toppingPose(toppingSettleSeconds), { offset: 0, scaleY: 1, scaleXZ: 1 });
});
test('a delayed frame and reduced motion both leave toppings settled', () => {
  assert.deepEqual(toppingPose(10), toppingPose(Infinity));
  assert.deepEqual(toppingPose(10), toppingPose(100));
  assert.equal(toppingPose(toppingFallSeconds + 0.035).scaleY < 1, true);
});
