# Feedants Competition API

This backend provides competition detail and registration endpoints for the Feedants technical assignment.

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start MongoDB locally or rely on the in-memory fallback automatically used when `MONGO_URI` is not set.
3. Install dependencies:

```bash
npm install
```

4. Seed demo data:

```bash
node seed.js
```

5. Start the server:

```bash
node src/server.js
```

## API endpoints

- `GET /health` — health check
- `GET /api/competitions/:slug` — fetch the competition details and user registration state
- `POST /api/competitions/:slug/register` — register a user for the competition
- `DELETE /api/competitions/:slug/register` — cancel a registration

## Example request

```bash
curl "http://localhost:5000/api/competitions/ai-bootcamp-2026?userId=demo-user"
```

```bash
curl -X POST http://localhost:5000/api/competitions/ai-bootcamp-2026/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user"}'
```
