import { useRef, useEffect, useState } from 'react';
import { StickyNote, Bold, Italic, Underline, List, Heading, Highlighter, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

export default function StudyNotes({ content, onUpdate, focus }) {
  const { t } = useApp();
  const ref = useRef(null);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (content.notes || '')) {
      ref.current.innerHTML = content.notes || '';
    }
  }, [content.notes]);

  const exec = (cmd, val) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onInput();
  };

  const onInput = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onUpdate(ref.current?.innerHTML || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    }, 500);
  };

  const Btn = ({ icon: Icon, cmd, val, label }) => (
    <Button variant="ghost" size="icon" className="h-8 w-8" title={label} onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}><Icon className="h-4 w-4" /></Button>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.notes.title')}</h2>
        {saved && <span className="text-xs text-muted-foreground">· {t('study.notes.saved')}</span>}
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 flex-wrap">
        <Btn icon={Heading} cmd="formatBlock" val="<h2>" label={t('study.notes.heading')} />
        <Btn icon={Bold} cmd="bold" label={t('study.notes.bold')} />
        <Btn icon={Italic} cmd="italic" label={t('study.notes.italic')} />
        <Btn icon={Underline} cmd="underline" label={t('study.notes.underline')} />
        <Btn icon={List} cmd="insertUnorderedList" label={t('study.notes.bullet')} />
        <Btn icon={CheckSquare} cmd="insertUnorderedList" label={t('study.notes.checklist')} />
        <Btn icon={Highlighter} cmd="hiliteColor" val="#fde68a" label={t('study.notes.highlight')} />
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={onInput}
        className="min-h-[320px] rounded-xl border border-border bg-card p-4 text-sm leading-7 outline-none prose-sm max-w-none"
        data-placeholder={t('study.notes.placeholder')} />
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#94a3b8}`}</style>
    </div>
  );
}