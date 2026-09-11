import { Upload, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { coverLayouts, reportFonts } from '@/lib/reportAssets';
import { getPageSize } from '@/lib/reportModel';
import { downscaleImage } from '@/lib/editorUtils';
import CoverPage from './CoverPage';

const fields = [
  { id: 'logo', key: 'rep.cover.logo' },
  { id: 'university', key: 'rep.cover.uni' },
  { id: 'department', key: 'rep.cover.dept' },
  { id: 'subject', key: 'rep.cover.subject' },
  { id: 'title', key: 'rep.cover.title' },
  { id: 'subtitle', key: 'rep.cover.subtitle' },
  { id: 'student', key: 'rep.cover.student' },
  { id: 'supervisor', key: 'rep.cover.supervisor' },
  { id: 'academicYear', key: 'rep.cover.year' },
  { id: 'date', key: 'rep.cover.date' },
];

export default function CoverEditor({ t, doc, onChange }) {
  const cover = doc.cover;
  const set = (patch) => onChange({ cover: { ...cover, ...patch } });
  const setShow = (k, v) => onChange({ cover: { ...cover, show: { ...cover.show, [k]: v } } });

  const onLogo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    set({ logo: src });
  };

  const ps = getPageSize(doc.pageSize);
  const scale = 240 / ps.pxW;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{t('rep.cover.enable')}</Label>
        <Switch checked={cover.enabled} onCheckedChange={(v) => set({ enabled: v })} />
      </div>
      {cover.enabled && (
        <>
          <div className="rounded-md border border-border p-2 bg-muted/30">
            <div className="flex justify-center overflow-hidden">
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                <CoverPage cover={{ ...cover, _rtl: false }} info={doc.studentInfo} pageSize={doc.pageSize} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.cover.layout')}</Label>
            <select value={cover.layout} onChange={(e) => set({ layout: e.target.value })}
              className="h-8 w-full rounded-md border border-input bg-transparent text-xs px-2">
              {coverLayouts.map((l) => <option key={l.id} value={l.id}>{t(l.key)}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 flex-1 gap-1.5" onClick={() => document.getElementById('rd-logo-upload')?.click()}>
              <Upload className="h-3.5 w-3.5" /> {cover.logo ? t('rep.cover.replaceLogo') : t('rep.cover.uploadLogo')}
            </Button>
            {cover.logo && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => set({ logo: '' })}><Trash2 className="h-3.5 w-3.5" /></Button>}
            <input id="rd-logo-upload" type="file" accept="image/*" className="hidden" onChange={onLogo} />
          </div>
          {cover.logo && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('rep.cover.logoSize')}: {cover.logoSize}px</Label>
              <input type="range" min={60} max={220} value={cover.logoSize} onChange={(e) => set({ logoSize: Number(e.target.value) })} className="w-full" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('rep.cover.color')}</Label>
              <input type="color" value={cover.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="h-8 w-full rounded-md border border-input" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('rep.cover.font')}</Label>
              <select value={cover.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}
                className="h-8 w-full rounded-md border border-input bg-transparent text-xs px-2">
                {reportFonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.cover.fields')}</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {fields.map((f) => (
                <label key={f.id} className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1">
                  <Switch checked={!!cover.show[f.id]} onCheckedChange={(v) => setShow(f.id, v)} />
                  <span className="text-xs">{t(f.key)}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}