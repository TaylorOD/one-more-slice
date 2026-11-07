import { addFranchiseStreet } from './franchise-details.js';
import * as THREE from '../../vendor/three.module.js';
import { createGeometry } from './geometry.js';
// Distances use roughly one metre per unit, matching the courier and cars.
export function createCity(scene) {
  const root = new THREE.Group();
  root.visible = false;
  scene.add(root);
  const { mesh, box } = createGeometry(root);
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const doorMaterial = material('#201f19');
  // A subtle tiled countertop, drawn here so the kitchen doesn't need image downloads.
  const tile = document.createElement('canvas');
  tile.width = tile.height = 256;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = '#101a23';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#111d27';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillRect(128, 128, 128, 128);
  ctx.strokeStyle = '#274154';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 128, 128);
  ctx.strokeRect(128, 0, 128, 128);
  ctx.strokeRect(0, 128, 128, 128);
  ctx.strokeRect(128, 128, 128, 128);
  const texture = new THREE.CanvasTexture(tile);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  const floor = mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.32;

  // Full sized city blocks behind the kitchen and delivery street.
  const city = new THREE.Group();
  root.add(city);
  const buildingMat = material('#101b28');
  const windowMat = new THREE.MeshStandardMaterial({
    color: '#569cd6',
    roughness: 0.8,
    emissive: '#569cd6',
    emissiveIntensity: 1.2
  });
  for (let i = 0; i < 12; i++) {
    const x = -38 + i * 7.5,
      height = 12 + ((i * 7) % 5) * 4;
    const z = -17 - (i % 2) * 6;
    box(6, height, 6, buildingMat, city, x, height / 2 - 0.3, z);
    for (let y = 3.8; y < height - 0.8; y += 3.2)
      for (const dx of [-2, 0, 2]) {
        if ((i + Math.round(y * 10) + Math.round(dx * 10)) % 3 === 0) continue;
        box(0.8, 1.4, 0.02, windowMat, city, x + dx, y, z + 3.01);
      }
    box(1.2, 2.4, 0.025, doorMaterial, city, x, 0.9, z + 3.02);
  }
  addFranchiseStreet(root);
  return {
    setVisible(visible) {
      root.visible = visible;
    }
  };
}
