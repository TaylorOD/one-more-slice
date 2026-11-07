// Shared pickup coordinates and delivery timing.
export const pickup = { x: -5.05, y: 1.28, z: 4.05 };
export const deliverySpeed = 1.2;
export const deliveryDuration = 6.3 / deliverySpeed;
export const trafficRoutes = [
  { color: '#713d3d', plate: '11 082', model: 'interceptor', offset: -1, speed: 8.5, lane: -0.7 },
  { color: '#4c5363', plate: '03 619', model: 'van', offset: 10, speed: -7, lane: -4 },
  { color: '#74715b', plate: '18 036', model: 'taxi', offset: 24, speed: -7, lane: -4 },
  { color: '#334c4b', plate: '05 192', model: 'hatch', offset: -14, speed: 8.5, lane: -0.7 }
];
export const trafficPosition = (route, t) => ((route.offset + route.speed * t + 72) % 48) - 24;
const clamp = (t) => Math.max(0, Math.min(1, t));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

// Matching velocities at each join keep steering tied to the actual path.
function curve(a, b, va, vb, start, end, seconds) {
  const duration = end - start,
    t = clamp((seconds - start) / duration);
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1,
    h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2,
    h11 = t ** 3 - t ** 2;
  return a.map(
    (value, i) => h00 * value + h10 * duration * va[i] + h01 * b[i] + h11 * duration * vb[i]
  );
}
function path(t) {
  if (t <= 1.65) return [-3.9, mix(7, 4.4, smooth(t / 1.65))];
  if (t <= 3.75) return curve([-3.9, 4.4], [-3.1, 1.5], [0, 0], [8 / 7, -0.8], 1.65, 3.75, t);
  if (t <= 4.65) return curve([-3.1, 1.5], [0.175, 0.65], [8 / 7, -0.8], [5.5, 0], 3.75, 4.65, t);
  const departure = t - 4.65;
  return [0.175 + 5.5 * departure + 1.2 * departure ** 2, 0.65];
}
export function courierPose(seconds, reduced = false) {
  const t = reduced ? 4.65 : Math.max(0, Math.min(seconds * deliverySpeed, 6.3));
  const [x, z] = path(t);
  const before = path(Math.max(0, t - 0.005)),
    after = path(t + 0.005);
  const yaw = t <= 1.65 ? Math.PI / 2 : Math.atan2(before[1] - after[1], after[0] - before[0]);
  const departure = Math.max(0, t - 4.65);
  const carDistance = 5.5 * t + 1.2 * departure ** 2;
  return {
    t,
    x,
    z,
    yaw,
    carDistance,
    carX: -20.8 + carDistance,
    street: smooth((t - 1.65) / 2.1),
    fire: smooth((t - 3.75) / 0.38),
    pull: smooth((t - 4.13) / 0.52),
    y: mix(0.04, -0.04, clamp((2.75 - z) / 0.5)),
    handZ:
      t < 1.65
        ? mix(0.4, -1.25, smooth((t - 1.1) / 0.55))
        : mix(-1.25, 0.55, smooth((t - 1.65) / 0.6))
  };
}
