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

// 5. Focus lock: a tiny native plugin that pins Sunshine on screen during a study sitting
//    (Android "app pinning": no other apps or notification shade until the sitting ends) and keeps the screen awake.
const javaDir = path.join(main, 'java', 'com', 'msja1729', 'sunshine');
fs.mkdirSync(javaDir, { recursive: true });
fs.writeFileSync(path.join(javaDir, 'FocusLockPlugin.java'), `package com.msja1729.sunshine;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.os.Build;
import android.view.WindowManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FocusLock")
public class FocusLockPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        Activity a = getActivity();
        a.runOnUiThread(() -> {
            try {
                a.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                a.startLockTask();
                call.resolve();
            } catch (Exception e) {
                call.reject(e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Activity a = getActivity();
        a.runOnUiThread(() -> {
            a.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            try { a.stopLockTask(); } catch (Exception e) { }
            call.resolve();
        });
    }

    @PluginMethod
    public void status(PluginCall call) {
        boolean pinned = false;
        if (Build.VERSION.SDK_INT >= 23) {
            ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
            pinned = am != null && am.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
        }
        JSObject r = new JSObject();
        r.put("pinned", pinned);
        call.resolve(r);
    }
}
`);
fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), `package com.msja1729.sunshine;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FocusLockPlugin.class);
        super.onCreate(savedInstanceState);
        // Let the study playlist move on to the next song (and YouTube start) without an extra tap.
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
`);

// 6. Version: name and code both come from package.json, so each new version installs as an update.
const pkg = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf8'));
const [maj, min, pat] = pkg.version.split('.').map(n => parseInt(n, 10) || 0);
const code = maj * 10000 + min * 100 + pat; // 1.1.2 -> 10102, always higher than older builds
const gradlePath = path.join(appDir, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${code}`)
               .replace(/versionName\s+"[^"]*"/, `versionName "${pkg.version}"`);
fs.writeFileSync(gradlePath, gradle);

console.log(`Android project customised: version ${pkg.version} (${code})`);
