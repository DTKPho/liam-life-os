const { app, BrowserWindow, shell, Menu, ipcMain, protocol, net, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

// Les photos sont servies à la page via lsphoto://img/<fichier>
protocol.registerSchemesAsPrivileged([
  { scheme: "lsphoto", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

app.setName("Mon Lifestyle");
const dataDir = () => app.getPath("userData");
const dataFile = () => path.join(dataDir(), "lifestyle.json");
const photosDir = () => path.join(dataDir(), "photos");
const safeName = (n) => path.basename(String(n)).replace(/[^\w.-]/g, "");

function registerIpc() {
  ipcMain.handle("store:load", async () => {
    try { return await fs.readFile(dataFile(), "utf8"); } catch { return null; }
  });
  ipcMain.handle("store:save", async (_e, json) => {
    if (typeof json !== "string") throw new Error("invalid");
    const tmp = dataFile() + ".tmp";
    await fs.writeFile(tmp, json, "utf8");
    await fs.rename(tmp, dataFile());
    return true;
  });
  ipcMain.handle("photo:save", async (_e, bytes) => {
    await fs.mkdir(photosDir(), { recursive: true });
    const name = crypto.randomUUID() + ".jpg";
    await fs.writeFile(path.join(photosDir(), name), Buffer.from(bytes));
    return name;
  });
  ipcMain.handle("photo:delete", async (_e, name) => {
    try { await fs.unlink(path.join(photosDir(), safeName(name))); } catch {}
    return true;
  });
  ipcMain.handle("photo:read", async (_e, name) => {
    const buf = await fs.readFile(path.join(photosDir(), safeName(name)));
    return "data:image/jpeg;base64," + buf.toString("base64");
  });
  ipcMain.handle("data:open", () => shell.openPath(dataDir()));
  ipcMain.handle("data:export", async (e, name, json) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: path.join(app.getPath("documents"), safeName(name)),
      filters: [{ name: "Sauvegarde Lifestyle", extensions: ["json"] }],
    });
    if (canceled || !filePath) return false;
    await fs.writeFile(filePath, json, "utf8");
    return true;
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 480,
    minHeight: 600,
    title: "Mon Lifestyle",
    backgroundColor: "#0b0b0c",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "app", "index.html"));

  // Liens externes -> navigateur par défaut
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });
}

app.whenReady().then(() => {
  protocol.handle("lsphoto", (req) => {
    const name = safeName(decodeURIComponent(new URL(req.url).pathname.slice(1)));
    return net.fetch(pathToFileURL(path.join(photosDir(), name)).toString());
  });
  registerIpc();
  if (process.platform === "darwin") {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { role: "appMenu" }, { role: "editMenu" }, { role: "viewMenu" }, { role: "windowMenu" },
    ]));
  }
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
