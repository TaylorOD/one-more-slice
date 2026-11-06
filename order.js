import { bakingPose, ovenLayout } from './oven-motion.js';
import { createCourier } from './courier.js';
import { maxToppings, decodeRecipe, randomSpot } from './recipe.js';
import { updateOrderView, updateCourierPhase, say } from './order-view.js';
import { bindPizzaInput } from './pizza-input.js';
import { bindSharing } from './sharing.js';
const $ = (id) => document.getElementById(id);
// Order state belongs here. The view renders it, the kitchen owns its meshes,
// and the courier owns a deterministic delivery timeline.
export function startOrder({
  host,
  scene,
  camera,
  renderer,
  fireLight,
  frameCamera,
  kitchen,
  city
}) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { carriage, pizza, slices, flames, makeTopping, sliceIndex, setCooked } = kitchen;
  const courier = createCourier(scene);
  let courierStarted = 0;
  let courierPhase = '';
  function restoreKitchen() {
    courier.reset();
    courierPhase = '';
    delete document.body.dataset.courierPhase;
    kitchen.setVisible(true);
    city.setVisible(false);
    frameCamera(false);
  }
  let toppings = [],
    selected = 'pepperoni',
    mode = 'prep',
    bakingStarted = 0,
    lastTime = 0,
    sliceTarget = 0;
  let rotationTarget = 0;
  const bakeSeconds = 8;
  function update() {
    updateOrderView({ mode, toppingCount: toppings.length });
  }
  function dispatch() {
    if (!['baked', 'sliced', 'dispatched'].includes(mode)) return;
    mode = 'pickup';
    courierStarted = performance.now();
    sliceTarget = 0;
    courierPhase = '';
    frameCamera(true);
    kitchen.setVisible(false);
    city.setVisible(true);
    courier.start();
    update();
    say('Courier at the pickup bay.');
  }
  $('dispatch').addEventListener('click', dispatch);
  $('replay').addEventListener('click', dispatch);
  function addTopping(type, x, z, angle = Math.random() * Math.PI * 2, animate = true) {
    if (mode !== 'prep' || toppings.length >= maxToppings) return;
    const group = makeTopping(type);
    const parent = slices[sliceIndex(x, z)];
    parent.add(group);
    let stack = 0;
    for (const t of toppings)
      if (Math.hypot(t.x - x, t.z - z) < 0.2) stack = Math.min(stack + 0.045, 0.4);
    const y = 0.3 + stack;
    group.position.set(x, animate && !reduceMotion ? y + 2 : y, z);
    group.rotation.y = angle;
    const topping = { type, x, z, angle, group, y, velocity: 0 };
    toppings.push(topping);
    update();
  }
  function removeAll() {
    for (const t of toppings) {
      t.group.removeFromParent();
    }
    toppings = [];
  }
  // Reset every part of an order together. Recipe loading uses the same path
  // without removing its URL, including when it interrupts baking or pickup.
  function clearOrder() {
    restoreKitchen();
    removeAll();
    mode = 'prep';
    carriage.position.set(0, ovenLayout.prepHeight, 0);
    carriage.scale.setScalar(1);
    sliceTarget = 0;
    slices[6].position.set(0, 0, 0);
    pizza.rotation.y = 0;
    rotationTarget = 0;
    setCooked(0);
  }
  function reset() {
    clearOrder();
    history.replaceState(null, '', location.pathname + location.search);
    update();
    say('Order cleared. Dispatch is standing by.');
  }
  function bake() {
    if (mode !== 'prep') return;
    mode = 'baking';
    bakingStarted = performance.now();
    $('progress').value = 0;
    update();
    say('Into the oven. Watch the cheese melt.');
  }
  document.querySelectorAll('[data-topping]').forEach((button) =>
    button.addEventListener('click', () => {
      selected = button.dataset.topping;
      document
        .querySelectorAll('[data-topping]')
        .forEach((b) => b.setAttribute('aria-pressed', b === button));
      say(
        selected === 'pineapple'
          ? 'A controversial choice. We support you.'
          : `${button.textContent.trim()} it is. Tap the pizza or add a handful.`
      );
    })
  );
  $('sprinkle').addEventListener('click', () => {
    if (mode !== 'prep') return;
    const before = toppings.length;
    for (let i = 0; i < 5; i++) {
      const p = randomSpot();
      addTopping(selected, p.x, p.z, p.angle);
    }
    say(
      toppings.length === before
        ? 'That’s 80 toppings. The dough has limits.'
        : 'A handful of good decisions. Probably.'
    );
  });
  $('undo').addEventListener('click', () => {
    if (mode !== 'prep') return;
    const t = toppings.pop();
    t?.group.removeFromParent();
    update();
    say('Nobody saw that.');
  });
  $('special').addEventListener('click', () => {
    if (mode !== 'prep') return;
    removeAll();
    for (let i = 0; i < 23; i++) {
      const p = randomSpot();
      addTopping(i < 12 ? 'pepperoni' : i < 18 ? 'mushroom' : 'basil', p.x, p.z, p.angle);
    }
    say('Pepperoni, mushrooms and basil. A solid life choice.');
  });
  $('reset').addEventListener('click', () => {
    if (toppings.length || mode !== 'prep') {
      if (!confirm('Start over with fresh dough? Your current pizza will be cleared.')) return;
    }
    reset();
  });
  $('primary').addEventListener('click', () => {
    if (mode === 'dispatched') {
      reset();
      return;
    }
    if (mode === 'prep') bake();
    else if (mode === 'baked') {
      mode = 'sliced';
      sliceTarget = 1;
      update();
      say('One slice. For quality control.');
    } else if (mode === 'sliced') {
      mode = 'baked';
      sliceTarget = 0;
      update();
      say('Back with the others. For now.');
    }
  });
  $('turn-left').addEventListener('click', () => (rotationTarget -= Math.PI / 6));
  $('turn-right').addEventListener('click', () => (rotationTarget += Math.PI / 6));

  bindPizzaInput({
    host,
    camera,
    pizza,
    getMode: () => mode,
    getRotation: () => rotationTarget,
    setRotation: (angle) => {
      rotationTarget = angle;
    },
    placeTopping(x, z) {
      addTopping(selected, x, z);
      say(
        toppings.length >= maxToppings
          ? 'That’s 80 toppings. Time for the oven.'
          : 'Nicely placed. Keep going.'
      );
    }
  });
  bindSharing(() => toppings);
  function openRecipe() {
    if (!location.hash) return;
    const recipe = decodeRecipe(location.hash);
    if (!recipe) {
      say('That recipe link looks broken. Your current order is unchanged.');
      return;
    }
    clearOrder();
    for (const [type, x, z, angle] of recipe.t) addTopping(type, x, z, angle, false);
    update();
    say('Recipe loaded. Make it yours.');
  }
  window.addEventListener('hashchange', openRecipe);
  function animate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.04);
    lastTime = now;
    if (mode === 'pickup') {
      const delivery = courier.frame((now - courierStarted) / 1000, reduceMotion);
      if (delivery.phase !== courierPhase) {
        courierPhase = delivery.phase;
        document.body.dataset.courierPhase = courierPhase;
        updateCourierPhase(courierPhase);
      }
      if (delivery.done) {
        mode = 'dispatched';
        update();
        say('Pizza collected. Courier outbound.');
      }
    }
    pizza.rotation.y +=
      (rotationTarget - pizza.rotation.y) * (reduceMotion ? 1 : Math.min(dt * 12, 1));
    for (const t of toppings)
      if (t.group.position.y > t.y) {
        t.velocity += dt * 14;
        t.group.position.y -= t.velocity * dt;
        if (t.group.position.y < t.y) t.group.position.y = t.y;
      }
    flames.forEach((f, i) => {
      f.scale.y = reduceMotion ? 1 : 0.8 + Math.sin(now * 0.008 + i * 2) * 0.2;
    });
    if (mode === 'baking') {
      const t = Math.min((now - bakingStarted) / 1000 / bakeSeconds, 1);
      $('progress').value = t;
      const pose = bakingPose(t);
      carriage.position.set(0, pose.y, pose.z);
      carriage.scale.setScalar(pose.scale);
      setCooked(Math.min(t * 1.3, 1));
      fireLight.intensity = 18;
      if (t === 1) {
        mode = 'baked';
        carriage.position.set(0, ovenLayout.prepHeight, 0);
        carriage.scale.setScalar(1);
        update();
        say('Thermal cycle complete. Order ready for pickup.');
      }
    } else fireLight.intensity = 13;
    if (mode === 'prep') carriage.scale.setScalar(1);
    const s = slices[6],
      a = (6.5 * Math.PI) / 4;
    s.position.x += (Math.cos(a) * sliceTarget * 0.8 - s.position.x) * Math.min(dt * 7, 1);
    s.position.z += (-Math.sin(a) * sliceTarget * 0.8 - s.position.z) * Math.min(dt * 7, 1);
    s.position.y += (sliceTarget * 0.28 - s.position.y) * Math.min(dt * 7, 1);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  update();
  openRecipe();
  requestAnimationFrame(animate);
}
