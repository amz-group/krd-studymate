import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Copy, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ScaledSlide from './ScaledSlide';
import { newSlideLayouts, layoutList } from '@/lib/presentationAssets';
import { baseDimensions } from '@/lib/presentationModel';
import { cn } from '@/lib/utils';

export default function SlidePanel({
  slides, currentSlideId, ratio, language, onSelect, onReorder, onAdd, onDuplicate, onDelete,
}) {
  const { t } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const { w, h } = baseDimensions(ratio);

  return (
    <div className="w-56 shrink-0 border-e border-border bg-card flex flex-col">
      <div className="p-2 border-b border-border relative">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setMenuOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> {t('ev.newSlide')}
        </Button>
        {menuOpen && (
          <div className="absolute z-20 top-full start-2 mt-1 w-52 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg py-1">
            {newSlideLayouts.map((id) => {
              const label = layoutList.find((l) => l.id === id)?.label || id;
              return (
                <button key={id} type="button"
                  onClick={() => { onAdd(id); setMenuOpen(false); }}
                  className="w-full text-start px-3 py-1.5 text-sm hover:bg-accent">
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={(r) => { if (r.destination) onReorder(r.source.index, r.destination.index); }}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {slides.map((s, i) => (
                  <Draggable key={s.id} draggableId={s.id} index={i}>
                    {(p) => (
                      <div ref={p.innerRef} {...p.draggableProps}
                        className={cn('group flex gap-1 rounded-lg border bg-background', currentSlideId === s.id ? 'border-primary ring-1 ring-primary' : 'border-border')}>
                        <span {...p.dragHandleProps} className="flex items-center px-1 text-muted-foreground cursor-grab"><GripVertical className="h-3.5 w-3.5" /></span>
                        <button onClick={() => onSelect(s.id)} className="flex-1 py-1.5 text-start">
                          <span className="block text-[10px] text-muted-foreground mb-1">{i + 1}</span>
                          <ScaledSlide slide={s} baseW={w} baseH={h} language={language} className="w-full rounded border border-border" />
                        </button>
                        <div className="flex flex-col justify-center pe-1 gap-1">
                          <button onClick={() => onDuplicate(s.id)} className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                          <button onClick={() => onDelete(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {slides.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{t('ev.emptySlides')}</p>}
      </div>
    </div>
  );
}