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

---

## Level 7: Connect Backend to Repliers

- **Goal**: Connect the Express backend to the external Repliers API, attach the private API key securely on the server side, query listings, and reshape the raw payload into a streamlined, clean response for the frontend.
- **What Was Implemented**:
  - Created `backend/src/services/repliersClient.js`: Implements `fetchListings(params)` which builds queries and calls `https://api.repliers.io/listings` with the `REPLIERS-API-KEY` header read from `process.env.REPLIERS_API_KEY`.
  - Created `backend/src/routes/listings.js`: Exposes `GET /api/listings`, accepts query parameters (`city`, `minBedrooms`, `maxPrice`, `resultsPerPage`), calls `fetchListings()`, maps and extracts clean fields (`id`, `price`, `bedrooms`, `bathrooms`, `propertyType`, `city`, `address`, `lat`, `lng`, `image`, `photoCount`), and returns `{ count, listings }`.
  - Updated `backend/src/server.js`: Mounted `listingsRouter` at `/api/listings`.
  - Error Handling: Wrapped upstream calls in `try/catch` block returning HTTP 502 with structured error messaging if the Repliers API fails, without leaking sensitive internals.
- **Decisions & Configuration**:
  - Full image URLs are constructed server-side as `https://cdn.repliers.io/${imagePath}` so frontend components consume ready-to-render image URLs.
  - Latitude and longitude are extracted from `map.latitude` and `map.longitude` and exposed at the root of each listing object for easy mapping.
  - Front-end is kept untouched during this level per strict level-by-level scoping rules.
- **How It Was Verified**:
  - Restarted backend server and tested `curl.exe http://localhost:5000/api/listings?city=Austin&resultsPerPage=2`.
  - Verified JSON payload returned 2 listings with real IDs, coordinates, prices, and photo URLs, with zero private keys exposed.
  - Verified filter parameter passing with `minBedrooms=4`.

---

## Level 8: Connect React to Backend

- **Goal**: Connect the React frontend to our local Express backend proxy so that live Repliers property listings are fetched, stored in React state, and rendered in the property list instead of static mock data.
- **What Was Implemented**:
  - Updated `frontend/src/App.jsx`: Replaced the mock data state source with a `useEffect` hook fetching `http://localhost:5000/api/listings?city=Austin`. Added `loading` and `error` states to give clear feedback during requests and network failures.
  - Retired the mock data array into a commented block (`// MOCK DATA — TEMPORARY (retained for rollback reference)`).
  - Updated `frontend/src/components/PropertyCard.jsx` and `frontend/src/components/PropertyList.jsx`: Enhanced property extraction to seamlessly handle both reshaped backend properties (`id`, `price`, `address`, `bedrooms`, `bathrooms`, `propertyType`, `image`, `photoCount`) and raw schemas.
  - Added loading indicator state to `PropertyList` while the network request is in flight.
- **Decisions & Configuration**:
  - The frontend queries our backend proxy on port 5000, completely preserving secret isolation from browser inspection.
  - Kept the mock data commented out at the top of `App.jsx` per requirements rather than deleting it.
  - Both development servers (Vite on port 5173 and Express on port 5000) run simultaneously.
- **How It Was Verified**:
  - Executed `npm run build` inside `frontend/` to confirm zero compilation errors.
  - Verified HTTP 200 responses simultaneously from `http://localhost:5173/` and `http://localhost:5000/api/listings?city=Austin`.
  - Verified property cards in the browser render live prices (`$369,000`, `$719,900`, etc.), real Austin addresses (`7913 Eudora LN`, `6303 Bexton CIR`), and CDN photo thumbnails matching the backend API output.

---

## Level 9: Display Repliers Properties on Mapbox

- **Goal**: Render every live Repliers listing fetched from the backend as an interactive marker on the Mapbox map, complete with custom price and property detail popups.
- **What Was Implemented**:
  - Updated `frontend/src/components/MapView.jsx`:
    - Added reactive `useEffect` monitoring `listings` prop.
    - Added marker cleanup to remove old markers when listings change.
    - Explicitly mapped `[listing.lng, listing.lat]` into `mapboxgl.Marker().setLngLat()`, strictly adhering to Mapbox's `[longitude, latitude]` coordinate ordering requirement (as opposed to standard geographical `lat, lng`).
    - Added `mapboxgl.Popup` to each marker displaying formatted price (`$XXX,XXX`), street address, city, and bedroom/bathroom count.
    - Implemented automatic viewport fitting via `mapboxgl.LngLatBounds()` and `map.fitBounds()`, dynamically panning and zooming the map to frame all active property markers.
    - Added map navigation controls (`NavigationControl`) for manual zoom and rotation.
- **Decisions & Configuration**:
  - Maintained `mapRef` and `markersRef` to cleanly manage the Mapbox instance and prevent duplicate or lingering markers across React re-renders.
  - Coordinate order was double-checked to ensure markers land in Austin, TX rather than offshore or on the wrong hemisphere.
- **How It Was Verified**:
  - Built frontend with `npm run build` with zero errors.
  - Verified live in browser on `http://localhost:5173`: map automatically centers and zooms to Austin, TX, displaying all 20 property markers with clickable popups showing property details.

---

## Level 10: Property Cards + Marker Interaction

