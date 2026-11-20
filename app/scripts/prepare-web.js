// Copies the web app from the repo root into app/www for Capacitor, and switches
// Google sign-in on for the Android app when a client ID is set in index.html.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const appDir = path.resolve(__dirname, '..');
const www = path.join(appDir, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest']) {
  fs.copyFileSync(path.join(root, f), path.join(www, f));
}
fs.cpSync(path.join(root, 'icons'), path.join(www, 'icons'), { recursive: true });
console.log('Web files copied to', www);

// Google sign-in: read the Web client ID from index.html
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = html.match(/const GOOGLE_CLIENT_ID='([^']*)'/);
const clientId = m ? m[1].trim() : '';
const cfgPath = path.join(appDir, 'capacitor.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
cfg.plugins = cfg.plugins || {};
if (clientId) {
  cfg.plugins.GoogleAuth = {
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'],
    serverClientId: clientId,
    forceCodeForRefreshToken: false
  };
  console.log('Google sign-in is ON for the Android app.');
} else {
  delete cfg.plugins.GoogleAuth;
  console.log('Google sign-in is OFF (no client ID in index.html).');
}
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
