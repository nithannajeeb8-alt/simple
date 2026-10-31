(() => {
  "use strict";

  const config = window.AUTH_CONFIG;
  if (!config || !config.API_BASE_URL || !config.ENDPOINTS) {
    console.error("Authentication configuration is missing. Check js/config.js.");
    return;
  }

  const apiBase = config.API_BASE_URL.replace(/\/+$/, "");

  function setMessage(element, message, type = "") {
    if (!element) return;
    element.textContent = message || "";
    element.classList.remove("error", "success");
    if (type) element.classList.add(type);
  }

  function setLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
  }

  function getErrorMessage(payload, fallback) {
    if (payload && typeof payload.message === "string") return payload.message;
    if (payload && typeof payload.error === "string") return payload.error;
    return fallback;
  }

  async function apiRequest(endpoint, options = {}) {
    let response;
    try {
      response = await fetch(`${apiBase}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {})
        }
      });
    } catch (error) {
      const networkError = new Error(
        "Could not reach the backend. Check that the Redmi server is running, both devices are on the same Wi-Fi, and API_BASE_URL in js/config.js has the Redmi's current IP address."
      );
      networkError.cause = error;
      throw networkError;
    }

    const contentType = response.headers.get("content-type") || "";
    let payload = null;
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      payload = text ? { message: text } : null;
    }

    if (!response.ok) {
      const fallback = response.status === 401
        ? "Your session is not valid. Please sign in again."
        : `The server returned an error (${response.status}).`;
      const error = new Error(getErrorMessage(payload, fallback));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  function getUserFromResponse(payload) {
    if (!payload || typeof payload !== "object") return null;
    // Accept the common { user: {...} } response and a direct user object.
    if (payload.user && typeof payload.user === "object") return payload.user;
    if (payload.data && typeof payload.data === "object") {
      if (payload.data.user && typeof payload.data.user === "object") return payload.data.user;
      return payload.data;
    }
    return payload;
  }

  function formatDate(value) {
    if (!value) return "Not provided";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric", month: "short", day: "numeric"
    }).format(date);
  }

  function enablePasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.togglePassword);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.textContent = show ? "Hide" : "Show";
        button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      });
    });
  }

  async function initLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    const message = document.getElementById("login-message");
    const submit = document.getElementById("login-submit");

    // If the visitor already has a valid session, go straight to the dashboard.
    try {
      await apiRequest(config.ENDPOINTS.me, { method: "GET" });
      window.location.replace("dashboard.html");
      return;
    } catch (error) {
      // A 401 here is normal for a signed-out visitor. Other errors are shown only on submit.
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(message, "");
      const emailInput = form.elements.email;
      const passwordInput = form.elements.password;
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!emailInput.checkValidity()) {
        setMessage(message, "Enter a valid email address.", "error");
        emailInput.focus();
        return;
      }
      if (!password) {
        setMessage(message, "Enter your password.", "error");
        passwordInput.focus();
        return;
      }

      setLoading(submit, true);
      try {
        await apiRequest(config.ENDPOINTS.login, {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        setMessage(message, "Signed in. Opening your dashboard…", "success");
        window.location.assign("dashboard.html");
      } catch (error) {
        setMessage(message, error.message || "Sign in failed. Please try again.", "error");
      } finally {
        setLoading(submit, false);
      }
    });
  }

  async function initRegisterPage() {
    const form = document.getElementById("register-form");
    if (!form) return;
    const message = document.getElementById("register-message");
    const submit = document.getElementById("register-submit");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(message, "");

      const usernameInput = form.elements.username;
      const emailInput = form.elements.email;
      const passwordInput = form.elements.password;
      const confirmInput = form.elements.confirmPassword;
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

      if (!usernameInput.checkValidity() || username.length < 2) {
        setMessage(message, "Username must contain at least 2 characters.", "error");
        usernameInput.focus();
        return;
      }
      if (!emailInput.checkValidity()) {
        setMessage(message, "Enter a valid email address.", "error");
        emailInput.focus();
        return;
      }
      if (password.length < 8) {
        setMessage(message, "Use a password with at least 8 characters.", "error");
        passwordInput.focus();
        return;
      }
      if (password !== confirmPassword) {
        setMessage(message, "The passwords do not match.", "error");
        confirmInput.focus();
        return;
      }

      setLoading(submit, true);
      try {
        await apiRequest(config.ENDPOINTS.register, {
          method: "POST",
          body: JSON.stringify({ username, email, password })
        });
        setMessage(message, "Account created. You can now sign in.", "success");
        form.reset();
        window.setTimeout(() => window.location.assign("index.html"), 1200);
      } catch (error) {
        setMessage(message, error.message || "Registration failed. Please try again.", "error");
      } finally {
        setLoading(submit, false);
      }
    });
  }

  async function initDashboardPage() {
    const message = document.getElementById("dashboard-message");
    const logoutButton = document.getElementById("logout-button");

    try {
      const payload = await apiRequest(config.ENDPOINTS.me, { method: "GET" });
      const user = getUserFromResponse(payload);
      if (!user || (!user.email && !user.username && !user.id)) {
        throw new Error("The server did not return profile information in the expected format.");
      }

      const username = user.username || user.name || "Not provided";
      const email = user.email || "Not provided";
      document.getElementById("profile-username").textContent = username;
      document.getElementById("profile-email").textContent = email;
      document.getElementById("profile-created").textContent = formatDate(user.created_at || user.createdAt);
      document.getElementById("profile-id").textContent = user.id ?? "Not provided";
      document.getElementById("profile-avatar").textContent = (username !== "Not provided" ? username.trim().charAt(0) : "U").toUpperCase();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        window.location.replace("index.html");
        return;
      }
      setMessage(message, error.message || "Could not load your profile.", "error");
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        setLoading(logoutButton, true);
        setMessage(message, "");
        try {
          await apiRequest(config.ENDPOINTS.logout, { method: "POST" });
          window.location.replace("index.html");
        } catch (error) {
          setMessage(message, error.message || "Sign out failed. Please try again.", "error");
        } finally {
          setLoading(logoutButton, false);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    enablePasswordToggles();
    const page = document.body.dataset.page;
    if (page === "login") initLoginPage();
    if (page === "register") initRegisterPage();
    if (page === "dashboard") initDashboardPage();
  });
})();
