import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent, Link2, Image as ImageIcon,
  Table as TableIcon, Minus, ListTree, Heading1, Palette, Highlighter, Search, Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportFonts } from '@/lib/reportAssets';

function TBtn({ icon: Icon, label, onClick, active, disabled }) {
  return (
    <Button variant={active ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8"
      onMouseDown={(e) => e.preventDefault()} onClick={onClick} disabled={disabled} title={label}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

const sizes = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36];

export default function EditorToolbar({ t, sel, api, onFind }) {
  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-card sticky top-0 z-20">
      <TBtn icon={Undo2} label={t('rep.undo')} onClick={api.undo} />
      <TBtn icon={Redo2} label={t('rep.redo')} onClick={api.redo} />
      <span className="w-px h-5 bg-border mx-0.5" />

      <select
        value={sel.block || 'p'}
        onChange={(e) => api.formatBlock(e.target.value)}
        className="h-8 rounded-md border border-input bg-transparent text-xs px-1.5"
        title={t('rep.style')}
      >
        <option value="p">{t('rep.style.paragraph')}</option>
        <option value="h1">{t('rep.style.h1')}</option>
        <option value="h2">{t('rep.style.h2')}</option>
        <option value="h3">{t('rep.style.h3')}</option>
        <option value="blockquote">{t('rep.style.quote')}</option>
      </select>

      <select
        value={sel.fontId || 'inter'}
        onChange={(e) => api.fontName(e.target.value)}
        className="h-8 rounded-md border border-input bg-transparent text-xs px-1.5 max-w-[120px]"
        title={t('rep.font')}
      >
        {reportFonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select>

      <select
        value={sel.fontSize || 12}
        onChange={(e) => api.fontSize(Number(e.target.value))}
        className="h-8 rounded-md border border-input bg-transparent text-xs px-1.5 w-16"
        title={t('rep.fontSize')}
      >
        {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <span className="w-px h-5 bg-border mx-0.5" />
      <TBtn icon={Bold} label={t('rep.bold')} active={sel.bold} onClick={() => api.cmd('bold')} />
      <TBtn icon={Italic} label={t('rep.italic')} active={sel.italic} onClick={() => api.cmd('italic')} />
      <TBtn icon={Underline} label={t('rep.underline')} active={sel.underline} onClick={() => api.cmd('underline')} />
      <TBtn icon={Strikethrough} label={t('rep.strike')} active={sel.strike} onClick={() => api.cmd('strikeThrough')} />

      <label className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent cursor-pointer" title={t('rep.color')}>
        <Palette className="h-4 w-4" />
        <input type="color" className="sr-only" onChange={(e) => api.color(e.target.value)} />
      </label>
      <label className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent cursor-pointer" title={t('rep.highlight')}>
        <Highlighter className="h-4 w-4" />
        <input type="color" className="sr-only" onChange={(e) => api.highlight(e.target.value)} />
      </label>

      <span className="w-px h-5 bg-border mx-0.5" />
      <TBtn icon={AlignLeft} label={t('rep.alignLeft')} active={sel.align === 'left'} onClick={() => api.cmd('justifyLeft')} />
      <TBtn icon={AlignCenter} label={t('rep.alignCenter')} active={sel.align === 'center'} onClick={() => api.cmd('justifyCenter')} />
      <TBtn icon={AlignRight} label={t('rep.alignRight')} active={sel.align === 'right'} onClick={() => api.cmd('justifyRight')} />
      <TBtn icon={AlignJustify} label={t('rep.alignJustify')} active={sel.align === 'justify'} onClick={() => api.cmd('justifyFull')} />

      <span className="w-px h-5 bg-border mx-0.5" />
      <TBtn icon={List} label={t('rep.bullet')} active={sel.bullet} onClick={() => api.cmd('insertUnorderedList')} />
      <TBtn icon={ListOrdered} label={t('rep.number')} active={sel.number} onClick={() => api.cmd('insertOrderedList')} />
      <TBtn icon={Indent} label={t('rep.indent')} onClick={() => api.cmd('indent')} />
      <TBtn icon={Outdent} label={t('rep.outdent')} onClick={() => api.cmd('outdent')} />

      <span className="w-px h-5 bg-border mx-0.5" />
      <TBtn icon={Link2} label={t('rep.link')} onClick={api.link} />
      <TBtn icon={ImageIcon} label={t('rep.image')} onClick={api.image} />
      <TBtn icon={TableIcon} label={t('rep.table')} onClick={api.table} />
      <TBtn icon={Minus} label={t('rep.pageBreak')} onClick={api.pageBreak} />
      <TBtn icon={ListTree} label={t('rep.toc')} onClick={api.toc} />
      <TBtn icon={Search} label={t('rep.find')} onClick={onFind} />
    </div>
  );
}