/*
 * Frontend configuration.
 * Change API_BASE_URL when your Redmi's Wi-Fi IP changes.
 * When you deploy the backend publicly, replace this with its HTTPS origin.
 * This file is public. Never put passwords, session secrets, or API keys here.
 */
window.AUTH_CONFIG = Object.freeze({
  API_BASE_URL: "http://192.168.29.64:3000",
  ENDPOINTS: Object.freeze({
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me"
  })
});
