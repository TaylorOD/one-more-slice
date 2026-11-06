import * as THREE from './vendor/three.module.js';
import { createGeometry } from './geometry.js';

// The room shares the pizza's coordinate system: the worktop is just below y=0.
// It belongs to the kitchen group so none of it follows the courier outside.
export function createKitchenRoom(root) {
  const { mesh, box } = createGeometry(root);
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const plaster = material('#d4bc91');
  const wood = material('#67442d');
  const oak = material('#9b7047');
  const stone = material('#d9c9a9');
  const copper = new THREE.MeshStandardMaterial({
    color: '#b77846',
    metalness: 0.55,
    roughness: 0.4
  });
  const ceramic = material('#eee1bd');

  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = tileCanvas.height = 256;
  const ctx = tileCanvas.getContext('2d');
  ctx.fillStyle = '#785643';
  ctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#a96847' : '#b77a54';
      ctx.fillRect(col * 128 + 3, row * 128 + 3, 122, 122);
    }
  const tiles = new THREE.CanvasTexture(tileCanvas);
  tiles.colorSpace = THREE.SRGBColorSpace;
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
  tiles.repeat.set(7, 7);
  const floor = mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshStandardMaterial({ map: tiles, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.5, -1);
  box(14, 7.4, 0.25, plaster, root, 0, 1.2, -6.8);
  box(0.25, 7.4, 12, plaster, root, -7, 1.2, -0.9);
  box(14, 0.2, 0.18, wood, root, 0, -2.25, -6.6);
  box(0.18, 0.2, 12, wood, root, -6.8, -2.25, -0.9);

  // Green glazed backsplash with a cream border around the oven and shelves.
  box(13.7, 2.25, 0.08, ceramic, root, 0, 0.6, -6.64);
  const glaze = new THREE.MeshStandardMaterial({ color: '#536b50', roughness: 0.25 });
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 23; col++) {
      box(0.55, 0.48, 0.04, glaze, root, -6.55 + col * 0.59, -0.15 + row * 0.52, -6.58);
    }
  box(14, 0.15, 0.2, wood, root, 0, 4.7, -6.6);

  // A real prep counter, with a stone top and cabinets reaching the tiled floor.
  box(9.3, 0.28, 7, stone, root, 0, -0.4, 0.7);
  box(8.7, 1.85, 6.45, wood, root, 0, -1.45, 0.7);
  for (const x of [-3.25, -1.08, 1.08, 3.25]) {
    box(1.95, 1.45, 0.07, oak, root, x, -1.35, 3.96);
    box(0.34, 0.07, 0.08, copper, root, x, -0.82, 4.02);
  }
  box(12.5, 0.28, 3.3, stone, root, 0, -0.4, -4.65);
  box(12, 1.9, 2.8, wood, root, 0, -1.45, -4.65);
  for (const x of [-5, -3, -1, 1, 3, 5]) {
    box(1.8, 1.5, 0.06, oak, root, x, -1.35, -3.22);
    box(0.3, 0.07, 0.08, copper, root, x, -0.8, -3.16);
  }

  // Open shelves, flour jars, plates and olive oil beside the oven.
  for (const y of [2.25, 3.55]) {
    box(3.3, 0.14, 0.8, oak, root, 4.3, y, -6.1);
    for (const x of [3.1, 5.5]) box(0.12, 0.5, 0.5, wood, root, x, y - 0.25, -6.25);
  }
  for (let i = 0; i < 4; i++) {
    const jar = mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.55, 16),
      i % 2 ? ceramic : material('#ae986d')
    );
    jar.position.set(3.2 + i * 0.7, 2.6, -6.05);
    box(0.46, 0.07, 0.46, wood, root, 3.2 + i * 0.7, 2.91, -6.05);
  }
  for (let i = 0; i < 5; i++) {
    const plate = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.045, 24), ceramic);
    plate.position.set(3.4, 3.65 + i * 0.05, -6.05);
  }
  const oil = material('#596335');
  for (const x of [4.6, 5.25]) {
    const bottle = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.62, 12), oil);
    bottle.position.set(x, 3.93, -6.05);
    box(0.13, 0.28, 0.13, oil, root, x, 4.35, -6.05);
    box(0.2, 0.25, 0.025, ceramic, root, x, 3.95, -5.86);
  }

  box(2.7, 0.07, 0.12, wood, root, -4.6, 2.9, -6.4);
  for (const x of [-5.45, -4.6, -3.75]) {
    box(0.07, 0.62, 0.07, copper, root, x, 2.52, -6.27);
    const pan = mesh(new THREE.CylinderGeometry(0.34, 0.32, 0.12, 24), copper);
    pan.rotation.x = Math.PI / 2;
    pan.position.set(x, 1.95, -6.22);
  }

  // A window in the side wall gives the room an outside edge without exposing
  // the city floor that belongs to the delivery scene.
  const night = new THREE.MeshStandardMaterial({
    color: '#263f4b',
    emissive: '#263f4b',
    emissiveIntensity: 0.35
  });
  box(0.08, 2.4, 2.5, wood, root, -6.8, 2, -2.7);
  box(0.08, 2.15, 2.25, night, root, -6.74, 2, -2.7);
  box(0.12, 2.2, 0.08, oak, root, -6.68, 2, -2.7);
  box(0.12, 0.08, 2.3, oak, root, -6.68, 2, -2.7);
  box(0.6, 0.12, 2.7, stone, root, -6.55, 0.85, -2.7);

  const warmLight = new THREE.PointLight('#ffd89c', 60, 18, 2);
  warmLight.position.set(1, 5, 2);
  root.add(warmLight);
}
