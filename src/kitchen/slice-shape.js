import * as THREE from '../../vendor/three.module.js';

// A scalloped inner edge removes the tip of the inspected slice.
export function sliceShape(start, radius, bitten = false) {
  const end = start + Math.PI / 4;
  const innerRadius = (angle) =>
    0.52 + 0.055 * Math.sin(((angle - start) / (end - start)) * Math.PI * 6);
  const shape = new THREE.Shape();
  shape.moveTo(
    bitten ? Math.cos(start) * innerRadius(start) : 0,
    bitten ? Math.sin(start) * innerRadius(start) : 0
  );
  shape.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
  shape.absarc(0, 0, radius, start, end, false);
  if (bitten) {
    for (let i = 24; i >= 0; i--) {
      const angle = start + ((end - start) * i) / 24;
      shape.lineTo(Math.cos(angle) * innerRadius(angle), Math.sin(angle) * innerRadius(angle));
    }
  } else shape.lineTo(0, 0);
  shape.closePath();
  return shape;
}
