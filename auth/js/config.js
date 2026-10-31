/*
 * Frontend configuration for local development.
 *
 * The frontend is served by the same Express server as the API, so using the
 * current origin avoids mixed-content and cross-origin cookie problems.
 * This file is public. Never put passwords, session secrets, or API keys here.
 */
window.AUTH_CONFIG = Object.freeze({
  API_BASE_URL: window.location.origin,
  ENDPOINTS: Object.freeze({
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me"
  })
});
