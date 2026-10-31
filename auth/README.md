# Authentication frontend (`/auth/`)

This is a static HTML/CSS/JavaScript frontend for the Express authentication API described in the project brief. It is designed to be copied into the `auth/` directory of your existing GitHub Pages repository.

## Files

- `index.html` — sign-in page and entry point for `https://your-domain.example/auth/`
- `register.html` — create-account form
- `dashboard.html` — profile page that checks the signed-in session with the backend
- `css/style.css` — shared responsive styling
- `js/config.js` — backend address and API route configuration
- `js/auth.js` — form handling, API requests, session check, profile display, and sign-out

## 1. Set the Redmi backend address

Open `js/config.js` and edit `API_BASE_URL`:

```js
API_BASE_URL: "http://192.168.29.64:3000",
```

That is the Redmi Wi-Fi address supplied in the project brief. It may change when the phone reconnects to Wi-Fi. Replace it with the current address when necessary.

This is public frontend configuration. Never put your `.env` values, session secret, passwords, or database file in this directory.

## 2. Expected API contract

The frontend currently calls these endpoints:

| Method | Path | JSON request body |
| --- | --- | --- |
| `POST` | `/auth/register` | `{ "username": "...", "email": "...", "password": "..." }` |
| `POST` | `/auth/login` | `{ "email": "...", "password": "..." }` |
| `POST` | `/auth/logout` | none |
| `GET` | `/auth/me` | none |

The frontend expects the API to use an HTTP session cookie. Fetch requests therefore use `credentials: "include"`.

For the profile, `/auth/me` should return either a user object directly or an object shaped like `{ "user": { "id": 1, "username": "...", "email": "...", "created_at": "..." } }`. The page handles both shapes.

The registration and login endpoints should return JSON with a helpful `message` when possible. The backend must validate all fields, enforce unique email addresses, hash passwords with bcrypt, and never return password hashes to the browser.

## 3. Add it to your existing GitHub repository

Extract this ZIP. Copy the included `auth` folder into the **root** of your existing website repository, so the repository looks like this:

```text
your-existing-repository/
├── (your existing website files stay here)
└── auth/
    ├── index.html
    ├── register.html
    ├── dashboard.html
    ├── README.md
    ├── css/
    │   └── style.css
    └── js/
        ├── config.js
        └── auth.js
```

Do not replace your existing root `index.html` or any other website files. Only add the new `auth/` folder. GitHub Pages will then serve it at `/auth/` once the change is published.

## 4. Important local-testing note

GitHub Pages is HTTPS, while the current Redmi API address is plain HTTP. Browsers block an HTTPS page from calling an HTTP API as mixed content. For the first local test, serve this static folder from your laptop over a local HTTP development server and use the Redmi's current Wi-Fi IP in `config.js`.

The backend must also allow the exact frontend origin through CORS with credentials enabled. The session cookie settings must be compatible with the origins and protocol being used. Because the laptop frontend and Redmi API are on different hosts, browser cross-site-cookie rules may prevent a session cookie from being stored or sent over plain HTTP. Do not weaken production cookie settings to work around this. We should configure and test the local development cookie/CORS setup deliberately before connecting the pages to your existing backend.

A common CORS configuration needs to:

- allow only the development frontend origin (not `*` when credentials are used);
- set `credentials: true`;
- handle preflight `OPTIONS` requests.

For public deployment, use HTTPS for both the website and API, configure secure session cookies, use a persistent production session store, and enforce backend-side authorization on every private route.

## 5. Test the frontend without the backend

You can open the HTML files to inspect the layout, but form submission needs the API. A local development server (for example, VS Code Live Server) is preferable to opening files directly with `file://`.

The dashboard is not secured merely because JavaScript redirects signed-out visitors. The backend must validate the session on `/auth/me` and on every future private data endpoint. Never send private account data to the browser before the backend has checked the session.

## Scope of this first frontend stage

This package includes registration, login, logout, session checking, and a basic profile dashboard. Password reset and email verification are not included yet because the backend routes and email workflow have not been verified. We should add those pages only after agreeing on the matching secure backend endpoints and token workflow.
