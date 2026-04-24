const path = require("path");
const fs = require("fs");
const electron = require("electron");

if (typeof electron === "string") {
  try {
    // When this file is executed under plain Node (instead of Electron),
    // `require("electron")` resolves to the path of the Electron binary.
    // Re-spawn Electron so the built-in Electron module APIs are available.
    // eslint-disable-next-line global-require
    const { spawn } = require("child_process");
    spawn(electron, [__filename, ...process.argv.slice(2)], { stdio: "inherit" });
  } catch {}
  process.exit(0);
}

const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = electron;

const TERMS_TEXT = `The game is in early testing.
By continuing, you agree to the Terms:
- The game is provided "as is."
- You are responsible for your own use.
- The game does not intentionally collect any personal data in offline mode.
- Once you accept the terms, you cannot opt out.
- All rights to this game belong to the owners of the company.
- If your name is Ivan, you will be an unpaid beta tester.
`;

function configurePortableDataDir() {
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;
  if (!portableDir) return;

  const userDataDir = path.join(portableDir, "user-data");
  try { fs.mkdirSync(userDataDir, { recursive: true }); } catch {}
  try { app.setPath("userData", userDataDir); } catch {}

  const termsPath = path.join(portableDir, "TERMS.txt");
  try {
    if (!fs.existsSync(termsPath)) fs.writeFileSync(termsPath, TERMS_TEXT, "utf8");
  } catch {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.once("ready-to-show", () => {
    try { win.setFullScreen(true); } catch {}
    try { win.show(); } catch {}
  });

  win.webContents.on("did-fail-load", (_evt, errorCode, errorDescription, validatedURL) => {
    // Visible in DevTools console.
    // Helps diagnose blank window issues in packaged builds.
    // eslint-disable-next-line no-console
    console.error("did-fail-load", { errorCode, errorDescription, validatedURL });
  });

  win.webContents.on("render-process-gone", (_evt, details) => {
    // eslint-disable-next-line no-console
    console.error("render-process-gone", details);
  });

  if (process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    win.loadFile(path.join(app.getAppPath(), "build", "index.html"));
  }
}

function configureAutoUpdates() {
  if (!app.isPackaged) return;

  try {
    // Lazy-load to avoid issues when running in dev/unpackaged mode.
    // electron-updater can access electron's app internals during module init.
    // eslint-disable-next-line global-require
    const { autoUpdater } = require("electron-updater");

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("autoUpdater:error", err);
    });

    autoUpdater.on("update-available", () => {
      // eslint-disable-next-line no-console
      console.log("autoUpdater:update-available");
    });

    autoUpdater.on("update-downloaded", async () => {
      try {
        const res = await dialog.showMessageBox({
          type: "info",
          buttons: ["Restart", "Later"],
          defaultId: 0,
          cancelId: 1,
          title: "Update ready",
          message: "A new version has been downloaded.",
          detail: "Restart the game to apply the update."
        });
        if (res.response === 0) {
          try { autoUpdater.quitAndInstall(); } catch {}
        }
      } catch {}
    });

    try { autoUpdater.checkForUpdates(); } catch {}
  } catch {}
}

app.whenReady().then(() => {
  configurePortableDataDir();
  configureAutoUpdates();

  try {
    ipcMain.handle("sa:quit-app", () => {
      try { app.quit(); } catch {}
    });
  } catch {}

  createWindow();

  // Allow opening DevTools even when menu is hidden.
  globalShortcut.register("F12", () => {
    const w = BrowserWindow.getFocusedWindow();
    if (!w) return;
    if (w.webContents.isDevToolsOpened()) w.webContents.closeDevTools();
    else w.webContents.openDevTools({ mode: "detach" });
  });
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    const w = BrowserWindow.getFocusedWindow();
    if (!w) return;
    if (w.webContents.isDevToolsOpened()) w.webContents.closeDevTools();
    else w.webContents.openDevTools({ mode: "detach" });
  });

  // Toggle fullscreen with F11.
  globalShortcut.register("F11", () => {
    const w = BrowserWindow.getFocusedWindow();
    if (!w) return;
    try { w.setFullScreen(!w.isFullScreen()); } catch {}
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  try { globalShortcut.unregisterAll(); } catch {}
});
