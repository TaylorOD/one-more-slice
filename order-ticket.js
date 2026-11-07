import { createRound, countToppings, orderSeconds } from './orders.js';
const $ = (id) => document.getElementById(id);
const duration = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function createOrderTicket() {
  const round = createRound();
  let lastClock = '';
  function renderCustomer() {
    const customer = round.customer;
    $('caller-name').textContent = customer.name;
    $('caller-location').textContent = `${customer.job} / ${customer.neighborhood}`;
    $('caller-words').textContent = `“${customer.call}”`;
    $('pizza-request').textContent = customer.pizza;
    $('requested-toppings').replaceChildren();
    for (const [type, count] of Object.entries(customer.toppings)) {
      const item = document.createElement('li');
      item.dataset.requested = type;
      item.dataset.count = count;
      const label = document.createElement('span');
      label.textContent =
        type === 'sauce' ? 'extra sauce' : type === 'cheese' ? 'extra cheese' : type;
      const progress = document.createElement('span');
      progress.className = 'ingredient-count';
      item.append(label, progress);
      $('requested-toppings').append(item);
    }
  }
  function tick(now) {
    const elapsed = round.elapsed(now);
    const late = elapsed > orderSeconds;
    const clock = late
      ? `${duration(Math.ceil(elapsed - orderSeconds))} late`
      : `${duration(Math.ceil(orderSeconds - elapsed))} left`;
    if (clock !== lastClock) {
      $('order-clock').textContent = clock;
      $('order-clock').classList.toggle('late', late);
      lastClock = clock;
    }
    const note = round.result
      ? 'delivery time recorded'
      : !round.started
        ? 'ticket age 28:00. clock starts with prep.'
        : late
          ? 'thirty minutes missed. HQ notified.'
          : 'thirty minute guarantee. two minutes left at intake.';
    if ($('clock-note').textContent !== note) $('clock-note').textContent = note;
  }
  function update(toppings) {
    const actual = countToppings(toppings);
    for (const item of $('requested-toppings').children) {
      const count = actual[item.dataset.requested] || 0;
      item.querySelector('.ingredient-count').textContent = `${count} / ${item.dataset.count}`;
      item.classList.toggle('matched', count === Number(item.dataset.count));
    }
  }
  function reset() {
    round.reset();
    $('order-receipt').hidden = true;
    $('call-state').textContent = 'franchise line open';
    tick(performance.now());
  }
  renderCustomer();
  reset();
  return {
    tick,
    update,
    reset,
    begin() {
      round.start(performance.now());
      $('call-state').textContent = 'ticket in production';
    },
    next() {
      round.next();
      renderCustomer();
      reset();
    },
    finish(toppings, bitten) {
      const result = round.finish(toppings, bitten, performance.now());
      $('call-state').textContent = 'delivery confirmed';
      $('order-score').textContent = `${result.score}`;
      $('receipt-title').textContent =
        result.score === 100
          ? 'Exactly what I ordered.'
          : result.score >= 70
            ? 'Close. Read the ticket, Deliverator.'
            : 'That is not my order.';
      const notes = [];
      if (result.missing.length) notes.push(`Missing: ${result.missing.join(', ')}.`);
      if (result.extras) notes.push(`${result.extras} unrequested or extra toppings.`);
      if (result.bitten) notes.push('Someone took a bite. 10 points off.');
      if (!notes.length) notes.push('All requested toppings. No extras.');
      $('score-details').textContent = notes.join(' ');
      $('receipt-time').textContent =
        `Delivered in ${duration(Math.ceil(result.elapsed))}. ${result.elapsed > orderSeconds ? 'Late arrival.' : 'On time.'}`;
      $('order-receipt').hidden = false;
      tick(performance.now());
    }
  };
}
