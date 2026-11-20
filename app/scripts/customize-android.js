// Applies Sunshine's icons, splash screen, notification icon, permissions and version
// to the Android project that `npx cap add android` generates.
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const main = path.join(appDir, 'android', 'app', 'src', 'main');
const res = path.join(main, 'res');

// 1. Remove the default Capacitor splash bitmaps; our splash.xml replaces them.
for (const dir of fs.readdirSync(res)) {
  const png = path.join(res, dir, 'splash.png');
  if (fs.existsSync(png)) fs.rmSync(png);
}

// 2. Copy Sunshine resources over the generated ones.
fs.cpSync(path.join(appDir, 'res'), res, { recursive: true, force: true });

// 3. Permissions for on-time reminders.
const manifestPath = path.join(main, 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
const perms = [
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
  '<uses-permission android:name="android.permission.USE_EXACT_ALARM" />',
  '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.VIBRATE" />'
];
for (const p of perms) {
  const name = p.match(/android:name="([^"]+)"/)[1];
  if (!manifest.includes(`"${name}"`)) {
    manifest = manifest.replace('</manifest>', `    ${p}\n</manifest>`);
  }
}
fs.writeFileSync(manifestPath, manifest);

// 4. Google sign-in needs the Web client ID as server_client_id on Android.
const capCfg = JSON.parse(fs.readFileSync(path.join(appDir, 'capacitor.config.json'), 'utf8'));
const gid = capCfg.plugins && capCfg.plugins.GoogleAuth && capCfg.plugins.GoogleAuth.serverClientId;
const stringsPath = path.join(res, 'values', 'strings.xml');
if (fs.existsSync(stringsPath)) {
  let strings = fs.readFileSync(stringsPath, 'utf8').replace(/\s*<string name="server_client_id">[^<]*<\/string>/, '');
  if (gid) strings = strings.replace('</resources>', `    <string name="server_client_id">${gid}</string>\n</resources>`);
  fs.writeFileSync(stringsPath, strings);
}

// 5. Version: name from package.json, code from the CI run number so updates install over older ones.
const pkg = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf8'));
const code = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10) + 100;
const gradlePath = path.join(appDir, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${code}`)
               .replace(/versionName\s+"[^"]*"/, `versionName "${pkg.version}"`);
fs.writeFileSync(gradlePath, gradle);

console.log(`Android project customised: version ${pkg.version} (${code})`);
