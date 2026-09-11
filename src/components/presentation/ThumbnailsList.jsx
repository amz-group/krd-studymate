import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Copy, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import SlideCanvas from './SlideCanvas';

export default function ThumbnailsList({ presentation, selectedId, onSelect, onReorder, onAdd, onDelete, onDuplicate }) {
  const { t } = useApp();
  const slides = presentation.content.slides;
  const onDragEnd = (r) => { if (!r.destination) return; onReorder(r.source.index, r.destination.index); };

  return (
    <div className="flex flex-col gap-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
              {slides.map((s, i) => (
                <Draggable key={s.id} draggableId={s.id} index={i}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.draggableProps} className={cn('group flex items-stretch gap-1 rounded-xl border bg-card', selectedId === s.id ? 'border-primary' : 'border-border')}>
                      <button {...p.dragHandleProps} className="flex items-center px-1.5 text-muted-foreground cursor-grab active:cursor-grabbing" aria-label="drag">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button onClick={() => onSelect(s.id)} className="flex-1 flex items-center gap-2 py-2 pe-2 text-start min-w-0">
                        <span className="text-xs font-semibold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <SlideCanvas slide={s} presentation={presentation} className="w-24 shrink-0 rounded-md overflow-hidden border border-border" />
                        <span className="text-xs font-medium truncate">{s.title || t(`pb.content.${s.type}Slide`)}</span>
                      </button>
                      <div className="flex flex-col justify-center pe-1.5 gap-1">
                        <button onClick={() => onDuplicate(s.id)} className="text-muted-foreground hover:text-foreground" aria-label={t('pb.content.duplicateSlide')}><Copy className="h-3.5 w-3.5" /></button>
                        <button onClick={() => onDelete(s.id)} className="text-muted-foreground hover:text-destructive" aria-label={t('pb.content.deleteSlide')}><Trash2 className="h-3.5 w-3.5" /></button>
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
      <Button variant="outline" size="sm" className="gap-2 w-full" onClick={onAdd}><Plus className="h-4 w-4" />{t('pb.content.addSlide')}</Button>
    </div>
  );
}