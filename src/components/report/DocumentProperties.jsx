import { useState } from 'react';
import { ChevronDown, Settings2, Image as ImageIcon, User, Heading, Hash, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';
import DocumentSettings from './DocumentSettings';
import StudentInfoEditor from './StudentInfoEditor';
import CoverEditor from './CoverEditor';
import HeaderFooterEditor from './HeaderFooterEditor';
import PageNumberEditor from './PageNumberEditor';
import ReferencesEditor from './ReferencesEditor';

function Section({ t, id, icon: Icon, title, children, open, onToggle }) {
  return (
    <div className="border-b border-border">
      <button onClick={onToggle} className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-accent/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold flex-1 text-start">{title}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function DocumentProperties({ t, doc, onChange }) {
  const [open, setOpen] = useState('settings');
  const toggle = (id) => setOpen((o) => (o === id ? null : id));
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{t('rep.properties')}</p>
      </div>
      <Section t={t} id="settings" icon={Settings2} title={t('rep.docSettings')} open={open === 'settings'} onToggle={() => toggle('settings')}>
        <DocumentSettings t={t} doc={doc} onChange={onChange} />
      </Section>
      <Section t={t} id="info" icon={User} title={t('rep.info.title')} open={open === 'info'} onToggle={() => toggle('info')}>
        <StudentInfoEditor t={t} doc={doc} onChange={onChange} />
      </Section>
      <Section t={t} id="cover" icon={ImageIcon} title={t('rep.cover.title')} open={open === 'cover'} onToggle={() => toggle('cover')}>
        <CoverEditor t={t} doc={doc} onChange={onChange} />
      </Section>
      <Section t={t} id="hf" icon={Heading} title={t('rep.headerFooter')} open={open === 'hf'} onToggle={() => toggle('hf')}>
        <HeaderFooterEditor t={t} doc={doc} onChange={onChange} />
      </Section>
      <Section t={t} id="pn" icon={Hash} title={t('rep.pageNumbers')} open={open === 'pn'} onToggle={() => toggle('pn')}>
        <PageNumberEditor t={t} doc={doc} onChange={onChange} />
      </Section>
      <Section t={t} id="refs" icon={BookMarked} title={t('rep.references')} open={open === 'refs'} onToggle={() => toggle('refs')}>
        <ReferencesEditor t={t} doc={doc} onChange={onChange} />
      </Section>
    </div>
  );
}