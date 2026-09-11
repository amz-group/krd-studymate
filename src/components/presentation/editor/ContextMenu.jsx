import { useEffect, useRef } from 'react';

// Lightweight right-click menu. Closes on outside click, Escape, or scroll.
export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 210);
  const top = Math.min(y, window.innerHeight - 340);
  return (
    <div ref={ref} className="fixed z-50 min-w-48 rounded-md border border-border bg-popover shadow-lg py-1 text-sm" style={{ left, top }}>
      {items.map((it, i) => it.divider ? (
        <div key={i} className="h-px bg-border my-1" />
      ) : (
        <button key={i} type="button" disabled={it.disabled} onClick={() => { it.onClick(); onClose(); }}
          className="flex items-center gap-2 w-full text-start px-3 py-1.5 hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent">
          {it.icon && <it.icon className="h-3.5 w-3.5" />}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}