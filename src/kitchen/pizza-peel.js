import * as THREE from '../../vendor/three.module.js';
import { createGeometry } from '../scene/geometry.js';

export function createPizzaPeel(parent) {
  const { mesh, box } = createGeometry(parent);
  const metal = new THREE.MeshStandardMaterial({
    color: '#9eabb4',
    metalness: 0.72,
    roughness: 0.47
  });
  const collar = new THREE.MeshStandardMaterial({
    color: '#56636e',
    metalness: 0.8,
    roughness: 0.35
  });
  const wood = new THREE.MeshStandardMaterial({ color: '#a86f3b', roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: '#40332a', roughness: 0.9 });
  // In the blade's XY shape, positive Y points toward the oven after rotation.
  const blade = new THREE.Shape();
  blade.moveTo(-2.1, 2.5);
  blade.quadraticCurveTo(-2.46, 2.5, -2.46, 2.1);
  blade.lineTo(-2.46, -1.3);
  blade.quadraticCurveTo(-2.46, -1.8, -1.75, -2.12);
  blade.lineTo(-0.23, -2.68);
  blade.lineTo(-0.23, -3.05);
  blade.lineTo(0.23, -3.05);
  blade.lineTo(0.23, -2.68);
  blade.lineTo(1.75, -2.12);
  blade.quadraticCurveTo(2.46, -1.8, 2.46, -1.3);
  blade.lineTo(2.46, 2.1);
  blade.quadraticCurveTo(2.46, 2.5, 2.1, 2.5);
  blade.closePath();
  for (const x of [-2.3, 2.3])
    for (const y of [-1, -0.5, 0, 0.5, 1, 1.5]) {
      const slot = new THREE.Path();
      slot.moveTo(x - 0.035, y - 0.14);
      slot.lineTo(x + 0.035, y - 0.14);
      slot.lineTo(x + 0.035, y + 0.14);
      slot.lineTo(x - 0.035, y + 0.14);
      slot.closePath();
      blade.holes.push(slot);
    }
  const head = mesh(
    new THREE.ExtrudeGeometry(blade, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
      curveSegments: 12
    }),
    metal
  );
  head.rotation.x = -Math.PI / 2;
  head.position.y = -0.06;
  // The collar caps the narrow metal neck. The wood begins beyond the blade,
  // so its joint is visible instead of a rectangle buried in a round board.
  box(0.48, 0.08, 0.65, collar, parent, 0, -0.005, 2.85);
  for (const z of [2.65, 3.03]) {
    const rivet = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 10), metal);
    rivet.position.set(0, 0.047, z);
  }
  const shaft = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12), metal);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.set(0, 0.03, 3.32);
  const grip = mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.65, 16), wood);
  grip.rotation.x = Math.PI / 2;
  grip.position.set(0, 0.03, 4.25);
  for (const z of [3.46, 4.98]) {
    const band = mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.07, 16), dark);
    band.rotation.x = Math.PI / 2;
    band.position.set(0, 0.03, z);
  }
}
