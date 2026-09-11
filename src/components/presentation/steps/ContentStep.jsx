import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import ThumbnailsList from '@/components/presentation/ThumbnailsList';
import SlideEditor from '@/components/presentation/SlideEditor';
import SlideCanvas from '@/components/presentation/SlideCanvas';
import { newSlide } from '@/lib/presentationModel';
import { createId } from '@/lib/db';

export default function ContentStep({ presentation, update }) {
  const { t } = useApp();
  const slides = presentation.content.slides;
  const [selectedId, setSelectedId] = useState(slides[0]?.id || null);
  const selected = slides.find((s) => s.id === selectedId) || slides[0] || null;

  const updateSlide = (id, patch) => update((c) => ({ ...c, slides: c.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const addSlide = () => { const s = newSlide('content', t); update((c) => ({ ...c, slides: [...c.slides, s] })); setSelectedId(s.id); };
  const deleteSlide = (id) => update((c) => ({ ...c, slides: c.slides.filter((s) => s.id !== id) }));
  const duplicateSlide = (id) => update((c) => {
    const idx = c.slides.findIndex((s) => s.id === id);
    if (idx < 0) return c;
    const copy = { ...c.slides[idx], id: createId() };
    const arr = [...c.slides];
    arr.splice(idx + 1, 0, copy);
    return { ...c, slides: arr };
  });
  const reorder = (from, to) => update((c) => {
    const arr = [...c.slides];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    return { ...c, slides: arr };
  });
  const updateReferences = (fn) => update((c) => ({ ...c, references: typeof fn === 'function' ? fn(c.references) : fn }));

  return (
    <div className="py-4">
      <div className="flex flex-col lg:grid lg:grid-cols-[15rem_1fr_19rem] gap-4">
        <div className="lg:max-h-[72vh] lg:overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">{t('pb.content.slides')}</p>
          <ThumbnailsList presentation={presentation} selectedId={selected?.id} onSelect={setSelectedId} onReorder={reorder} onAdd={addSlide} onDelete={deleteSlide} onDuplicate={duplicateSlide} />
        </div>
        <div className="flex flex-col items-center gap-3">
          {selected
            ? <SlideCanvas slide={selected} presentation={presentation} className="w-full max-w-3xl rounded-xl border border-border shadow-sm" />
            : <div className="text-sm text-muted-foreground py-16">{t('pb.content.empty')}</div>}
        </div>
        <div className="lg:max-h-[72vh] lg:overflow-y-auto">
          {selected ? <SlideEditor slide={selected} presentation={presentation} onUpdate={(patch) => updateSlide(selected.id, patch)} onUpdateReferences={updateReferences} /> : null}
        </div>
      </div>
    </div>
  );
}