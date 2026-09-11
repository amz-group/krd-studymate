import { useState, useEffect, useCallback } from 'react';
import { getAllProjects, saveProject, deleteProject, createId, nowISO } from './db';

// Shared hook for loading + managing projects from IndexedDB.
// Used by Home (recent) and My Projects (full list).
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllProjects();
      all.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      setProjects(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const rename = useCallback(async (id, name) => {
    const all = await getAllProjects();
    const proj = all.find((p) => p.id === id);
    if (!proj) return;
    const updated = { ...proj, name, updated_date: nowISO() };
    await saveProject(updated);
    await reload();
  }, [reload]);

  const duplicate = useCallback(async (id) => {
    const all = await getAllProjects();
    const proj = all.find((p) => p.id === id);
    if (!proj) return;
    const copy = {
      ...proj,
      id: createId(),
      name: `${proj.name} (copy)`,
      created_date: nowISO(),
      updated_date: nowISO(),
    };
    await saveProject(copy);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id) => {
    await deleteProject(id);
    await reload();
  }, [reload]);

  const removeAll = useCallback(async () => {
    const all = await getAllProjects();
    await Promise.all(all.map((p) => deleteProject(p.id)));
    await reload();
  }, [reload]);

  return { projects, loading, reload, rename, duplicate, remove, removeAll };
}