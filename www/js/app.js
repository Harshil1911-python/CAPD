/**
 * Capacitor Plugins Demo App
 * Vanilla JS + IndexedDB + Capacitor APIs
 * Works on Web (limited) and fully on Android/iOS after `npx cap sync`
 */

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function log(...args) {
  const out = $("#output");
  const panel = $("#output-panel");
  const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
  const time = new Date().toLocaleTimeString();
  out.textContent += `[${time}] ${msg}\n`;
  out.scrollTop = out.scrollHeight;
  panel.classList.remove("hidden");
  console.log(...args);
}

function clearLog() {
  $("#output").textContent = "";
}

$("#clear-output")?.addEventListener("click", clearLog);

function showResult(el, data) {
  if (!el) return;
  el.textContent = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
}

// Safe Capacitor access
function Cap() {
  return window.Capacitor || null;
}
function Plugins() {
  return (window.Capacitor && window.Capacitor.Plugins) || {};
}
function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

// ---------- IndexedDB helper (Preferences fallback + demo) ----------
const DB_NAME = "capacitor_demo_db";
const STORE = "kv";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- Plugin Catalog ----------
const PLUGINS = [
  {
    id: "camera",
    name: "Camera",
    icon: "📷",
    desc: "Take photo or pick from gallery",
    type: "official",
    actions: [
      { label: "Take Photo", fn: "cameraTake" },
      { label: "From Gallery", fn: "cameraGallery" }
    ]
  },
  {
    id: "filesystem",
    name: "Filesystem",
    icon: "📁",
    desc: "Read / write device storage",
    type: "official",
    actions: [
      { label: "Write Test File", fn: "fsWrite" },
      { label: "Read Test File", fn: "fsRead" },
      { label: "List Directory", fn: "fsList" }
    ]
  },
  {
    id: "share",
    name: "Share",
    icon: "📤",
    desc: "Native share sheet",
    type: "official",
    actions: [{ label: "Share Text", fn: "shareText" }]
  },
  {
    id: "clipboard",
    name: "Clipboard",
    icon: "📋",
    desc: "Copy & paste",
    type: "official",
    actions: [
      { label: "Copy to Clipboard", fn: "clipWrite" },
      { label: "Read Clipboard", fn: "clipRead" }
    ]
  },
  {
    id: "geolocation",
    name: "Geolocation",
    icon: "📍",
    desc: "GPS position",
    type: "official",
    actions: [
      { label: "Get Current Position", fn: "geoCurrent" },
      { label: "Watch Position (5s)", fn: "geoWatch" }
    ]
  },
  {
    id: "local-notifications",
    name: "Local Notifications",
    icon: "🔔",
    desc: "Schedule local alerts",
    type: "official",
    actions: [
      { label: "Request Permission", fn: "localNotifPerm" },
      { label: "Schedule in 5s", fn: "localNotifSchedule" }
    ]
  },
  {
    id: "push-notifications",
    name: "Push Notifications",
    icon: "📲",
    desc: "FCM / APNs (needs config)",
    type: "official",
    actions: [
      { label: "Register / Check", fn: "pushRegister" }
    ]
  },
  {
    id: "network",
    name: "Network",
    icon: "🌐",
    desc: "Connection status",
    type: "official",
    actions: [
      { label: "Get Status", fn: "netStatus" },
      { label: "Listen Changes", fn: "netListen" }
    ]
  },
  {
    id: "device",
    name: "Device Info",
    icon: "📱",
    desc: "Model, OS, UUID…",
    type: "official",
    actions: [{ label: "Get Info", fn: "deviceInfo" }]
  },
  {
    id: "battery",
    name: "Battery",
    icon: "🔋",
    desc: "Level & charging (web + native)",
    type: "web",
    actions: [{ label: "Get Battery", fn: "batteryInfo" }]
  },
  {
    id: "haptics",
    name: "Haptics",
    icon: "📳",
    desc: "Vibration feedback",
    type: "official",
    actions: [
      { label: "Impact (Medium)", fn: "hapticImpact" },
      { label: "Notification Success", fn: "hapticSuccess" },
      { label: "Vibrate", fn: "hapticVibrate" }
    ]
  },
  {
    id: "keyboard",
    name: "Keyboard",
    icon: "⌨️",
    desc: "Show / hide keyboard events",
    type: "official",
    actions: [
      { label: "Show Keyboard", fn: "kbShow" },
      { label: "Hide Keyboard", fn: "kbHide" }
    ]
  },
  {
    id: "statusbar",
    name: "Status Bar",
    icon: "📶",
    desc: "Style & visibility",
    type: "official",
    actions: [
      { label: "Toggle Style", fn: "statusToggle" },
      { label: "Hide / Show", fn: "statusVisibility" }
    ]
  },
  {
    id: "splash",
    name: "Splash Screen",
    icon: "🚀",
    desc: "Hide / show splash",
    type: "official",
    actions: [{ label: "Hide Splash", fn: "splashHide" }]
  },
  {
    id: "orientation",
    name: "Screen Orientation",
    icon: "🔄",
    desc: "Lock / unlock orientation",
    type: "official",
    actions: [
      { label: "Lock Portrait", fn: "orientPortrait" },
      { label: "Lock Landscape", fn: "orientLandscape" },
      { label: "Unlock", fn: "orientUnlock" }
    ]
  },
  {
    id: "browser",
    name: "In-App Browser",
    icon: "🌍",
    desc: "Open URL in system browser",
    type: "official",
    actions: [{ label: "Open Capacitor Docs", fn: "browserOpen" }]
  },
  {
    id: "app",
    name: "App",
    icon: "📦",
    desc: "App state, URL open, exit",
    type: "official",
    actions: [
      { label: "Get Info", fn: "appInfo" },
      { label: "Get State", fn: "appState" }
    ]
  },
  {
    id: "preferences",
    name: "Preferences",
    icon: "⚙️",
    desc: "Simple key-value storage",
    type: "official",
    actions: [
      { label: "Set Value", fn: "prefSet" },
      { label: "Get Value", fn: "prefGet" }
    ]
  },
  {
    id: "indexeddb",
    name: "IndexedDB",
    icon: "🗄️",
    desc: "Web SQL-like storage (demo)",
    type: "web",
    actions: [
      { label: "Save to IndexedDB", fn: "idbSave" },
      { label: "Load from IndexedDB", fn: "idbLoad" }
    ]
  },
  {
    id: "motion",
    name: "Sensors / Motion",
    icon: "🧭",
    desc: "Accelerometer & orientation",
    type: "official",
    actions: [
      { label: "Start Accel (3s)", fn: "motionAccel" },
      { label: "Start Orientation (3s)", fn: "motionOrient" }
    ]
  },
  {
    id: "toast",
    name: "Toast",
    icon: "🍞",
    desc: "Native toast messages",
    type: "official",
    actions: [{ label: "Show Toast", fn: "toastShow" }]
  },
  {
    id: "dialog",
    name: "Dialog",
    icon: "💬",
    desc: "Alert / Confirm / Prompt",
    type: "official",
    actions: [
      { label: "Alert", fn: "dialogAlert" },
      { label: "Confirm", fn: "dialogConfirm" },
      { label: "Prompt", fn: "dialogPrompt" }
    ]
  },
  // Community / advanced – show info
  {
    id: "secure-storage",
    name: "Secure Storage",
    icon: "🔐",
    desc: "Encrypted keychain / Keystore",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoSecure" }]
  },
  {
    id: "biometrics",
    name: "Biometrics",
    icon: "👆",
    desc: "Fingerprint / Face ID",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoBio" }]
  },
  {
    id: "contacts",
    name: "Contacts",
    icon: "👥",
    desc: "Read device contacts",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoContacts" }]
  },
  {
    id: "ble",
    name: "Bluetooth LE",
    icon: "📡",
    desc: "Scan & connect BLE devices",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoBLE" }]
  },
  {
    id: "wifi",
    name: "Wi-Fi",
    icon: "📶",
    desc: "Scan / connect networks",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoWifi" }]
  },
  {
    id: "printing",
    name: "Printing",
    icon: "🖨️",
    desc: "Print documents",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoPrint" }]
  },
  {
    id: "background",
    name: "Background Tasks",
    icon: "⏱️",
    desc: "Background runner / tasks",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoBg" }]
  },
  {
    id: "audio",
    name: "Audio",
    icon: "🔊",
    desc: "Native audio playback",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoAudio" }]
  },
  {
    id: "video",
    name: "Video",
    icon: "🎬",
    desc: "Video player / recorder",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoVideo" }]
  },
  {
    id: "sqlite",
    name: "SQLite",
    icon: "🗃️",
    desc: "Local SQL database",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoSQLite" }]
  },
  {
    id: "deeplinks",
    name: "Deep Links",
    icon: "🔗",
    desc: "App URL schemes & universal links",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoDeep" }]
  },
  {
    id: "permissions",
    name: "Permissions",
    icon: "🔓",
    desc: "Request runtime permissions",
    type: "official",
    actions: [{ label: "Check Camera Perm", fn: "permCamera" }]
  },
  {
    id: "auth",
    name: "Authentication",
    icon: "🔑",
    desc: "OAuth / Social login helpers",
    type: "community",
    actions: [{ label: "Info / Setup", fn: "infoAuth" }]
  }
];

