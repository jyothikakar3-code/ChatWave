# Deploy ChatWave AVN with Streamlit Community Cloud

1. Push this folder to your GitHub repository.
2. Open [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
3. Click **Create app**.
4. Select your `ChatWave` repository and the `main` branch.
5. Set **Main file path** to `streamlit_app.py`.
6. Click **Deploy** and open the generated app URL.

For Render, create a PostgreSQL database, copy its internal connection string into `DATABASE_URL`, and add a long random `JWT_SECRET` environment variable. The server creates the required tables automatically on startup.
