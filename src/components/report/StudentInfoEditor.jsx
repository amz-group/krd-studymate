import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function StudentInfoEditor({ t, doc, onChange }) {
  const info = doc.studentInfo;
  const set = (patch) => onChange({ studentInfo: { ...info, ...patch } });
  const setStudent = (i, patch) => {
    const students = info.students.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    set({ students });
  };
  const addStudent = () => set({ students: [...info.students, { name: '', id: '' }] });
  const removeStudent = (i) => set({ students: info.students.filter((_, idx) => idx !== i) });

  const fields = [
    ['title', 'rep.info.title'], ['subtitle', 'rep.info.subtitle'], ['subject', 'rep.info.subject'],
    ['university', 'rep.info.university'], ['college', 'rep.info.college'], ['department', 'rep.info.department'],
    ['stage', 'rep.info.stage'], ['group', 'rep.info.group'], ['supervisor', 'rep.info.supervisor'],
    ['academicYear', 'rep.info.academicYear'], ['date', 'rep.info.date'],
  ];

  return (
    <div className="space-y-2.5">
      {fields.map(([k, label]) => (
        <div key={k} className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t(label)}</Label>
          <Input value={info[k] || ''} onChange={(e) => set({ [k]: e.target.value })} className="h-8 text-xs" />
        </div>
      ))}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-semibold text-muted-foreground">{t('rep.info.students')}</Label>
        {info.students.map((s, i) => (
          <div key={i} className="flex gap-1.5">
            <Input placeholder={t('rep.info.studentName')} value={s.name} onChange={(e) => setStudent(i, { name: e.target.value })} className="h-8 text-xs flex-1" />
            <Input placeholder={t('rep.info.studentId')} value={s.id} onChange={(e) => setStudent(i, { id: e.target.value })} className="h-8 text-xs w-24" />
            {info.students.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStudent(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-8 w-full gap-1.5" onClick={addStudent}><Plus className="h-3.5 w-3.5" /> {t('rep.info.addStudent')}</Button>
      </div>
    </div>
  );
}