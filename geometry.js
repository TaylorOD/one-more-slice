import * as THREE from './vendor/three.module.js';
// Each scene shares its small sphere geometry. Meshes own their transforms,
// while geometry and materials stay alive until the page is closed.
export function createGeometry(scene) {
  const sphereGeo = new THREE.SphereGeometry(1, 16, 10);
  function mesh(geometry, mat, parent = scene) {
    const m = new THREE.Mesh(geometry, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(w, h, d, mat, parent, x = 0, y = 0, z = 0) {
    const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
    m.position.set(x, y, z);
    return m;
  }
  function ball(x, y, z, sx, sy, sz, mat, parent) {
    const m = mesh(sphereGeo, mat, parent);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    return m;
  }

  return { mesh, box, ball };
}
