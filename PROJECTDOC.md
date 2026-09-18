# Project Build Log (PROJECTDOC.md)

This document tracks the running progress, architectural choices, implementations, and verification steps across each development level.

---

## Level 0: Understand the Project

- **Goal**: Understand the overarching architecture, data flow, and separation of concerns across the three core layers (React frontend, Express backend, Repliers/Mapbox external services) before writing any code.
- **Concepts & Architecture**:
  - **Client-Server Architecture**: The frontend (React/Vite) only talks to our custom backend proxy (`localhost:5000`), never directly to Repliers.
  - **Secret Isolation**: The Repliers API key (`REPLIERS-API-KEY`) requires strict confidentiality and lives exclusively on the server in `backend/.env`. Mapbox uses a public access token (`pk.*`) exposed via `frontend/.env` with the `VITE_` prefix.
  - **Data vs. Rendering Decoupling**: Repliers handles MLS property data, while Mapbox GL JS handles spatial rendering on the client. Neither service is aware of the other; React connects them by taking coordinates (`map.latitude`, `map.longitude`) from the reshaped listings and feeding them as `[longitude, latitude]` markers to Mapbox.
- **Verification**: Verified understanding of data flow, security boundary, and coordinate order expectations.

---

## Level 1: Development Environment Setup

- **Goal**: Verify prerequisites (Node.js runtime, Git version control), set up the root project directory, establish ignore rules, and create the baseline repository structure.
- **What Was Implemented**:
  - Confirmed Node.js version (`v22.18.0`, satisfying the Node 18+ requirement for native `fetch`).
  - Confirmed Git version (`git version 2.55.0.windows.5`).
  - Initialized empty Git repository in the project root.
  - Created `.gitignore` ignoring dependencies (`node_modules/`), secrets (`.env`, `SECRETS.md`), build outputs (`dist/`), and OS files (`.DS_Store`).
  - Created `README.md` introducing the architecture and components.
  - Initialized `PROJECTDOC.md` as the running build log.
  - Initialized `BUGFIX.md` as the running issue resolution log.
- **Decisions & Configuration**:
  - Node 22.18.0 was detected and confirmed suitable for running both modern ES modules and native fetch without polyfills.
  - Scaffolding of `frontend/` and `backend/` was deliberately postponed to subsequent levels per the strict level-by-level progression rules.
- **How It Was Verified**:
  - Executed `node -v` and `git --version` cleanly.
  - Executed `git status` to verify repository initialization and clean tracking of root setup files.
  - Committed initial checkpoint: `chore: initialize project repo`.
  - Linked GitHub remote `https://github.com/VamshiYamjala/repliers-mapbox-real-estate-explorer.git` and pushed `main` branch.

---

## Level 2: Repliers Account / API Verification

- **Goal**: Prove that the Repliers developer account and API key work with a live HTTP request before writing application code.
- **What Was Implemented**:
  - Secured the API key in a local `SECRETS.md` file explicitly protected from Git tracking via `.gitignore`.
  - Executed a direct verification query to `https://api.repliers.io/listings?resultsPerPage=1` using the `REPLIERS-API-KEY` header.
  - Inspected the returned JSON structure.
- **Decisions & Configuration**:
  - Verified against Repliers' free sandbox dataset.
  - Tested with `resultsPerPage=1` to minimize network overhead and isolate credential validity.
- **How It Was Verified**:
  - Received HTTP 200 with an active listing (`mlsNumber`: `ACT8714298`, `listPrice`: `$369,000`, `city`: `Austin`, `map.latitude`: `30.158569`, `map.longitude`: `-97.74043`).
  - Confirmed that `listings` array is populated and contains standard MLS fields needed for future levels.

---

## Level 3: Understand Repliers JSON & Choose Markets

- **Goal**: Understand the real listing JSON payload structure, verify critical data fields, and choose 2–4 supported candidate cities based on real listing counts in the Repliers sandbox data rather than assumptions.
- **What Was Implemented**:
  - Queried candidate cities across the United States to discover where sandbox listings actually exist.
  - Inspected a full real listing object to verify exact property key paths.
  - Saved a sanitized sample response to `backend/sample-data/sample-listing.json` for offline development and schema reference without storing API keys.
- **Real City Result Counts**:
  - **Austin**: 1,955 listings (primary market candidate)
  - **Orlando**: 290 listings (secondary market candidate)
  - **Tampa**: 216 listings (secondary market candidate)
  - **Dallas**: 80 listings (candidate)
  - **Miami**: 2 listings (thin in sandbox)
  - **Houston**: 2 listings (thin in sandbox)
  - **Los Angeles**: 0 listings (no sandbox coverage)
  - **New York**: 0 listings (no sandbox coverage)
- **Field Verification**:
  - Unique ID: `mlsNumber` (e.g. `"ACT8714298"`)
  - Pricing: `listPrice` (e.g. `369000`)
  - Status: `standardStatus` (`"Active"`), `status` (`"A"`)
  - Property Specs: `details.numBedrooms` (`4`), `details.numBathrooms` (`2`), `details.sqft` (`"1752"`)
  - Property Types: `details.propertyType` (`"Residential"`, `"Residential Lease"`, `"Residential Income"`)
  - Address: `address.city` (`"Austin"`), `address.state` (`"TX"`), `address.streetNumber` (`"7913"`), `address.streetName` (`"Eudora"`), `address.streetSuffix` (`"LN"`)
  - Coordinates: `map.latitude` (`30.158569`), `map.longitude` (`-97.74043`)
  - Photos: `images[0]` (`"sample/IMG-ACT8714298_0.jpg"`), full URL resolves with `https://cdn.repliers.io/`, `photoCount` (`29`)
