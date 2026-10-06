// Thin wrappers so a full or blocked storage never crashes the app.
export function readJSON(key, fallback, storage = window.localStorage) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value, storage = window.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key, storage = window.localStorage) {
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}
