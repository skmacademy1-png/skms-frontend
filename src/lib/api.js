/* skms-backend client. Local Vite development uses the local API by default.
  For a deployed build, set VITE_API_URL to the live backend URL in the hosting provider. */
const LOCAL_API_URL = 'http://localhost:4000';
// Production API: https://skms-backend-xgcx.onrender.com
const LIVE_API_URL = 'https://skms-backend-xgcx.onrender.com';
export const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? LOCAL_API_URL : LIVE_API_URL)).replace(/\/+$/, '');

/* null when the API can't be reached (asleep, offline, timed out), else { ok, status, data }.
   A free Render service takes ~50s to wake, so the default timeout outlasts that. */
export async function api(path, { timeout = 70_000, ...opts } = {}) {
  try {
    const res = await fetch(API_URL + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      signal: AbortSignal.timeout(timeout),
    });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return null;
  }
}

export const ls = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, v) { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};
