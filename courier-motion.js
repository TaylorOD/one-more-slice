// World coordinates shared by the pickup counter and courier path.
export const pickup = { x: -5.05, y: 1.28, z: 4.05 };
const clamp = (t) => Math.max(0, Math.min(1, t));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

export function courierPose(seconds, reduced = false) {
  const t = reduced ? 4.65 : Math.max(0, Math.min(seconds, 9));
  const collect = smooth(t / 1.65);
  const street = smooth((t - 1.65) / 2.15);
  const fire = clamp((t - 3.75) / 0.38);
  const pull = smooth((t - 4.13) / 0.5);
  const departure = Math.max(0, t - 4.65);
  const carDistance = 3.2 * t + departure * departure * 0.9;
  const carX = -11.5 + carDistance;
  const preX = mix(-3.9, -3.1, street);
  const z = mix(mix(7, 4.4, collect), 1.45, street) - 0.8 * smooth((t - 3.45) / 0.35);
  return {
    t,
    street,
    fire,
    pull,
    carX,
    carDistance,
    x: mix(preX, carX - 4.6, pull),
    y: mix(0.04, -0.04, clamp((2.75 - z) / 0.5)),
    // Approach the side hatch, then turn into the lane behind the passing car.
    z,
    yaw: (Math.PI / 2) * (1 - smooth((t - 2.5) / 1.3)),
    handZ:
      t < 1.65
        ? mix(0.4, -1.25, smooth((t - 1.1) / 0.55))
        : mix(-1.25, 0.55, smooth((t - 1.65) / 0.6))
  };
}