- **Goal**: Implement bidirectional synchronization between the property cards in the list and the markers on the map: clicking a marker highlights and scrolls to its matching card, and clicking a card smoothly flies the map to that marker and opens its price popup.
- **What Was Implemented**:
  - Lifted state in `frontend/src/App.jsx`: Maintained `selectedId` and `setSelectedId` as the single source of truth for property selection across the application.
  - Updated `frontend/src/components/MapView.jsx`:
    - Tracked marker instances in a `markerMapRef` mapping `id -> { marker, popup, lngLat }`.
    - Added click event listeners to marker DOM elements that invoke `onSelectListing(id)`.
    - Added reactive `useEffect` watching `[selectedId]`: automatically opens the matching marker's popup and invokes `map.flyTo()` with smooth easing (`zoom: 15`, `speed: 1.2`) to focus on the selected property.
    - Dynamically styles the selected marker with a distinctive accent color (`#ef4444`).
  - Updated `frontend/src/components/PropertyCard.jsx`:
    - Attached a component `ref` and a reactive `useEffect` monitoring `[isSelected]` that calls `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` whenever a marker is clicked on the map.
    - Enhanced selection styling with an active border ring, elevated drop shadow, and subtle card background tint.
- **Decisions & Configuration**:
  - Selection state is exclusively owned by `App.jsx` to eliminate race conditions between list clicks and marker clicks.
  - Card scrolling uses `block: 'nearest'` so scrolling the list container doesn't abruptly jump the entire page viewport.
- **How It Was Verified**:
  - Built frontend with `npm run build` with zero errors.
  - Verified live in browser at `http://localhost:5173`: clicking various cards flies the map and opens the popup, and clicking markers automatically highlights and scrolls to the card in the list.

---

## Level 11: Select and Support 2–4 U.S. Markets

- **Goal**: Make the city selection interface truly interactive so that choosing any of the confirmed U.S. markets (Austin, Orlando, Tampa, Dallas) immediately re-fetches that city's real listings, re-renders the cards, and re-centers the Mapbox map.
- **What Was Implemented**:
  - Updated `frontend/src/components/CitySelector.jsx`: Implemented both a controlled `<select>` dropdown and quick-access market buttons hard-coded to exactly the 4 data-confirmed markets: `Austin`, `Orlando`, `Tampa`, and `Dallas`.
  - Updated `frontend/src/App.jsx`:
    - Added `selectedCity` as an active dependency to the `useEffect` fetch hook.
    - Dynamically builds the query string `?city=${selectedCity}&resultsPerPage=20`.
    - Resets `selectedId` to `null` on city change to clear active selections from previous markets.
    - Sets loading state to `true` while fetching the newly selected market.
  - Leveraged `MapView.jsx` existing reactive effect to automatically calculate new coordinate bounds and fly the map to the newly selected city upon listing updates.
- **Decisions & Configuration**:
  - Market list is strictly limited to the 4 verified markets (`Austin`, `Orlando`, `Tampa`, `Dallas`) discovered in Level 3, adhering to the rule of never inventing or assuming markets with zero sandbox data.
- **How It Was Verified**:
  - Executed automated backend queries verifying that Austin, Orlando, Tampa, and Dallas all return HTTP 200 with matching listings and valid coordinates.
  - Built frontend with `npm run build` with zero errors.
  - Tested live in browser at `http://localhost:5173`: switching cities immediately loads that city's listings, updates the card list, and pans the Mapbox map directly to the corresponding city.

---

## Level 12: Add Filters (Price, Bedrooms, Bathrooms, Property Type, Reset)

- **Goal**: Implement property filtering across all 5 brief-required dimensions (Min/Max Price, Min Bedrooms, Min Bathrooms, Property Type, and Reset) with live query-string synchronization and exact Repliers API parameter validation.
- **What Was Implemented**:
  - Researched and confirmed the exact bathroom parameter name from live Repliers OpenAPI documentation (`docs.repliers.io/llms.txt` and reference docs): discovered the parameter is strictly `minBaths` (and `maxBaths`), **not** `minBathrooms` or `bathrooms`.
  - Updated `backend/src/routes/listings.js`: Extended route handler to accept `minPrice`, `maxPrice`, `minBedrooms`, `minBaths`, and `propertyType` query parameters and pass them through to `fetchListings()`.
  - Updated `frontend/src/App.jsx`:
    - Combined `selectedCity` and all active `filters` into dynamic `URLSearchParams`.
    - Mapped user input `filters.minBathrooms` to the verified `minBaths` query parameter.
    - Attached `[selectedCity, filters]` to `useEffect` so changing any filter instantly fires a fresh query.
    - Implemented `handleResetFilters()` clearing all filter values back to initial defaults.
  - Verified `FilterBar.jsx` controls: Min/Max Price numeric inputs, Min Bedrooms dropdown (`1+`, `2+`, `3+`, `4+`), Min Bathrooms dropdown (`1+`, `2+`, `3+`), Property Type dropdown (`Residential`, `Residential Lease`, `Residential Income`), and the Reset Filters button.
- **Decisions & Configuration**:
  - Strictly validated parameter names against Repliers official documentation before writing code to prevent silent filter ignores.
  - Reset button restores unfiltered city view while preserving the currently selected market.
- **How It Was Verified**:
  - Directly tested `curl.exe http://localhost:5000/api/listings?city=Austin&minBedrooms=4&minBaths=2&maxPrice=800000&resultsPerPage=5`: confirmed all 5 returned listings strictly satisfied price <= $800k, beds >= 4, and baths >= 2.
  - Built frontend with `npm run build` with zero errors.
  - Verified live on `http://localhost:5173`: setting filters updates the cards and map markers simultaneously in real-time, and clicking "Reset Filters" returns all properties.
