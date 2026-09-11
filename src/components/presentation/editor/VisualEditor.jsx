import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2, Redo2, Type, Image as ImageIcon, Shapes, LayoutTemplate, Palette,
  Sparkles, BookOpen, Eye, Save, ZoomIn, ZoomOut, Maximize, Grid3x3,
  PanelLeft, PanelRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { newElement, buildSlideFromLayout, applyTemplate, buildExampleSlides, baseDimensions } from '@/lib/presentationModel';
import { defaultTextContent } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';
import SlidePanel from './SlidePanel';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import { PanelDrawer, AddPanel, TemplatesPanel, LayoutsPanel, BackgroundPanel, IconsPanel, ExamplesPanel } from './ToolbarPanels';

export default function VisualEditor({
  presentation, update, undo, redo, canUndo, canRedo, onPreview, onSave, saveState,
}) {
  const { t } = useApp();
  const content = presentation.content;
  const slides = content.slides;
  const ratio = content.ratio;
  const language = content.language;

  const [currentSlideId, setCurrentSlideId] = useState(slides[0]?.id || null);
  const [selectedElId, setSelectedElId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activePanel, setActivePanel] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [snap, setSnap] = useState(true);
  const [showSlides, setShowSlides] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const clipboard = useRef(null);

  const currentSlide = slides.find((s) => s.id === currentSlideId) || slides[0] || null;
  const selectedEl = currentSlide?.elements.find((e) => e.id === selectedElId) || null;

  // ---- update helpers (each commit = one undo entry) ----
  const updateSlide = (slideId, updater) => update((c) => ({
    ...c, slides: c.slides.map((s) => (s.id === slideId ? (typeof updater === 'function' ? updater(s) : { ...s, ...updater }) : s)),
  }));
  const updateElement = (elId, patch) => updateSlide(currentSlideId, (s) => ({
    ...s, elements: s.elements.map((e) => {
      if (e.id !== elId) return e;
      const next = { ...e, ...patch };
      if (patch.content) next.content = { ...e.content, ...patch.content };
      return next;
    }),
  }));

  const addElement = (el) => {
    updateSlide(currentSlideId, (s) => ({ ...s, elements: [...s.elements, el] }));
    setSelectedElId(el.id);
  };
  const removeElement = (elId) => { updateSlide(currentSlideId, (s) => ({ ...s, elements: s.elements.filter((e) => e.id !== elId) })); setSelectedElId(null); };
  const duplicateElement = (elId) => {
    const el = currentSlide.elements.find((e) => e.id === elId); if (!el) return;
    const copy = { ...el, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, x: el.x + 24, y: el.y + 24 };
    updateSlide(currentSlideId, (s) => ({ ...s, elements: [...s.elements, copy] }));
    setSelectedElId(copy.id);
  };
  const moveZ = (dir) => {
    if (!selectedElId) return;
    updateSlide(currentSlideId, (s) => {
      const arr = [...s.elements];
      const i = arr.findIndex((e) => e.id === selectedElId);
      const j = dir === 'forward' ? i + 1 : i - 1;
      if (i < 0 || j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, elements: arr };
    });
  };
  const toggleLock = () => { if (selectedEl) updateElement(selectedEl.id, { locked: !selectedEl.locked }); };

  const addSlide = (layoutId) => {
    const s = buildSlideFromLayout(layoutId, t, { type: 'solid', color: '#ffffff' });
    update((c) => ({ ...c, slides: [...c.slides, s] }));
    setCurrentSlideId(s.id); setSelectedElId(null);
  };
  const duplicateSlide = (slideId) => {
    const s = slides.find((x) => x.id === slideId); if (!s) return;
    const copy = { ...s, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, elements: s.elements.map((e) => ({ ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) };
    const idx = slides.findIndex((x) => x.id === slideId);
    update((c) => ({ ...c, slides: [...c.slides.slice(0, idx + 1), copy, ...c.slides.slice(idx + 1)] }));
    setCurrentSlideId(copy.id);
  };
  const deleteSlide = (slideId) => {
    update((c) => ({ ...c, slides: c.slides.filter((s) => s.id !== slideId) }));
    if (currentSlideId === slideId) { const next = slides.find((s) => s.id !== slideId); setCurrentSlideId(next?.id || null); }
    setSelectedElId(null);
  };
  const reorderSlides = (from, to) => update((c) => {
    const arr = [...c.slides]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); return { ...c, slides: arr };
  });

  const applyTemplateToAll = (tpl) => update((c) => ({ ...c, slides: c.slides.map((s, i) => applyTemplate(s, tpl, i === 0)) }));
  const applyLayout = (layoutId) => updateSlide(currentSlideId, (s) => ({ ...s, elements: buildSlideFromLayout(layoutId, t, s.background).elements }));
  const useExample = (ex) => {
    const built = buildExampleSlides(ex, t);
    update((c) => ({ ...c, slides: built }));
    setCurrentSlideId(built[0]?.id || null); setSelectedElId(null);
  };
  const setSlideBackground = (bg) => updateSlide(currentSlideId, { background: bg });
  const setRatio = (r) => update((c) => ({ ...c, ratio: r }));
  const setSlideNotes = (notes) => updateSlide(currentSlideId, { notes });

  const addText = (role) => addElement(newElement('text', { role, x: 200, y: 200, width: 600, height: 120, content: { ...defaultTextContent(role), text: t(`ev.text.${role}`) } }));
  const addShape = (shape) => addElement(newElement('shape', { x: 300, y: 250, width: 300, height: 200, content: { shape, fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: shape === 'rounded' ? 16 : 0, opacity: 1 } }));
  const addIcon = (name) => addElement(newElement('icon', { x: 500, y: 300, width: 120, height: 120, content: { name, color: '#2563eb', size: 64, opacity: 1 } }));
  const addImageFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    addElement(newElement('image', { x: 300, y: 200, width: 500, height: 320, content: { src, fit: 'cover', radius: 12, shadow: false, opacity: 1 } }));
    setActivePanel(null);
  };

  // ---- keyboard shortcuts ----
  const stateRef = useRef(null);
  stateRef.current = { selectedElId, currentSlideId, editingId, activePanel };
  useEffect(() => {
    const onKey = (e) => {
      const st = stateRef.current || {};
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || st.editingId;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (typing || !st.selectedElId) return;
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateElement(st.selectedElId); return; }
      if (mod && e.key.toLowerCase() === 'c') { clipboard.current = JSON.parse(JSON.stringify(currentSlide.elements.find((x) => x.id === st.selectedElId))); return; }
      if (mod && e.key.toLowerCase() === 'v' && clipboard.current) {
        const c = { ...clipboard.current, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, x: clipboard.current.x + 30, y: clipboard.current.y + 30 };
        addElement(c); return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); removeElement(st.selectedElId); return; }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const el = currentSlide.elements.find((x) => x.id === st.selectedElId); if (!el) return;
        let { x, y } = el;
        if (e.key === 'ArrowLeft') x -= step; if (e.key === 'ArrowRight') x += step;
        if (e.key === 'ArrowUp') y -= step; if (e.key === 'ArrowDown') y += step;
        updateElement(st.selectedElId, { x, y });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const ToolBtn = ({ icon: Icon, label, onClick, active, disabled }) => (
    <Button variant={active ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={onClick} disabled={disabled} title={label}>
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (!currentSlide) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm text-muted-foreground">{t('ev.emptySlides')}</p>
        <Button onClick={() => addSlide('title')}>{t('ev.newSlide')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-card">
        <ToolBtn icon={Undo2} label={t('ev.editor')} onClick={undo} disabled={!canUndo} />
        <ToolBtn icon={Redo2} label={t('ev.editor')} onClick={redo} disabled={!canRedo} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={Type} label={t('ev.addText')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={ImageIcon} label={t('ev.addImage')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Shapes} label={t('ev.addShape')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Sparkles} label={t('ev.addIcon')} onClick={() => setActivePanel('icons')} active={activePanel === 'icons'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={LayoutTemplate} label={t('ev.layout')} onClick={() => setActivePanel('layouts')} active={activePanel === 'layouts'} />
        <ToolBtn icon={Palette} label={t('ev.template')} onClick={() => setActivePanel('templates')} active={activePanel === 'templates'} />
        <ToolBtn icon={BookOpen} label={t('ev.examples')} onClick={() => setActivePanel('examples')} active={activePanel === 'examples'} />
        <ToolBtn icon={Grid3x3} label={t('ev.background')} onClick={() => setActivePanel('background')} active={activePanel === 'background'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={ZoomOut} label={t('ev.zoomOut')} onClick={() => setZoom((z) => Math.max(40, z - 25))} />
        <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
        <ToolBtn icon={ZoomIn} label={t('ev.zoomIn')} onClick={() => setZoom((z) => Math.min(200, z + 25))} />
        <ToolBtn icon={Maximize} label={t('ev.fit')} onClick={() => setZoom(100)} />
        <ToolBtn icon={Grid3x3} label={t('ev.grid')} onClick={() => setShowGrid((v) => !v)} active={showGrid} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={PanelLeft} label={t('ev.slides')} onClick={() => setShowSlides((v) => !v)} active={showSlides} />
        <ToolBtn icon={PanelRight} label={t('ev.props')} onClick={() => setShowProps((v) => !v)} active={showProps} />
        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onPreview}><Eye className="h-4 w-4" /> {t('ev.preview')}</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onSave}><Save className="h-4 w-4" />{saveState === 'saving' ? t('pb.saving') : saveState === 'saved' ? t('pb.saved') : t('ev.save')}</Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className={cn(showSlides ? 'flex' : 'hidden', 'md:flex')}>
          <SlidePanel slides={slides} currentSlideId={currentSlideId} ratio={ratio} language={language}
            onSelect={(id) => { setCurrentSlideId(id); setSelectedElId(null); }}
            onReorder={reorderSlides} onAdd={addSlide} onDuplicate={duplicateSlide} onDelete={deleteSlide} />
        </div>
        <EditorCanvas slide={currentSlide} language={language} ratio={ratio} zoom={zoom} selectedId={selectedElId} editingId={editingId}
          showGrid={showGrid} snap={snap}
          onSelectElement={setSelectedElId}
          onChangeElement={updateElement}
          onStartEdit={(id) => { setSelectedElId(id); setEditingId(id); }}
          onEndEdit={(id, text) => { updateElement(id, { content: { text } }); setEditingId(null); }}
          onBackgroundClick={() => { setSelectedElId(null); setEditingId(null); }} />
        <div className={cn(showProps ? 'flex' : 'hidden', 'md:flex')}>
          <PropertiesPanel slide={currentSlide} selectedEl={selectedEl} ratio={ratio}
            onChangeElement={updateElement} onChangeRatio={setRatio} onChangeSlideNotes={setSlideNotes}
            onDuplicate={() => duplicateElement(selectedElId)} onDelete={() => removeElement(selectedElId)}
            onForward={() => moveZ('forward')} onBackward={() => moveZ('backward')} onToggleLock={toggleLock} />
        </div>
      </div>

      {activePanel && (
        <PanelDrawer title={({ add: t('ev.add'), layouts: t('ev.layout'), templates: t('ev.template'), background: t('ev.background'), icons: t('ev.addIcon'), examples: t('ev.examples') })[activePanel]} onClose={() => setActivePanel(null)}>
          {activePanel === 'add' && <AddPanel language={language} ratio={ratio} onAddText={addText} onAddShape={addShape} onAddImageFile={addImageFile} />}
          {activePanel === 'templates' && <TemplatesPanel language={language} ratio={ratio} onApply={applyTemplateToAll} />}
          {activePanel === 'layouts' && <LayoutsPanel language={language} ratio={ratio} onApply={applyLayout} />}
          {activePanel === 'background' && <BackgroundPanel slide={currentSlide} onChange={setSlideBackground} />}
          {activePanel === 'icons' && <IconsPanel onAdd={addIcon} />}
          {activePanel === 'examples' && <ExamplesPanel language={language} ratio={ratio} onUse={useExample} />}
        </PanelDrawer>
      )}
    </div>
  );
}