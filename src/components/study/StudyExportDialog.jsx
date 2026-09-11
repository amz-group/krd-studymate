import { useState } from 'react';
import { Download, Loader2, Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/lib/AppContext';
import { exportStudyPack, printStudyPack } from '@/lib/exportStudyPack';

const SECTIONS = [
  { key: 'summary', label: 'study.ws.summary' },
  { key: 'keyPoints', label: 'study.ws.keyPoints' },
  { key: 'questions', label: 'study.ws.questions' },
  { key: 'flashcards', label: 'study.ws.flashcards' },
  { key: 'notes', label: 'study.ws.notes' },
];

export default function StudyExportDialog({ open, onClose, project, t }) {
  const { t: tt } = useApp();
  const T = t || tt;
  const [sections, setSections] = useState({ summary: true, keyPoints: true, questions: true, flashcards: true, notes: true });
  const [cover, setCover] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [busy, setBusy] = useState(false);

  const toggle = (k) => setSections((s) => ({ ...s, [k]: !s[k] }));

  const run = async () => {
    setBusy(true);
    try {
      await exportStudyPack(project, { sections, cover, studentName, subject, date }, T);
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{T('study.export.title')}</DialogTitle>
          <DialogDescription>{T('study.export.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cover} onChange={(e) => setCover(e.target.checked)} className="rounded" />
            {T('study.export.cover')}
          </label>
          {cover && (
            <div className="grid grid-cols-1 gap-2 pl-6">
              <Input placeholder={T('study.export.studentName')} value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              <Input placeholder={T('study.export.subject')} value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Input placeholder={T('study.export.date')} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">{T('study.export.include')}</div>
            <div className="space-y-1.5">
              {SECTIONS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sections[s.key]} onChange={() => toggle(s.key)} className="rounded" />
                  {T(s.label)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 gap-2" disabled={busy} onClick={run}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> {T('study.export.preparing')}</> : <><Download className="h-4 w-4" /> {T('study.export.download')}</>}
            </Button>
            <Button variant="outline" className="gap-2" disabled={busy} onClick={() => printStudyPack(project, { sections, cover, studentName, subject, date }, T)}>
              <Printer className="h-4 w-4" /> {T('study.export.print')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}