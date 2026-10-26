// localStorage wrapper: never throws, validates shape, falls back on malformed data.
const KEY = 'monetra.v1';
export function loadState(fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    const ok = raw && Array.isArray(raw.accounts) && Array.isArray(raw.transactions) && Array.isArray(raw.bills) && Array.isArray(raw.goals) && raw.settings;
    return ok ? { ...fallback, ...raw } : fallback;
  } catch { return fallback; }
}
export function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full/blocked */ } }
export function clearState() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
