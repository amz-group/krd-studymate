import { useRef, useEffect, useState } from 'react';
import CanvasElement from '@/components/presentation/editor/CanvasElement';
import { bgCss } from '@/components/presentation/editor/SlideRenderer';
import { isRtl } from '@/lib/posterModel';
import { snapBox, clamp } from '@/lib/editorUtils';

const MIN = 24;
const PAD = 24;

// Center panel for the poster editor. Owns all drag/resize interaction so
// coordinates stay in the poster's logical space (pointer deltas divided by
// the view scale). One commit per gesture = one undo entry.
export default function PosterCanvas({
  poster, baseW, baseH, language, zoomMode, selectedIds, editingId, showGrid, snap,
  onSelect, onCommitMoves, onCommitResize, onStartEdit, onEndEdit, onBackgroundClick, onContextMenu,
}) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitScale = Math.min((size.w - PAD) / baseW, (size.h - PAD) / baseH);
  const fitWidthScale = (size.w - PAD) / baseW;
  const rawScale = zoomMode === 'fit' ? fitScale : zoomMode === 'fitWidth' ? fitWidthScale : Number(zoomMode) / 100;
  const scale = isFinite(rawScale) && rawScale > 0 ? rawScale : 0.1;

  const dragRef = useRef(null);
  const [live, setLive] = useState(null);
  const [guides, setGuides] = useState({ x: null, y: null });
  const liveRef = useRef(null);
  liveRef.current = live;

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    e.preventDefault();
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.mode === 'move') {
      const a = d.orig[d.activeId];
      let nx = a.x + dx, ny = a.y + dy;
      let g = { x: null, y: null };
      if (snap) {
        const peers = poster.elements.filter((el) => !d.orig[el.id]);
        const s = snapBox({ x: nx, y: ny, width: a.width, height: a.height }, peers, baseW, baseH);
        nx = s.x; ny = s.y; g = { x: s.snapX, y: s.snapY };
      }
      const sdx = nx - a.x, sdy = ny - a.y;
      const next = {};
      Object.keys(d.orig).forEach((id) => {
        const o = d.orig[id];
        next[id] = {
          x: clamp(o.x + sdx, -o.width + 40, baseW - 40),
          y: clamp(o.y + sdy, -o.height + 40, baseH - 40),
          width: o.width, height: o.height,
        };
      });
      setLive(next); setGuides(g);
    } else {
      const o = d.orig[d.activeId];
      let nw = o.width, nh = o.height, nx = o.x, ny = o.y;
      if (d.handle.includes('e')) nw = Math.max(MIN, o.width + dx);
      if (d.handle.includes('s')) nh = Math.max(MIN, o.height + dy);
      if (d.handle.includes('w')) { nw = Math.max(MIN, o.width - dx); nx = o.x + (o.width - nw); }
      if (d.handle.includes('n')) { nh = Math.max(MIN, o.height - dy); ny = o.y + (o.height - nh); }
      if (d.aspect && d.handle.length === 2) {
        nh = nw / (o.width / o.height);
        if (d.handle.includes('w')) nx = o.x + (o.width - nw);
        if (d.handle.includes('n')) ny = o.y + (o.height - nh);
      }
      setLive({ [d.activeId]: { x: nx, y: ny, width: nw, height: nh } });
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
      if (d.mode === 'move') onCommitMoves(box);
      else onCommitResize(d.activeId, box[d.activeId]);
    }
    setLive(null);
  };

  const startDrag = (e, elId, mode, handle) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const additive = e.shiftKey;
    let sel;
    if (additive) {
      if (selectedIds.includes(elId)) { onSelect(selectedIds.filter((id) => id !== elId)); return; }
      sel = [...selectedIds, elId]; onSelect(sel);
    } else if (!selectedIds.includes(elId)) {
      sel = [elId]; onSelect(sel);
    } else {
      sel = selectedIds;
    }
    const el = poster.elements.find((x) => x.id === elId);
    if (!el || el.locked || editingId === elId) return;
    const ids = sel.includes(elId) ? sel : [elId];
    const orig = {};
    ids.forEach((id) => {
      const x = poster.elements.find((e2) => e2.id === id);
      if (x) orig[id] = { x: x.x, y: x.y, width: x.width, height: x.height };
    });
    const aspect = mode === 'resize' && (e.shiftKey || (el.type === 'image' && el.content.lockAspect));
    dragRef.current = { mode, handle, startX: e.clientX, startY: e.clientY, activeId: elId, orig, aspect };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const elements = [...poster.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div ref={ref} className="flex-1 min-w-0 overflow-auto bg-muted/40 p-3"
      onPointerDown={(e) => { if (e.button === 0) onBackgroundClick(); }}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, null); }}>
      <div className="min-h-full min-w-full flex items-center justify-center">
        <div style={{ width: baseW * scale, height: baseH * scale, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: baseW, height: baseH, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', direction: isRtl(language) ? 'rtl' : 'ltr', ...bgCss(poster.background) }}>
            {poster.background?.type === 'image' && poster.background.image && (
              <img src={poster.background.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: poster.background.imageOpacity ?? 1, pointerEvents: 'none' }} />
            )}
            {poster.background?.overlay && (
              <div style={{ position: 'absolute', inset: 0, background: poster.background.overlay, opacity: poster.background.overlayOpacity ?? 0.3, pointerEvents: 'none' }} />
            )}
            {showGrid && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#94a3b833 1px, transparent 1px), linear-gradient(90deg, #94a3b833 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
            )}
            {elements.map((el) => (
              <CanvasElement
                key={el.id} el={el} scale={scale}
                box={live?.[el.id] || { x: el.x, y: el.y, width: el.width, height: el.height }}
                selected={selectedIds.includes(el.id)} editing={editingId === el.id}
                onStartDrag={startDrag}
                onStartEdit={onStartEdit}
                onEndEdit={onEndEdit}
                onContextMenu={(e) => onContextMenu(e, el.id)}
              />
            ))}
            {guides.x !== null && (
              <div style={{ position: 'absolute', left: guides.x, top: 0, width: 1, height: baseH, background: '#ec4899', pointerEvents: 'none' }} />
            )}
            {guides.y !== null && (
              <div style={{ position: 'absolute', top: guides.y, left: 0, height: 1, width: baseW, background: '#ec4899', pointerEvents: 'none' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}