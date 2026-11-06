export const types = ['pepperoni', 'mushroom', 'basil', 'olive', 'pineapple', 'pepper'];
export const maxToppings = 80;
export const toppingRadius = 1.72;

export function validateRecipe(value) {
  if (!value || value.v !== 1 || !Array.isArray(value.t) || value.t.length > maxToppings)
    return null;
  const valid = value.t.every(
    (t) =>
      Array.isArray(t) &&
      t.length === 4 &&
      types.includes(t[0]) &&
      t.slice(1).every(Number.isFinite) &&
      Math.hypot(t[1], t[2]) <= toppingRadius + 0.01 &&
      Math.abs(t[3]) <= Math.PI * 2
  );
  return valid ? { v: 1, t: value.t } : null;
}

export function encodeRecipe(toppings) {
  return encodeURIComponent(
    JSON.stringify({
      v: 1,
      t: toppings.map((t) => [t.type, +t.x.toFixed(3), +t.z.toFixed(3), +t.angle.toFixed(3)])
    })
  );
}

export function decodeRecipe(hash) {
  if (!hash.startsWith('#recipe=') || hash.length > 12000) return null;
  try {
    return validateRecipe(JSON.parse(decodeURIComponent(hash.slice(8))));
  } catch {
    return null;
  }
}

export function randomSpot(random = Math.random) {
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random()) * toppingRadius;
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    angle: random() * Math.PI * 2
  };
}
