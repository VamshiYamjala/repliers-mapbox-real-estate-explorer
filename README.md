# Repliers + Mapbox Real Estate Explorer

An interactive property explorer web application that connects real-estate listing data from the Repliers API with interactive map visualization powered by Mapbox GL JS.

## Architecture Overview

- **Frontend**: React (Vite) single-page application rendering an interactive Mapbox map, filter controls, and property listing cards.
- **Backend**: Node.js + Express API acting as a proxy and data shaper to securely query the Repliers API without exposing private API keys to the browser client.
- **Data Source**: Repliers API (https://api.repliers.io) providing MLS property listings.
- **Map Engine**: Mapbox GL JS rendering interactive markers and popups based on listing coordinates.

## Project Structure (Target)

`
repliers-mapbox-real-estate-explorer/
├── frontend/          # React + Vite client
├── backend/           # Node.js + Express server
├── PROJECTDOC.md      # Running project build and decision log
├── BUGFIX.md          # Running bug and issue tracking log
├── README.md
└── .gitignore
`

## Current Status
- **Level 1 complete**: Development environment verified (Node.js, Git) and base project skeleton initialized.
