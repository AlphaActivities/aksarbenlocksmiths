import {readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
if(createHash('sha256').update(readFileSync('baseline.tar.gz')).digest('hex') !== '4ede1bda1fc97f2cedb974999152af667e14a1eb609d5fb38a4a881226971d50') throw Error('Baseline checksum mismatch');
mkdirSync('baseline',{recursive:true});
execFileSync('tar',['-xzf','baseline.tar.gz','-C','baseline']);

// Refresh only the private CRM entry, bundle and service worker.
execFileSync('./node_modules/.bin/vite', ['build', '--config', 'preview/cloudflare/admin.vite.mjs'], {cwd: '../..', stdio: 'inherit'});
const { readdirSync, writeFileSync, rmSync } = await import('node:fs');
const { assets } = await import('./baseline/worker/assets.mjs');
const bundle = 'baseline/admin-build';
const add = (key, file, type) => { assets[key] = [type, readFileSync(file).toString('base64')]; };
add('/admin/index.html', bundle + '/admin/index.html', 'text/html; charset=utf-8');
add('/admin/sw.js', '../../public/admin/sw.js', 'application/javascript; charset=utf-8');
for (const name of readdirSync(bundle + '/assets')) {
  const type = name.endsWith('.js') ? 'application/javascript' : name.endsWith('.css') ? 'text/css' : null;
  if (!type) throw Error('Unexpected generated admin asset: ' + name);
  add('/assets/' + name, bundle + '/assets/' + name, type + '; charset=utf-8');
}
writeFileSync('baseline/worker/assets.mjs', 'export const assets = ' + JSON.stringify(assets) + ';\n');
rmSync(bundle, {recursive: true});
