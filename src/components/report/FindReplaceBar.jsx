import { useState } from 'react';
import { Search, Replace, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FindReplaceBar({ t, onClose, onFind, onReplace, onReplaceAll }) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border bg-accent/40">
      <div className="flex items-center gap-1.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder={t('rep.find')}
          className="h-8 w-44" onKeyDown={(e) => { if (e.key === 'Enter') onFind(find); }} />
        <Button variant="ghost" size="sm" className="h-8" onClick={() => onFind(find)}>{t('rep.findNext')}</Button>
      </div>
      <div className="flex items-center gap-1.5">
        <Replace className="h-4 w-4 text-muted-foreground" />
        <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder={t('rep.replace')}
          className="h-8 w-44" />
        <Button variant="ghost" size="sm" className="h-8" onClick={() => onReplace(find, replace)}>{t('rep.replace')}</Button>
        <Button variant="ghost" size="sm" className="h-8" onClick={() => onReplaceAll(find, replace)}>{t('rep.replaceAll')}</Button>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 ms-auto" onClick={onClose}><X className="h-4 w-4" /></Button>
    </div>
  );
}