import axios from "axios";

console.log("RAW VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("RESOLVED API BASE URL =", resolveApiBaseUrl());

function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_BASE_URL || "").trim();

  if (!raw) {
    return "/api";
  }

  // If a full origin is provided without a path, default to /api.
  if (/^https?:\/\//i.test(raw)) {
    const withoutTrailingSlash = raw.replace(/\/+$/, "");
    const hasPath = /^https?:\/\/[^/]+\/.+/i.test(withoutTrailingSlash);
    return hasPath ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return normalized.replace(/\/+$/, "") || "/api";
}

const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

export function withAuth(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

export default api;
