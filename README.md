# Feedants Competition Details Module

A full-stack competition details app built with React Native + Expo on the frontend and Node.js + Express + MongoDB on the backend.

## Project structure

- [backend](backend) — API server, Mongo models, business logic, and seed data
- [frontend](frontend) — Expo app for the competition details screen
- [README.md](README.md) — setup and submission notes

## Tech stack

- Frontend: React Native, Expo, Axios
- Backend: Node.js, Express
- Database: MongoDB with automatic in-memory fallback for local development

## Quick start

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Start the backend

From the backend folder:

```bash
cd backend
node src/server.js
```

The API runs on port `5000` by default.

### 3) Start the frontend

From the frontend folder:

```bash
cd frontend
$env:CI='1'
npx expo start --web --port 8084
```

If port `8084` is busy, choose another free port and update the frontend `API_BASE_URL` as needed.

## Environment variables

The backend uses the following environment variables if present:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/feedants
```

If `MONGO_URI` is missing, the app automatically starts an in-memory MongoDB instance for local development.

## Demo data

The backend auto-seeds demo competition data on startup, including:

- `ai-bootcamp-2026`

## API endpoints

- `GET /health`
- `GET /api/competitions/:slug`
- `POST /api/competitions/:slug/register`
- `DELETE /api/competitions/:slug/register`

## Important assumptions

- A single demo user (`demo-user`) is used for registration flows in this assignment.
- The backend is the source of truth for seat counts, lifecycle status, and registration validity.
- The frontend is designed to read live backend state instead of simulating data locally.
- The app is intended for local demo use, not a production authentication system.

## Major technical decisions

- Registration data is kept in a separate `Registration` collection to keep competition records normalized.
- Capacity and status checks are enforced on the server, preventing front-end-only bypass.
- Unique document constraints prevent duplicate registrations for the same user and competition.
- Competition state is calculated centrally based on time, capacity, and registration deadlines.
- The UI is structured so it can react to API-driven changes without hardcoded state mismatches.

## Trade-offs and production improvements

- Demo-user identity replaces a real login flow for simplicity and local execution.
- The in-memory MongoDB fallback makes setup easy but is not suitable for production workloads.
- For production, I would add real authentication, stronger concurrency protections, rate limiting, monitoring, test coverage, and a more scalable admin workflow.

## Verification performed

The following checks were run successfully during development:

- backend health endpoint responded successfully
- competition data was fetched from `GET /api/competitions/ai-bootcamp-2026?userId=demo-user`
- registration flow succeeded through the API and updated the competition state
- the frontend was started in Expo web mode and rendered the screen locally

## Notes for submission

This implementation satisfies the assignment requirement of being dynamic and data-backed rather than a static UI mock. The logic is backed by a real backend and MongoDB model, with the frontend reflecting live server state.
