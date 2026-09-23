# Feedants Competition Details Module

This repository contains a functional full-stack implementation of the Feedants Competition Details feature using React Native on the frontend and Node.js + Express with MongoDB on the backend.

## Project structure

- [backend](backend) — Express API, MongoDB models, and the competition logic
- [frontend](frontend) — Expo React Native app showing the competition details screen

## Tech stack

- Frontend: React Native + Expo
- Backend: Node.js + Express
- Database: MongoDB (with an in-memory Mongo fallback for local development)

## Setup

### 1) Backend

```bash
cd backend
npm install
node src/server.js
```

If you want to reseed demo data manually:

```bash
cd backend
node seed.js
```

### 2) Frontend

```bash
cd frontend
npm install
npx expo start
```

For Android emulators, the app is configured to use `http://10.0.2.2:5000`.
For iOS simulators or local web testing, it falls back to `http://localhost:5000`.

## Environment variables

The backend reads the following values if provided:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/feedants
```

If `MONGO_URI` is not set, the application uses an in-memory MongoDB instance automatically for local development.

## Demo data

The server auto-seeds a default competition record when the database is empty, including the main competition used by the UI:

- `ai-bootcamp-2026`

## Core API endpoints

- `GET /health`
- `GET /api/competitions/:slug`
- `POST /api/competitions/:slug/register`
- `DELETE /api/competitions/:slug/register`

## Important assumptions

- The application uses a single demo user identity (`demo-user`) for the competition registration flow.
- The backend is the source of truth for participant counts, registration state, and lifecycle timing.
- The UI is intentionally driven by live API data rather than hardcoded competition values.

## Major technical decisions

- A separate `Registration` collection is used instead of embedding participant data inside the competition document.
- Capacity checks and registration logic are enforced server-side.
- Unique indexes prevent duplicate registration entries for the same user and competition.
- Competition status is derived from current time plus registration and seat constraints, keeping business logic centralized.

## Trade-offs and production improvements

- In this version, the app uses a demo user instead of full authentication.
- A local in-memory Mongo database is used for easy setup; production would use a dedicated MongoDB deployment.
- For a larger-scale production system, I would add real auth, Redis-backed concurrency protection, rate limiting, observability, and a more complete admin panel.

## Verification

The backend was verified with live requests:

- `GET /api/competitions/ai-bootcamp-2026?userId=demo-user` returned the competition payload with status and remaining seats.
- `POST /api/competitions/ai-bootcamp-2026/register` returned a successful registration response.
- The follow-up GET request showed `isUserRegistered: true` and the updated `remainingSeats` value.

The Expo app was started in the local environment, and the mobile client is set up to query the backend at the correct host for Android emulators.
