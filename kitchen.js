import * as THREE from './vendor/three.module.js';
import { createGeometry } from './geometry.js';
export function createKitchen(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const { mesh, box, ball } = createGeometry(root);
  const material = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
  const mats = {
    wood: material('#364753', { metalness: 0.65, roughness: 0.4 }),
    edge: material('#192833'),
    crust: material('#e9b96b'),
    dough: material('#edc986'),
    cheese: material('#f4d575', { roughness: 0.52 }),
    sauce: material('#b84125'),
    pepperoni: material('#b33c26'),
    fleck: material('#edb16d'),
    mushroom: material('#d8c5a5'),
    gill: material('#806246'),
    basil: material('#447344'),
    olive: material('#35392d'),
    pepper: material('#648b34'),
    pineapple: material('#f0c94b'),
    mozzarella: material('#fff0c7'),
    sausage: material('#815335'),
    chicken: material('#e4be83'),
    brick: material('#273747', { metalness: 0.35 }),
    grout: material('#485d70', { metalness: 0.5 }),
    oven: material('#17222d'),
    black: material('#201f19'),
    coal: material('#382a21'),
    char: material('#96603a'),
    cream: material('#8999a5'),
    metal: material('#79796b', { metalness: 0.3 }),
    towel: material('#243d51')
  };
  const neon = material('#569cd6', { emissive: '#569cd6', emissiveIntensity: 2 });
  box(4.4, 0.045, 0.045, neon, root, 0, 2.37, -4.0);
  box(0.045, 0.035, 8, neon, root, -5, -0.28, -1.8);
  box(0.045, 0.035, 8, neon, root, 5, -0.28, -1.8);
  const rimLight = new THREE.PointLight('#569cd6', 35, 16, 2);
  rimLight.position.set(-3, 3, -5);
  scene.add(rimLight);

  // The brick oven is made from individual blocks around an arched opening.
  const oven = new THREE.Group();
  oven.position.set(0, 0, -4.5);
  root.add(oven);
  box(5, 0.3, 2.65, mats.grout, oven, 0, -0.1, 0);
  box(4.1, 2, 1.7, mats.brick, oven, 0, 0.85, -0.45);
  const arch = new THREE.Shape();
  arch.moveTo(-1.2, 0);
  arch.lineTo(1.2, 0);
  arch.lineTo(1.2, 0.65);
  arch.absarc(0, 0.65, 1.2, 0, Math.PI, false);
  arch.lineTo(-1.2, 0);
  const dark = mesh(new THREE.ShapeGeometry(arch), mats.black, oven);
  dark.position.set(0, 0.03, 0.46);
  for (let i = 0; i < 11; i++) {
    const a = (i / 10) * Math.PI;
    const b = box(
      0.45,
      0.45,
      0.35,
      i % 2 ? mats.brick : mats.grout,
      oven,
      Math.cos(a) * 1.47,
      0.68 + Math.sin(a) * 1.47,
      0.62
    );
    b.rotation.z = a;
  }
  for (const x of [-1.47, 1.47])
    for (let j = 0; j < 2; j++) box(0.43, 0.32, 0.36, mats.brick, oven, x, 0.17 + j * 0.34, 0.62);
  box(4.55, 0.24, 2.3, mats.grout, oven, 0, 2.2, -0.35);
  box(0.85, 0.85, 0.8, mats.brick, oven, 1.05, 2.7, -0.65);
  box(1, 0.15, 1, mats.oven, oven, 1.05, 3.16, -0.65);
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 768;
  signCanvas.height = 128;
  const signContext = signCanvas.getContext('2d');
  signContext.fillStyle = '#080d13';
  signContext.fillRect(0, 0, 768, 128);
  signContext.fillStyle = '#e8b96c';
  signContext.font = 'bold 66px monospace';
  signContext.textAlign = 'center';
  signContext.fillText('C0saNostra Pizza', 384, 85);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const shopSign = mesh(
    new THREE.PlaneGeometry(4.7, 0.78),
    new THREE.MeshBasicMaterial({ map: signTexture }),
    oven
  );
  shopSign.position.set(0, 2.85, 0.85);
  for (let i = 0; i < 8; i++) ball(-0.85 + i * 0.24, 0.12, 0.51, 0.13, 0.08, 0.12, mats.coal, oven);
  const flames = [];
  for (let i = 0; i < 7; i++) {
    const m = mesh(
      new THREE.ConeGeometry(0.12, 0.62, 7),
      material('#ffb84a', { emissive: '#ff7221', emissiveIntensity: 2 }),
      oven
    );
    m.position.set(-0.8 + i * 0.27, 0.38, 0.52);
    flames.push(m);
  }
  // Flour bowl, basil pot and a folded tea towel.
  const bowl = mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.36, 32), mats.cream);
  bowl.position.set(-3.6, -0.03, -1.65);
  const flour = mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.03, 32), material('#f9efd9'));
  flour.position.set(-3.6, 0.16, -1.65);
  const pot = mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.5, 24), mats.brick);
  pot.position.set(3.4, -0.05, -2.5);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    const leaf = ball(
      3.4 + Math.cos(a) * 0.23,
      0.35 + (i % 3) * 0.12,
      -2.5 + Math.sin(a) * 0.23,
      0.12,
      0.26,
      0.055,
      mats.basil,
      root
    );
    leaf.rotation.z = a;
  }
  const cloth = box(1.1, 0.035, 1.65, mats.towel, root, 3.4, -0.27, 0.1);
  cloth.rotation.y = -0.3;
  for (let i = 0; i < 5; i++) {
    const stripe = box(0.025, 0.04, 1.65, mats.cream, cloth, -0.4 + i * 0.2, 0.03, 0);
    stripe.castShadow = false;
  }

  const carriage = new THREE.Group();
  root.add(carriage);
  const peel = mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.16, 80), mats.wood, carriage);
  peel.position.y = -0.1;
  box(0.48, 0.16, 2.1, mats.edge, carriage, 0, -0.1, 3.1);
  for (let i = 0; i < 9; i++) {
    const x = -2 + i * 0.5;
    const length = 2 * Math.sqrt(2.6 ** 2 - x * x);
    box(0.012, 0.004, length, mats.edge, carriage, x, -0.016, 0);
  }
  const pizza = new THREE.Group();
  carriage.add(pizza);
  const slices = [];
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group();
    pizza.add(group);
    slices.push(group);
    const start = (i * Math.PI) / 4;
    // Wedges allow a real slice to pull away after baking.
    const wedge = new THREE.Shape();
    wedge.moveTo(0, 0);
    wedge.lineTo(Math.cos(start) * 2.12, Math.sin(start) * 2.12);
    wedge.absarc(0, 0, 2.12, start, start + Math.PI / 4, false);
    wedge.lineTo(0, 0);
    const base = mesh(
      new THREE.ExtrudeGeometry(wedge, {
        depth: 0.17,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        curveSegments: 16
      }),
      mats.dough,
      group
    );
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.025;
    function layer(radius, y, mat) {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
      sh.absarc(0, 0, radius, start, start + Math.PI / 4, false);
      sh.lineTo(0, 0);
      const m = mesh(new THREE.ShapeGeometry(sh, 24), mat, group);
      m.rotation.x = -Math.PI / 2;
      m.position.y = y;
      return m;
    }
    layer(1.99, 0.241, mats.sauce);
    layer(1.91, 0.247, mats.cheese);
    const rim = mesh(
      new THREE.TorusGeometry(2.03, 0.17, 10, 20, Math.PI / 4 + 0.008),
      mats.crust,
      group
    );
    rim.rotation.x = -Math.PI / 2;
    rim.rotation.z = start;
    rim.position.y = 0.21;
  }
  function sliceIndex(x, z) {
    return Math.floor(((Math.atan2(-z, x) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4));
  }
  // Small toasted spots are geometry, so they stay on their own slice.
  const cheeseSpots = [];
  for (let i = 0; i < 85; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt((i + 0.5) / 85) * 1.82;
    const x = Math.cos(a) * r,
      z = Math.sin(a) * r;
    const spot = ball(
      x,
      0.25,
      z,
      0.035 + (i % 4) * 0.014,
      0.004,
      0.025 + (i % 3) * 0.012,
      mats.char,
      slices[sliceIndex(x, z)]
    );
    spot.visible = false;
    cheeseSpots.push(spot);
  }
  for (let i = 0; i < 64; i++) {
    const a = (i * Math.PI * 2) / 64;
    const x = Math.cos(a) * 2.05,
      z = Math.sin(a) * 2.05;
    ball(x, 0.35, z, 0.028 + (i % 3) * 0.01, 0.012, 0.028, mats.char, slices[sliceIndex(x, z)]);
  }

  // Toppings borrow these resources for the lifetime of the root. Removing one
  // only detaches its meshes. Disposing shared geometry would break other toppings.
  const toppingGeometry = {
    disc: new THREE.CylinderGeometry(0.205, 0.205, 0.048, 18),
    ring: new THREE.TorusGeometry(0.115, 0.041, 7, 14),
    chunk: new THREE.BoxGeometry(0.23, 0.12, 0.18),
    stem: new THREE.CylinderGeometry(0.045, 0.06, 0.18, 9),
    cap: new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    gills: new THREE.CircleGeometry(0.17, 12),
    basilStem: new THREE.BoxGeometry(0.009, 0.03, 0.34)
  };
  const basilStemMaterial = material('#9aa45d');
  function makeTopping(type) {
    const group = new THREE.Group();
    if (type === 'pepperoni') {
      mesh(toppingGeometry.disc, mats.pepperoni, group);
      for (let i = 0; i < 5; i++) {
        const a = i * 2.4;
        ball(Math.cos(a) * 0.12, 0.026, Math.sin(a) * 0.12, 0.022, 0.005, 0.017, mats.fleck, group);
      }
    } else if (type === 'olive' || type === 'pepper') {
      const ring = mesh(toppingGeometry.ring, type === 'olive' ? mats.olive : mats.pepper, group);
      ring.rotation.x = Math.PI / 2;
      if (type === 'pepper') ring.scale.set(1.5, 0.8, 1);
    } else if (type === 'pineapple') {
      const chunk = mesh(toppingGeometry.chunk, mats.pineapple, group);
      chunk.rotation.z = 0.12;
    } else if (type === 'basil') {
      const leaf = ball(0, 0, 0, 0.105, 0.027, 0.24, mats.basil, group);
      leaf.rotation.z = 0.2;
      const stem = mesh(toppingGeometry.basilStem, basilStemMaterial, group);
      stem.position.y = 0.013;
    } else if (type === 'cheese') {
      for (let i = 0; i < 3; i++) {
        const shred = mesh(toppingGeometry.chunk, mats.mozzarella, group);
        shred.scale.set(0.8, 0.35, 0.25);
        shred.position.set((i - 1) * 0.09, i * 0.008, (i % 2) * 0.09);
        shred.rotation.y = i * 1.2;
      }
    } else if (type === 'sauce') {
      ball(0, 0, 0, 0.24, 0.018, 0.19, mats.sauce, group);
      ball(0.14, 0.005, 0.05, 0.13, 0.015, 0.1, mats.sauce, group);
    } else if (type === 'sausage') {
      for (let i = 0; i < 3; i++) {
        ball((i - 1) * 0.1, 0.025, (i % 2) * 0.1, 0.105, 0.085, 0.09, mats.sausage, group);
      }
    } else if (type === 'chicken') {
      const piece = mesh(toppingGeometry.chunk, mats.chicken, group);
      piece.scale.set(1.5, 0.7, 0.75);
      piece.rotation.y = 0.3;
      for (let i = 0; i < 3; i++) {
        const grillMark = mesh(toppingGeometry.basilStem, mats.sausage, group);
        grillMark.scale.set(2, 0.3, 0.38);
        grillMark.position.set(-0.09 + i * 0.09, 0.048, 0);
      }
    } else if (type === 'mushroom') {
      const mushroom = new THREE.Group();
      group.add(mushroom);
      mushroom.rotation.x = Math.PI / 2;
      mesh(toppingGeometry.stem, mats.mushroom, mushroom);
      const cap = mesh(toppingGeometry.cap, mats.mushroom, mushroom);
      cap.position.y = 0.09;
      const gills = mesh(toppingGeometry.gills, mats.gill, mushroom);
      gills.rotation.x = Math.PI / 2;
      gills.position.y = 0.09;
    }
    return group;
  }

  function setCooked(t) {
    mats.crust.color.set('#e9b96b').lerp(new THREE.Color('#b96d2e'), t);
    mats.cheese.color.set('#f4d575').lerp(new THREE.Color('#e8b94f'), t);
    mats.dough.color.set('#edc986').lerp(new THREE.Color('#dca057'), t);
    cheeseSpots.forEach((spot, i) => {
      spot.visible = t > 0.18 + (i % 8) * 0.065;
    });
  }
  return {
    carriage,
    pizza,
    slices,
    flames,
    makeTopping,
    sliceIndex,
    setCooked,
    setVisible(visible) {
      root.visible = visible;
    }
  };
}
