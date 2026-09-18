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
