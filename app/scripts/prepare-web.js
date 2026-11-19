// Copies the web app from the repo root into app/www for Capacitor.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const www = path.resolve(__dirname, '..', 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest']) {
  fs.copyFileSync(path.join(root, f), path.join(www, f));
}
fs.cpSync(path.join(root, 'icons'), path.join(www, 'icons'), { recursive: true });
console.log('Web files copied to', www);
