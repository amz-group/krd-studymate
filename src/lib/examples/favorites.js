// Local-first favorites & recently-used for examples (no login, no cloud).
const FAV_KEY = 'krd_studymate_example_favorites';
const RECENT_KEY = 'krd_studymate_example_recent';

function readArr(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeArr(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch { /* ignore */ }
}

export function getFavorites() {
  return readArr(FAV_KEY);
}
export function isFavorite(id) {
  return readArr(FAV_KEY).includes(id);
}
export function toggleFavorite(id) {
  const favs = readArr(FAV_KEY);
  const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  writeArr(FAV_KEY, next);
  return next;
}

export function getRecent() {
  return readArr(RECENT_KEY);
}
export function pushRecent(id) {
  const cur = readArr(RECENT_KEY).filter((x) => x !== id);
  writeArr(RECENT_KEY, [id, ...cur].slice(0, 12));
}