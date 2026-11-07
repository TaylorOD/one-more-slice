import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist/vendor', { recursive: true });
for (const file of [
  'index.html',
  'style.css',
  'dispatch.css',
  'orders.css',
  'orders.js',
  'order-ticket.js',
  'app.js',
  'recipe.js',
  'courier.js',
  'traffic-vehicles.js',
  'courier-motion.js',
  'scene.js',
  'city.js',
  'geometry.js',
  'kitchen.js',
  'sauce-surface.js',
  'slice-shape.js',
  'kitchen-room.js',
  'ingredient-station.js',
  'pizza-oven.js',
  'pizza-peel.js',
  'oven-motion.js',
  'order.js',
  'topping-motion.js',
  'order-view.js',
  'pizza-input.js'
]) {
  await copyFile(file, 'dist/' + file);
}
for (const file of ['three.module.js', 'three.core.js']) {
  await copyFile('node_modules/three/build/' + file, 'dist/vendor/' + file);
}
console.log('pizza is ready in dist');
