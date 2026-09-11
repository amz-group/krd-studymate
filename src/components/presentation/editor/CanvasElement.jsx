import { useRef, useState } from 'react';
import ElementView from './ElementView';
import { snapBox, clamp } from '@/lib/editorUtils';

const MIN = 24;

// Interactive wrapper for one element: select, drag (with snapping), resize,
// inline text editing. Commits to presentation state on pointer up (one undo
// entry per action — not per mouse move).
export default function CanvasElement({
  el, scale, selected, editing, peers, slideW, slideH, snap,
  onSelect, onChange, onStartEdit, onEndEdit,
}) {
  const [live, setLive] = useState(null);
  const [guides, setGuides] = useState({ x: null, y: null });
  const liveRef = useRef(null);
  liveRef.current = live;
  const dragRef = useRef(null);

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    e.preventDefault();
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.mode === 'move') {
      let nx = d.ox + dx;
      let ny = d.oy + dy;
      let g = { x: null, y: null };
      if (snap) {
        const s = snapBox({ x: nx, y: ny, width: d.w, height: d.h }, peers, slideW, slideH);
        nx = s.x; ny = s.y; g = { x: s.snapX, y: s.snapY };
      }
      nx = clamp(nx, -d.w + 40, slideW - 40);
      ny = clamp(ny, -d.h + 40, slideH - 40);
      setLive({ x: nx, y: ny, width: d.w, height: d.h });
      setGuides(g);
    } else {
      let nw = d.w, nh = d.h, nx = d.ox, ny = d.oy;
      if (d.handle.includes('e')) nw = Math.max(MIN, d.w + dx);
      if (d.handle.includes('s')) nh = Math.max(MIN, d.h + dy);
      if (d.handle.includes('w')) { nw = Math.max(MIN, d.w - dx); nx = d.ox + (d.w - nw); }
      if (d.handle.includes('n')) { nh = Math.max(MIN, d.h - dy); ny = d.oy + (d.h - nh); }
      setLive({ x: nx, y: ny, width: nw, height: nh });
    }
  };

  const onUp = () => {
    const d = dragRef.current;
    const box = liveRef.current;
    dragRef.current = null;
    setGuides({ x: null, y: null });
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (d && box) {
      if (d.mode === 'move') onChange({ x: box.x, y: box.y });
      else onChange({ x: box.x, y: box.y, width: box.width, height: box.height });
    }
    setLive(null);
  };

  const beginDrag = (e, mode, handle) => {
    e.stopPropagation();
    onSelect(el.id);
    if (el.locked || editing) return;
    dragRef.current = { mode, handle, startX: e.clientX, startY: e.clientY, ox: el.x, oy: el.y, w: el.width, h: el.height };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const box = live || { x: el.x, y: el.y, width: el.width, height: el.height };
  const handles = ['nw', 'ne', 'sw', 'se'];
  const handlePos = {
    nw: { left: '-6px', top: '-6px', cursor: 'nwse-resize' },
    ne: { right: '-6px', top: '-6px', cursor: 'nesw-resize' },
    sw: { left: '-6px', bottom: '-6px', cursor: 'nesw-resize' },
    se: { right: '-6px', bottom: '-6px', cursor: 'nwse-resize' },
  };

  return (
    <>
      <div
        onPointerDown={(e) => beginDrag(e, 'move')}
        onDoubleClick={(e) => { e.stopPropagation(); if (el.type === 'text') onStartEdit(el.id); }}
        style={{
          position: 'absolute', left: box.x, top: box.y, width: box.width, height: box.height,
          transform: `rotate(${el.rotation || 0}deg)`, zIndex: el.zIndex || 0, cursor: el.locked ? 'default' : 'move',
        }}
      >
        {editing ? (
          <textarea
            autoFocus
            defaultValue={el.content.text}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => onEndEdit(el.id, e.target.value)}
            style={{
              width: '100%', height: '100%', boxSizing: 'border-box', resize: 'none', border: 'none', outline: 'none',
              padding: '4px', margin: 0, background: 'rgba(255,255,255,0.9)', color: el.content.color,
              fontFamily: 'inherit', fontSize: `${el.content.size}px`, lineHeight: el.content.lineHeight,
              textAlign: el.content.align, fontWeight: el.content.bold ? 700 : 400, fontStyle: el.content.italic ? 'italic' : 'normal',
            }}
          />
        ) : (
          <ElementView el={el} />
        )}
        {selected && !editing && (
          <div style={{ position: 'absolute', inset: 0, border: '2px solid #2563eb', pointerEvents: 'none' }} />
        )}
        {selected && !el.locked && !editing && handles.map((h) => (
          <div key={h} onPointerDown={(e) => beginDrag(e, 'resize', h)} style={{
            position: 'absolute', width: 12, height: 12, background: '#fff', border: '2px solid #2563eb', borderRadius: 2,
            ...handlePos[h],
          }} />
        ))}
        {el.locked && selected && (
          <div style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, background: '#000', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>🔒</div>
        )}
      </div>
      {guides.x !== null && (
        <div style={{ position: 'absolute', left: guides.x, top: 0, width: 1, height: slideH, background: '#ec4899', pointerEvents: 'none' }} />
      )}
      {guides.y !== null && (
        <div style={{ position: 'absolute', top: guides.y, left: 0, height: 1, width: slideW, background: '#ec4899', pointerEvents: 'none' }} />
      )}
    </>
  );
}