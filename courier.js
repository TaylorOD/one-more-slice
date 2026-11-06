import { createTrafficVehicles } from './traffic-vehicles.js';
import * as THREE from './vendor/three.module.js';
import {
  courierPose,
  pickup,
  deliveryDuration,
  trafficRoutes,
  trafficPosition
} from './courier-motion.js';

const clamp = THREE.MathUtils.clamp;
const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

export function createCourier(scene) {
  const root = new THREE.Group();
  root.visible = false;
  scene.add(root);
  const material = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...extra });
  const steel = material('#293945', { metalness: 0.6 }),
    dark = material('#10161b'),
    rubber = material('#171b21');
  const alloy = material('#8e9ca4', { metalness: 0.75, roughness: 0.3 }),
    jacket = material('#765783'),
    trim = material('#c59c5c');
  const pants = material('#273344'),
    skin = material('#bc8b70'),
    hair = material('#392922'),
    bagMat = material('#8c4542');
  const cyan = material('#61b8d8', { emissive: '#3393b5', emissiveIntensity: 0.8 });
  const amber = material('#e4b76b', { emissive: '#c38b38', emissiveIntensity: 0.4 });
  const red = material('#b83e42', { emissive: '#cf3a31', emissiveIntensity: 0.9 });
  const white = material('#d7e5df', { emissive: '#c1d5d0', emissiveIntensity: 0.8 });
  const unitBox = new THREE.BoxGeometry(1, 1, 1),
    sphere = new THREE.SphereGeometry(1, 16, 12);
  const unitLimb = new THREE.CylinderGeometry(1, 1, 1, 10);
  const v1 = new THREE.Vector3(),
    v2 = new THREE.Vector3(),
    up = new THREE.Vector3(0, 1, 0);
  function box(parent, x, y, z, w, h, d, mat = steel) {
    const m = new THREE.Mesh(unitBox, mat);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function ball(parent, x, y, z, sx, sy, sz, mat) {
    const m = new THREE.Mesh(sphere, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function joint(parent, width, mat) {
    const m = new THREE.Mesh(unitLimb, mat);
    m.castShadow = true;
    parent.add(m);
    return (a, b) => {
      v1.set(...a);
      v2.set(...b).sub(v1);
      m.position.copy(v1).addScaledVector(v2, 0.5);
      m.scale.set(width, v2.length(), width);
      m.quaternion.setFromUnitVectors(up, v2.normalize());
    };
  }
  function label(parent, text, w, h, x, y, z, color = '#d6bc8d', background = '#14202a') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = color;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 82);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  function wedge(parent, outline, depth, mat) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    const mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSize: 0.06,
        bevelThickness: 0.06,
        bevelSegments: 2,
        steps: 1
      }),
      mat
    );
    mesh.position.z = -depth / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function wheel(parent, x, y, z, r, width, board = false) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, width, 20), rubber);
    tire.rotation.x = Math.PI / 2;
    group.add(tire);
    const spokes = new THREE.InstancedMesh(unitBox, steel, 10);
    const treads = new THREE.InstancedMesh(unitBox, dark, 10);
    const part = new THREE.Object3D();
    let spokeIndex = 0;
    group.add(spokes, treads);
    for (const side of [-1, 1]) {
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.58, r * 0.58, 0.025, 12), alloy);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = side * (width / 2 + 0.015);
      group.add(hub);
      for (let i = 0; i < 5; i++) {
        part.position.set(0, 0, side * (width / 2 + 0.035));
        part.scale.set(r * 0.9, 0.035, 0.025);
        part.rotation.z = (i * Math.PI) / 5;
        part.updateMatrix();
        spokes.setMatrixAt(spokeIndex++, part.matrix);
      }
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.7, 0.016, 5, 20),
        board ? cyan : dark
      );
      ring.position.z = side * (width / 2 + 0.025);
      group.add(ring);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      part.position.set(Math.sin(a) * r, Math.cos(a) * r, 0);
      part.scale.set(0.055, 0.025, width * 0.9);
      part.rotation.z = -a;
      part.updateMatrix();
      treads.setMatrixAt(i, part.matrix);
    }
    return group;
  }

  // Two lanes of moving traffic, separated from the pickup sidewalk.
  const asphalt = material('#18212a', { roughness: 0.38 });
  box(root, 0, -0.23, -1.3, 42, 0.12, 7.7, asphalt);
  box(root, 0, -0.19, 3.4, 28, 0.2, 1.8, material('#34414b'));
  // The side walkway meets a dropped curb, so the board never passes through a curb.
  box(root, -4, -0.19, 6.65, 4, 0.2, 4.7, material('#34414b'));
  box(root, -9.3, -0.06, 2.5, 9.4, 0.3, 0.18, alloy);
  box(root, 5.95, -0.06, 2.5, 16.1, 0.3, 0.18, alloy);
  box(root, -3.35, -0.15, 2.5, 2.5, 0.04, 0.5, asphalt).rotation.x = -Math.atan(0.08 / 0.5);
  for (let x = -20; x < 22; x += 3) box(root, x, -0.16, -2.1, 1.4, 0.014, 0.07, trim);
  for (let x = -13; x < 14; x += 2) box(root, x, -0.075, 3.4, 0.015, 0.012, 1.7, steel);
  for (let x = -12; x < 14; x += 7) {
    box(root, x, -0.14, 2, 0.8, 0.025, 0.5, dark);
    for (let i = 0; i < 6; i++) box(root, x - 0.32 + i * 0.13, -0.12, 2, 0.035, 0.014, 0.4, alloy);
  }
  const puddleMat = material('#233e51', {
    metalness: 0.65,
    roughness: 0.16,
    transparent: true,
    opacity: 0.65
  });
  for (const [x, z, sx, sz] of [
    [-7, 0.7, 2, 0.4],
    [4, -3.2, 2.8, 0.35],
    [7, 1.8, 1.5, 0.3]
  ]) {
    const puddle = ball(root, x, -0.15, z, sx, 0.008, sz, puddleMat);
    puddle.castShadow = false;
  }
  for (const x of [-7, 6]) {
    box(root, x, 0.15, 3.1, 0.17, 0.55, 0.17, steel);
    box(root, x, 0.36, 3.1, 0.19, 0.12, 0.19, amber);
  }
  // A two storey corner shop, with a human sized door beside the pickup bay.
  const masonry = material('#30404a'),
    glass = material('#203c4b', { metalness: 0.45, roughness: 0.22 });
  box(root, -9, 2.95, 6, 6, 6.2, 6, masonry);
  box(root, -9, 6.1, 6, 6.25, 0.25, 6.25, steel);
  box(root, -9, 3.1, 2.96, 6.1, 0.18, 0.16, alloy);
  box(root, -5.96, 3.1, 6, 0.16, 0.18, 6.1, alloy);
  // Shopfront facing the road.
  for (const x of [-10.6, -7.5]) {
    box(root, x, 1.3, 2.96, 2.5, 2.15, 0.04, glass);
    box(root, x, 1.3, 2.91, 0.07, 2.2, 0.08, alloy);
    box(root, x, 0.2, 2.91, 2.6, 0.09, 0.08, alloy);
    box(root, x, 2.4, 2.91, 2.6, 0.09, 0.08, alloy);
  }
  for (const x of [-10.6, -8.8, -7]) box(root, x, 4.6, 2.96, 0.9, 1.35, 0.04, glass);
  // The visible side entrance is taller than the courier.
  box(root, -5.96, 1.08, 7.5, 0.04, 2.3, 1.1, dark);
  box(root, -5.92, 1.35, 7.5, 0.04, 1.25, 0.85, glass);
  box(root, -5.88, 1.05, 7.93, 0.08, 0.09, 0.2, trim);
  for (const z of [6.2]) box(root, -5.96, 1.35, z, 0.04, 1.9, 1.2, glass);
  for (const z of [4.4, 6.2, 8]) box(root, -5.96, 4.6, z, 0.04, 1.35, 0.9, glass);
  box(root, -5.5, 2.65, 4.5, 1.1, 0.12, 2, steel);
  const shopName = label(root, 'Snowcrust', 4.5, 0.7, -5.86, 3.5, 6, '#e4b76b');
  shopName.rotation.y = Math.PI / 2;
  label(root, 'Snowcrust', 5, 0.7, -9, 3.5, 2.85, '#e4b76b');
  // The pickup hatch belongs to the shop, leaving the street and rider path clear.
  box(root, -5.94, 1.65, pickup.z, 0.1, 1.15, 1.9, dark);
  box(root, -5.35, 1.15, pickup.z, 1.3, 0.12, 1.9, alloy);
  const pickupSign = label(root, 'PICKUP', 1.6, 0.3, -5.86, 2.14, pickup.z);
  pickupSign.rotation.y = Math.PI / 2;
  box(root, -5.83, 1.45, pickup.z + 0.86, 0.04, 0.15, 0.08, cyan);
  label(root, 'NO PARKING', 1.2, 0.28, 5.3, 1.75, 2.8, '#c77569');
  box(root, 5.3, 0.7, 2.75, 0.07, 2, 0.07, steel);

  const { makeCar, wheelSets } = createTrafficVehicles({
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
  });
  const targetCar = makeCar('#384e5a', '07 204');
  const traffic = trafficRoutes.map((route) => ({
    ...route,
    car: makeCar(route.color, route.plate, route.model)
  }));
  traffic.filter((t) => t.speed < 0).forEach((t) => (t.car.rotation.y = Math.PI));

  const rider = new THREE.Group();
  root.add(rider);
  const board = new THREE.Group();
  rider.add(board);
  box(board, 0, 0.24, 0, 1.55, 0.1, 0.48, dark);
  for (const x of [-0.73, 0.73])
    box(board, x, 0.28, 0, 0.2, 0.07, 0.48, jacket).rotation.z = x > 0 ? 0.3 : -0.3;
  box(board, 0, 0.18, 0, 1.2, 0.07, 0.35, steel);
  for (const x of [-0.5, 0.5]) {
    box(board, x, 0.12, 0, 0.18, 0.1, 0.78, alloy);
    box(board, x, 0.15, 0, 0.2, 0.13, 0.19, trim);
  }
  const boardWheels = [];
  for (const x of [-0.53, 0.53])
    for (const z of [-0.37, 0.37]) boardWheels.push(wheel(board, x, 0.1, z, 0.23, 0.18, true));
  for (const z of [-0.25, 0.25]) box(board, 0, 0.26, z, 1.15, 0.028, 0.02, cyan);
  for (const x of [-0.45, 0.45])
    for (const z of [-0.13, 0.13]) ball(board, x, 0.3, z, 0.018, 0.009, 0.018, alloy);

  const body = new THREE.Group();
  rider.add(body);
  const torso = new THREE.Group();
  body.add(torso);
  box(torso, 0, 0, 0, 0.42, 0.64, 0.48, jacket);
  box(torso, 0.215, 0, 0, 0.025, 0.56, 0.035, alloy);
  for (const z of [-0.27, 0.27]) {
    box(torso, 0.05, 0.15, z, 0.37, 0.07, 0.025, trim);
    box(torso, -0.03, -0.17, z, 0.28, 0.16, 0.045, steel);
    for (let i = 0; i < 3; i++)
      box(torso, 0.1 - i * 0.08, 0.02, z, 0.035, 0.015, 0.015, trim).rotation.z = 0.3;
  }
  box(torso, -0.25, 0.02, 0, 0.16, 0.5, 0.4, bagMat);
  box(torso, -0.34, 0.03, 0, 0.025, 0.36, 0.28, dark);
  box(torso, 0, 0.31, 0, 0.5, 0.1, 0.58, steel);
  const strap = box(torso, 0.235, 0, 0, 0.025, 0.68, 0.07, dark);
  strap.rotation.x = -0.55;
  box(torso, 0.25, -0.1, -0.08, 0.035, 0.1, 0.09, alloy);
  const head = new THREE.Group();
  body.add(head);
  ball(head, 0, 0, 0, 0.2, 0.24, 0.19, skin);
  ball(head, 0.18, -0.015, 0, 0.07, 0.055, 0.055, skin);
  ball(head, -0.035, 0.12, 0, 0.235, 0.18, 0.23, trim);
  box(head, 0.1, 0.03, 0, 0.26, 0.065, 0.43, dark);
  box(head, 0.235, 0.03, 0, 0.025, 0.05, 0.34, cyan);
  box(head, -0.04, 0.285, 0, 0.32, 0.018, 0.055, steel);
  for (let i = 0; i < 3; i++)
    box(head, -0.07 + i * 0.075, 0.25, 0.14, 0.035, 0.018, 0.05, alloy).rotation.z = 0.25;
  const ponytail = new THREE.Group();
  head.add(ponytail);
  for (let i = 0; i < 5; i++)
    ball(ponytail, -0.2 - i * 0.075, -0.01 - i * 0.03, 0.04, 0.1 - i * 0.012, 0.075, 0.075, hair);
  ball(head, -0.22, 0.01, 0.04, 0.07, 0.07, 0.07, bagMat);
  const legs = [
    joint(body, 0.12, pants),
    joint(body, 0.105, pants),
    joint(body, 0.12, pants),
    joint(body, 0.105, pants)
  ];
  const arms = [
    joint(body, 0.085, jacket),
    joint(body, 0.07, skin),
    joint(body, 0.085, jacket),
    joint(body, 0.07, skin)
  ];
  const knees = [
    ball(body, 0, 0, 0, 0.15, 0.12, 0.14, steel),
    ball(body, 0, 0, 0, 0.15, 0.12, 0.14, steel)
  ];
  const elbows = [
    ball(body, 0, 0, 0, 0.095, 0.095, 0.095, dark),
    ball(body, 0, 0, 0, 0.095, 0.095, 0.095, dark)
  ];
  for (const x of [-0.42, 0.45]) {
    box(body, x, 0.37, 0, 0.37, 0.16, 0.25, dark);
    box(body, x, 0.3, 0, 0.39, 0.035, 0.27, alloy);
    box(body, x + 0.05, 0.43, 0, 0.07, 0.025, 0.25, trim);
  }
  const launcher = new THREE.Group();
  body.add(launcher);
  box(launcher, 0, 0, 0, 0.35, 0.14, 0.16, steel);
  box(launcher, 0.19, 0, 0, 0.07, 0.08, 0.1, alloy);
  const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16), trim);
  reel.rotation.x = Math.PI / 2;
  reel.position.set(-0.06, 0.06, 0);
  launcher.add(reel);
  box(launcher, 0.04, 0.08, 0.09, 0.12, 0.03, 0.02, cyan);

  const parcel = new THREE.Group();
  root.add(parcel);
  box(parcel, 0, 0, 0, 0.92, 0.13, 0.92, material('#bbae85'));
  box(parcel, 0, -0.06, 0, 0.94, 0.04, 0.94, trim);
  const logo = label(parcel, 'Snowcrust', 0.75, 0.19, 0, 0.072, 0, '#ac4439', '#bbae85');
  logo.rotation.x = -Math.PI / 2;
  box(parcel, 0, 0.075, 0, 0.045, 0.009, 0.95, bagMat);
  for (const x of [-0.35, 0.35])
    for (let i = 0; i < 3; i++) box(parcel, x, 0, -0.18 + i * 0.18, 0.035, 0.025, 0.04, dark);
  const cableGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 13 }, () => new THREE.Vector3())
  );
  const cable = new THREE.Line(cableGeometry, new THREE.LineBasicMaterial({ color: '#a4c4d5' }));
  root.add(cable);
  const magnet = new THREE.Group();
  root.add(magnet);
  box(magnet, 0, 0, 0, 0.12, 0.16, 0.22, steel);
  box(magnet, 0.07, 0, 0, 0.04, 0.18, 0.24, cyan);
  const sparks = new THREE.Group();
  root.add(sparks);
  for (let i = 0; i < 7; i++)
    box(
      sparks,
      Math.cos(i * 2.4) * 0.15,
      Math.sin(i * 2.4) * 0.12,
      0,
      0.02,
      0.12,
      0.02,
      amber
    ).rotation.z = i;
  const aimTarget = new THREE.Vector3();
  const hand = new THREE.Vector3(),
    rear = new THREE.Vector3(),
    towEnd = new THREE.Vector3();

  function frame(seconds, reduced = false) {
    // One deterministic timeline keeps reset, background tabs and reduced motion reliable.
    const pose = courierPose(seconds, reduced);
    const { t, street, fire, pull, carX } = pose;
    targetCar.position.set(carX, 0, -0.7);
    for (const item of traffic) {
      item.car.position.set(trafficPosition(item, t), 0, item.lane);
      for (const wheel of wheelSets.get(item.car))
        wheel.rotation.z = (-Math.abs(item.speed) * t) / 0.39;
    }
    for (const wheel of wheelSets.get(targetCar)) wheel.rotation.z = -pose.carDistance / 0.39;
    rider.position.set(pose.x, pose.y, pose.z);
    rider.rotation.y = pose.yaw;
    board.rotation.x = Math.sin(street * Math.PI) * 0.12;
    board.rotation.z = -Math.sin(pull * Math.PI) * 0.025;
    const crouch = 0.16 * street + 0.12 * Math.sin(pull * Math.PI);
    torso.position.set(0.06 + pull * 0.17, 1.15 - crouch, 0);
    torso.rotation.z = -0.15 - pull * 0.22;
    head.position.set(0.17 + pull * 0.3, 1.7 - crouch, 0);
    head.rotation.y = -0.35 * street;
    ponytail.rotation.z = 0.2 + pull * 0.35 + (!reduced ? Math.sin(t * 9) * 0.12 : 0);
    const hip = [-0.07, 0.9 - crouch, 0],
      backKnee = [-0.52, 0.66 - crouch * 0.4, 0.06],
      frontKnee = [0.53, 0.62 - crouch * 0.4, -0.03];
    legs[0](hip, backKnee);
    legs[1](backKnee, [-0.42, 0.42, 0]);
    legs[2](hip, frontKnee);
    legs[3](frontKnee, [0.45, 0.42, 0]);
    knees[0].position.set(...backKnee);
    knees[1].position.set(...frontKnee);
    const boxHand = [0.4, 1.16 - crouch * 0.3, pose.handZ];
    const aimHand = [0.62 + fire * 0.12, 1.05 - crouch * 0.5, -0.25];
    const boxElbow = [0.02, 1.02 - crouch, 0.4],
      aimElbow = [0.34, 1.15 - crouch, -0.32];
    arms[0]([0.08, 1.4 - crouch, 0.25], boxElbow);
    arms[1](boxElbow, boxHand);
    arms[2]([0.08, 1.4 - crouch, -0.25], aimElbow);
    arms[3](aimElbow, aimHand);
    elbows[0].position.set(...boxElbow);
    elbows[1].position.set(...aimElbow);
    launcher.position.set(...aimHand);
    root.updateMatrixWorld(true);
    const target = body.worldToLocal(aimTarget.set(carX - 2.17, 0.54, -0.7));
    launcher.rotation.y = Math.atan2(-(target.z - aimHand[2]), target.x - aimHand[0]) * fire;
    launcher.updateMatrixWorld(true);
    if (t < 1.65) parcel.position.set(pickup.x, pickup.y, pickup.z);
    else {
      v1.set(boxHand[0] - 0.05, boxHand[1] + 0.08, boxHand[2] + 0.1);
      body.localToWorld(v1);
      parcel.position.copy(v1);
    }
    parcel.rotation.z = -0.05 * smooth((t - 1.65) / 0.6) - pull * 0.04;
    parcel.rotation.y = pose.yaw;
    launcher.localToWorld(hand.set(0.2, 0, 0));
    rear.set(carX - 2.17, 0.54, -0.7);
    towEnd.copy(hand).lerp(rear, fire);
    cable.visible = t >= 3.75;
    magnet.visible = cable.visible;
    magnet.position.copy(towEnd);
    const points = cableGeometry.attributes.position;
    for (let i = 0; i < 13; i++) {
      const f = i / 12;
      v1.copy(hand).lerp(towEnd, f);
      v1.y -= Math.sin(f * Math.PI) * (0.22 * (1 - pull) + 0.025);
      points.setXYZ(i, v1.x, v1.y, v1.z);
    }
    points.needsUpdate = true;
    cableGeometry.computeBoundingSphere();
    sparks.visible = !reduced && t >= 4.1 && t < 4.3;
    sparks.position.copy(rear);
    for (const wheel of boardWheels)
      wheel.rotation.z = -Math.hypot(pose.x + 3.9, pose.z - 7) / 0.23;
    const phase = t < 1.65 ? 'collect' : t < 3.75 ? 'approach' : t < 4.13 ? 'hook' : 'ride';
    return { done: seconds >= deliveryDuration, phase };
  }
  return {
    start() {
      root.visible = true;
      frame(0);
    },
    reset() {
      root.visible = false;
    },
    frame
  };
}