- **Decisions & Recommended Markets**:
  - Recommending **Austin, Orlando, Tampa, and Dallas** as the supported markets because Los Angeles and New York have 0 results and Miami has only 2 results in the sandbox dataset.
- **How It Was Verified**:
  - Automated Node script queried the live Repliers API with proper headers.
  - Verified all fields directly from the parsed response and verified `backend/sample-data/sample-listing.json`.

---

## Level 4: Mapbox Setup and First Map

- **Goal**: Scaffold a bare React + Vite frontend application, install and configure Mapbox GL JS, and render an interactive street map centered on initial coordinates without listings or backend data yet.
- **What Was Implemented**:
  - Scaffolded React 18 frontend inside `frontend/` using Vite and `@vitejs/plugin-react`.
  - Installed `mapbox-gl` (v3.31.0) and imported its stylesheet (`mapbox-gl/dist/mapbox-gl.css`).
  - Saved the user's Mapbox public access token in `frontend/.env` as `VITE_MAPBOX_TOKEN` and created `frontend/.env.example`.
  - Created `frontend/src/components/MapView.jsx` encapsulating the Mapbox GL map instance via React `useRef` and `useEffect`.
  - Created `frontend/src/App.jsx` to render the `MapView` inside the root layout.
  - Verified `frontend/.env` is completely ignored by both root and frontend `.gitignore` rules.
- **Decisions & Configuration**:
  - Mapbox container uses an explicit height (`500px`) and full width (`100%`) so the WebGL canvas mounts with valid dimensions.
  - Public token is safely accessed through Vite's `import.meta.env.VITE_MAPBOX_TOKEN`.
  - Map center initializes at placeholder coordinates `[-80.1918, 25.7617]` (Miami), cleanup function `map.remove()` runs on component unmount.
- **How It Was Verified**:
  - Executed `npm run build` inside `frontend/` to confirm complete JSX/CSS bundling with zero compilation errors.
  - Started Vite development server on `http://localhost:5173` and confirmed with HTTP request that the single-page application and root container are served properly.

---

## Level 5: Build React UI (Static, Mock Data)

- **Goal**: Create the UI components (`PropertyCard`, `PropertyList`, `FilterBar`, `CitySelector`) and layout in `App.jsx`, rendering against realistic mock data shaped like real Repliers listings to iterate on presentation before touching the backend.
- **What Was Implemented**:
  - Created `frontend/src/components/PropertyCard.jsx`: Displays property thumbnail, property type badge, price formatted with commas, full address, beds, baths, sqft, and photo count badge. Supports selection state and click handlers.
  - Created `frontend/src/components/PropertyList.jsx`: Renders a scrollable container with total count header and maps through listing objects, rendering a `PropertyCard` keyed by `listing.mlsNumber`. Includes an empty-state message if results are 0.
  - Created `frontend/src/components/FilterBar.jsx`: Provides interactive inputs for Min/Max Price, Min Bedrooms (Any, 1+, 2+, 3+, 4+), Min Bathrooms (Any, 1+, 2+, 3+), Property Type (All Types, Residential, Residential Lease, Residential Income), and a Reset button.
  - Created `frontend/src/components/CitySelector.jsx`: Renders buttons to switch between confirmed markets (`Austin`, `Orlando`, `Tampa`, `Dallas`).
  - Updated `frontend/src/App.jsx`: Defined a clearly marked `// MOCK DATA — TEMPORARY` array with 3 sample listings matching the Repliers schema. Arranged the layout with `CitySelector` and `FilterBar` at the top, and `MapView` and `PropertyList` in a responsive side-by-side grid below.
- **Decisions & Configuration**:
  - Layout uses CSS grid (`minmax(350px, 1fr) 420px`) with fixed scrollable property list height (`600px`) so that the interactive map and cards are viewable simultaneously without page jumps.
  - Hard-coded props and state are isolated cleanly; no backend endpoints are contacted yet.
- **How It Was Verified**:
  - Ran `npm run build` to confirm zero compilation or bundling errors.
  - Verified live in Vite dev server on `http://localhost:5173`. Confirmed card details, badges, and layout render without console errors.

---

## Level 6: Build Node.js + Express Backend (Skeleton)

- **Goal**: Scaffold a minimal Node.js + Express backend server responding to an `/api/health` check route with CORS enabled, verifying the runtime, port, and cross-origin setup before introducing Repliers API proxy logic.
- **What Was Implemented**:
  - Initialized backend environment in `backend/` with `express`, `cors`, and `dotenv`.
  - Configured `backend/package.json` with `"type": "module"` for native ES module imports and a `"dev": "node src/server.js"` script.
  - Created `backend/.env` with `REPLIERS_API_KEY` and `PORT=5000`.
  - Created `backend/.env.example` with blank keys to document required environment variables without leaking secrets.
  - Verified `backend/.env` is completely ignored by Git.
  - Created `backend/src/server.js` configuring Express, `cors()` middleware, and the `GET /api/health` endpoint.
- **Decisions & Configuration**:
  - Server listens on port `5000` (or `process.env.PORT` fallback).
  - CORS middleware enabled so the Vite development server running on `http://localhost:5173` will be able to make API requests without cross-origin browser blocking.
  - Repliers-specific routes are kept out of this level per strict level-by-level scoping rules.
- **How It Was Verified**:
  - Launched backend server with `npm run dev`.
  - Executed `curl.exe http://localhost:5000/api/health` and received `{"status":"ok"}` with HTTP 200.