// ---------- Action Implementations ----------
const Actions = {
  // CAMERA
  async cameraTake() {
    const { Camera } = Plugins();
    if (!Camera) return log("Camera plugin not available (web or not installed)");
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: "uri",
        source: "CAMERA"
      });
      log("Photo taken:", photo);
      return photo;
    } catch (e) {
      log("Camera error:", e.message || e);
    }
  },
  async cameraGallery() {
    const { Camera } = Plugins();
    if (!Camera) return log("Camera plugin not available");
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: "uri",
        source: "PHOTOS"
      });
      log("Gallery photo:", photo);
      return photo;
    } catch (e) {
      log("Gallery error:", e.message || e);
    }
  },

  // FILESYSTEM
  async fsWrite() {
    const { Filesystem, Directory, Encoding } = Plugins();
    if (!Filesystem) {
      // fallback
      await idbSet("demo_file", "Hello from IndexedDB fallback @ " + new Date().toISOString());
      return log("Wrote via IndexedDB fallback");
    }
    try {
      await Filesystem.writeFile({
        path: "demo/hello.txt",
        data: "Hello Capacitor Filesystem! " + new Date().toISOString(),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true
      });
      log("File written to Data/demo/hello.txt");
    } catch (e) {
      log("FS write error:", e.message || e);
    }
  },
  async fsRead() {
    const { Filesystem, Directory, Encoding } = Plugins();
    if (!Filesystem) {
      const v = await idbGet("demo_file");
      return log("IndexedDB read:", v);
    }
    try {
      const res = await Filesystem.readFile({
        path: "demo/hello.txt",
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      log("File content:", res.data);
      return res;
    } catch (e) {
      log("FS read error:", e.message || e);
    }
  },
  async fsList() {
    const { Filesystem, Directory } = Plugins();
    if (!Filesystem) return log("Filesystem not available");
    try {
      const res = await Filesystem.readdir({
        path: "demo",
        directory: Directory.Data
      });
      log("Directory listing:", res.files);
      return res;
    } catch (e) {
      log("FS list error:", e.message || e);
    }
  },

  // SHARE
  async shareText() {
    const { Share } = Plugins();
    if (!Share) {
      if (navigator.share) {
        await navigator.share({ title: "Capacitor Demo", text: "Hello from Capacitor Plugins Demo!", url: "https://capacitorjs.com" });
        return log("Shared via Web Share API");
      }
      return log("Share not available");
    }
    try {
      await Share.share({
        title: "Capacitor Demo",
        text: "Check out this Capacitor Plugins Demo app!",
        url: "https://capacitorjs.com",
        dialogTitle: "Share with…"
      });
      log("Share sheet opened");
    } catch (e) {
      log("Share cancelled or error:", e.message || e);
    }
  },

  // CLIPBOARD
  async clipWrite() {
    const { Clipboard } = Plugins();
    const text = "Copied from Capacitor Demo @ " + new Date().toLocaleString();
    if (!Clipboard) {
      await navigator.clipboard.writeText(text);
      return log("Copied via navigator.clipboard");
    }
    await Clipboard.write({ string: text });
    log("Copied to clipboard:", text);
  },
  async clipRead() {
    const { Clipboard } = Plugins();
    if (!Clipboard) {
      const t = await navigator.clipboard.readText();
      return log("Clipboard (web):", t);
    }
    const { value } = await Clipboard.read();
    log("Clipboard:", value);
  },

  // GEOLOCATION
  async geoCurrent() {
    const { Geolocation } = Plugins();
    if (!Geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => log("Web geo:", { lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => log("Geo error:", err.message)
      );
      return;
    }
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      log("Position:", pos.coords);
      return pos;
    } catch (e) {
      log("Geolocation error:", e.message || e);
    }
  },
  async geoWatch() {
    const { Geolocation } = Plugins();
    if (!Geolocation) return log("Geolocation plugin missing");
    log("Watching position for 5 seconds…");
    const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
      if (err) log("Watch error:", err);
      else log("Watch update:", pos.coords.latitude, pos.coords.longitude);
    });
    setTimeout(async () => {
      await Geolocation.clearWatch({ id });
      log("Stopped watching");
    }, 5000);
  },

  // LOCAL NOTIFICATIONS
  async localNotifPerm() {
    const { LocalNotifications } = Plugins();
    if (!LocalNotifications) return log("LocalNotifications not available");
    const perm = await LocalNotifications.requestPermissions();
    log("Permission:", perm);
  },
  async localNotifSchedule() {
    const { LocalNotifications } = Plugins();
    if (!LocalNotifications) return log("LocalNotifications not available");
    await LocalNotifications.schedule({
      notifications: [{
        title: "Capacitor Demo",
        body: "This is a local notification scheduled 5 seconds ago!",
        id: Math.floor(Math.random() * 100000),
        schedule: { at: new Date(Date.now() + 5000) },
        sound: null,
        attachments: null,
        actionTypeId: "",
        extra: null
      }]
    });
    log("Notification scheduled in 5 seconds");
  },

  // PUSH
  async pushRegister() {
    const { PushNotifications } = Plugins();
    if (!PushNotifications) return log("PushNotifications requires native + FCM/APNs setup");
    try {
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive !== "granted") {
        perm = await PushNotifications.requestPermissions();
      }
      log("Push permission:", perm);
      if (perm.receive === "granted") {
        await PushNotifications.register();
        log("Registered for push. Listen for registration event for the token.");
        PushNotifications.addListener("registration", (token) => log("Push token:", token.value));
        PushNotifications.addListener("registrationError", (err) => log("Reg error:", err));
      }
    } catch (e) {
      log("Push error:", e.message || e);
    }
  },

  // NETWORK
  async netStatus() {
    const { Network } = Plugins();
    if (!Network) {
      log("Online:", navigator.onLine);
      return;
    }
    const status = await Network.getStatus();
    log("Network:", status);
  },
  async netListen() {
    const { Network } = Plugins();
    if (!Network) return log("Network plugin missing");
    Network.addListener("networkStatusChange", (s) => log("Network changed:", s));
    log("Listening for network changes…");
  },

  // DEVICE
  async deviceInfo() {
    const { Device } = Plugins();
    if (!Device) {
      log("UserAgent:", navigator.userAgent);
      return;
    }
    const info = await Device.getInfo();
    const id = await Device.getId();
    log("Device:", { ...info, ...id });
  },

  // BATTERY (web Battery Status API + note)
  async batteryInfo() {
    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      log("Battery:", {
        level: Math.round(b.level * 100) + "%",
        charging: b.charging,
        chargingTime: b.chargingTime,
        dischargingTime: b.dischargingTime
      });
    } else {
      log("Battery API not available in this browser. On Android use a community battery plugin.");
    }
  },

  // HAPTICS
  async hapticImpact() {
    const { Haptics, ImpactStyle } = Plugins();
    if (!Haptics) {
      if (navigator.vibrate) navigator.vibrate(50);
      return log("Vibrated (web)");
    }
    await Haptics.impact({ style: ImpactStyle?.Medium || "MEDIUM" });
    log("Haptic impact fired");
  },
  async hapticSuccess() {
    const { Haptics, NotificationType } = Plugins();
    if (!Haptics) return log("Haptics not available");
    await Haptics.notification({ type: NotificationType?.Success || "SUCCESS" });
    log("Haptic success");
  },
  async hapticVibrate() {
    const { Haptics } = Plugins();
    if (!Haptics) {
      navigator.vibrate?.([100, 50, 100]);
      return;
    }
    await Haptics.vibrate();
    log("Vibrate");
  },

  // KEYBOARD
  async kbShow() {
    const { Keyboard } = Plugins();
    if (!Keyboard) return log("Keyboard plugin is native-only");
    await Keyboard.show();
    log("Keyboard show requested");
  },
  async kbHide() {
    const { Keyboard } = Plugins();
    if (!Keyboard) return log("Keyboard plugin is native-only");
    await Keyboard.hide();
    log("Keyboard hide requested");
  },

  // STATUS BAR
  async statusToggle() {
    const { StatusBar, Style } = Plugins();
    if (!StatusBar) return log("StatusBar is native-only");
    const info = await StatusBar.getInfo();
    const next = info.style === "DARK" ? "LIGHT" : "DARK";
    await StatusBar.setStyle({ style: next });
    log("StatusBar style →", next);
  },
  async statusVisibility() {
    const { StatusBar } = Plugins();
    if (!StatusBar) return log("StatusBar is native-only");
    const info = await StatusBar.getInfo();
    if (info.visible) {
      await StatusBar.hide();
      log("StatusBar hidden");
    } else {
      await StatusBar.show();
      log("StatusBar shown");
    }
  },

  // SPLASH
  async splashHide() {
    const { SplashScreen } = Plugins();
    if (!SplashScreen) return log("SplashScreen is native-only (already hidden on web)");
    await SplashScreen.hide();
    log("Splash hidden");
  },

  // ORIENTATION
  async orientPortrait() {
    const { ScreenOrientation } = Plugins();
    if (!ScreenOrientation) return log("ScreenOrientation native-only");
    await ScreenOrientation.lock({ orientation: "portrait" });
    log("Locked to portrait");
  },
  async orientLandscape() {
    const { ScreenOrientation } = Plugins();
    if (!ScreenOrientation) return log("ScreenOrientation native-only");
    await ScreenOrientation.lock({ orientation: "landscape" });
    log("Locked to landscape");
  },
  async orientUnlock() {
    const { ScreenOrientation } = Plugins();
    if (!ScreenOrientation) return log("ScreenOrientation native-only");
    await ScreenOrientation.unlock();
    log("Orientation unlocked");
  },

  // BROWSER
  async browserOpen() {
    const { Browser } = Plugins();
    if (!Browser) {
      window.open("https://capacitorjs.com/docs", "_blank");
      return log("Opened in new tab (web)");
    }
    await Browser.open({ url: "https://capacitorjs.com/docs" });
    log("In-app browser opened");
  },

  // APP
  async appInfo() {
    const { App } = Plugins();
    if (!App) return log("App plugin native-only");
    const info = await App.getInfo();
    log("App info:", info);
  },
  async appState() {
    const { App } = Plugins();
    if (!App) return log("App plugin native-only");
    const state = await App.getState();
    log("App state:", state);
  },

  // PREFERENCES
  async prefSet() {
    const { Preferences } = Plugins();
    const val = "demo-value-" + Date.now();
    if (!Preferences) {
      localStorage.setItem("demo_pref", val);
      return log("Saved to localStorage:", val);
    }
    await Preferences.set({ key: "demo_key", value: val });
    log("Preferences set:", val);
  },
  async prefGet() {
    const { Preferences } = Plugins();
    if (!Preferences) {
      return log("localStorage:", localStorage.getItem("demo_pref"));
    }
    const { value } = await Preferences.get({ key: "demo_key" });
    log("Preferences get:", value);
  },

  // INDEXEDDB
  async idbSave() {
    const payload = { message: "Hello IndexedDB", ts: Date.now(), random: Math.random() };
    await idbSet("demo_record", payload);
    log("Saved to IndexedDB:", payload);
  },
  async idbLoad() {
    const data = await idbGet("demo_record");
    log("Loaded from IndexedDB:", data);
  },

  // MOTION
  async motionAccel() {
    const { Motion } = Plugins();
    if (!Motion) {
      // web DeviceMotion
      const handler = (e) => log("Accel:", e.accelerationIncludingGravity);
      window.addEventListener("devicemotion", handler);
      setTimeout(() => window.removeEventListener("devicemotion", handler), 3000);
      return log("Listening DeviceMotion for 3s (may need permission / HTTPS)");
    }
    log("Listening acceleration for 3s…");
    const handler = await Motion.addListener("accel", (e) => log("Accel:", e));
    setTimeout(() => {
      handler.remove();
      log("Stopped accel");
    }, 3000);
  },
  async motionOrient() {
    const { Motion } = Plugins();
    if (!Motion) return log("Motion plugin preferred on native");
    log("Listening orientation for 3s…");
    const handler = await Motion.addListener("orientation", (e) => log("Orientation:", e));
    setTimeout(() => {
      handler.remove();
      log("Stopped orientation");
    }, 3000);
  },

  // TOAST
  async toastShow() {
    const { Toast } = Plugins();
    if (!Toast) {
      log("Toast is native-only – showing log instead");
      return;
    }
    await Toast.show({ text: "Hello from Capacitor Toast!", duration: "long" });
  },

  // DIALOG
  async dialogAlert() {
    const { Dialog } = Plugins();
    if (!Dialog) {
      alert("Hello from Capacitor Dialog (web fallback)");
      return;
    }
    await Dialog.alert({ title: "Alert", message: "This is a native alert dialog." });
  },
  async dialogConfirm() {
    const { Dialog } = Plugins();
    if (!Dialog) {
      const ok = confirm("Do you like this demo?");
      return log("Confirm result:", ok);
    }
    const { value } = await Dialog.confirm({ title: "Confirm", message: "Do you like this demo?" });
    log("Confirm:", value);
  },
  async dialogPrompt() {
    const { Dialog } = Plugins();
    if (!Dialog) {
      const v = prompt("Enter your name");
      return log("Prompt:", v);
    }
    const { value, cancelled } = await Dialog.prompt({ title: "Prompt", message: "Enter your name" });
    log("Prompt:", { value, cancelled });
  },

  // PERMISSIONS (via Camera as example)
  async permCamera() {
    const { Camera } = Plugins();
    if (!Camera) return log("Camera plugin needed for this check");
    const status = await Camera.checkPermissions();
    log("Camera permissions:", status);
    if (status.camera !== "granted") {
      const req = await Camera.requestPermissions({ permissions: ["camera"] });
      log("After request:", req);
    }
  },

  // Community info helpers
  infoSecure() {
    log("Secure Storage: Use @aparajita/capacitor-secure-storage or @capawesome/capacitor-secure-storage. Install + npx cap sync. Provides encrypted Keychain/Keystore storage.");
  },
  infoBio() {
    log("Biometrics: Use @capawesome-team/capacitor-biometrics or @aparajita/capacitor-biometric-auth. Requires Face ID / Fingerprint permissions in native projects.");
  },
  infoContacts() {
    log("Contacts: Use @capacitor-community/contacts. Add READ_CONTACTS permission on Android and Privacy description on iOS.");
  },
  infoBLE() {
    log("Bluetooth LE: Use @capacitor-community/bluetooth-le. Powerful scan/connect/GATT API. Needs Bluetooth permissions.");
  },
  infoWifi() {
    log("Wi-Fi: Limited official support. Community options exist (e.g. capacitor-wifi). Many features restricted on modern Android/iOS.");
  },
  infoPrint() {
    log("Printing: Use @capawesome-team/capacitor-printer or similar. Wraps native print dialogs.");
  },
  infoBg() {
    log("Background Tasks: @capacitor/background-runner or @capawesome/capacitor-background-task. Strict OS limits apply.");
  },
  infoAudio() {
    log("Audio: @capgo/capacitor-native-audio or @capacitor-community/native-audio for low-latency playback.");
  },
  infoVideo() {
    log("Video: Community video-player / media plugins. Camera can also record video on many devices.");
  },
  infoSQLite() {
    log("SQLite: jeep-sqlite or @capacitor-community/sqlite. Excellent for offline-first apps. Works with encryption options.");
  },
  infoDeep() {
    log("Deep Links: Configure associated domains / intent filters in native projects + use App plugin addListener('appUrlOpen').");
  },
  infoAuth() {
    log("Auth: @capgo/capacitor-social-login, @capacitor-community/generic-oauth2, or Firebase Auth plugins.");
  }
};

