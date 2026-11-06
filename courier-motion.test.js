import test from 'node:test';
import assert from 'node:assert/strict';
import { courierPose, pickup } from './courier-motion.js';

test('courier and board stay clear of the shop and pickup counter', () => {
  for (let i = 0; i <= 900; i++) {
    const pose = courierPose(i / 100);
    // Conservative horizontal bounds include the board, shoes and backpack.
    const halfX = 0.85 * Math.cos(pose.yaw) + 0.5 * Math.sin(pose.yaw);
    const halfZ = 0.85 * Math.sin(pose.yaw) + 0.5 * Math.cos(pose.yaw);
    assert.ok(pose.z + halfZ < 3 || pose.x - halfX > -6, 'shop wall clearance');
    assert.ok(
      pose.x - halfX > -4.7 || Math.abs(pose.z - pickup.z) > 0.95 + halfZ,
      'pickup counter clearance'
    );
    assert.ok(pose.x + halfX < pose.carX - 2.2 || pose.z - halfZ > 0.4, 'tow car clearance');
  }
});

test('pizza pickup meets the hand without a position jump', () => {
  const pose = courierPose(1.65);
  assert.ok(
    Math.abs(
      pose.x + 0.35 * Math.cos(pose.yaw) + (pose.handZ + 0.1) * Math.sin(pose.yaw) - pickup.x
    ) < 0.001
  );
  assert.ok(Math.abs(pose.y + 1.24 - pickup.y) < 0.001);
  assert.ok(
    Math.abs(
      pose.z - 0.35 * Math.sin(pose.yaw) + (pose.handZ + 0.1) * Math.cos(pose.yaw) - pickup.z
    ) < 0.001
  );
});

test('courier moves continuously and stays behind the tow car', () => {
  let previous = courierPose(0);
  for (let i = 1; i <= 9000; i++) {
    const pose = courierPose(i / 1000);
    assert.ok(Math.hypot(pose.x - previous.x, pose.z - previous.z) < 0.02);
    if (pose.t >= 4.65) assert.ok(Math.abs(pose.carX - pose.x - 4.6) < 0.001);
    previous = pose;
  }
  assert.deepEqual(courierPose(0, true), courierPose(9, true));
});
