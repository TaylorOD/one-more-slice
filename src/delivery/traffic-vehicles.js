import * as THREE from '../../vendor/three.module.js';

// All models keep the same bumper position and road footprint for safe towing.
export function createTrafficVehicles({
  root,
  material,
  box,
  wedge,
  wheel,
  label,
  steel,
  dark,
  alloy,
  trim,
  white,
  red
}) {
  const wheelSets = new Map();
  function makeCar(color, number, model = 'coupe') {
    const car = new THREE.Group();
    const wheels = [];
    wheelSets.set(car, wheels);
    root.add(car);
    const paint = material(color, { metalness: 0.75, roughness: 0.3 });
    const roofHeight = { coupe: 1.2, interceptor: 1.35, hatch: 1.6, taxi: 1.55, van: 2.05 }[model];
    const glowColor = {
      coupe: '#40e6ff',
      interceptor: '#ff457f',
      hatch: '#abf15a',
      taxi: '#ffc75b',
      van: '#a593ff'
    }[model];
    const glow = material(glowColor, { emissive: glowColor, emissiveIntensity: 1.8 });
    car.userData.model = model;
    wedge(
      car,
      [
        [-2, 0.35],
        [-2.1, 0.74],
        [-1.3, 0.9],
        [0.8, 0.9],
        [2.15, 0.57],
        [2.1, 0.34]
      ],
      1.7,
      paint
    );
    wedge(
      car,
      [
        [-1.32, 0.83],
        [-0.8, roofHeight],
        [0.52, roofHeight],
        [1.2, 0.83]
      ],
      1.4,
      dark
    );
    box(car, -0.15, roofHeight + 0.05, 0, 1.55, 0.08, 1.55, paint);
    for (const z of [-0.72, 0.72]) {
      // Split windows and pillars, mirrors, inset door handles and a worn stripe.
      box(
        car,
        -0.55,
        (roofHeight + 0.83) / 2,
        z,
        0.55,
        roofHeight - 0.88,
        0.024,
        material('#3c677a', { metalness: 0.5, roughness: 0.22 })
      );
      box(
        car,
        0.2,
        (roofHeight + 0.83) / 2,
        z,
        0.55,
        roofHeight - 0.88,
        0.024,
        material('#3c677a', { metalness: 0.5, roughness: 0.22 })
      );
      box(car, -0.13, (roofHeight + 0.83) / 2, z, 0.055, roofHeight - 0.78, 0.035, paint);
      box(car, 0.8, 0.95, z * 1.4, 0.2, 0.12, 0.18, paint);
      box(car, -0.62, 0.78, z * 1.24, 0.25, 0.035, 0.025, alloy);
      box(car, -0.1, 0.51, z * 1.24, 3.6, 0.08, 0.025, trim);
      for (let i = 0; i < 5; i++)
        box(car, -1.4 + i * 0.13, 0.52, z * 1.26, 0.07, 0.04, 0.025, paint);
    }
    for (const x of [-1.3, 1.35])
      for (const z of [-0.94, 0.94]) wheels.push(wheel(car, x, 0.24, z, 0.39, 0.23));
    box(car, 2.12, 0.45, 0, 0.08, 0.12, 1.85, steel);
    box(car, -2.12, 0.49, 0, 0.09, 0.15, 1.85, steel);
    for (const z of [-0.62, 0.62]) {
      box(car, 2.12, 0.65, z, 0.04, 0.13, 0.4, white);
      box(car, -2.13, 0.68, z, 0.04, 0.1, 0.45, red);
    }
    for (let i = 0; i < 7; i++) box(car, 2.15, 0.48, -0.35 + i * 0.12, 0.025, 0.07, 0.035, alloy);
    const plate = label(car, number, 0.55, 0.16, -2.18, 0.48, 0, '#a9b5b9');
    plate.rotation.y = -Math.PI / 2;

    // Shared lighting language, distinct silhouettes and equipment per model.
    for (const z of [-0.91, 0.91]) {
      box(car, 0, 0.32, z, 3.35, 0.035, 0.035, glow);
      box(car, -0.8, 0.66, z, 0.8, 0.23, 0.06, steel);
      for (let i = 0; i < 3; i++)
        box(car, -1.04 + i * 0.2, 0.66, z * 1.04, 0.07, 0.17, 0.025, alloy);
    }
    box(car, 2.17, 0.67, 0, 0.035, 0.045, 1.45, glow);
    box(car, -2.18, 0.72, 0, 0.035, 0.05, 1.45, red);
    if (model === 'van') {
      box(car, -0.95, 1.42, 0, 2.15, 1.2, 1.65, paint);
      for (const z of [-0.84, 0.84]) {
        box(car, -1, 1.45, z, 1.7, 0.9, 0.04, steel);
        box(car, -1, 1.5, z * 1.04, 1.3, 0.06, 0.02, glow);
        for (let i = 0; i < 4; i++)
          box(car, -1.6 + i * 0.4, 1.23, z * 1.04, 0.18, 0.18, 0.03, alloy);
      }
      box(car, -0.9, 2.12, 0, 1.9, 0.14, 1.5, steel);
    } else if (model === 'interceptor') {
      box(car, -1.65, 1.22, 0, 0.3, 0.08, 2, steel);
      for (const z of [-0.65, 0.65]) box(car, -1.65, 1.02, z, 0.08, 0.35, 0.09, alloy);
      box(car, 0, roofHeight + 0.13, 0, 0.55, 0.08, 1.25, glow);
    } else if (model === 'taxi') {
      box(car, -0.15, roofHeight + 0.21, 0, 0.7, 0.25, 0.5, steel);
      const taxiSign = label(car, 'TAXI', 0.65, 0.2, -0.15, roofHeight + 0.23, 0.26, '#ffc75b');
      taxiSign.material.depthWrite = false;
      for (const z of [-0.92, 0.92])
        for (let i = 0; i < 8; i++)
          box(car, -1.3 + i * 0.32, 0.7, z, 0.16, 0.12, 0.03, i % 2 ? dark : trim);
    } else if (model === 'hatch') {
      box(car, -1.05, 1.25, 0, 0.45, 0.7, 1.5, paint);
      box(car, -0.5, roofHeight + 0.15, 0, 1.1, 0.18, 1.2, steel);
      for (const z of [-0.5, 0.5]) box(car, -0.5, roofHeight + 0.27, z, 1.2, 0.05, 0.05, glow);
    } else {
      for (const z of [-0.55, 0.55]) {
        box(car, 1.25, 0.94, z, 0.75, 0.035, 0.08, glow).rotation.z = -0.15;
        box(car, -1.5, 0.93, z, 0.7, 0.05, 0.35, steel);
      }
    }
    return car;
  }
  return { makeCar, wheelSets };
}
