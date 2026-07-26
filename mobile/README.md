# Khoya Paya static Flutter prototype

This folder is an offline-only UI prototype. It has no API, database, Firebase,
analytics, payments, cloud storage, or real authentication.

## Requirements

- Flutter 3.44.0 / Dart 3.12.0 or compatible stable release
- Android Studio with Android SDK and an emulator, or an Android phone
- Java 17 and Android platform tools (`adb`)

## Run locally

```powershell
cd mobile
flutter pub get
flutter run
```

Demo credentials: `demo@khoyapaya.local` / `Demo1234`. Any valid-looking
email and password of at least eight characters also enters the static app.

## Physical Android phone

1. Enable Developer options and USB debugging on the phone.
2. Connect it by USB and accept the device authorization prompt.
3. Run `adb devices` and confirm the device shows as `device`.
4. Run `flutter run -d <device-id>`.

## Build and install local debug APK

```powershell
cd mobile
flutter build apk --debug
adb install -r build\app\outputs\flutter-apk\app-debug.apk
```

The debug APK is local and uses Android's standard debug signing only. Do not
publish or distribute it as a production release.

### Manual APK installation

1. Copy `build\app\outputs\flutter-apk\app-debug.apk` to the phone by USB.
2. Open it in the phone's Files app.
3. If Android asks, allow “Install unknown apps” for the Files app.
4. Tap Install. Disable that permission again after installation if desired.

### Rebuild after changes

```powershell
cd D:\khoya-paya\mobile
dart format .
flutter analyze
flutter test
flutter build apk --debug
```

### View connected-phone logs

```powershell
flutter devices
flutter logs -d <device-id>
```

For Android platform logs:

```powershell
adb logcat
```

The complete static route inventory is in `docs/ROUTE_INVENTORY.md`.
