import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportFonts } from '@/lib/reportAssets';
import { pageSizes } from '@/lib/reportAssets';

function Row({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function DocumentSettings({ t, doc, onChange }) {
  const set = (patch) => onChange(patch);
  const setMargin = (k, v) => onChange({ margin: { ...doc.margin, [k]: v } });
  return (
    <div className="space-y-3">
      <Row label={t('rep.pageSize')}>
        <div className="flex gap-2">
          {Object.values(pageSizes).map((p) => (
            <button key={p.id} onClick={() => set({ pageSize: p.id })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${doc.pageSize === p.id ? 'border-primary bg-accent' : 'border-border'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </Row>
      <Row label={t('rep.margins')}>
        <div className="grid grid-cols-4 gap-1.5">
          {['top', 'right', 'bottom', 'left'].map((k) => (
            <div key={k}>
              <Input type="number" value={doc.margin[k]} min={5} max={50}
                onChange={(e) => setMargin(k, Number(e.target.value) || 0)} className="h-8 text-xs" />
              <span className="text-[10px] text-muted-foreground">{t(`rep.margin.${k}`)}</span>
            </div>
          ))}
        </div>
      </Row>
      <Row label={t('rep.font')}>
        <select value={doc.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}
          className="h-8 w-full rounded-md border border-input bg-transparent text-xs px-2">
          {reportFonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label={t('rep.fontSize')}>
          <Input type="number" value={doc.fontSize} min={8} max={36}
            onChange={(e) => set({ fontSize: Number(e.target.value) || 12 })} className="h-8 text-xs" />
        </Row>
        <Row label={t('rep.lineHeight')}>
          <Input type="number" step="0.1" value={doc.lineHeight} min={1} max={3}
            onChange={(e) => set({ lineHeight: Number(e.target.value) || 1.5 })} className="h-8 text-xs" />
        </Row>
      </div>
      <Row label={t('rep.paraSpacing')}>
        <Input type="number" value={doc.paragraphSpacing} min={0} max={40}
          onChange={(e) => set({ paragraphSpacing: Number(e.target.value) || 0 })} className="h-8 text-xs" />
      </Row>
    </div>
  );
}