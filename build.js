import {mkdir, copyFile} from 'node:fs/promises';
await mkdir('dist/vendor', {recursive: true});
for (const file of ['index.html', 'style.css', 'dispatch.css', 'app.js', 'recipe.js', 'courier.js']) {
  await copyFile(file, 'dist/' + file);
}
for (const file of ['three.module.js', 'three.core.js']) {
  await copyFile('node_modules/three/build/' + file, 'dist/vendor/' + file);
}
console.log('pizza is ready in dist');
