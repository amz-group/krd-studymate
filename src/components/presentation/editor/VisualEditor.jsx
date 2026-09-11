import { useState, useRef, useEffect } from 'react';
import {
  Undo2, Redo2, Type, Image as ImageIcon, Square, Sparkles, Shapes, LayoutTemplate,
  Palette, BookOpen, Eye, Save, ZoomIn, ZoomOut, Maximize, Grid3x3, PanelLeft, PanelRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { newElement, buildSlideFromLayout, applyTemplate, buildExampleSlides } from '@/lib/presentationModel';
import { defaultTextContent } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';
import SlidePanel from './SlidePanel';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import ContextMenu from './ContextMenu';
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [zoomMode, setZoomMode] = useState('fit');
  const [focusMode, setFocusMode] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [snap] = useState(true);
  const [showSlides, setShowSlides] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const [menu, setMenu] = useState(null);
  const clipboard = useRef([]);

  const currentSlide = slides.find((s) => s.id === currentSlideId) || slides[0] || null;
  const selectedEls = currentSlide ? currentSlide.elements.filter((e) => selectedIds.includes(e.id)) : [];
  const selectedEl = selectedEls.length === 1 ? selectedEls[0] : null;

  // Clear selection when the active slide changes.
  useEffect(() => { setSelectedIds([]); setEditingId(null); }, [currentSlideId]);

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
    setSelectedIds([el.id]);
  };
  const removeSelected = () => {
    const ids = selectedEls.map((e) => e.id);
    if (!ids.length) return;
    updateSlide(currentSlideId, (s) => ({ ...s, elements: s.elements.filter((e) => !ids.includes(e.id)) }));
    setSelectedIds([]); setEditingId(null);
  };
  const duplicateSelected = () => {
    if (!selectedEls.length) return;
    const copies = selectedEls.map((el) => ({ ...el, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, x: el.x + 24, y: el.y + 24, content: { ...el.content } }));
    updateSlide(currentSlideId, (s) => ({ ...s, elements: [...s.elements, ...copies] }));
    setSelectedIds(copies.map((c) => c.id));
  };
  const paste = () => {
    if (!clipboard.current.length) return;
    const copies = clipboard.current.map((el) => ({ ...el, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, x: el.x + 30, y: el.y + 30, content: { ...el.content } }));
    updateSlide(currentSlideId, (s) => ({ ...s, elements: [...s.elements, ...copies] }));
    setSelectedIds(copies.map((c) => c.id));
  };

  const moveZ = (dir) => {
    if (!selectedEls.length) return;
    const ids = selectedEls.map((e) => e.id);
    updateSlide(currentSlideId, (s) => {
      let arr = s.elements.map((e) => ({ ...e }));
      if (dir === 'front' || dir === 'back') {
        const zs = arr.map((e) => e.zIndex || 0);
        if (dir === 'front') { const max = Math.max(0, ...zs); arr = arr.map((e) => ids.includes(e.id) ? { ...e, zIndex: max + 1 } : e); }
        else { const min = Math.min(0, ...zs); arr = arr.map((e) => ids.includes(e.id) ? { ...e, zIndex: min - 1 } : e); }
        return { ...s, elements: arr };
      }
      const sorted = [...arr].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (let i = 0; i < sorted.length; i++) {
        if (ids.includes(sorted[i].id)) {
          if (dir === 'forward' && i < sorted.length - 1 && !ids.includes(sorted[i + 1].id)) {
            const tz = sorted[i].zIndex || i; sorted[i].zIndex = sorted[i + 1].zIndex || (i + 1); sorted[i + 1].zIndex = tz; i++;
          } else if (dir === 'backward' && i > 0 && !ids.includes(sorted[i - 1].id)) {
            const tz = sorted[i].zIndex || i; sorted[i].zIndex = sorted[i - 1].zIndex || (i - 1); sorted[i - 1].zIndex = tz;
          }
        }
      }
      return { ...s, elements: sorted };
    });
  };
  const toggleLock = () => {
    const ids = selectedEls.map((e) => e.id);
    if (!ids.length) return;
    const allLocked = selectedEls.every((e) => e.locked);
    updateSlide(currentSlideId, (s) => ({ ...s, elements: s.elements.map((e) => ids.includes(e.id) ? { ...e, locked: !allLocked } : e) }));
  };

  const align = (type) => {
    if (selectedEls.length < 2) return;
    const ids = selectedEls.map((e) => e.id);
    updateSlide(currentSlideId, (s) => {
      const els = s.elements.filter((e) => ids.includes(e.id));
      const set = (fn) => s.elements.map((e) => ids.includes(e.id) ? fn(e) : e);
      if (type === 'left') { const m = Math.min(...els.map((e) => e.x)); return { ...s, elements: set((e) => ({ ...e, x: m })) }; }
      if (type === 'right') { const m = Math.max(...els.map((e) => e.x + e.width)); return { ...s, elements: set((e) => ({ ...e, x: m - e.width })) }; }
      if (type === 'centerH') { const m = (Math.min(...els.map((e) => e.x)) + Math.max(...els.map((e) => e.x + e.width))) / 2; return { ...s, elements: set((e) => ({ ...e, x: m - e.width / 2 })) }; }
      if (type === 'top') { const m = Math.min(...els.map((e) => e.y)); return { ...s, elements: set((e) => ({ ...e, y: m })) }; }
      if (type === 'bottom') { const m = Math.max(...els.map((e) => e.y + e.height)); return { ...s, elements: set((e) => ({ ...e, y: m - e.height })) }; }
      if (type === 'middle') { const m = (Math.min(...els.map((e) => e.y)) + Math.max(...els.map((e) => e.y + e.height))) / 2; return { ...s, elements: set((e) => ({ ...e, y: m - e.height / 2 })) }; }
      return s;
    });
  };
  const distribute = (axis) => {
    if (selectedEls.length < 3) return;
    const ids = selectedEls.map((e) => e.id);
    updateSlide(currentSlideId, (s) => {
      const els = s.elements.filter((e) => ids.includes(e.id));
      const sorted = [...els].sort((a, b) => (axis === 'h' ? a.x - b.x : a.y - b.y));
      const first = sorted[0], last = sorted[sorted.length - 1];
      const map = {};
      if (axis === 'h') {
        const span = (last.x + last.width) - first.x; const totalW = sorted.reduce((a, e) => a + e.width, 0);
        const gap = (span - totalW) / (sorted.length - 1);
        let cur = first.x; sorted.forEach((e) => { map[e.id] = cur; cur += e.width + gap; });
      } else {
        const span = (last.y + last.height) - first.y; const totalH = sorted.reduce((a, e) => a + e.height, 0);
        const gap = (span - totalH) / (sorted.length - 1);
        let cur = first.y; sorted.forEach((e) => { map[e.id] = cur; cur += e.height + gap; });
      }
      return { ...s, elements: s.elements.map((e) => map[e.id] !== undefined ? { ...e, [axis === 'h' ? 'x' : 'y']: map[e.id] } : e) };
    });
  };

  const onCommitMoves = (box) => updateSlide(currentSlideId, (s) => ({ ...s, elements: s.elements.map((e) => box[e.id] ? { ...e, x: box[e.id].x, y: box[e.id].y } : e) }));
  const onCommitResize = (id, b) => updateElement(id, { x: b.x, y: b.y, width: b.width, height: b.height });

  const addSlide = (layoutId) => { const s = buildSlideFromLayout(layoutId, t, { type: 'solid', color: '#ffffff' }); update((c) => ({ ...c, slides: [...c.slides, s] })); setCurrentSlideId(s.id); };
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
  };
  const reorderSlides = (from, to) => update((c) => { const arr = [...c.slides]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); return { ...c, slides: arr }; });

  const applyTemplateToAll = (tpl) => update((c) => ({ ...c, slides: c.slides.map((s, i) => applyTemplate(s, tpl, i === 0)) }));
  const applyLayout = (layoutId) => updateSlide(currentSlideId, (s) => ({ ...s, elements: buildSlideFromLayout(layoutId, t, s.background).elements }));
  const useExample = (ex) => { const built = buildExampleSlides(ex, t); update((c) => ({ ...c, slides: built })); setCurrentSlideId(built[0]?.id || null); };
  const setSlideBackground = (bg) => updateSlide(currentSlideId, { background: bg });
  const setRatio = (r) => update((c) => ({ ...c, ratio: r }));
  const setSlideNotes = (notes) => updateSlide(currentSlideId, { notes });

  const addText = (role) => addElement(newElement('text', { role, x: 200, y: 200, width: 600, height: 120, content: { ...defaultTextContent(role), text: t(`ev.text.${role}`) } }));
  const addShape = (shape) => addElement(newElement('shape', { x: 300, y: 250, width: 300, height: 200, content: { shape, fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: shape === 'rounded' ? 16 : 0, opacity: 1 } }));
  const addIcon = (name) => addElement(newElement('icon', { x: 500, y: 300, width: 120, height: 120, content: { name, color: '#2563eb', size: 64, opacity: 1 } }));
  const addImageFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    addElement(newElement('image', { x: 300, y: 200, width: 500, height: 320, content: { src, fit: 'cover', radius: 12, shadow: false, opacity: 1, lockAspect: false } }));
    setActivePanel(null);
  };

  // ---- keyboard ----
  const stateRef = useRef(null);
  stateRef.current = { selectedIds, editingId };
  useEffect(() => {
    const onKey = (e) => {
      const st = stateRef.current || {};
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || st.editingId;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (st.editingId && e.key === 'Escape') { setEditingId(null); return; }
      if (typing) return;
      if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); if (currentSlide) setSelectedIds(currentSlide.elements.map((el) => el.id)); return; }
      if (!st.selectedIds.length) return;
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); return; }
      if (mod && e.key.toLowerCase() === 'x') { e.preventDefault(); clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); removeSelected(); return; }
      if (mod && e.key.toLowerCase() === 'v' && clipboard.current.length) { e.preventDefault(); paste(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); return; }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const ids = selectedEls.map((el) => el.id);
        updateSlide(currentSlideId, (s) => ({ ...s, elements: s.elements.map((el) => ids.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el) }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const openMenu = (e, elId) => {
    if (elId && !selectedIds.includes(elId)) setSelectedIds([elId]);
    setMenu({ x: e.clientX, y: e.clientY, elId });
  };

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

  const zoomStep = (dir) => {
    let cur = zoomMode === 'fit' || zoomMode === 'fitWidth' ? 100 : Number(zoomMode);
    cur = Math.max(50, Math.min(150, cur + dir * 25));
    setZoomMode(String(cur));
  };

  const menuItems = menu ? buildMenuItems(menu.elId, t, {
    hasClipboard: !!clipboard.current.length,
    onCut: () => { clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); removeSelected(); },
    onCopy: () => { clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); },
    onPaste: paste,
    onDuplicate: duplicateSelected,
    onForward: () => moveZ('forward'),
    onBackward: () => moveZ('backward'),
    onFront: () => moveZ('front'),
    onBack: () => moveZ('back'),
    onToggleLock: toggleLock,
    onDelete: removeSelected,
    allLocked: selectedEls.length > 0 && selectedEls.every((e) => e.locked),
  }) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-card">
        <ToolBtn icon={Undo2} label={t('pb.undo')} onClick={undo} disabled={!canUndo} />
        <ToolBtn icon={Redo2} label={t('pb.redo')} onClick={redo} disabled={!canRedo} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={Type} label={t('ev.addText')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={ImageIcon} label={t('ev.addImage')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Square} label={t('ev.addShape')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Sparkles} label={t('ev.addIcon')} onClick={() => setActivePanel('icons')} active={activePanel === 'icons'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={Shapes} label={t('ev.layout')} onClick={() => setActivePanel('layouts')} active={activePanel === 'layouts'} />
        <ToolBtn icon={LayoutTemplate} label={t('ev.template')} onClick={() => setActivePanel('templates')} active={activePanel === 'templates'} />
        <ToolBtn icon={Palette} label={t('ev.background')} onClick={() => setActivePanel('background')} active={activePanel === 'background'} />
        <ToolBtn icon={BookOpen} label={t('ev.examples')} onClick={() => setActivePanel('examples')} active={activePanel === 'examples'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={ZoomOut} label={t('ev.zoomOut')} onClick={() => zoomStep(-1)} />
        <select value={zoomMode} onChange={(e) => setZoomMode(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent text-xs px-1" title={t('ev.zoom')}>
          <option value="fit">{t('ev.zoom.fit')}</option>
          <option value="fitWidth">{t('ev.zoom.fitWidth')}</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
        </select>
        <ToolBtn icon={ZoomIn} label={t('ev.zoomIn')} onClick={() => zoomStep(1)} />
        <ToolBtn icon={Grid3x3} label={t('ev.grid')} onClick={() => setShowGrid((v) => !v)} active={showGrid} />
        <ToolBtn icon={Maximize} label={t('ev.focus')} onClick={() => setFocusMode((v) => !v)} active={focusMode} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={PanelLeft} label={t('ev.slides')} onClick={() => setShowSlides((v) => !v)} active={showSlides} disabled={focusMode} />
        <ToolBtn icon={PanelRight} label={t('ev.props')} onClick={() => setShowProps((v) => !v)} active={showProps} disabled={focusMode} />
        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onPreview}><Eye className="h-4 w-4" /> {t('ev.preview')}</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onSave}><Save className="h-4 w-4" />{saveState === 'saving' ? t('pb.saving') : saveState === 'saved' ? t('pb.saved') : t('ev.save')}</Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {!focusMode && (
          <div className={cn(showSlides ? 'flex' : 'hidden', 'md:flex')}>
            <SlidePanel slides={slides} currentSlideId={currentSlideId} ratio={ratio} language={language}
              onSelect={(id) => setCurrentSlideId(id)}
              onReorder={reorderSlides} onAdd={addSlide} onDuplicate={duplicateSlide} onDelete={deleteSlide} />
          </div>
        )}
        <EditorCanvas slide={currentSlide} ratio={ratio} language={language} zoomMode={zoomMode}
          selectedIds={selectedIds} editingId={editingId} showGrid={showGrid} snap={snap}
          onSelect={setSelectedIds}
          onCommitMoves={onCommitMoves} onCommitResize={onCommitResize}
          onStartEdit={(id) => { setSelectedIds([id]); setEditingId(id); }}
          onEndEdit={(id, text) => { updateElement(id, { content: { text } }); setEditingId(null); }}
          onBackgroundClick={() => { setSelectedIds([]); setEditingId(null); }}
          onContextMenu={openMenu} />
        {!focusMode && (
          <div className={cn(showProps ? 'flex' : 'hidden', 'md:flex')}>
            <PropertiesPanel slide={currentSlide} selectedEls={selectedEls} selectedEl={selectedEl} ratio={ratio}
              onChangeElement={updateElement} onChangeRatio={setRatio} onChangeSlideNotes={setSlideNotes}
              onOpenPanel={setActivePanel}
              onDuplicate={duplicateSelected} onDelete={removeSelected}
              onForward={() => moveZ('forward')} onBackward={() => moveZ('backward')}
              onFront={() => moveZ('front')} onBack={() => moveZ('back')}
              onToggleLock={toggleLock}
              onAlign={align} onDistribute={distribute} />
          </div>
        )}
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

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </div>
  );
}

function buildMenuItems(elId, t, h) {
  if (!elId) {
    return [
      { label: t('ev.action.paste'), onClick: h.onPaste, disabled: !h.hasClipboard },
    ];
  }
  return [
    { label: t('ev.action.cut'), onClick: h.onCut },
    { label: t('ev.action.copy'), onClick: h.onCopy },
    { label: t('ev.action.paste'), onClick: h.onPaste, disabled: !h.hasClipboard },
    { label: t('ev.action.duplicate'), onClick: h.onDuplicate },
    { divider: true },
    { label: t('ev.action.forward'), onClick: h.onForward },
    { label: t('ev.action.backward'), onClick: h.onBackward },
    { label: t('ev.action.front'), onClick: h.onFront },
    { label: t('ev.action.back'), onClick: h.onBack },
    { divider: true },
    { label: h.allLocked ? t('ev.action.unlock') : t('ev.action.lock'), onClick: h.onToggleLock },
    { label: t('ev.action.delete'), onClick: h.onDelete },
  ];
}