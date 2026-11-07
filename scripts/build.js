import { mkdir, copyFile, cp, rm } from 'node:fs/promises';

// Rebuild only the generated site. Tests, docs and screenshots never ship.
await rm('dist', { recursive: true, force: true });
await mkdir('dist/vendor', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) {
  await copyFile('node_modules/three/build/' + file, 'dist/vendor/' + file);
}
console.log('pizza is ready in dist');
