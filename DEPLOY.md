# Deploy ChatWave AVN

1. Push this folder to a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Select Docker deployment. Render will use the included `Dockerfile`.
4. Deploy the service and open the generated HTTPS URL.

The server uses the Render-provided `PORT` value and supports WebSocket connections automatically. This prototype stores messages in memory; add a database before production use so messages survive restarts.
