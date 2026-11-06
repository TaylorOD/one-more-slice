import { maxToppings } from './recipe.js';
const $ = (id) => document.getElementById(id);
export const say = (text) => ($('status').textContent = text);
export function updateOrderView({ mode, toppingCount }) {
  document.body.dataset.mode = mode;
  document.body.dataset.toppings = toppingCount;
  $('topping-count').textContent = `${toppingCount} / ${maxToppings}`;
  $('undo').disabled = !toppingCount || mode !== 'prep';
  const delivering = mode === 'pickup' || mode === 'dispatched';
  $('step-eat').innerHTML = delivering ? '<b>03</b> dispatch' : '<b>03</b> inspect';
  $('primary').disabled = mode === 'baking' || mode === 'pickup';
  $('dispatch').hidden = !['baked', 'sliced'].includes(mode);
  $('replay').hidden = mode !== 'dispatched';
  document.querySelector('.turn-controls').hidden = delivering;
  $('delivery-status').hidden = !delivering;
  $('prep-controls').hidden = mode !== 'prep';
  $('bake-progress').hidden = mode !== 'baking';
  $('finished').hidden = !['baked', 'sliced'].includes(mode);
  $('primary').innerHTML =
    mode === 'prep'
      ? '<span>fire oven()</span><span>↗</span>'
      : mode === 'baking'
        ? '<span>oven.running</span><span>◌</span>'
        : mode === 'baked'
          ? '<span>inspect slice()</span><span>↗</span>'
          : '<span>return slice()</span><span>↙</span>';
  $('panel-title').innerHTML =
    mode === 'prep'
      ? 'Incoming order.<br>Make it yours.'
      : mode === 'baking'
        ? 'Thermal cycle<br>in progress.'
        : 'Order complete.<br>Ready for pickup.';
  $('panel-copy').innerHTML =
    mode === 'prep'
      ? 'Base loaded: sauce + mozzarella.<br>Take your time. Add what you like.'
      : mode === 'baking'
        ? 'Watch the cheese melt and the crust turn golden.'
        : 'Inspect a slice. Quality control is your job.';
  $('scene-label').textContent =
    mode === 'baking'
      ? 'THERMAL BAY / 01'
      : mode === 'prep'
        ? 'PREP BAY / 01'
        : 'DISPATCH BAY / 01';
  $('oven-label').textContent = mode === 'baking' ? 'BAKING AT 450°' : 'OVEN READY';
  $('scene-instruction').textContent =
    mode === 'prep'
      ? 'pick a topping, then tap the pizza'
      : mode === 'baking'
        ? 'a little heat goes a long way'
        : mode === 'sliced'
          ? 'that one’s yours. you earned it.'
          : 'golden, bubbly, ready for a slice';
  ['prep', 'bake', 'eat'].forEach((s, i) =>
    $('step-' + s).classList.toggle(
      'active',
      i === (mode === 'prep' ? 0 : mode === 'baking' ? 1 : 2)
    )
  );
  if (delivering) {
    $('panel-title').innerHTML =
      mode === 'pickup'
        ? 'Courier incoming.<br>Keep it hot.'
        : 'Order dispatched.<br>Catch you next shift.';
    $('panel-copy').textContent =
      mode === 'pickup'
        ? 'One board. One box. A borrowed ride.'
        : 'Your pizza is on its way through sector 07.';
    $('primary').innerHTML =
      mode === 'pickup'
        ? '<span>pickup in progress</span>'
        : '<span>new order()</span><span>↗</span>';
    $('scene-label').textContent = 'STREET CAM / 07';
    $('oven-label').textContent = mode === 'pickup' ? 'COURIER ACTIVE' : 'DISPATCH COMPLETE';
    $('scene-instruction').textContent =
      mode === 'pickup' ? 'collect the box. hook the car. go.' : 'another order out into the night';
    $('delivery-phase').textContent =
      mode === 'pickup' ? '01 / collect' : '// collected. hooked. dispatched.';
    document.querySelectorAll('[data-phase]').forEach((item) => {
      item.classList.remove('active');
      item.classList.toggle('complete', mode === 'dispatched');
    });
  }
}
export function updateCourierPhase(phase) {
  const messages = {
    collect: ['01 / collect', 'Box on the counter. She’s already rolling.'],
    approach: ['02 / find a ride', 'Traffic moving. Courier approaching the street.'],
    hook: ['03 / magnetic lock', 'Tow line fired. Catching the next car.'],
    ride: ['04 / outbound', 'Cable tight. Pizza secure. Sector 07 outbound.']
  };
  $('delivery-phase').textContent = messages[phase][0];
  const phases = ['collect', 'approach', 'hook', 'ride'];
  document.querySelectorAll('[data-phase]').forEach((item) => {
    item.classList.toggle('active', item.dataset.phase === phase);
    item.classList.toggle('complete', phases.indexOf(item.dataset.phase) < phases.indexOf(phase));
  });
  say(messages[phase][1]);
}
