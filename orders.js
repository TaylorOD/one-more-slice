export const orderSeconds = 120;

// Original callers from the franchise districts around the kitchen.
// Counts refer to extra toppings. The dough already has sauce and mozzarella.
export const customers = [
  {
    name: 'Mara Voss',
    job: 'burbclave gate operator',
    neighborhood: 'Valley franchise strip',
    pizza: 'Gatehouse double meat',
    call: 'Deliverator. Gate six. The scanner thinks I am a visitor again. Pepperoni and sausage. Leave it at the guard window before the next shift locks me out.',
    toppings: { pepperoni: 5, sausage: 5 }
  },
  {
    name: 'Jax Relay',
    job: 'freelance data kourier',
    neighborhood: 'Long Beach container stacks',
    pizza: 'Night shift chicken',
    call: 'C0saNostra? Container 88, upper deck. Chicken, peppers and extra sauce. Knock twice. The doorbell belongs to a company I no longer work for.',
    toppings: { chicken: 5, pepper: 5, sauce: 1 }
  },
  {
    name: 'Nina Static',
    job: 'Metaverse club technician',
    neighborhood: 'LAX motel district',
    pizza: 'Afterhours mushroom',
    call: 'Room 19. Mushrooms, olives and basil. The club is still open but my avatar can finish the shift. I need actual food.',
    toppings: { mushroom: 5, olive: 5, basil: 5 }
  },
  {
    name: 'Vic Sato',
    job: 'franchise tow dispatcher',
    neighborhood: 'Harbor toll road',
    pizza: 'Tollbooth special',
    call: 'Dispatch booth, under the blue sign. Pepperoni, pineapple, extra cheese. Tell your kourier the east ramp is clear. I just towed the barricade.',
    toppings: { pepperoni: 5, pineapple: 5, cheese: 5 }
  },
  {
    name: 'Rae Switch',
    job: 'private road signal tech',
    neighborhood: 'Valley burbclave perimeter',
    pizza: 'Perimeter heat',
    call: 'Snowcrust. Signal cabinet nine. Bacon, red onion and jalapeños. The light is stuck on red. Your kourier can use the service lane.',
    toppings: { bacon: 5, onion: 5, jalapeno: 5 }
  },
  {
    name: 'Len Port',
    job: 'container lease broker',
    neighborhood: 'Long Beach cargo district',
    pizza: 'Dockside salt',
    call: 'Anchovies, red onion, basil. Stack four, ground level. Ignore the eviction notice. It belongs to the previous tenant. So does the lock.',
    toppings: { anchovy: 5, onion: 5, basil: 5 }
  }
];

export function countToppings(toppings) {
  const counts = {};
  for (const { type } of toppings) counts[type] = (counts[type] || 0) + 1;
  return counts;
}

// Missing toppings reduce the match. Extras increase the denominator, so
// covering the pizza with everything cannot earn a perfect score.
export function scoreOrder(requested, toppings, bitten = false) {
  const actual = countToppings(toppings);
  let required = 0,
    matched = 0,
    extras = 0;
  const missing = [];
  for (const [type, count] of Object.entries(requested)) {
    required += count;
    matched += Math.min(count, actual[type] || 0);
    if ((actual[type] || 0) < count) missing.push(`${count - (actual[type] || 0)} ${type}`);
  }
  for (const [type, count] of Object.entries(actual))
    extras += Math.max(0, count - (requested[type] || 0));
  const score = Math.max(
    0,
    Math.round((100 * matched) / Math.max(1, required + extras)) - (bitten ? 10 : 0)
  );
  return { score, missing, extras, bitten };
}

export function createRound(index = Math.floor(Math.random() * customers.length)) {
  let started = null,
    result = null;
  return {
    get customer() {
      return customers[index];
    },
    get result() {
      return result;
    },
    start(now) {
      if (started === null && !result) started = now;
    },
    elapsed(now) {
      return result ? result.elapsed : started === null ? 0 : Math.max(0, (now - started) / 1000);
    },
    get started() {
      return started !== null;
    },
    reset() {
      started = null;
      result = null;
    },
    next() {
      index = (index + 1) % customers.length;
      this.reset();
    },
    finish(toppings, bitten, now) {
      if (!result)
        result = {
          ...scoreOrder(customers[index].toppings, toppings, bitten),
          elapsed: this.elapsed(now)
        };
      return result;
    }
  };
}
