import { useEffect, useRef } from 'react';
import { getPageSize } from '@/lib/reportModel';

// The editable document page. The contentEditable is UNCONTROLLED: innerHTML is
// set exactly once on mount, then never re-synced from props — this prevents
// focus loss, typing resets, and text disappearing during React re-renders.
export default function ReportPage({
  editorRef, initialHtml, dir, pageSize, margin, fontFamily, fontSize, lineHeight,
  paragraphSpacing, primaryColor, zoom, onInput, onSelectionChange, onBlur,
}) {
  const localRef = useRef(null);
  const ref = editorRef || localRef;
  const ps = getPageSize(pageSize);

  useEffect(() => {
    if (ref.current && initialHtml != null) {
      ref.current.innerHTML = initialHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vars = {
    '--rd-para-space': `${paragraphSpacing}px`,
    '--rd-line-height': String(lineHeight),
    '--rd-primary': primaryColor || '#1e293b',
    fontFamily,
    fontSize: `${fontSize}pt`,
    direction: dir === 'rtl' ? 'rtl' : 'ltr',
  };

  return (
    <div className="flex justify-center p-4 md:p-10" style={{ background: '#525659', minHeight: '100%' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        <div
          className="rd-page"
          style={{
            width: `${ps.w}mm`, minHeight: `${ps.h}mm`, background: '#ffffff',
            boxShadow: '0 6px 24px rgba(0,0,0,0.35)', color: '#0f172a',
            padding: `${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm`,
            boxSizing: 'border-box',
          }}
        >
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={onInput}
            onKeyUp={onSelectionChange}
            onMouseUp={onSelectionChange}
            onFocus={onSelectionChange}
            onBlur={onBlur}
            className="rd-editor"
            style={vars}
          />
        </div>
      </div>
    </div>
  );
}