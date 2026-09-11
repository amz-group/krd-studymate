import { useState } from 'react';
import { Layers, RefreshCw, Loader2, ChevronLeft, ChevronRight, Shuffle, Plus, Pencil, Trash2, Copy, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/AppContext';

const rid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function StudyFlashcards({ content, sourceText, rLabel, onGenerate, onUpdate, onProgress, focus }) {
  const { t, dir } = useApp();
  const [busy, setBusy] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState(null); // shuffled order
  const [editing, setEditing] = useState(null); // {id?, front, back}
  const cards = content.flashcards || [];
  const view = order ? order.map((i) => cards[i]).filter(Boolean) : cards;
  const card = view[idx];

  const generate = () => {
    setBusy(true);
    setTimeout(() => { onGenerate(); setBusy(false); setIdx(0); setFlipped(false); setOrder(null); }, 50);
  };

  const shuffle = () => {
    const o = [...Array(cards.length).keys()];
    for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    setOrder(o); setIdx(0); setFlipped(false);
  };

  const setDifficulty = (d) => {
    if (!card) return;
    const realIdx = order ? order[idx] : idx;
    const next = cards.map((c, i) => i === realIdx ? { ...c, difficulty: d, studied: true } : c);
    onUpdate(next);
    const studied = next.filter((c) => c.studied).length;
    onProgress?.(studied);
  };

  const saveCard = () => {
    if (!editing.front.trim() && !editing.back.trim()) { setEditing(null); return; }
    if (editing.id) {
      onUpdate(cards.map((c) => c.id === editing.id ? { ...c, front: editing.front, back: editing.back } : c));
    } else {
      onUpdate([...cards, { id: rid(), front: editing.front, back: editing.back, difficulty: null, studied: false }]);
    }
    setEditing(null);
  };
  const del = (id) => { onUpdate(cards.filter((c) => c.id !== id)); if (idx >= cards.length - 1) setIdx(Math.max(0, idx - 1)); };
  const dup = (id) => { const c = cards.find((x) => x.id === id); if (c) onUpdate([...cards, { ...c, id: rid(), front: c.front, back: c.back, difficulty: null, studied: false }]); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.fc.title')}</h2>
        <span className="text-xs text-muted-foreground">· {rLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" className="gap-2" disabled={busy} onClick={generate}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t('study.fc.generate')}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" disabled={!cards.length} onClick={shuffle}><Shuffle className="h-4 w-4" /> {t('study.fc.shuffle')}</Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditing({ front: '', back: '' })}><Plus className="h-4 w-4" /> {t('study.fc.add')}</Button>
      </div>

      {cards.length === 0 && !busy ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.fc.empty')}</div>
      ) : card ? (
        <>
          <div className="text-center text-sm text-muted-foreground">{t('study.fc.ofN', { n: idx + 1, total: view.length })}</div>
          <div className="[perspective:1200px]">
            <button onClick={() => setFlipped(!flipped)} className="w-full min-h-[220px] rounded-2xl border border-border bg-card p-6 text-start transition-transform" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
              <div className="text-xs text-muted-foreground mb-2">{flipped ? t('study.fc.back') : t('study.fc.front')}</div>
              <div className="text-lg font-medium" dir={dir}>{flipped ? card.back : card.front}</div>
              {!flipped && <div className="text-xs text-muted-foreground mt-4">{t('study.fc.flip')}</div>}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-1.5" disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFlipped(false); }}><ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {t('study.fc.prev')}</Button>
            <div className="flex gap-1.5">
              {['easy', 'medium', 'hard'].map((d) => (
                <Button key={d} size="sm" variant={card.difficulty === d ? 'default' : 'outline'} onClick={() => setDifficulty(d)}>{t(`study.fc.${d}`)}</Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" disabled={idx >= view.length - 1} onClick={() => { setIdx(idx + 1); setFlipped(false); }}>{t('study.fc.next')} <ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
          </div>

          {!focus && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{t('study.fc.title')} ({cards.length})</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {cards.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                    <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                    <span className="flex-1 truncate" dir={dir}>{c.front}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing({ id: c.id, front: c.front, back: c.back })}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dup(c.id)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold">{editing.id ? t('study.fc.edit') : t('study.fc.add')}</h3><button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button></div>
            <div><label className="text-xs text-muted-foreground">{t('study.fc.front')}</label><Textarea rows={2} value={editing.front} onChange={(e) => setEditing({ ...editing, front: e.target.value })} placeholder={t('study.fc.frontPh')} dir={dir} /></div>
            <div><label className="text-xs text-muted-foreground">{t('study.fc.back')}</label><Textarea rows={3} value={editing.back} onChange={(e) => setEditing({ ...editing, back: e.target.value })} placeholder={t('study.fc.backPh')} dir={dir} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(null)}>{t('study.fc.cancel')}</Button><Button size="sm" className="gap-1.5" onClick={saveCard}><Check className="h-4 w-4" /> {t('study.fc.save')}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}