import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2, Redo2, Type, Image as ImageIcon, Square, Sparkles, Shapes, LayoutTemplate,
  Palette, BookOpen, Eye, Save, ZoomIn, ZoomOut, Maximize, Grid3x3, PanelLeft, PanelRight,
  Download, Layers, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { saveProject, nowISO, createId } from '@/lib/db';
import { usePresentationState } from '@/lib/usePresentationState';
import { newElement } from '@/lib/presentationModel';
import { defaultTextContent } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';
import PosterCanvas from './PosterCanvas';
import PosterPropertiesPanel from './PosterPropertiesPanel';
import ContextMenu from '@/components/presentation/editor/ContextMenu';
import { PanelDrawer, IconsPanel, BackgroundPanel } from '@/components/presentation/editor/ToolbarPanels';
import {
  PosterTemplatesPanel, PosterLayoutsPanel, PosterExamplesPanel,
  PosterSectionsPanel, PosterAddPanel,
} from './PosterToolbarPanels';
import PosterPreview from './PosterPreview';
import PosterExportDialog from './PosterExportDialog';
import {
  buildPosterFromTemplate, buildPosterFromLayout, applyPosterTemplate,
  buildExamplePoster,
} from '@/lib/posterModel';

export default function PosterEditor({ initial, onExit }) {
  const { t, autoSave } = useApp();
  const { presentation: project, update, undo, redo, canUndo, canRedo } = usePresentationState(initial);
  const content = project.content;
  const size = content.size;
  const baseW = size.w;
  const baseH = size.h;
  const language = content.language;

  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [zoomMode, setZoomMode] = useState('fit');
  const [focusMode, setFocusMode] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [snap] = useState(true);
  const [showLeft, setShowLeft] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const [menu, setMenu] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const clipboard = useRef([]);

  const selectedEls = content.elements.filter((e) => selectedIds.includes(e.id));
  const selectedEl = selectedEls.length === 1 ? selectedEls[0] : null;

  const updateContent = useCallback((updater) => {
    update((p) => ({ ...p, content: typeof updater === 'function' ? updater(p.content) : { ...p.content, ...updater } }));
  }, [update]);
  const updateElements = (fn) => updateContent((c) => ({ ...c, elements: fn(c.elements) }));
  const updateElement = (id, patch) => updateElements((els) => els.map((e) => {
    if (e.id !== id) return e;
    const next = { ...e, ...patch };
    if (patch.content) next.content = { ...e.content, ...patch.content };
    return next;
  }));

  const addElement = (el) => { updateElements((els) => [...els, el]); setSelectedIds([el.id]); };
  const removeSelected = () => {
    const ids = selectedEls.map((e) => e.id);
    if (!ids.length) return;
    updateElements((els) => els.filter((e) => !ids.includes(e.id)));
    setSelectedIds([]); setEditingId(null);
  };
  const duplicateSelected = () => {
    if (!selectedEls.length) return;
    const copies = selectedEls.map((el) => ({ ...el, id: createId(), x: el.x + 24, y: el.y + 24, content: { ...el.content } }));
    updateElements((els) => [...els, ...copies]);
    setSelectedIds(copies.map((c) => c.id));
  };
  const paste = () => {
    if (!clipboard.current.length) return;
    const copies = clipboard.current.map((el) => ({ ...el, id: createId(), x: el.x + 30, y: el.y + 30, content: { ...el.content } }));
    updateElements((els) => [...els, ...copies]);
    setSelectedIds(copies.map((c) => c.id));
  };

  const moveZ = (dir) => {
    if (!selectedEls.length) return;
    const ids = selectedEls.map((e) => e.id);
    updateElements((arr) => {
      let a = arr.map((e) => ({ ...e }));
      if (dir === 'front' || dir === 'back') {
        const zs = a.map((e) => e.zIndex || 0);
        if (dir === 'front') { const max = Math.max(0, ...zs); a = a.map((e) => ids.includes(e.id) ? { ...e, zIndex: max + 1 } : e); }
        else { const min = Math.min(0, ...zs); a = a.map((e) => ids.includes(e.id) ? { ...e, zIndex: min - 1 } : e); }
        return a;
      }
      const sorted = [...a].sort((x, y) => (x.zIndex || 0) - (y.zIndex || 0));
      for (let i = 0; i < sorted.length; i++) {
        if (ids.includes(sorted[i].id)) {
          if (dir === 'forward' && i < sorted.length - 1 && !ids.includes(sorted[i + 1].id)) {
            const tz = sorted[i].zIndex || i; sorted[i].zIndex = sorted[i + 1].zIndex || (i + 1); sorted[i + 1].zIndex = tz; i++;
          } else if (dir === 'backward' && i > 0 && !ids.includes(sorted[i - 1].id)) {
            const tz = sorted[i].zIndex || i; sorted[i].zIndex = sorted[i - 1].zIndex || (i - 1); sorted[i - 1].zIndex = tz;
          }
        }
      }
      return sorted;
    });
  };
  const toggleLock = () => {
    const ids = selectedEls.map((e) => e.id);
    if (!ids.length) return;
    const allLocked = selectedEls.every((e) => e.locked);
    updateElements((els) => els.map((e) => ids.includes(e.id) ? { ...e, locked: !allLocked } : e));
  };

  const align = (type) => {
    if (selectedEls.length < 2) return;
    const ids = selectedEls.map((e) => e.id);
    updateElements((els) => {
      const group = els.filter((e) => ids.includes(e.id));
      const set = (fn) => els.map((e) => ids.includes(e.id) ? fn(e) : e);
      if (type === 'left') { const m = Math.min(...group.map((e) => e.x)); return set((e) => ({ ...e, x: m })); }
      if (type === 'right') { const m = Math.max(...group.map((e) => e.x + e.width)); return set((e) => ({ ...e, x: m - e.width })); }
      if (type === 'centerH') { const m = (Math.min(...group.map((e) => e.x)) + Math.max(...group.map((e) => e.x + e.width))) / 2; return set((e) => ({ ...e, x: m - e.width / 2 })); }
      if (type === 'top') { const m = Math.min(...group.map((e) => e.y)); return set((e) => ({ ...e, y: m })); }
      if (type === 'bottom') { const m = Math.max(...group.map((e) => e.y + e.height)); return set((e) => ({ ...e, y: m - e.height })); }
      if (type === 'middle') { const m = (Math.min(...group.map((e) => e.y)) + Math.max(...group.map((e) => e.y + e.height))) / 2; return set((e) => ({ ...e, y: m - e.height / 2 })); }
      return els;
    });
  };
  const distribute = (axis) => {
    if (selectedEls.length < 3) return;
    const ids = selectedEls.map((e) => e.id);
    updateElements((els) => {
      const group = els.filter((e) => ids.includes(e.id));
      const sorted = [...group].sort((a, b) => (axis === 'h' ? a.x - b.x : a.y - b.y));
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
      return els.map((e) => map[e.id] !== undefined ? { ...e, [axis === 'h' ? 'x' : 'y']: map[e.id] } : e);
    });
  };

  const onCommitMoves = (box) => updateElements((els) => els.map((e) => box[e.id] ? { ...e, x: box[e.id].x, y: box[e.id].y } : e));
  const onCommitResize = (id, b) => updateElement(id, { x: b.x, y: b.y, width: b.width, height: b.height });

  const changeSize = (newSize) => updateContent((c) => {
    const sx = newSize.w / c.size.w, sy = newSize.h / c.size.h;
    return { ...c, size: newSize, elements: c.elements.map((e) => ({ ...e, x: Math.round(e.x * sx), y: Math.round(e.y * sy), width: Math.round(e.width * sx), height: Math.round(e.height * sy) })) };
  });
  const applyTemplate = (tpl) => updateContent((c) => ({ ...applyPosterTemplate(c, tpl), templateId: tpl.id }));
  const applyLayout = (layout) => updateContent((c) => ({ ...c, elements: buildPosterFromLayout(layout, c.size, t, c.elements) }));
  const useExample = (ex) => {
    const built = buildExamplePoster(ex, t);
    updateContent((c) => ({ ...c, size: built.size, background: built.background, elements: built.elements, templateId: built.templateId }));
  };
  const setPosterBackground = (bg) => updateContent((c) => ({ ...c, background: bg }));

  const addText = (role) => addElement(newElement('text', { role, x: Math.round(baseW * 0.1), y: Math.round(baseH * 0.1), width: Math.round(baseW * 0.8), height: Math.round(baseH * 0.12), content: { ...defaultTextContent(role), text: t(`ev.text.${role}`) } }));
  const addShape = (shape) => addElement(newElement('shape', { x: Math.round(baseW * 0.25), y: Math.round(baseH * 0.3), width: Math.round(baseW * 0.25), height: Math.round(baseH * 0.2), content: { shape, fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: shape === 'rounded' ? 16 : 0, opacity: 1 } }));
  const addIcon = (name) => addElement(newElement('icon', { x: Math.round(baseW * 0.4), y: Math.round(baseH * 0.4), width: 120, height: 120, content: { name, color: '#2563eb', size: 64, opacity: 1 } }));
  const addImageFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    addElement(newElement('image', { x: Math.round(baseW * 0.2), y: Math.round(baseH * 0.2), width: Math.round(baseW * 0.4), height: Math.round(baseH * 0.3), content: { src, fit: 'cover', radius: 12, shadow: false, opacity: 1, lockAspect: false } }));
    setActivePanel(null);
  };
  const addLogo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    addElement(newElement('image', { role: 'logo', x: Math.round(baseW * 0.78), y: Math.round(baseH * 0.04), width: Math.round(baseW * 0.16), height: Math.round(baseH * 0.08), content: { src, fit: 'fit', radius: 8, shadow: false, opacity: 1, lockAspect: true } }));
    setActivePanel(null);
  };
  const addSection = (block) => {
    const els = block.build(size);
    const offset = Math.min(content.elements.length, 12) * Math.round(baseH * 0.05);
    const shifted = els.map((e) => ({ ...e, y: e.y + offset }));
    updateElements((arr) => [...arr, ...shifted]);
    setSelectedIds(shifted.map((e) => e.id));
    setActivePanel(null);
  };

  // keyboard
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
      if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); setSelectedIds(content.elements.map((el) => el.id)); return; }
      if (!st.selectedIds.length) return;
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); return; }
      if (mod && e.key.toLowerCase() === 'x') { e.preventDefault(); clipboard.current = selectedEls.map((el) => JSON.parse(JSON.stringify(el))); removeSelected(); return; }
      if (mod && e.key.toLowerCase() === 'v' && clipboard.current.length) { e.preventDefault(); paste(); return; }
      if (e.key === 'Delete') { e.preventDefault(); removeSelected(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); removeSelected(); return; }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const ids = selectedEls.map((el) => el.id);
        updateElements((els) => els.map((el) => ids.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // debounced auto-save
  const latestRef = useRef(project);
  latestRef.current = project;
  const persist = useCallback(async () => {
    const p = latestRef.current;
    await saveProject({ ...p, type: 'poster', updated_date: nowISO() });
  }, []);
  useEffect(() => {
    if (!autoSave) return;
    setSaveState('saving');
    const timer = setTimeout(async () => { await persist(); setSaveState('saved'); }, 700);
    return () => clearTimeout(timer);
  }, [project, autoSave, persist]);

  const saveNow = async () => { setSaveState('saving'); await persist(); setSaveState('saved'); setTimeout(() => setSaveState('idle'), 1500); };

  const openMenu = (e, elId) => {
    if (elId && !selectedIds.includes(elId)) setSelectedIds([elId]);
    setMenu({ x: e.clientX, y: e.clientY, elId });
  };

  const ToolBtn = ({ icon: Icon, label, onClick, active, disabled }) => (
    <Button variant={active ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={onClick} disabled={disabled} title={label}>
      <Icon className="h-4 w-4" />
    </Button>
  );

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

  const leftTools = [
    { id: 'templates', icon: LayoutTemplate, label: t('ev.template') },
    { id: 'layouts', icon: Shapes, label: t('ev.layout') },
    { id: 'add', icon: Type, label: t('ev.add') },
    { id: 'icons', icon: Sparkles, label: t('ev.addIcon') },
    { id: 'sections', icon: Layers, label: t('poster.sections') },
    { id: 'background', icon: Palette, label: t('ev.background') },
    { id: 'examples', icon: BookOpen, label: t('ev.examples') },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-card">
        <ToolBtn icon={ArrowLeft} label={t('common.back')} onClick={onExit} />
        <ToolBtn icon={Undo2} label={t('pb.undo')} onClick={undo} disabled={!canUndo} />
        <ToolBtn icon={Redo2} label={t('pb.redo')} onClick={redo} disabled={!canRedo} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={Type} label={t('ev.addText')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={ImageIcon} label={t('ev.addImage')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Square} label={t('ev.addShape')} onClick={() => setActivePanel('add')} active={activePanel === 'add'} />
        <ToolBtn icon={Sparkles} label={t('ev.addIcon')} onClick={() => setActivePanel('icons')} active={activePanel === 'icons'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={LayoutTemplate} label={t('ev.template')} onClick={() => setActivePanel('templates')} active={activePanel === 'templates'} />
        <ToolBtn icon={Shapes} label={t('ev.layout')} onClick={() => setActivePanel('layouts')} active={activePanel === 'layouts'} />
        <ToolBtn icon={Layers} label={t('poster.sections')} onClick={() => setActivePanel('sections')} active={activePanel === 'sections'} />
        <ToolBtn icon={Palette} label={t('ev.background')} onClick={() => setActivePanel('background')} active={activePanel === 'background'} />
        <span className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn icon={ZoomOut} label={t('ev.zoomOut')} onClick={() => zoomStep(-1)} />
        <select value={zoomMode} onChange={(e) => setZoomMode(e.target.value)} className="h-8 rounded-md border border-input bg-transparent text-xs px-1" title={t('ev.zoom')}>
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
        <ToolBtn icon={PanelLeft} label={t('ev.slides')} onClick={() => setShowLeft((v) => !v)} active={showLeft} disabled={focusMode} />
        <ToolBtn icon={PanelRight} label={t('ev.props')} onClick={() => setShowProps((v) => !v)} active={showProps} disabled={focusMode} />
        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowExport(true)}><Download className="h-4 w-4" /> {t('export.button')}</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreview(true)}><Eye className="h-4 w-4" /> {t('ev.preview')}</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={saveNow}><Save className="h-4 w-4" />{saveState === 'saving' ? t('pb.saving') : saveState === 'saved' ? t('pb.saved') : t('ev.save')}</Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {!focusMode && (
          <div className={cn(showLeft ? 'flex' : 'hidden', 'md:flex flex-col w-14 md:w-16 shrink-0 border-e border-border bg-card')}>
            {leftTools.map((tool) => (
              <button key={tool.id} onClick={() => setActivePanel(tool.id)} title={tool.label}
                className={cn('flex flex-col items-center justify-center gap-1 py-3 text-[10px] hover:bg-accent', activePanel === tool.id ? 'text-primary bg-accent' : 'text-muted-foreground')}>
                <tool.icon className="h-5 w-5" />
                <span className="hidden md:inline leading-tight text-center px-1">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
        <PosterCanvas poster={content} baseW={baseW} baseH={baseH} language={language} zoomMode={zoomMode}
          selectedIds={selectedIds} editingId={editingId} showGrid={showGrid} snap={snap}
          onSelect={setSelectedIds}
          onCommitMoves={onCommitMoves} onCommitResize={onCommitResize}
          onStartEdit={(id) => { setSelectedIds([id]); setEditingId(id); }}
          onEndEdit={(id, text) => { updateElement(id, { content: { text } }); setEditingId(null); }}
          onBackgroundClick={() => { setSelectedIds([]); setEditingId(null); }}
          onContextMenu={openMenu} />
        {!focusMode && (
          <div className={cn(showProps ? 'flex' : 'hidden', 'md:flex')}>
            <PosterPropertiesPanel poster={content} selectedEls={selectedEls} selectedEl={selectedEl}
              onChangeElement={updateElement} onChangeSize={changeSize}
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
        <PanelDrawer title={panelTitle(activePanel, t)} onClose={() => setActivePanel(null)}>
          {activePanel === 'add' && <PosterAddPanel onAddText={addText} onAddShape={addShape} onAddImageFile={addImageFile} onAddLogo={addLogo} />}
          {activePanel === 'templates' && <PosterTemplatesPanel onApply={applyTemplate} />}
          {activePanel === 'layouts' && <PosterLayoutsPanel onApply={applyLayout} />}
          {activePanel === 'background' && <BackgroundPanel slide={content} onChange={setPosterBackground} />}
          {activePanel === 'icons' && <IconsPanel onAdd={addIcon} />}
          {activePanel === 'sections' && <PosterSectionsPanel onAdd={addSection} />}
          {activePanel === 'examples' && <PosterExamplesPanel onUse={useExample} />}
        </PanelDrawer>
      )}

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
      {showPreview && <PosterPreview poster={content} onClose={() => setShowPreview(false)} />}
      <PosterExportDialog open={showExport} poster={{ ...content, name: project.name || t('poster.untitled') }} onClose={() => setShowExport(false)} />
    </div>
  );
}

function panelTitle(id, t) {
  const map = { add: t('ev.add'), templates: t('ev.template'), layouts: t('ev.layout'), background: t('ev.background'), icons: t('ev.addIcon'), sections: t('poster.sections'), examples: t('ev.examples') };
  return map[id] || '';
}

function buildMenuItems(elId, t, h) {
  if (!elId) {
    return [{ label: t('ev.action.paste'), onClick: h.onPaste, disabled: !h.hasClipboard }];
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