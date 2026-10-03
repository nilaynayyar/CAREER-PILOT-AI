/**
 * CareerPilot AI — Windows Desktop Application
 * Main Process
 */

const { app, BrowserWindow, dialog, Menu, shell } = require("electron");
const path = require("path");
const http = require("http");

const BACKEND_URL = process.env.CAREERPILOT_BACKEND_URL || "http://127.0.0.1:8000";
const FRONTEND_URL = process.env.CAREERPILOT_FRONTEND_URL || "http://localhost:3000";

let mainWindow = null;

function checkBackendHealth(callback) {
  const req = http.get(`${BACKEND_URL}/api/v1/health`, (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        callback(true, parsed);
      } catch (e) {
        callback(false, null);
      }
    });
  });

  req.on("error", () => {
    callback(false, null);
  });

  req.setTimeout(3000, () => {
    req.destroy();
    callback(false, null);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: "CareerPilot AI — Career Intelligence Platform",
    backgroundColor: "#0d1117",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: false,
  });

  // Build application menu
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Check Backend Connection",
          click: () => {
            checkBackendHealth((ok, info) => {
              if (ok) {
                dialog.showMessageBox(mainWindow, {
                  type: "info",
                  title: "Backend Status",
                  message: `CareerPilot Backend is connected!\n\nML Model: ${info.model_loaded ? "Loaded" : "Not Loaded"}\nO*NET Data: ${info.onet_data_loaded ? "Loaded" : "Not Loaded"}\nGemini: ${info.gemini_available ? "Active" : "Offline Fallback"}`,
                });
              } else {
                dialog.showMessageBox(mainWindow, {
                  type: "warning",
                  title: "Backend Offline",
                  message: `Cannot connect to CareerPilot backend at ${BACKEND_URL}.\nPlease ensure FastAPI is running (python -m uvicorn backend.app.main:app).`,
                });
              }
            });
          },
        },
        { type: "separator" },
        { label: "Exit", accelerator: "Ctrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About CareerPilot AI",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About CareerPilot AI",
              message: "CareerPilot AI v1.0.0\n\nCross-platform Career Intelligence Platform powered by empirical Machine Learning (AMEO 2015) and O*NET occupational data.",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(FRONTEND_URL).catch((err) => {
    console.error("Failed to load frontend:", err);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
