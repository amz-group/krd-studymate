import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Highlighter, Plus, ListPlus, Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/AppContext';

const HL_COLORS = [
  { key: 'yellow', bg: 'bg-yellow-200 dark:bg-yellow-500/30' },
  { key: 'green', bg: 'bg-green-200 dark:bg-green-500/30' },
  { key: 'blue', bg: 'bg-blue-200 dark:bg-blue-500/30' },
  { key: 'pink', bg: 'bg-pink-200 dark:bg-pink-500/30' },
];

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Render page text with inline highlights + search matches.
function renderPage(text, highlights, query) {
  let html = esc(text);
  const wraps = [];
  for (const h of highlights) {
    if (h.text && h.text.length > 2) {
      const cls = HL_COLORS.find((c) => c.key === h.color)?.bg || HL_COLORS[0].bg;
      wraps.push({ needle: h.text, cls, title: h.note || '' });
    }
  }
  if (query && query.length > 1) {
    wraps.push({ needle: query, cls: 'bg-primary/30', title: '' });
  }
  for (const w of wraps) {
    const re = new RegExp(w.needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    html = html.replace(re, (m) => `<mark class="${w.cls} rounded px-0.5" title="${esc(w.title)}">${m}</mark>`);
  }
  return html.replace(/\n/g, '<br/>');
}

export default function StudyDocument({ content, onAddHighlight, onAddKeyPoint, onMakeFlashcard, onSelectText }) {
  const { t, dir } = useApp();
  const pages = content.pages?.length ? content.pages : [{ index: 0, text: content.text }];
  const [page, setPage] = useState(content.range?.page || 0);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bar, setBar] = useState(null); // { x, y, text }
  const [hlColor, setHlColor] = useState('yellow');
  const ref = useRef(null);

  const current = pages[page] || pages[0];
  const pageHighlights = (content.highlights || []).filter((h) => h.page === current.index);

  const matches = useMemo(() => {
    if (!query || query.length < 2) return { count: 0, pages: [] };
    const lc = query.toLowerCase();
    const pgs = pages.map((p, i) => {
      const c = (p.text || '').toLowerCase().split(lc).length - 1;
      return { i, c };
    }).filter((p) => p.c > 0);
    return { count: pgs.reduce((s, p) => s + p.c, 0), pages: pgs };
  }, [query, pages]);

  const onMouseUp = () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    onSelectText?.(text);
    if (text.length > 1 && ref.current && sel.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setBar({ x: rect.left + rect.width / 2, y: rect.top, text });
    } else {
      setBar(null);
    }
  };

  const jumpToMatch = (pgs) => {
    if (!pgs.length) return;
    const next = pgs.find((p) => p.i >= page) || pgs[0];
    setPage(next.i);
  };

  const clearBar = () => { window.getSelection()?.removeAllRanges(); setBar(null); };

  const doHighlight = () => {
    onAddHighlight({ page: current.index, text: bar.text, color: hlColor, note: '' });
    clearBar();
  };
  const doNote = () => {
    const note = window.prompt(t('study.doc.notePrompt'), '');
    if (note !== null) onAddHighlight({ page: current.index, text: bar.text, color: hlColor, note });
    clearBar();
  };
  const doKeyPoint = () => { onAddKeyPoint?.(bar.text); clearBar(); };
  const doFlashcard = () => { onMakeFlashcard?.(bar.text, bar.text); clearBar(); };

  return (
    <div className="space-y-3" onMouseUp={onMouseUp}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
          <span className="text-sm text-muted-foreground px-1">{t('study.doc.pageOf', { n: page + 1, total: pages.length })}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pages.length - 1} onClick={() => setPage(page + 1)}><ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{t('study.doc.jumpTo')}</span>
          <Input type="number" min={1} max={pages.length} value={page + 1} onChange={(e) => setPage(Math.min(pages.length, Math.max(1, Number(e.target.value))) - 1)} className="h-8 w-16 text-sm" />
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSearch(!showSearch)}><Search className="h-4 w-4" /> {t('study.doc.search')}</Button>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('study.doc.search')} className="h-8 text-sm" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {query ? (matches.count ? t('study.doc.matches', { n: matches.count }) : t('study.doc.noMatches')) : ''}
          </span>
          {matches.pages.length > 0 && <Button size="sm" variant="ghost" onClick={() => jumpToMatch(matches.pages)}>→</Button>}
        </div>
      )}

      {/* Highlight color picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Highlighter className="h-3.5 w-3.5" /> {t('study.doc.highlight')}</span>
        <div className="flex gap-1">
          {HL_COLORS.map((c) => (
            <button key={c.key} onClick={() => setHlColor(c.key)} className={`h-5 w-5 rounded ${c.bg} ${hlColor === c.key ? 'ring-2 ring-primary ring-offset-1' : ''}`} />
          ))}
        </div>
      </div>

      {/* Page text */}
      <div ref={ref} className="prose-sm max-w-none rounded-xl border border-border bg-card p-5 md:p-7 text-sm leading-7 whitespace-pre-wrap select-text" dir={dir}
        dangerouslySetInnerHTML={{ __html: renderPage(current.text || '', pageHighlights, query) }} />

      {/* Selection action bar */}
      {bar && (
        <div className="fixed z-50 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-popover border border-border shadow-lg p-1" style={{ left: Math.max(120, Math.min(window.innerWidth - 120, bar.x)), top: bar.y - 48 }}>
          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={doHighlight}><Highlighter className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={doNote} title={t('study.doc.addNote')}><Plus className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={doKeyPoint} title={t('study.doc.addToKey')}><ListPlus className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={doFlashcard} title={t('study.doc.makeFlashcard')}><Layers className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="h-8 w-8" onClick={clearBar}><X className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}