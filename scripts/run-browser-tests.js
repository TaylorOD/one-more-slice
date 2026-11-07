import { fork, spawnSync } from 'node:child_process';

// Build and serve our own copy on a free port. A running dev server cannot
// accidentally make these checks pass against an older build.
const build = spawnSync(process.execPath, ['scripts/build.js'], { stdio: 'inherit' });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const server = fork('scripts/server.js', [], { env: { ...process.env, PORT: '0' } });
try {
  process.env.TEST_BASE_URL = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server did not start')), 10000);
    server.once('message', ({ url }) => {
      clearTimeout(timeout);
      resolve(url);
    });
    server.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    server.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Preview server exited: ${code}`));
    });
  });
  await import('../tests/browser/browser-check.js');
} finally {
  server.kill();
}
