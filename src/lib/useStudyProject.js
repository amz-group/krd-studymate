import { useState, useEffect, useRef, useCallback } from 'react';
import { saveProject } from './db';
import { nowISO } from './db';

// Manages a study project: live state + debounced auto-save to IndexedDB.
// Does NOT save on every keystroke — saves after a quiet period.
export function useStudyProject(initial) {
  const [project, setProject] = useState(initial);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const timer = useRef(null);
  const first = useRef(true);

  // If the parent passes a new project (e.g. open another), sync.
  useEffect(() => { setProject(initial); first.current = true; }, [initial]);

  const persist = useCallback(async (p) => {
    setSaveState('saving');
    try {
      const toSave = { ...p, updated_date: nowISO() };
      await saveProject(toSave);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1200);
    } catch {
      setSaveState('idle');
    }
  }, []);

  // Debounced auto-save on project change.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(project), 900);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [project, persist]);

  const update = useCallback((updater) => {
    setProject((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  // Update a sub-field of content.
  const updateContent = useCallback((key, value) => {
    setProject((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
      updated_date: nowISO(),
    }));
  }, []);

  const saveNow = useCallback(() => persist(project), [project, persist]);

  return { project, update, updateContent, saveState, saveNow };
}