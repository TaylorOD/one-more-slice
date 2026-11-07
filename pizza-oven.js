import * as THREE from './vendor/three.module.js';
import { createGeometry } from './geometry.js';
import { ovenLayout } from './oven-motion.js';

export function createPizzaOven(parent) {
  const oven = new THREE.Group();
  oven.position.z = ovenLayout.centerZ;
  parent.add(oven);
  const { mesh, box, ball } = createGeometry(oven);
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const brick = material('#a85e3d'),
    mortar = material('#cfb997'),
    soot = material('#30251c');
  const stone = new THREE.MeshStandardMaterial({
      color: '#9b8065',
      emissive: '#bc4710',
      emissiveIntensity: 0.22,
      roughness: 0.9
    }),
    coal = material('#382a21');

  // Separate walls leave an actual hollow chamber behind the front opening.
  box(0.55, 3.4, 3.6, brick, oven, -2.1, 1.5, -0.1);
  box(0.55, 3.4, 3.6, brick, oven, 2.1, 1.5, -0.1);
  box(4.8, 3.4, 0.2, soot, oven, 0, 1.5, -1.9);
  box(4.95, 0.2, 3.9, mortar, oven, 0, 3.3, -0.1);
  box(4.8, 0.18, 3.8, mortar, oven, 0, -0.14, -0.1);

  const face = new THREE.Shape();
  face.moveTo(-2.4, -0.2);
  face.lineTo(2.4, -0.2);
  face.lineTo(2.4, 3.2);
  face.lineTo(-2.4, 3.2);
  face.closePath();
  const opening = new THREE.Path();
  opening.moveTo(-1.8, 0.81);
  opening.lineTo(1.8, 0.81);
  opening.lineTo(1.8, 1.2);
  opening.absarc(0, 1.2, ovenLayout.openingHalfWidth, 0, Math.PI, false);
  opening.lineTo(-1.8, 0.81);
  const firebox = new THREE.Path();
  firebox.moveTo(-1.35, -0.05);
  firebox.lineTo(1.35, -0.05);
  firebox.lineTo(1.35, 0.65);
  firebox.lineTo(-1.35, 0.65);
  firebox.closePath();
  face.holes.push(opening, firebox);
  const facade = mesh(new THREE.ExtrudeGeometry(face, { depth: 0.2, bevelEnabled: false }), brick);
  facade.position.z = 1.5;

  for (let i = 0; i < 13; i++) {
    const angle = (i / 12) * Math.PI;
    const archBrick = box(
      0.36,
      0.3,
      0.27,
      i % 2 ? brick : mortar,
      oven,
      Math.cos(angle) * 1.98,
      1.2 + Math.sin(angle) * 1.98,
      1.7
    );
    archBrick.rotation.z = angle;
  }
  for (const x of [-1.98, 1.98]) box(0.35, 0.42, 0.27, mortar, oven, x, 1, 1.7);
  box(4.1, 0.16, 3.7, stone, oven, 0, ovenLayout.deckTop - 0.08, -0.1);
  box(4.35, 0.12, 0.35, mortar, oven, 0, ovenLayout.deckTop - 0.06, 1.73);

  // Fire stays in its own lower chamber, below the continuous baking stone.
  const flames = [];
  const flameGeometry = new THREE.ConeGeometry(0.11, 0.44, 7);
  const flameMaterial = new THREE.MeshStandardMaterial({
    color: '#ffc268',
    emissive: '#ff7c24',
    emissiveIntensity: 2
  });
  for (let i = 0; i < 8; i++) {
    const x = -1.12 + i * 0.32;
    ball(x, 0.08, 1.48, 0.16, 0.08, 0.13, coal, oven);
    const flame = mesh(flameGeometry, flameMaterial);
    flame.position.set(x, ovenLayout.flameTop - 0.22, 1.48);
    flames.push(flame);
  }
  box(0.85, 0.7, 0.85, brick, oven, 1.05, 3.75, -0.7);
  box(1, 0.12, 1, soot, oven, 1.05, 4.13, -0.7);

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#493021';
  ctx.fillRect(0, 0, 768, 128);
  ctx.fillStyle = '#e8b96c';
  ctx.font = 'bold 66px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('C0saN0stra Pizza', 384, 85);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = mesh(
    new THREE.PlaneGeometry(4.7, 0.65),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  sign.position.set(0, 3.72, 1.75);
  // Rear flames rise behind the pizza. Their nearest edge stays behind the
  // pizza while it rests at the centre of the deck.
  const rearFlames = [];
  const fireCore = new THREE.MeshBasicMaterial({ color: '#fff0ab' });
  for (let i = 0; i < 9; i++) {
    const flame = mesh(new THREE.ConeGeometry(0.11, 1.1 + (i % 3) * 0.13, 7), flameMaterial);
    flame.position.set(-1.45 + i * 0.36, 1.48, -1.68);
    rearFlames.push(flame);
    const core = mesh(new THREE.ConeGeometry(0.06, 0.65, 7), fireCore);
    core.position.set(flame.position.x, 1.16, -1.64);
  }
  const glow = new THREE.PointLight('#ff791d', 50, 6, 2);
  glow.position.set(0, 1.8, -0.8);
  oven.add(glow);
  const embers = new THREE.MeshStandardMaterial({
    color: '#e66d14',
    emissive: '#ff5008',
    emissiveIntensity: 3
  });
  for (let i = 0; i < 12; i++) ball(-1.2 + i * 0.22, 0.06, 1.5, 0.09, 0.045, 0.07, embers, oven);
  const animatedFlames = [...flames, ...rearFlames];
  return {
    update(now, reduced) {
      animatedFlames.forEach((flame, i) => {
        flame.scale.y = reduced ? 1 : 0.88 + Math.sin(now * 0.009 + i * 1.8) * 0.12;
        flame.rotation.z = reduced ? 0 : Math.sin(now * 0.006 + i) * 0.07;
      });
      glow.intensity = reduced ? 50 : 48 + Math.sin(now * 0.012) * 2;
    }
  };
}
