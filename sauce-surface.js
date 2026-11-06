import * as THREE from './vendor/three.module.js';

// One reusable texture coats every slice. Sauce stays inside the crust and
// travels with a slice instead of becoming a stack of topping meshes.
export function createSauceSurface() {
  const size = 512,
    radius = 1.91;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const tile = document.createElement('canvas');
  tile.width = tile.height = 128;
  const paint = tile.getContext('2d');
  paint.fillStyle = '#ae301c';
  paint.fillRect(0, 0, 128, 128);
  let seed = 42;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 700; i++) {
    const x = random() * 128,
      y = random() * 128;
    paint.fillStyle = i % 3 ? '#d54e283b' : '#711d1730';
    paint.beginPath();
    paint.ellipse(x, y, 0.7 + (i % 3), 0.5 + (i % 2), i, 0, Math.PI * 2);
    paint.fill();
  }
  const pattern = context.createPattern(tile, 'repeat');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.01,
    roughness: 0.28,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2
  });
  let previousKey = '',
    lastPaint = -Infinity,
    wasMoving = false;
  function update(toppings, now) {
    const sauce = toppings.filter((t) => t.type === 'sauce');
    const key = sauce.map((t) => t.x + ',' + t.z + ',' + t.placedAt).join('|');
    const moving = sauce.some((t) => now - t.placedAt < 1100);
    if (key === previousKey && !wasMoving) return;
    if (key === previousKey && now - lastPaint < 33) return;
    context.clearRect(0, 0, size, size);
    for (const topping of sauce) {
      const progress = Math.min(1, (now - topping.placedAt) / 1000);
      const spread = 0.08 + 2.5 * (1 - (1 - progress) ** 3);
      const x = (topping.x / (radius * 2) + 0.5) * size;
      const y = (topping.z / (radius * 2) + 0.5) * size;
      context.beginPath();
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const r = (spread * (1 + 0.035 * Math.sin(angle * 7)) * size) / (radius * 2);
        const px = x + Math.cos(angle) * r,
          py = y + Math.sin(angle) * r;
        if (i) context.lineTo(px, py);
        else context.moveTo(px, py);
      }
      context.closePath();
      context.fillStyle = pattern;
      context.fill();
    }
    texture.needsUpdate = true;
    wasMoving = moving;
    previousKey = key;
    lastPaint = now;
  }
  function mapGeometry(geometry) {
    const positions = geometry.attributes.position,
      uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, positions.getX(i) / (radius * 2) + 0.5, positions.getY(i) / (radius * 2) + 0.5);
    return geometry;
  }
  return { material, update, mapGeometry };
}
