# Render Single-Service Deployment

This repository is configured to run frontend + backend together as one Render Web Service.

## What runs in one service

- React frontend is built from `frontend/` during `npm run build`.
- Node/Express backend starts from `backend/server.js` with `npm start`.
- Backend serves `frontend/dist` and API routes under `/api`.

## Database note

Render Web Services do not run MongoDB as a managed service in this repository.
Use an external MongoDB URI (for example MongoDB Atlas) in `MONGO_URI`.

## Deploy using `render.yaml`

1. In Render, create a new Blueprint and select this repository.
2. Render will read `render.yaml`.
3. Set the following env vars when prompted:
   - `MONGO_URI`: your MongoDB connection string.
   - `CLIENT_URL`: your final Render app URL, for example `https://your-app.onrender.com`.
4. Deploy.

## Default users

`SEED_DEFAULT_USERS=true` in `render.yaml` seeds default users only when the database is empty.
Set it to `false` after first successful deployment if you do not want startup seed checks.

## Local sanity check

Run from repo root:

```bash
npm run build
npm start
```

Health endpoint:

- `GET /api/health`
