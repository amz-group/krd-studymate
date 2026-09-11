import ElementView from './ElementView';

// Presentational + event-forwarding. All drag/resize math lives in EditorCanvas.
// The inner content has pointer-events:none so clicks anywhere on the element
// reach this wrapper (reliable selection), except the inline text textarea.
export default function CanvasElement({ el, box, selected, editing, onStartDrag, onStartEdit, onEndEdit, onContextMenu }) {
  const handles = ['nw', 'ne', 'sw', 'se'];
  const handlePos = {
    nw: { left: '-5px', top: '-5px', cursor: 'nwse-resize' },
    ne: { right: '-5px', top: '-5px', cursor: 'nesw-resize' },
    sw: { left: '-5px', bottom: '-5px', cursor: 'nesw-resize' },
    se: { right: '-5px', bottom: '-5px', cursor: 'nwse-resize' },
  };
  return (
    <div
      onPointerDown={(e) => onStartDrag(e, el.id, 'move')}
      onDoubleClick={(e) => { e.stopPropagation(); if (el.type === 'text' && !el.locked) onStartEdit(el.id); }}
      onContextMenu={(e) => { e.stopPropagation(); onContextMenu(e); }}
      style={{
        position: 'absolute', left: box.x, top: box.y, width: box.width, height: box.height,
        transform: `rotate(${el.rotation || 0}deg)`, zIndex: el.zIndex || 0,
        cursor: el.locked ? 'default' : 'move',
      }}
    >
      {editing ? (
        <textarea
          autoFocus
          defaultValue={el.content.text}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.target.blur(); } e.stopPropagation(); }}
          onBlur={(e) => onEndEdit(el.id, e.target.value)}
          style={{
            width: '100%', height: '100%', boxSizing: 'border-box', resize: 'none', border: 'none', outline: 'none',
            padding: '4px', margin: 0, background: 'rgba(255,255,255,0.95)', color: el.content.color,
            fontFamily: 'inherit', fontSize: `${el.content.size}px`, lineHeight: el.content.lineHeight,
            textAlign: el.content.align, fontWeight: el.content.bold ? 700 : 400, fontStyle: el.content.italic ? 'italic' : 'normal',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <ElementView el={el} />
        </div>
      )}
      {selected && !editing && (
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #2563eb', pointerEvents: 'none' }} />
      )}
      {selected && !el.locked && !editing && handles.map((h) => (
        <div key={h} onPointerDown={(e) => onStartDrag(e, el.id, 'resize', h)} style={{
          position: 'absolute', width: 10, height: 10, background: '#fff', border: '2px solid #2563eb', borderRadius: 2,
          ...handlePos[h],
        }} />
      ))}
      {el.locked && selected && (
        <div style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, background: '#000', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>🔒</div>
      )}
    </div>
  );
}