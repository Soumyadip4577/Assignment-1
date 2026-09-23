# Feedants Competition Details App

This React Native app consumes the Feedants competition API and renders a live competition detail screen with dynamic state for lifecycle, registration status, and remaining capacity.

## Setup

1. Start the backend API from the `backend` folder:

```bash
cd backend
npm install
node src/server.js
```

2. Start the Expo app from the `frontend` folder:

```bash
cd frontend
npm install
npx expo start
```

3. Run the app in an emulator or Expo Go.

## Environment

- Backend default port: `5000`
- Default demo user: `demo-user`
- API URL used by the app: `http://localhost:5000`

## Notes

- If `MONGO_URI` is not supplied, the backend starts an in-memory MongoDB instance automatically for local development.
- Demo competition data is seeded with `node backend/seed.js`.

## Important assumptions

- The app assumes a single demo user for registration states, represented by `demo-user`.
- The backend is the source of truth for competition lifecycle and seat availability.
- All visible state is derived from the database rather than being hardcoded in the frontend.

## Production improvements

- Add real authentication and user identity.
- Use Redis for seat-locking and rate limiting under heavy concurrency.
- Add server-side tests and a CI pipeline.
- Expand the API to support a list page and multiple competition filters.
