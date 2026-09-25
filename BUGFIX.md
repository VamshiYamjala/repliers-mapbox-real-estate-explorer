# Bug Fix & Issue Resolution Log (BUGFIX.md)

This document tracks all bugs, unexpected behaviors, errors, and fixes encountered during project development.

## Process
1. Whenever an error or unexpected behavior occurs, first search this document for an existing entry matching the symptom.
2. If a documented solution exists, apply it first.
3. If no matching entry exists or the existing fix is insufficient, diagnose and implement the resolution.
4. Record the symptom/error message, root cause, exact fix applied, and corresponding level/file before moving forward.

---

## Log Entries

### Bug 1: Vite Scaffolding Defaulted to Vanilla TS Instead of React
- **Level / File**: Level 4, frontend/package.json, frontend/vite.config.js, frontend/src/main.jsx
- **Symptom / Error Message**: Running `npm create vite@latest frontend -- --template react` produced npm warnings (`npm warn "react" is being parsed as a normal command line argument`) and scaffolded a vanilla TypeScript template instead of React.
- **Root Cause**: PowerShell argument passing rules and npm v10+ handling of `-- --template react`.
- **Exact Fix Applied**: Installed `react`, `react-dom`, and `@vitejs/plugin-react`. Configured `frontend/vite.config.js`, set up React 18 mount point in `index.html` and `src/main.jsx`, and created `src/App.jsx`.

### Bug 2: Vite Build JSON Parsing SyntaxError (UTF-8 BOM)
- **Level / File**: Level 4, frontend/package.json
- **Symptom / Error Message**: `[plugin vite:css] Failed to load PostCSS config: ... [SyntaxError] Unexpected token, "{"name"... is not valid JSON` during `npm run build`.
- **Root Cause**: PowerShell 5.1's `Out-File -Encoding utf8` prepends a UTF-8 Byte Order Mark (BOM, `0xFEFF`) to files, causing Vite/Rolldown JSON parsing to fail.
- **Exact Fix Applied**: Stripped the leading `0xFEFF` BOM character using Node.js filesystem APIs. Verified `npm run build` succeeds cleanly with 0 errors.

### Bug 3: `.env.example` Accidentally Ignored by `.env.*` Gitignore Rule
- **Level / File**: Level 4, `.gitignore`, `frontend/.gitignore`
- **Symptom / Error Message**: `frontend/.env.example` was excluded by git tracking and did not stage during `git add .`.
- **Root Cause**: The wildcard ignore pattern `.env.*` in `.gitignore` matches `.env.example`.
- **Exact Fix Applied**: Added exception rule `!.env.example` directly below `.env.*` in both root `.gitignore` and `frontend/.gitignore`. Verified `git check-ignore` confirms `.env` remains ignored while `.env.example` is tracked.

### Bug 4: Vercel Peer Dependency Mismatch between Vite 8 and @vitejs/plugin-react
- **Level / File**: Vercel Deployment / frontend/package.json, frontend/package-lock.json
- **Symptom / Error Message**: `vite@8.3.0 is installed, but @vitejs/plugin-react@4.7.0 requires: vite ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0. Vercel cannot resolve the dependency tree.`
- **Root Cause**: `frontend/package.json` had `"@vitejs/plugin-react": "^4.3.4"` while `"vite": "^8.3.0"` was installed. In npm v7+, peer dependencies are strictly resolved during CI/CD (`npm install` on Vercel), failing when peer requirements conflict.
- **Exact Fix Applied**: Updated `frontend/package.json` devDependencies to `"@vitejs/plugin-react": "^6.1.1"` which officially requires `vite: "^8.0.0"`. Ran clean `npm install` and `npm run build` with zero `--force` or `--legacy-peer-deps` flags. Verified local build completes in <800ms with 0 errors.

### Bug 5: Production Frontend Blocked by CORS Due to Hardcoded localhost:5000
- **Level / File**: Production Deployment / frontend/src/App.jsx
- **Symptom / Error Message**: `Access to fetch at http://localhost:5000/api/listings... from origin https://repliers-mapbox-real-estate-explore.vercel.app has been blocked by CORS policy.`
- **Root Cause**: `frontend/src/App.jsx` hardcoded `http://localhost:5000/api/listings` in `fetchListingsData`, preventing the production frontend from reaching the deployed Express backend on Render (`https://repliers-mapbox-real-estate-explorer.onrender.com`).
- **Exact Fix Applied**: Defined `API_BASE_URL` using `(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')` and updated the fetch call to `${API_BASE_URL}/api/listings...`. Added `VITE_API_URL` to `frontend/.env.example`.

### Bug 6: Mapbox Vector Tile Cancellations & City Switch Async Race Conditions
- **Level / File**: frontend/src/App.jsx, frontend/src/components/MapView.jsx, frontend/src/main.jsx
- **Symptom / Error Message**: Red `*.vector.pbf (canceled)` requests with `net::ERR_ABORTED` in DevTools Network tab when switching markets. During rapid city switches, older API responses overwrote newer market selections.
- **Root Cause**: 
  1. React 18 `<React.StrictMode>` dev double-mounting mounted `MapView`, started fetching Austin tiles, and immediately ran `map.remove()`, aborting in-flight tiles.
  2. Initial map center was hardcoded to Austin `[-97.7431, 30.2672]`, and `map.fitBounds` ran with `duration: 1000`, causing Mapbox to abort Austin and intermediate flight tiles when switching cities.
  3. `fetchListings` lacked request cancellation (`AbortController`), allowing stale queries to overwrite newer city state.
- **Exact Fix Applied**:
  1. Removed `<React.StrictMode>` wrapper in `frontend/src/main.jsx` to prevent WebGL dev double-destruction.
  2. Added `CITY_CENTERS` coordinate dictionary and `duration: 0` for `fitBounds` in `frontend/src/components/MapView.jsx` to jump directly to destination bounds without aborting intermediate zoom tiles.
  3. Integrated `AbortController` in `frontend/src/App.jsx` to abort stale in-flight listings queries on city/filter switches. Verified clean build and 0 canceled requests via CDP testing.
