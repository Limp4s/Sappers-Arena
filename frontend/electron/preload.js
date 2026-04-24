const { contextBridge, ipcRenderer } = require("electron");
 
contextBridge.exposeInMainWorld("electron", {
  quitApp: () => ipcRenderer.invoke("sa:quit-app"),
});