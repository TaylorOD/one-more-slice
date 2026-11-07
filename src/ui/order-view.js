import { maxToppings } from '../order/recipe.js';
const $ = (id) => document.getElementById(id);
export const say = (text) => ($('status').textContent = text);
export function updateOrderView({ mode, toppingCount, bitten = false }) {
  document.body.dataset.mode = mode;
  document.body.dataset.bitten = String(bitten);
  $('bite').hidden = mode !== 'sliced';
  $('bite').disabled = bitten;
  $('bite').textContent = bitten ? 'bite taken' : 'take a bite';
  document.body.dataset.toppings = toppingCount;
  $('topping-count').textContent = `${toppingCount} / ${maxToppings}`;
  $('undo').disabled = !toppingCount || mode !== 'prep';
  const delivering = mode === 'pickup' || mode === 'dispatched';
  $('delivery-comment').hidden = !delivering || !bitten;
  $('primary').disabled = mode === 'baking' || mode === 'pickup';
  $('dispatch').hidden = !['baked', 'sliced'].includes(mode);
  $('replay').hidden = mode !== 'dispatched';
  document.querySelector('.turn-controls').hidden = delivering;
  $('delivery-status').hidden = !delivering;
  $('prep-controls').hidden = mode !== 'prep';
  $('bake-progress').hidden = mode !== 'baking';
  $('primary').innerHTML =
    mode === 'prep'
      ? '<span>bake pizza</span><span>↗</span>'
      : mode === 'baking'
        ? '<span>baking</span><span>◌</span>'
        : mode === 'baked'
          ? '<span>inspect slice</span><span>↗</span>'
          : '<span>return slice</span><span>↙</span>';
  $('panel-title').innerHTML =
    mode === 'prep' ? 'Load the ticket.' : mode === 'baking' ? 'Baking.' : 'Cargo ready.';
  $('panel-copy').innerHTML =
    mode === 'prep'
      ? 'Sauce and mozzarella included.<br>Load the extras on the ticket.'
      : mode === 'baking'
        ? 'Toppings are locked while the pizza bakes.'
        : 'Inspect a slice or dispatch the pizza.';
  $('scene-label').textContent =
    mode === 'baking' ? 'OVEN' : mode === 'prep' ? 'KITCHEN' : 'PICKUP';
  $('oven-label').textContent = mode === 'baking' ? 'BAKING AT 500°C' : 'OVEN READY';
  $('scene-instruction').textContent =
    mode === 'prep'
      ? 'pick a topping, then tap the pizza'
      : mode === 'baking'
        ? 'pizza on the oven deck'
        : mode === 'sliced'
          ? 'return the slice or dispatch the pizza'
          : 'drag to inspect the baked pizza';
  ['prep', 'bake', 'eat'].forEach((s, i) =>
    $('step-' + s).classList.toggle(
      'active',
      i === (mode === 'prep' ? 0 : mode === 'baking' ? 1 : 2)
    )
  );
  if (delivering) {
    $('panel-title').innerHTML = mode === 'pickup' ? 'Kourier pickup.' : 'Pizza delivered.';
    $('panel-copy').textContent =
      mode === 'pickup'
        ? 'RadiKS pickup. Delivery address loaded in the smart box.'
        : 'Check the receipt, replay the pickup or take the next call.';
    $('primary').innerHTML =
      mode === 'pickup'
        ? '<span>pickup in progress</span>'
        : '<span>next call</span><span>↗</span>';
    $('scene-label').textContent = 'STREET';
    $('oven-label').textContent = mode === 'pickup' ? 'KOURIER ACTIVE' : 'CARGO DELIVERED';
    $('scene-instruction').textContent =
      mode === 'pickup' ? 'kourier pickup and bumper tow' : 'delivery confirmed';
    $('delivery-phase').textContent = mode === 'pickup' ? 'Collecting cargo' : 'Delivery confirmed';
    document.querySelectorAll('[data-phase]').forEach((item) => {
      item.classList.remove('active');
      item.classList.toggle('complete', mode === 'dispatched');
    });
  }
}
export function updateCourierPhase(phase) {
  const messages = {
    collect: ['Collecting cargo', 'RadiKS kourier collecting the smart box.'],
    approach: ['Approaching traffic', 'Traffic moving. Kourier looking for a tow.'],
    hook: ['Attaching tow line', 'Electromagnetic harpoon attached. Catching the next car.'],
    ride: ['Leaving the franchise', 'Tow line attached. Kourier outbound.']
  };
  $('delivery-phase').textContent = messages[phase][0];
  const phases = ['collect', 'approach', 'hook', 'ride'];
  document.querySelectorAll('[data-phase]').forEach((item) => {
    item.classList.toggle('active', item.dataset.phase === phase);
    item.classList.toggle('complete', phases.indexOf(item.dataset.phase) < phases.indexOf(phase));
  });
  say(messages[phase][1]);
}
