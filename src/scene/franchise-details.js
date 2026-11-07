import * as THREE from '../../vendor/three.module.js';
import { createGeometry } from './geometry.js';

// Signs are real world objects. Keep their copy short enough to read in the scene.
function sign(parent, lines, width, height, x, y, z, color = '#f2b55d') {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12212c';
  ctx.fillRect(0, 0, 768, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 752, 240);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px monospace';
  lines.forEach((line, i) => ctx.fillText(line, 384, 85 + i * 65, 720));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  panel.position.set(x, y, z);
  parent.add(panel);
  return panel;
}

export function addDispatchDetails(root) {
  const { box } = createGeometry(root);
  const steel = new THREE.MeshStandardMaterial({
    color: '#65727a',
    metalness: 0.7,
    roughness: 0.4
  });
  const dark = new THREE.MeshStandardMaterial({ color: '#0c1720' });
  // A wall chute and scanner beside the oven, outside the loading path.
  box(2, 1.3, 0.4, steel, root, 4.4, 0.75, -5.9);
  box(1.7, 0.8, 0.04, dark, root, 4.4, 0.75, -5.67);
  for (let i = 0; i < 6; i++) box(1.7, 0.04, 0.07, steel, root, 4.4, 0.42 + i * 0.12, -5.62);
  box(2, 0.08, 0.9, steel, root, 4.4, 0.12, -5.45);
  sign(root, ['SMART BOX', 'ADDRESS / ROUTE'], 1.9, 0.63, -4.5, 0.65, -5.92, '#67e4da');
  sign(root, ['DISPATCH CHUTE', 'SCAN BEFORE RELEASE'], 2.5, 0.8, 4.4, 1.85, -5.6);
  // A franchise procedure binder on the side counter, not decorative floating copy.
  box(0.8, 0.1, 1.05, dark, root, -4.1, -0.19, 2.4);
  const binder = sign(root, ['C0saN0stra', 'PIZZA UNIVERSITY'], 0.75, 0.9, -4.1, -0.13, 2.4);
  binder.rotation.x = -Math.PI / 2;
}

export function addFranchiseStreet(root) {
  const { box } = createGeometry(root);
  const steel = new THREE.MeshStandardMaterial({ color: '#435665', roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: '#1b2d3b', roughness: 0.9 });
  // Storage housing sits behind both traffic lanes. No props enter the tow route.
  box(12, 3.1, 4, dark, root, 2, 1.25, -10);
  for (let unit = 0; unit < 4; unit++) {
    const x = -2.5 + unit * 3;
    box(2.6, 2.6, 0.08, steel, root, x, 1.05, -7.95);
    for (let rib = 0; rib < 13; rib++)
      box(2.55, 0.035, 0.055, dark, root, x, -0.15 + rib * 0.19, -7.88);
    box(0.3, 0.06, 0.08, dark, root, x, 0.35, -7.81);
  }
  sign(root, ['U-Stor-It', 'INGLEWOOD'], 4.6, 1.2, 2, 3.5, -7.85);
  // A franchulate checkpoint marks a side entrance, never the public through lane.
  for (const x of [10, 15]) box(0.35, 4.6, 0.35, steel, root, x, 2, -8);
  sign(root, ['GREATER HONG KONG', 'FRANCHULATE / ENTRY'], 5.7, 1.5, 12.5, 4.2, -7.8, '#67e4da');
  box(4.6, 0.12, 0.15, steel, root, 12.5, 1.2, -8);
  for (const x of [-12.5, -9.5]) box(0.12, 4.8, 0.12, steel, root, x, 2.1, -8.1);
  sign(root, ['RadiKS', 'KOURIER CHECK IN'], 3.6, 1, -11, 4.3, -8, '#f18b35');
}
