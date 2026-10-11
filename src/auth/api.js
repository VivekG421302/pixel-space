// REST client for the account service (Spring Boot). See docs/AUTH_API.md for the contract.
//
// Security model:
//  - The short-lived JWT access token lives in memory only (never localStorage / sessionStorage).
//  - The session itself is an httpOnly refresh cookie set by the backend; JS cannot read it.
//  - Requests send credentials and an X-Requested-With header (CSRF guard for cookie-based endpoints).

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
// {{Base Url}} in the docs = VITE_API_BASE_URL + API_PREFIX
export const API_PREFIX = '/api/v1';

export const OAUTH_PROVIDERS = (import.meta.env.VITE_OAUTH_PROVIDERS ?? 'google,github')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

const DEFAULTS = {
  0: 'Cannot reach the account service. You can keep playing as a guest.',
  400: 'Please check the form and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'That request was not allowed.',
  404: 'That account service address was not found.',
  409: 'That email is already registered.',
  422: 'Please check the highlighted fields.',
  429: 'Too many attempts. Please wait a moment and try again.',
};

let accessToken = null;
let expiresAt = 0;
let refreshing = null;

export const getAccessToken = () => accessToken;
export const tokenTtlMs = () => (accessToken ? Math.max(0, expiresAt - Date.now()) : 0);

function setToken(token, expiresIn) {
  accessToken = token || null;
  expiresAt = token && expiresIn ? Date.now() + expiresIn * 1000 : 0;
}
export const clearToken = () => setToken(null);

async function request(path, { method = 'GET', body, auth = false, retry = true } = {}) {
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, DEFAULTS[0]);
  }

  if (res.status === 401 && auth && retry) {
    const ok = await refreshSession().then(() => true, () => false);
    if (ok) return request(path, { method, body, auth, retry: false });
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const fallback = res.status >= 500 ? 'The account service had a problem. Please try again later.' : DEFAULTS[res.status];
    throw new ApiError(res.status, (data && data.message) || fallback || DEFAULTS[400], data && data.errors);
  }
  return data;
}

/** Exchanges the httpOnly refresh cookie for a new access token. Single-flight. */
export function refreshSession() {
  if (!refreshing) {
    refreshing = request(`${API_PREFIX}/auth/refresh`, { method: 'POST' })
      .then((d) => {
        setToken(d.accessToken, d.expiresIn);
        return d;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function establish(path, body) {
  const d = await request(path, { method: 'POST', body });
  setToken(d.accessToken, d.expiresIn);
  return d;
}

export const login = (email, password, remember) => establish(`${API_PREFIX}/auth/login`, { email, password, remember: !!remember });
export const signup = (name, email, password) => establish(`${API_PREFIX}/auth/signup`, { name, email, password });
export const me = () => request(`${API_PREFIX}/auth/me`, { auth: true });
export const forgotPassword = (email) => request(`${API_PREFIX}/auth/forgot-password`, { method: 'POST', body: { email } });
export const resetPassword = (token, password) => request(`${API_PREFIX}/auth/reset-password`, { method: 'POST', body: { token, password } });

export async function logout() {
  try {
    await request(`${API_PREFIX}/auth/logout`, { method: 'POST' });
  } finally {
    clearToken();
  }
}

/** Server-side OAuth2 (Spring Security oauth2Login): the browser is redirected, no tokens travel in the URL. */
export const oauthUrl = (provider) => `${BASE}${API_PREFIX}/auth/oauth2/authorization/${encodeURIComponent(provider)}`;

/** For future features (progress sync): fetch with the bearer token and one automatic refresh on 401. */
export const authFetch = (path, opts = {}) => request(path, { ...opts, auth: true });
