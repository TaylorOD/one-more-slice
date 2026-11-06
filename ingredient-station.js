import * as THREE from './vendor/three.module.js';
import { createGeometry } from './geometry.js';

// Reuse the same ingredient meshes as the pizza, including their shared geometry.
export function createIngredientStation(root, makeTopping) {
  const { box, mesh } = createGeometry(root);
  const steel = new THREE.MeshStandardMaterial({
    color: '#77848a',
    metalness: 0.65,
    roughness: 0.4
  });
  const inside = new THREE.MeshStandardMaterial({ color: '#172127', roughness: 0.8 });
  const trays = [
    ['cheese', -4, -1.4],
    ['sausage', -4, 0.45],
    ['mushroom', -4, 2.3],
    ['sauce', 4, -1.4],
    ['chicken', 4, 0.45],
    ['basil', 4, 2.3],
    ['pepperoni', -3, 4.1],
    ['olive', -1, 4.1],
    ['pepper', 1, 4.1],
    ['pineapple', 3, 4.1]
  ];
  for (const [type, x, z] of trays) {
    const tray = new THREE.Group();
    tray.position.set(x, -0.15, z);
    root.add(tray);
    box(1.4, 0.12, 1.1, steel, tray);
    box(1.25, 0.025, 0.94, inside, tray, 0, 0.07, 0);
    for (const side of [-1, 1]) {
      box(0.055, 0.16, 1.1, steel, tray, side * 0.68, 0.08, 0);
      box(1.4, 0.16, 0.055, steel, tray, 0, 0.08, side * 0.53);
    }
    for (let i = 0; i < 9; i++) {
      const ingredient = makeTopping(type);
      ingredient.scale.setScalar(0.8);
      ingredient.position.set(((i % 3) - 1) * 0.36, 0.13, (Math.floor(i / 3) - 1) * 0.24);
      ingredient.rotation.y = i * 2.4;
      tray.add(ingredient);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101c27';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#8feaf2';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), 128, 43);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = mesh(
      new THREE.PlaneGeometry(1.1, 0.25),
      new THREE.MeshBasicMaterial({ map: texture }),
      tray
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.18, 0.5);
  }
}
