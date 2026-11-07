import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreOrder, createRound, customers, orderSeconds } from '../../src/order/orders.js';
const toppings = (counts) =>
  Object.entries(counts).flatMap(([type, count]) =>
    Array.from({ length: count }, () => ({ type }))
  );

test('every caller can receive a perfect pizza', () => {
  for (const customer of customers)
    assert.equal(scoreOrder(customer.toppings, toppings(customer.toppings)).score, 100);
});
test('missing toppings, wrong toppings and extras reduce accuracy', () => {
  const request = { pepperoni: 5, sausage: 5 };
  assert.equal(scoreOrder(request, []).score, 0);
  assert.equal(scoreOrder(request, toppings({ olive: 10 })).score, 0);
  assert.equal(scoreOrder(request, toppings({ pepperoni: 5 })).score, 50);
  assert.equal(scoreOrder(request, toppings({ ...request, olive: 10 })).score, 50);
  assert.equal(scoreOrder(request, toppings({ pepperoni: 10, sausage: 10 })).score, 50);
  assert.equal(scoreOrder(request, toppings(request), true).score, 90);
  assert.equal(scoreOrder(request, [], true).score, 0);
});
test('timer waits for preparation and never resets when another topping is added', () => {
  const round = createRound(0);
  assert.equal(round.elapsed(900000), 0);
  round.start(1000);
  round.start(5000);
  assert.equal(round.elapsed(6000), 5);
  assert.ok(round.elapsed(130000) > orderSeconds);
});
test('delivery freezes score and time through replay until reset or next call', () => {
  const round = createRound(0);
  round.start(1000);
  const result = round.finish(toppings(round.customer.toppings), false, 11000);
  assert.equal(result.score, 100);
  assert.equal(round.elapsed(999999), 10);
  assert.deepEqual(round.finish([], true, 999999), result);
  const customer = round.customer;
  round.reset();
  assert.equal(round.result, null);
  assert.equal(round.customer, customer);
  assert.equal(round.elapsed(999999), 0);
  round.next();
  assert.notEqual(round.customer, customer);
  assert.equal(round.started, false);
});