// ---------- UI ----------
function renderCards() {
  const main = $("#main-content");
  main.innerHTML = "";
  PLUGINS.forEach((p) => {
    const card = document.createElement("div");
    card.className = `plugin-card ${p.type === "official" ? "official" : p.type === "community" ? "community" : "web-only"}`;
    card.innerHTML = `
      <span class="tag ${p.type === "official" ? "official" : p.type === "community" ? "community" : "web"}">${p.type}</span>
      <div class="plugin-icon">${p.icon}</div>
      <div class="plugin-name">${p.name}</div>
      <div class="plugin-desc">${p.desc}</div>
    `;
    card.addEventListener("click", () => openModal(p));
    main.appendChild(card);
  });
}

function openModal(plugin) {
  // remove existing
  document.querySelector(".modal-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <button class="close-modal">×</button>
      <h2>${plugin.icon} ${plugin.name}</h2>
      <p class="desc">${plugin.desc}</p>
      <div class="actions"></div>
      <div class="result-box" id="modal-result"></div>
      <img class="preview-img" id="modal-img" alt="preview" />
    </div>
  `;
  document.body.appendChild(overlay);

  const actionsEl = overlay.querySelector(".actions");
  plugin.actions.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "action-btn";
    btn.textContent = a.label;
    btn.addEventListener("click", async () => {
      const resultBox = $("#modal-result");
      resultBox.textContent = "Running…";
      try {
        const res = await Actions[a.fn]();
        if (res) showResult(resultBox, res);
        else if (!resultBox.textContent || resultBox.textContent === "Running…") {
          resultBox.textContent = "Done – check output panel below";
        }
      } catch (e) {
        resultBox.textContent = "Error: " + (e.message || e);
        log(e);
      }
    });
    actionsEl.appendChild(btn);
  });

  const close = () => {
    overlay.classList.remove("open");
    setTimeout(() => overlay.remove(), 300);
  };
  overlay.querySelector(".close-modal").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  requestAnimationFrame(() => overlay.classList.add("open"));
}

// ---------- Init ----------
async function init() {
  renderCards();

  const badge = $("#platform-badge");
  if (isNative()) {
    badge.textContent = Cap().getPlatform?.() || "Native";
    badge.style.background = "rgba(0, 230, 118, 0.15)";
    badge.style.color = "#00e676";
    badge.style.borderColor = "rgba(0, 230, 118, 0.3)";
  } else {
    badge.textContent = "Web Preview";
  }

  // Try to hide splash if present
  try {
    const { SplashScreen } = Plugins();
    if (SplashScreen) await SplashScreen.hide();
  } catch (_) {}

  log("Capacitor Plugins Demo ready");
  log("Platform:", isNative() ? Cap().getPlatform() : "web");
  log("Tap any card to try the feature. Many official plugins work fully after `npx cap sync` + native build.");
}

init();
