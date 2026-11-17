const { contextBridge, ipcRenderer } = require("electron");

// API minimale exposée à la page : données et photos enregistrées sur le disque
contextBridge.exposeInMainWorld("lifestyle", {
  load: () => ipcRenderer.invoke("store:load"),
  save: (json) => ipcRenderer.invoke("store:save", json),
  savePhoto: (bytes) => ipcRenderer.invoke("photo:save", bytes),
  deletePhoto: (name) => ipcRenderer.invoke("photo:delete", name),
  readPhoto: (name) => ipcRenderer.invoke("photo:read", name),
  openDataFolder: () => ipcRenderer.invoke("data:open"),
  exportFile: (name, json) => ipcRenderer.invoke("data:export", name, json),
});

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("desktop-app");
  if (process.platform === "darwin") document.documentElement.classList.add("desktop-mac");
});
