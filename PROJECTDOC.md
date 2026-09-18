# Project Build Log (PROJECTDOC.md)

This document tracks the running progress, architectural choices, implementations, and verification steps across each development level.

---

## Level 0: Understand the Project

- **Goal**: Understand the overarching architecture, data flow, and separation of concerns across the three core layers (React frontend, Express backend, Repliers/Mapbox external services) before writing any code.
- **Concepts & Architecture**:
  - **Client-Server Architecture**: The frontend (React/Vite) only talks to our custom backend proxy (localhost:5000), never directly to Repliers.
  - **Secret Isolation**: The Repliers API key (REPLIERS-API-KEY) requires strict confidentiality and lives exclusively on the server in ackend/.env. Mapbox uses a public access token (pk.*) exposed via rontend/.env with the VITE_ prefix.
  - **Data vs. Rendering Decoupling**: Repliers handles MLS property data, while Mapbox GL JS handles spatial rendering on the client. Neither service is aware of the other; React connects them by taking coordinates (map.latitude, map.longitude) from the reshaped listings and feeding them as [longitude, latitude] markers to Mapbox.
- **Verification**: Verified understanding of data flow, security boundary, and coordinate order expectations.

---

## Level 1: Development Environment Setup

- **Goal**: Verify prerequisites (Node.js runtime, Git version control), set up the root project directory, establish ignore rules, and create the baseline repository structure.
- **What Was Implemented**:
  - Confirmed Node.js version (22.18.0, satisfying the Node 18+ requirement for native etch).
  - Confirmed Git version (git version 2.55.0.windows.5).
  - Initialized empty Git repository in the project root.
  - Created .gitignore ignoring dependencies (
ode_modules/), secrets (.env), build outputs (dist/), and OS files (.DS_Store).
  - Created README.md introducing the architecture and components.
  - Initialized PROJECTDOC.md as the running build log.
  - Initialized BUGFIX.md as the running issue resolution log.
- **Decisions & Configuration**:
  - Node 22.18.0 was detected and confirmed suitable for running both modern ES modules and native fetch without polyfills.
  - Scaffolding of rontend/ and ackend/ was deliberately postponed to subsequent levels per the strict level-by-level progression rules.
- **How It Was Verified**:
  - Executed 
ode -v and git --version cleanly.
  - Executed git status to verify repository initialization and clean tracking of root setup files.
