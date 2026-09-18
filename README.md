# Repliers + Mapbox Real Estate Explorer 🏡🗺️

A modern, interactive real-estate property explorer web application that connects live MLS listing data from the **Repliers API** with interactive geospatial visualization powered by **Mapbox GL JS**.

---

## 🌟 Overview & Architecture

The application is structured into two clean tiers with complete separation of concerns:

- **Frontend (React 18 + Vite)**:
  - Renders an interactive Mapbox GL JS street map with custom markers, auto-fit coordinate bounding, and price popups.
  - Displays property cards in a scrollable list with prices, photos, and property metrics.
  - Provides bidirectional selection: clicking a marker highlights and smoothly scrolls to its card, and clicking a card flies the map and opens that marker's popup.
  - Multi-market switcher for 4 confirmed data-rich cities (**Austin**, **Orlando**, **Tampa**, **Dallas**).
  - Multi-parameter filter bar (**Min/Max Price**, **Bedrooms**, **Bathrooms**, **Property Type**, and **Reset**).
  - Handles loading states, empty search suggestions, and error retry states.

- **Backend (Node.js + Express API)**:
  - Acts as a secure proxy and data shaper.
  - Holds the private `REPLIERS-API-KEY` server-side, preventing secret leakage to the browser.
  - Queries `https://api.repliers.io/listings` with validated parameters (such as `minBaths`).
  - Reshapes verbose MLS payloads into concise, frontend-friendly listing objects (`id`, `price`, `bedrooms`, `bathrooms`, `propertyType`, `city`, `address`, `lat`, `lng`, `image`, `photoCount`).

---

## 📐 Data Flow

```
User (Browser)
     │
     ▼
React Frontend (Vite @ localhost:5173)
     │
     ▼ HTTP GET /api/listings?city=Austin&minBedrooms=3&minBaths=2
Node.js + Express Server (@ localhost:5000)
     │
     ▼ HTTP GET with REPLIERS-API-KEY header
Repliers API (https://api.repliers.io)
     │
     ▼ Raw MLS Listings JSON
Backend Data Shaper
     │
     ▼ Clean { count, listings } JSON
React State (App.jsx)
  ┌──┴─────────────────────────┐
  ▼                            ▼
Mapbox GL JS             Property Cards
(Markers + Popups)       (Details + Scroll)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ installed (`node -v`)
- **Repliers API Key** (from [login.repliers.com](https://login.repliers.com))
- **Mapbox Public Token** (starts with `pk.`, from [account.mapbox.com](https://account.mapbox.com))

---

### Step 1: Clone and Configure Environment Files

1. **Backend Environment**:
   Create `backend/.env` (or copy from `backend/.env.example`):
   ```env
   REPLIERS_API_KEY=your_repliers_api_key_here
   PORT=5000
   ```

2. **Frontend Environment**:
   Create `frontend/.env` (or copy from `frontend/.env.example`):
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
   ```

> *Note: Both `.env` files are ignored by `.gitignore` and never committed.*

---

### Step 2: Install Dependencies & Run Both Servers

#### Terminal 1: Start Express Backend
```bash
cd backend
npm install
npm run dev
```
*The backend API server starts at `http://localhost:5000`.*
*Verify health at: `http://localhost:5000/api/health`.*

#### Terminal 2: Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite server opens at `http://localhost:5173`.*

---

## 📁 Project Directory Layout

```
repliers-mapbox-real-estate-explorer/
├── frontend/                     # React 18 single-page application
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.jsx       # Mapbox GL JS map, markers & popups
│   │   │   ├── PropertyCard.jsx  # Individual property card with selection
│   │   │   ├── PropertyList.jsx  # Scrollable card container with states
│   │   │   ├── FilterBar.jsx     # Price, bed, bath & type filters
│   │   │   └── CitySelector.jsx  # Multi-market selector (Austin, Orlando, etc.)
│   │   ├── App.jsx               # Single source of truth state & API fetch hook
│   │   ├── main.jsx              # React 18 DOM mount point
│   │   └── style.css             # Responsive design tokens & styles
│   ├── .env                      # Mapbox public token (git-ignored)
│   ├── .env.example              # Template environment variables
│   └── package.json
│
├── backend/                      # Node.js + Express API server
│   ├── src/
│   │   ├── routes/
│   │   │   └── listings.js       # Express /api/listings endpoint & shaper
│   │   ├── services/
│   │   │   └── repliersClient.js # Outgoing Repliers HTTP client with auth
│   │   └── server.js             # Express server setup & CORS middleware
│   ├── sample-data/
│   │   └── sample-listing.json   # Offline schema reference payload
│   ├── .env                      # Repliers API key & port (git-ignored)
│   ├── .env.example              # Template environment variables
│   └── package.json
│
├── PROJECTDOC.md                 # Running build log for every level
├── BUGFIX.md                     # Running issue resolution and diagnosis log
├── README.md                     # Project documentation & run guide
└── .gitignore                    # Secrets, build artifacts & dependencies ignore
```

---

## 🧪 Verification & Feature Checklist

- [x] **Clean Professional UI**: Cohesive colors, responsive grid layout, badge indicators.
- [x] **Secure Architecture**: Secret `REPLIERS-API-KEY` stays strictly server-side.
- [x] **Interactive Mapbox Map**: Smooth panning, zooming, and dynamic auto-fit bounds.
- [x] **Verified Supported Markets**: Austin, Orlando, Tampa, and Dallas backed by real sample counts.
- [x] **Bidirectional Sync**: Clicking card flies map to marker; clicking marker scrolls to matching card.
- [x] **Multi-Parameter Filtering**: Min/Max price, Bedrooms, Bathrooms (`minBaths`), Property Type, and Reset.
- [x] **Resilient States**: Visual loading spinner, empty-state recovery, and error retry handlers.
