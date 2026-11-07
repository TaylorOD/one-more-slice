const gravity = 14;
export const toppingFallSeconds = Math.sqrt(4 / gravity);
export const toppingSettleSeconds = toppingFallSeconds + 0.3;
const settled = Object.freeze({ offset: 0, scaleY: 1, scaleXZ: 1 });

// Sample elapsed time rather than integrating velocity frame by frame.
// A slow frame can skip a bounce, but cannot bury a topping or keep it moving.
export function toppingPose(seconds) {
  if (!Number.isFinite(seconds) || seconds >= toppingSettleSeconds) return settled;
  const t = Math.max(0, seconds);
  if (t < toppingFallSeconds)
    return { offset: Math.max(0, 2 - (gravity * t * t) / 2), scaleY: 1, scaleXZ: 1 };
  const contact = t - toppingFallSeconds;
  const first = contact < 0.22;
  const phase = first ? contact / 0.22 : (contact - 0.22) / 0.08;
  const offset = (first ? 0.09 : 0.012) * 4 * phase * (1 - phase);
  const squash = contact < 0.07 ? Math.sin((contact / 0.07) * Math.PI) * 0.1 : 0;
  return { offset: Math.max(0, offset), scaleY: 1 - squash, scaleXZ: 1 + squash * 0.5 };
}
