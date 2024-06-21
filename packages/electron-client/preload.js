/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

const { contextBridge, ipcRenderer } = require("electron");

let config = null;

ipcRenderer.on("config", (sender, message) => (config = message));

contextBridge.exposeInMainWorld("electronAPI", {
  config() {
    return config;
  },
  setProperty(key, value) {
    ipcRenderer.send("set-property", key, value);
  },
  saveFile(source) {
    ipcRenderer.send("save-file", source);
  },
  getSourceForImport(sourceRelativePath) {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(16);
      function responseHandler(e, requestIdResponse, err, source) {
        if (requestIdResponse === requestId) {
          if (err) return reject(err);
          ipcRenderer.off("getSourceForImport-response", responseHandler);
          return resolve(source);
        }
      }
      ipcRenderer.on("getSourceForImport-response", responseHandler);
      ipcRenderer.send("getSourceForImport", requestId, sourceRelativePath);
    });
  },
  exit() {
    ipcRenderer.send("exit");
  },
});
