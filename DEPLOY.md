# ChatWave deployment

## Render

1. Create a **PostgreSQL** database in Render.
2. Create a **Web Service** from the GitHub repository.
3. Set Runtime to **Docker** and branch to `main`.
4. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL`: the PostgreSQL **internal** connection string from Render
   - `JWT_SECRET`: a long random secret, at least 32 characters
5. Deploy. The server listens on Render's `PORT` and creates its tables on startup.

The browser app, REST API, and Socket.IO server run from the same service. Render's HTTPS URL provides the secure WebSocket (`wss`) connection.

## Local setup

```bash
cp .env.example .env
npm install
npm start
```

Use a local PostgreSQL database in `DATABASE_URL`, then open `http://localhost:8787`.
