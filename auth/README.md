# Authentication frontend (`/auth/`)

This folder contains the static HTML/CSS/JavaScript interface for the Express authentication API.

## Files

- `index.html` — sign-in page
- `register.html` — create-account page
- `dashboard.html` — profile page; it checks the signed-in session with the backend
- `css/style.css` — shared responsive styling
- `js/config.js` — same-origin API configuration
- `js/auth.js` — form handling, API requests, session check, profile display, and sign-out

## Local development with the Redmi backend

For the first working test, serve the frontend from the same Express server as the API. This avoids the browser blocking GitHub Pages HTTPS requests to the Redmi's plain HTTP address, and avoids needing cross-origin cookies or CORS for this local test.

1. Copy this entire `auth` folder into `~/website-backend/public/` on the Redmi. The final path must be:

   `~/website-backend/public/auth/index.html`

2. In the backend `server.js`, add `const path = require("path");` near the other imports.

3. After the session middleware and before `app.use("/auth", authRoutes);`, add:

   ```js
   app.use("/auth", express.static(path.join(__dirname, "public", "auth")));
   ```

4. Keep the existing API route immediately after it:

   ```js
   app.use("/auth", authRoutes);
   ```

   Static files are served when a matching file exists. API paths such as `/auth/login` continue to fall through to the router.

5. Restart the backend and open this URL on the laptop, while both devices are on the same Wi-Fi:

   `http://192.168.29.64:3000/auth/`

   Replace the IP if the Redmi's Wi-Fi address changes.

`js/config.js` uses `window.location.origin`, so API requests automatically go to the same host and port that served the page. Do not open the GitHub Pages copy for this local HTTP test.

## API contract

| Method | Path | JSON request body |
| --- | --- | --- |
| `POST` | `/auth/register` | `{ "username": "...", "email": "...", "password": "..." }` |
| `POST` | `/auth/login` | `{ "email": "...", "password": "..." }` |
| `POST` | `/auth/logout` | none |
| `GET` | `/auth/me` | none |

The frontend sends `credentials: "include"` so the browser can use the Express session cookie. The `/auth/me` endpoint should return a user object directly or `{ "user": { ... } }`.

## GitHub Pages and public deployment

GitHub Pages can host the static frontend, but it cannot run Express. The current Redmi URL is an HTTP address on a private Wi-Fi network and is not a public production API. Do not expose the Redmi server to the internet for this test.

When a backend is deployed publicly, it must use HTTPS, a persistent session store, secure cookie settings, restricted CORS if frontend and API use different origins, rate limiting, CSRF protections appropriate to the architecture, and server-side authorization for every private endpoint. At that point, update `API_BASE_URL` to the public HTTPS backend origin and test the cookie/CORS configuration deliberately.

## Security scope

This is a learning-stage frontend. The dashboard's visual redirect is not security by itself; the backend must validate the session for `/auth/me` and every private API route. Password reset and email verification are not included until the matching backend token and email workflows exist.
