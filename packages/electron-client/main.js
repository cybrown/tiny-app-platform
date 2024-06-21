// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const findFreePort = require("find-free-port");
const fs = require("fs");
const windowStateKeeper = require("electron-window-state");

if (require("electron-squirrel-startup")) return app.quit();

const PORT = findFreePort(16384 + Math.floor(Math.random() * 16384)).then(
  (ports) => ports[0]
);

async function createWindow() {
  /** @type BrowserWindow */
  let sideBrowserWindow;

  function grabBrowserWindow() {
    if (sideBrowserWindow == null || sideBrowserWindow.isDestroyed()) {
      sideBrowserWindow = new BrowserWindow({
        webPreferences: {
          partition: "private",
        },
      });
    }
    return sideBrowserWindow;
  }

  let openInSystemBrowser = false;

  let sourcePath = null;
  openInSystemBrowser = false;
  let sourceFromFile = await new Promise((resolve, reject) => {
    if (process.argv.length > 1) {
      sourcePath = process.argv[1];
    }
    if (sourcePath == null) {
      const sourcePaths = dialog.showOpenDialogSync({
        buttonLabel: "File to load or create",
        filters: [{ name: "Tiny app scripts", extensions: ["tas"] }],
        properties: ["createDirectory", "promptToCreate", "dontAddToRecent"],
      });
      if (sourcePaths === undefined) {
        dialog.showErrorBox("Error", "A file must be selected to continue");
        process.exit(0);
      }
      sourcePath = sourcePaths[0];
    }
    fs.readFile(sourcePath, (err, data) => {
      if (err) {
        console.error("Failed to load file", err);
        return reject(err);
      }
      resolve(data.toString("utf-8"));
    });
  });

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  const noNativeFrame = sourceFromFile.includes("//no-native-frame");

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: !noNativeFrame,
  });

  mainWindowState.manage(mainWindow);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (openInSystemBrowser) {
      shell.openExternal(url);
    } else {
      const sideBrowserWindow = grabBrowserWindow();
      sideBrowserWindow.loadURL(url.slice(0, -1));
      sideBrowserWindow.focus();
    }
    return { action: "deny" };
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
  mainWindow.webContents.on("did-navigate", async function() {
    const port = await PORT;
    const sourcePathDirname = path.dirname(sourcePath);
    mainWindow.webContents.send("config", {
      backendUrl: "http://localhost:" + port,
      sourceFromFile,
      sourcePath,
      sourcePathDirname,
    });
    ipcMain.on("set-property", (e, key, value) => {
      switch (key) {
        case "useSystemBrowser":
          openInSystemBrowser = value;
          break;
        default:
          throw new Error("Unknown property key: " + key);
      }
    });

    ipcMain.on("save-file", (e, source) => {
      sourceFromFile = source;
      fs.writeFile(sourcePath, source, (err) => {
        if (err) throw err;
      });
    });

    ipcMain.on("exit", (e) => {
      mainWindow.close();
    });

    ipcMain.on("getSourceForImport", (e, requestId, sourceRelativePath) => {
      const modulePath = path.join(
        sourcePathDirname,
        sourceRelativePath + ".tas"
      );
      fs.readFile(modulePath, (err, data) => {
        if (err) {
          mainWindow.webContents.send(
            "getSourceForImport-response",
            requestId,
            err
          );
          return;
        }
        mainWindow.webContents.send(
          "getSourceForImport-response",
          requestId,
          null,
          { path: modulePath, source: data.toString("utf-8") }
        );
      });
    });
  });

  mainWindow.on("close", () => {
    if (sideBrowserWindow && !sideBrowserWindow.isDestroyed()) {
      sideBrowserWindow.close();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
PORT.then((port) => {
  const server = require("./back/lib/server");
  server.listen({ port, host: "127.0.0.1" }, () => {
    console.log(`Server listening on port ${port}`);
  });
});
