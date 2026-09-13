import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
const assets = {};
for (const [path, type] of [['/', 'text/html'], ['/style.css', 'text/css'], ['/app.js', 'text/javascript'], ['/effects.js', 'text/javascript'], ['/presence.js', 'text/javascript']]) {
  assets[path] = { type, body: await readFile('public/' + (path === '/' ? 'index.html' : path.slice(1)), 'utf8') };
}
assets['/fonts/gelasio-regular.woff2'] = { type: 'font/woff2', base64: true, body: await readFile('public/fonts/gelasio-regular.woff2', 'base64') };
assets['/fonts/OFL.txt'] = { type: 'text/plain', body: await readFile('public/fonts/OFL.txt', 'utf8') };
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await writeFile('dist/server/index.js', 'const assets = ' + JSON.stringify(assets) + ';\n' + await readFile('server/worker.js', 'utf8'));
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
await cp('drizzle', 'dist/.openai/drizzle', { recursive: true });
console.log('Built Mora with presence support.');
