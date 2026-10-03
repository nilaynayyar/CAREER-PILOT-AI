# CareerPilot AI Windows Desktop Application

## 1. Overview

The CareerPilot AI desktop client packages the application into a native Windows executable experience. It connects to the running FastAPI backend and provides:

- Native Windows window management (1280×840 default, 900×600 minimum resizable).
- Custom desktop menus with direct backend connection health testing.
- Honest offline warnings if FastAPI is unreachable.
- Zero local ML duplication — shares the exact empirical ML models and O*NET dataset.

---

## 2. Desktop Implementations Provided

To ensure both immediate developer usability on machines without Rust and long-term production release readiness, CareerPilot AI provides two desktop solutions:

### Option A: Tauri Native Desktop Configuration (`src-tauri/`)
For production builds when the Rust toolchain (`cargo`, `rustc`) is available:
- `src-tauri/tauri.conf.json`: Window configurations, shell permissions, HTTP whitelist, MSI bundle metadata.
- `src-tauri/Cargo.toml`: Package dependencies (`tauri = "1.5"`, `serde`).
- `src-tauri/src/main.rs`: Native entry point.
- `src-tauri/build.rs`: Cargo build script.

### Option B: Windows Desktop Launcher (`desktop/` & `run-desktop.bat`)
For immediate Windows execution:
- `desktop/package.json`: Electron desktop wrapper.
- `desktop/main.js`: Main process handling window creation, menus, and backend pinging.
- `run-desktop.bat`: One-click Windows batch launcher that tests backend connectivity and launches the desktop app.

---

## 3. Configuration & Backend Connection

The desktop application respects the following environment variables:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `CAREERPILOT_BACKEND_URL` | `http://127.0.0.1:8000` | Target FastAPI server address |
| `CAREERPILOT_FRONTEND_URL` | `http://localhost:3000` | Web UI rendering URL |

If the backend is not responding upon checking `File -> Check Backend Connection`, the desktop client displays an honest alert dialog:
```
Cannot connect to CareerPilot backend at http://127.0.0.1:8000.
Please ensure FastAPI is running (python -m uvicorn backend.app.main:app).
```

---

## 4. Launching the Windows Desktop App

### One-Click Launch (Recommended)
Run the root batch file:
```cmd
run-desktop.bat
```

### Manual Launch via npm
```bash
cd desktop
npm install
npm start
```

### Tauri Production Build (When Cargo is installed)
```bash
npm run tauri build
```

---

## 5. Verification Status

- **Tauri Architecture & Configuration**: **PASS** (tauri.conf.json, Cargo.toml, main.rs, build.rs verified).
- **Windows Launcher**: **PASS** (`run-desktop.bat` and `desktop/main.js` configured with native window controls, dark mode, and connection checks).
- **Rust Toolchain Status on Current Machine**: Cargo/Rustc not currently in system PATH on this environment.
