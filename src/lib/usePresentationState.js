import { useState, useCallback, useMemo } from 'react';

// Undo/redo-aware state for the presentation object.
// `update` accepts either a function (present => next) or a partial object.
export function usePresentationState(initial) {
  const [history, setHistory] = useState({ past: [], present: initial, future: [] });

  const update = useCallback((updater) => {
    setHistory(({ past, present, future }) => {
      const next = typeof updater === 'function' ? updater(present) : { ...present, ...updater };
      if (next === present) return { past, present, future };
      return { past: [...past.slice(-49), present], present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(({ past, present, future }) => {
      if (!past.length) return { past, present, future };
      const previous = past[past.length - 1];
      return { past: past.slice(0, -1), present: previous, future: [present, ...future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(({ past, present, future }) => {
      if (!future.length) return { past, present, future };
      const next = future[0];
      return { past: [...past, present], present: next, future: future.slice(1) };
    });
  }, []);

  return useMemo(
    () => ({
      presentation: history.present,
      update,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    [history, update, undo, redo]
  );
}