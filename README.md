# Sunshine

A gentle 21-day companion for daily habits, mood check-ins, gratitude and grounding.
It installs on Android as an app and keeps working offline.

**Open it:** https://msja1729.github.io/sunshine/

## Android app (with reminders)

Download the latest **Sunshine APK** from the [Releases page](https://github.com/msja1729/sunshine/releases/latest), open it on your phone and allow installing from your browser or Files app if Android asks.

The Android app adds friendly, on-time reminders that show up outside the app: wake-up, meals, Vitamin B12, morning and night medicine, Vitamin D on Sundays, water every 2 hours (8 AM–8 PM), an evening check-in and a wind-down before bed. Each one can be switched off or moved under **Profile & backup → Reminders**. Reminders are planned two weeks ahead and refreshed every time you open the app.

To update, install the new APK over the old one. Your data stays.

## Web version

1. Open the link above in **Chrome**.
2. Tap **Install app** at the top of Sunshine, or Chrome's **⋮ menu → Install app**.
3. The web version has every feature except timed reminders.

## Privacy

- There is no server and no online account. Your profile, PIN, habits, moods, SOS log and photos are stored only on your phone, inside the app.
- The PIN is never stored as typed. It is hashed with PBKDF2 (SHA-256) before saving.
- A forgotten PIN can't be recovered. Use **Profile & backup → Export backup** now and then, and keep the file somewhere safe.
- Clearing Chrome's site data for this address, or uninstalling the app, removes your data from the phone. Export a backup first.

## What's inside

- Register and PIN unlock screen; the app locks again after 5 minutes away.
- 10 daily habits in two groups (Basics and Care), a 21-day garden and a 21-day tracker.
- Daily wins, a gratitude and hope quote, mood check-in and a gentle healing step.
- A private memory frame for family photos.
- Gentle Grounding & Rescue Rituals (SOS page): 9 feelings, 7–8 evidence-based rituals each (CBT, DBT, ACT, somatic), shown 4 at a time with shuffle; live breathing circles, countdown timers, a write-and-release scratchpad that is never saved, and your own Spotify/YouTube comfort links. Every finished ritual is logged by day.
- Your trusted person's number as a Call button on the SOS page.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app |
| `manifest.webmanifest` | Name, icons and colours for installing |
| `sw.js` | Offline support |
| `icons/` | App icons |
| `app/` | Android wrapper (Capacitor), icons, splash and reminder setup |
| `.github/workflows/android-release.yml` | Builds and publishes the signed APK |

### Building a new Android release

The workflow runs when a tag like `v1.0.1` is pushed, or from **Actions → Android release → Run workflow**. Bump `version` in `app/package.json` first. Signing uses `app/signing/sunshine-release.p12`, whose password lives only in the `SUNSHINE_KEY_PASSWORD` repository secret.

If a day feels too heavy: Tele-MANAS (India, free, 24/7) **14416** or **1-800-891-4416**. Emergency: **112**.
