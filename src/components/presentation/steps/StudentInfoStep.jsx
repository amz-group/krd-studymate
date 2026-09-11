import { useApp } from '@/lib/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createId } from '@/lib/db';

const fieldDefs = [
  { key: 'name', labelKey: 'pb.student.name' },
  { key: 'id', labelKey: 'pb.student.id' },
  { key: 'university', labelKey: 'pb.student.university' },
  { key: 'college', labelKey: 'pb.student.college' },
  { key: 'department', labelKey: 'pb.student.department' },
  { key: 'stage', labelKey: 'pb.student.stage' },
  { key: 'group', labelKey: 'pb.student.group' },
  { key: 'supervisor', labelKey: 'pb.student.supervisor' },
  { key: 'academicYear', labelKey: 'pb.student.academicYear' },
];

const commonFields = ['university', 'college', 'department', 'supervisor', 'academicYear'];
const studentFields = ['name', 'id', 'stage', 'group'];

export default function StudentInfoStep({ presentation, update }) {
  const { t } = useApp();
  const si = presentation.content.studentInfo;

  const toggle = (k) => update((c) => ({ ...c, studentInfo: { ...c.studentInfo, fields: { ...c.studentInfo.fields, [k]: !c.studentInfo.fields[k] } } }));
  const setCommon = (k, v) => update((c) => ({ ...c, studentInfo: { ...c.studentInfo, common: { ...c.studentInfo.common, [k]: v } } }));
  const setStudent = (idx, k, v) => update((c) => ({ ...c, studentInfo: { ...c.studentInfo, students: c.studentInfo.students.map((s, i) => (i === idx ? { ...s, [k]: v } : s)) } }));
  const addStudent = () => update((c) => ({ ...c, studentInfo: { ...c.studentInfo, students: [...c.studentInfo.students, { uid: createId(), name: '', id: '', stage: '', group: '' }] } }));
  const removeStudent = (idx) => update((c) => ({ ...c, studentInfo: { ...c.studentInfo, students: c.studentInfo.students.filter((_, i) => i !== idx) } }));

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('pb.student.question')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('pb.student.optional')}</p>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">{t('pb.student.fields')}</p>
        <div className="flex flex-wrap gap-2">
          {fieldDefs.map((f) => {
            const on = si.fields[f.key];
            return (
              <button key={f.key} type="button" onClick={() => toggle(f.key)}
                className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  on ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:bg-accent/50')}>
                {on ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {t(f.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border p-4 space-y-3">
        <p className="text-sm font-medium">{t('pb.student.common')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonFields.map((k) => si.fields[k] ? (
            <div key={k} className="space-y-1.5">
              <Label>{t(`pb.student.${k}`)}</Label>
              <Input value={si.common[k] || ''} onChange={(e) => setCommon(k, e.target.value)} />
            </div>
          ) : null)}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">{t('pb.student.students')}</p>
        {si.students.map((s, idx) => (
          <div key={s.uid} className="rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">#{idx + 1}</span>
              {si.students.length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive gap-1.5" onClick={() => removeStudent(idx)}>
                  <Trash2 className="h-4 w-4" />{t('pb.student.removeStudent')}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentFields.map((k) => si.fields[k] ? (
                <div key={k} className="space-y-1.5">
                  <Label>{t(`pb.student.${k}`)}</Label>
                  <Input value={s[k] || ''} onChange={(e) => setStudent(idx, k, e.target.value)} placeholder={k === 'name' ? t('pb.student.namePlaceholder') : ''} />
                </div>
              ) : null)}
            </div>
          </div>
        ))}
        <Button variant="outline" className="gap-2" onClick={addStudent}><Plus className="h-4 w-4" />{t('pb.student.addStudent')}</Button>
      </div>
    </div>
  );
}