# ⚡ Capacitor Plugins Demo

A ready-to-build **Capacitor** Android (and iOS) app that demonstrates **all major native device features** in one place.

Built with:
- **Vanilla HTML / CSS / JavaScript**
- **IndexedDB** for client-side storage demos
- Official **@capacitor/** plugins
- Clear placeholders + setup notes for popular community plugins

## Features covered

| Feature | Type | Status in this demo |
|---------|------|---------------------|
| Camera | Official | ✅ Take photo / Gallery |
| Filesystem | Official | ✅ Read / Write / List |
| Share | Official | ✅ Native share sheet |
| Clipboard | Official | ✅ Copy / Read |
| Geolocation | Official | ✅ Current + Watch |
| Local Notifications | Official | ✅ Schedule |
| Push Notifications | Official | ✅ Register (needs FCM/APNs) |
| Network | Official | ✅ Status + listener |
| Device Info | Official | ✅ Model, OS, UUID… |
| Battery | Web / Community | ✅ Battery Status API |
| Haptics | Official | ✅ Impact / Notification / Vibrate |
| Keyboard | Official | ✅ Show / Hide |
| Status Bar | Official | ✅ Style + visibility |
| Splash Screen | Official | ✅ Hide |
| Screen Orientation | Official | ✅ Lock / Unlock |
| In-App Browser | Official | ✅ Open URL |
| App | Official | ✅ Info + State |
| Preferences | Official | ✅ Key-value |
| IndexedDB | Web | ✅ Full demo |
| Motion / Sensors | Official | ✅ Accel + Orientation |
| Toast | Official | ✅ Native toast |
| Dialog | Official | ✅ Alert / Confirm / Prompt |
| Permissions | Official | ✅ Camera example |
| Secure Storage | Community | ℹ️ Setup notes |
| Biometrics | Community | ℹ️ Setup notes |
| Contacts | Community | ℹ️ Setup notes |
| Bluetooth LE | Community | ℹ️ Setup notes |
| Wi-Fi | Community | ℹ️ Setup notes |
| Printing | Community | ℹ️ Setup notes |
| Background Tasks | Community | ℹ️ Setup notes |
| Audio / Video | Community | ℹ️ Setup notes |
| SQLite | Community | ℹ️ Setup notes |
| Deep Links | Config | ℹ️ Setup notes |
| Authentication | Community | ℹ️ Setup notes |

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Add Android platform
npx cap add android

# 3. Sync web assets + plugins
npx cap sync

# 4. Open in Android Studio
npx cap open android
```

Then run on an emulator or device from Android Studio.

### Web preview (limited native APIs)

```bash
npm start
# → http://localhost:3000
```

## GitHub Actions → APK

A workflow is included at `.github/workflows/android-build.yml`.

1. Push this repo to GitHub.
2. The workflow builds a **debug APK** on every push to `main` (and on manual dispatch).
3. Download the artifact from the Actions run.

> For a **release/signed** APK you need to add a keystore as a GitHub secret and adjust the workflow (see comments inside the YAML).

## Adding community plugins

Example – Biometrics:

```bash
npm install @capawesome-team/capacitor-biometrics
npx cap sync
```

Then follow the plugin’s README for AndroidManifest / Info.plist permissions.

Popular sources:
- [Official plugins](https://capacitorjs.com/docs/apis)
- [Capacitor Community](https://github.com/capacitor-community)
- [Capawesome](https://capawesome.io/plugins/)
- [Capgo](https://capgo.app/plugins/)

## Project structure

```
capacitor-plugins-demo/
├── www/                  # Web assets (the app UI)
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js         # All demos + IndexedDB
├── capacitor.config.json
├── package.json
├── .github/workflows/    # APK build
└── README.md
```

## Notes

- Many plugins require **runtime permissions**. The demo requests them when you tap the corresponding action.
- Push notifications need Firebase Cloud Messaging (Android) / APNs (iOS) configuration.
- Bluetooth, Contacts, Biometrics, etc. need extra native configuration – the app shows clear setup guidance.
- IndexedDB works everywhere (web + native WebView) and is used both as a demo and as a fallback for storage features.

## License

MIT – use freely for learning or as a starting point for your own apps.
