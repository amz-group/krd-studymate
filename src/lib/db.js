// Local-first IndexedDB storage for KRD StudyMate projects.
// No external database, no cloud sync — everything stays on the device.

const DB_NAME = 'krd_studymate';
const DB_VERSION = 1;
const STORE = 'projects';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('updated_date', 'updated_date', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProjects() {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE, 'readonly');
    const result = await reqToPromise(tx.objectStore(STORE).getAll());
    return result || [];
  } finally {
    db.close();
  }
}

export async function getProject(id) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE, 'readonly');
    return await reqToPromise(tx.objectStore(STORE).get(id));
  } finally {
    db.close();
  }
}

// Create or update a project (auto-save friendly: pass the whole object).
export async function saveProject(project) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    await reqToPromise(tx.objectStore(STORE).put(project));
    await tx.done;
    return project;
  } finally {
    db.close();
  }
}

export async function deleteProject(id) {
  const db = await openDB();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    await reqToPromise(tx.objectStore(STORE).delete(id));
    await tx.done;
  } finally {
    db.close();
  }
}

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowISO() {
  return new Date().toISOString();
}

// Build a fresh project shell. `content` is left empty for Step 1;
// the advanced tools (Steps 2–5) will populate it.
export function createProjectShell(type, name) {
  const ts = nowISO();
  return {
    id: createId(),
    name,
    type,            // presentation | poster | report
    content: {},
    created_date: ts,
    updated_date: ts,
  };
}