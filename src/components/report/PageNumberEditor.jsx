import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

const styles = [
  { id: '1', label: '1, 2, 3' },
  { id: 'page', label: 'Page 1' },
  { id: 'pageof', label: 'Page 1 of 10' },
];
const positions = [
  { id: 'left', label: '⬅' },
  { id: 'center', label: '⬌' },
  { id: 'right', label: '➡' },
];

export default function PageNumberEditor({ t, doc, onChange }) {
  const pn = doc.pageNumber;
  const set = (patch) => onChange({ pageNumber: { ...pn, ...patch } });
  return (
    <div className="space-y-3">
      <Row label={t('rep.pageNumbers')}>
        <Switch checked={pn.enabled} onCheckedChange={(v) => set({ enabled: v })} />
      </Row>
      {pn.enabled && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.pnStyle')}</Label>
            <div className="flex gap-1.5">
              {styles.map((s) => (
                <button key={s.id} onClick={() => set({ style: s.id })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${pn.style === s.id ? 'border-primary bg-accent' : 'border-border'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.pnPosition')}</Label>
            <div className="flex gap-1.5">
              {positions.map((p) => (
                <button key={p.id} onClick={() => set({ position: p.id })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${pn.position === p.id ? 'border-primary bg-accent' : 'border-border'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Row label={t('rep.pnHideCover')}>
            <Switch checked={pn.hideOnCover} onCheckedChange={(v) => set({ hideOnCover: v })} />
          </Row>
        </>
      )}
    </div>
  );
}