import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeRecipe, decodeRecipe, validateRecipe, randomSpot, toppingRadius} from './recipe.js';
test('a shared pizza keeps its toppings and positions', () => {
  const toppings = [{type:'basil', x:0.25, z:-1, angle:2}];
  assert.deepEqual(decodeRecipe('#recipe=' + encodeRecipe(toppings)), {v:1, t:[['basil', .25, -1, 2]]});
});
test('bad links cannot inject toppings or overload the scene', () => {
  for (const value of [null, {v:2,t:[]}, {v:1,t:[['script',0,0,0]]}, {v:1,t:[['basil',9,0,0]]}, {v:1,t:[['basil',0,0,Infinity]]}, {v:1,t:Array(81).fill(['basil',0,0,0])}]) {
    assert.equal(validateRecipe(value), null);
  }
  assert.equal(decodeRecipe('#recipe=%broken'), null);
  assert.equal(decodeRecipe('#recipe=' + 'a'.repeat(12001)), null);
});
test('random toppings stay on the cheese and survive sharing', () => {
  const toppings = Array.from({length:80}, () => ({type:'olive', ...randomSpot()}));
  assert.ok(toppings.every(t => Math.hypot(t.x,t.z) <= toppingRadius));
  assert.equal(decodeRecipe('#recipe=' + encodeRecipe(toppings)).t.length, 80);
});
