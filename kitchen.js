import { createSauceSurface } from './sauce-surface.js';
import { sliceShape } from './slice-shape.js';
import * as THREE from './vendor/three.module.js';
import { createGeometry } from './geometry.js';
import { createKitchenRoom } from './kitchen-room.js';
import { createPizzaOven } from './pizza-oven.js';
import { ovenLayout } from './oven-motion.js';
import { createIngredientStation } from './ingredient-station.js';
export function createKitchen(scene) {
  const root = new THREE.Group();
  scene.add(root);
  createKitchenRoom(root);
  const { mesh, box, ball } = createGeometry(root);
  const material = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
  const mats = {
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
    bacon: material('#aa4c3f'),
    baconFat: material('#edba9c'),
    onion: material('#bd81bb'),
    jalapeno: material('#358337'),
    anchovy: material('#718c8c', { metalness: 0.25, roughness: 0.45 }),
    brick: material('#a85e3d'),
    char: material('#96603a'),
    cream: material('#e9d8b4'),
    towel: material('#7d3730')
  };
  const rimLight = new THREE.PointLight('#569cd6', 35, 16, 2);
  rimLight.position.set(-3, 3, -5);
  scene.add(rimLight);
  rimLight.visible = false;

  const { flames } = createPizzaOven(root);
  // Flour bowl, basil pot and a folded tea towel.
  const bowl = mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.36, 32), mats.cream);
  bowl.position.set(-5.3, -0.03, -4.2);
  const flour = mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.03, 32), material('#f9efd9'));
  flour.position.set(-5.3, 0.16, -4.2);
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
  const cloth = box(1.1, 0.035, 1.65, mats.towel, root, 5.1, -0.27, -4.3);
  cloth.rotation.y = -0.3;
  for (let i = 0; i < 5; i++) {
    const stripe = box(0.025, 0.04, 1.65, mats.cream, cloth, -0.4 + i * 0.2, 0.03, 0);
    stripe.castShadow = false;
  }

  const carriage = new THREE.Group();
  root.add(carriage);
  carriage.position.y = ovenLayout.prepHeight;
  const fieldMaterial = material('#52deef', {
    emissive: '#32c9e8',
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.7
  });
  for (const radius of [2.35, 2.55]) {
    const ring = mesh(new THREE.TorusGeometry(radius, 0.018, 6, 80), fieldMaterial, root);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.15;
  }
  const fieldLight = new THREE.PointLight('#31dbe9', 8, 7, 2);
  fieldLight.position.set(0, 0.4, 1);
  root.add(fieldLight);
  const paddleWood = material('#b88e59');
  const paddleEdge = material('#79532f');
  const peel = mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.16, 80), paddleWood, carriage);
  peel.position.y = -0.1;
  box(0.48, 0.16, 2.1, paddleEdge, carriage, 0, -0.1, 3.1);
  for (let i = 0; i < 9; i++) {
    const x = -2 + i * 0.5;
    box(0.012, 0.004, 2 * Math.sqrt(2.6 ** 2 - x * x), paddleEdge, carriage, x, -0.016, 0);
  }
  const pizza = new THREE.Group();
  carriage.add(pizza);
  const sauceSurface = createSauceSurface();
  const slices = [];
  const biteLayers = [];
  let isBitten = false;
  let cooked = 0;
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group();
    pizza.add(group);
    slices.push(group);
    const start = (i * Math.PI) / 4;
    // Wedges allow a real slice to pull away after baking.
    const wedge = sliceShape(start, 2.12);
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
    if (i === 6) {
      const bittenGeometry = new THREE.ExtrudeGeometry(sliceShape(start, 2.12, true), {
        depth: 0.17,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        curveSegments: 16
      });
      biteLayers.push({ mesh: base, whole: base.geometry, bitten: bittenGeometry });
    }
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.025;
    function layer(radius, y, mat) {
      const sh = sliceShape(start, radius);
      const geometry = new THREE.ShapeGeometry(sh, 24);
      if (mat === sauceSurface.material) sauceSurface.mapGeometry(geometry);
      const m = mesh(geometry, mat, group);
      if (i === 6)
        biteLayers.push({
          mesh: m,
          whole: m.geometry,
          bitten:
            mat === sauceSurface.material
              ? sauceSurface.mapGeometry(
                  new THREE.ShapeGeometry(sliceShape(start, radius, true), 24)
                )
              : new THREE.ShapeGeometry(sliceShape(start, radius, true), 24)
        });
      m.rotation.x = -Math.PI / 2;
      m.position.y = y;
      return m;
    }
    layer(1.99, 0.241, mats.sauce);
    layer(1.91, 0.247, mats.cheese);
    layer(1.91, 0.257, sauceSurface.material);
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
    onionArc: new THREE.TorusGeometry(0.17, 0.026, 6, 18, Math.PI * 1.5),
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
    } else if (type === 'bacon') {
      for (let i = 0; i < 3; i++) {
        const strip = mesh(toppingGeometry.chunk, mats.bacon, group);
        strip.scale.set(0.55, 0.3, 0.85);
        strip.position.set(Math.sin(i * 2) * 0.025, (i % 2) * 0.015, (i - 1) * 0.13);
        const fat = mesh(toppingGeometry.chunk, mats.baconFat, group);
        fat.scale.set(0.14, 0.08, 0.85);
        fat.position.copy(strip.position);
        fat.position.y += 0.022;
      }
    } else if (type === 'onion') {
      const arc = mesh(toppingGeometry.onionArc, mats.onion, group);
      arc.rotation.x = Math.PI / 2;
      const inner = mesh(toppingGeometry.onionArc, mats.mozzarella, group);
      inner.rotation.x = Math.PI / 2;
      inner.scale.setScalar(0.8);
    } else if (type === 'jalapeno') {
      const ring = mesh(toppingGeometry.ring, mats.jalapeno, group);
      ring.rotation.x = Math.PI / 2;
      ring.scale.setScalar(1.15);
      for (let i = 0; i < 3; i++) {
        const angle = i * 2.1;
        ball(
          Math.cos(angle) * 0.065,
          0.01,
          Math.sin(angle) * 0.065,
          0.025,
          0.012,
          0.015,
          mats.mozzarella,
          group
        );
      }
    } else if (type === 'anchovy') {
      ball(0, 0.025, 0, 0.065, 0.035, 0.23, mats.anchovy, group);
      const tail = mesh(toppingGeometry.chunk, mats.anchovy, group);
      tail.scale.set(0.55, 0.22, 0.45);
      tail.position.z = 0.21;
      ball(0.035, 0.05, -0.14, 0.012, 0.012, 0.012, mats.olive, group);
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

  createIngredientStation(root, makeTopping);

  function setCooked(t) {
    cooked = t;
    mats.crust.color.set('#e9b96b').lerp(new THREE.Color('#b96d2e'), t);
    mats.cheese.color.set('#f4d575').lerp(new THREE.Color('#e8b94f'), t);
    mats.dough.color.set('#edc986').lerp(new THREE.Color('#dca057'), t);
    cheeseSpots.forEach((spot, i) => {
      spot.visible =
        t > 0.18 + (i % 8) * 0.065 &&
        !(
          isBitten &&
          spot.parent === slices[6] &&
          Math.hypot(spot.position.x, spot.position.z) < 0.59
        );
    });
  }
  return {
    carriage,
    pizza,
    slices,
    flames,
    makeTopping,
    updateSauce: sauceSurface.update,
    sliceIndex,
    setCooked,
    setBitten(value) {
      isBitten = value;
      for (const layer of biteLayers) layer.mesh.geometry = value ? layer.bitten : layer.whole;
      setCooked(cooked);
    },
    setVisible(visible) {
      root.visible = visible;
      rimLight.visible = !visible;
    }
  };
}
