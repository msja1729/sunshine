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

## First-time setup and customising

On first open, Sunshine walks you through a short setup: your name, your day (wake, meals, bed), your medicines and which days you take them, which habits you want, your prayer or mantra, water goal, theme and welcome song, then a PIN. Everything can be changed later under **Me → My routine**, and reminders follow your routine automatically.

## Google Drive (optional)

You can sign in with Google so your data is saved in your own Google Drive, in a private app folder only Sunshine can see. Signing in on a second phone or the web version offers to restore everything, and changes keep syncing. Your PIN is never uploaded; each device has its own.

To switch this on, put the Web OAuth client ID into `const GOOGLE_CLIENT_ID=''` in `index.html`. The Android build picks it up automatically.

## Privacy

- There is no Sunshine server. Your profile, PIN, habits, moods, SOS log and photos are stored on your phone, and in your own Google Drive only if you choose to sign in.
- The PIN is never stored as typed. It is hashed with PBKDF2 (SHA-256) before saving.
- A forgotten PIN can't be recovered. Use **Profile & backup → Export backup** now and then, and keep the file somewhere safe.
- Clearing Chrome's site data for this address, or uninstalling the app, removes your data from the phone. Export a backup first.

## What's inside

- **Study garden (Tree of Knowledge):** set a daily study goal and plan each sitting with Pomodoro rounds (15·3, 25·5, 50·10 or your own). While you focus, a jug pours water onto today's tree and it grows live, from seed to sapling to blossoms to golden fruit when you reach your goal. Breaks bring the sunrise. Sounds generated on the phone: rain, forest, stream, waves, fireplace, warm pad, brown noise, plus binaural beats (alpha, beta, theta, gamma). On Android, the phone can be pinned to Sunshine so other apps can't open until you end the sitting. A grove shows a tree for each day.
- **Done from the notification:** reminders have a ✓ Done button (or +250 ml / +500 ml for water, and "In 10 min"). Tapping it ticks the habit and opens a card with a little plant growing and a kind line.
- **Your own routines:** besides medicines, add any routine (skincare, journaling, revising notes…) with its own time, days and reminder.

- Welcome music: gentle built-in chimes, or your own song file, starts softly when you tap Unlock and fades out on its own (♪ button to pause; settings under Me → Welcome music).
- Living motion: plants sway in their pots, leaves flutter, the moon rocks, steam rises, birds fly, the candle flickers.
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
