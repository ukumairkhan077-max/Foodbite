// lib/apiClient.js
// Single place that talks to the backend. Since the frontend and backend now live
// in the same Next.js app, this defaults to a relative path — no separate host needed.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function getStoredToken() {
  if (typeof window === "undefined") return null; // guard for server-side rendering
  return localStorage.getItem("authToken");
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getStoredToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: "include", // also send the httpOnly cookie, as a fallback
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
