import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

export default function HeaderFooterEditor({ t, doc, onChange }) {
  const header = doc.header; const footer = doc.footer;
  const setHeader = (patch) => onChange({ header: { ...header, ...patch } });
  const setFooter = (patch) => onChange({ footer: { ...footer, ...patch } });
  return (
    <div className="space-y-4">
      <Section title={t('rep.header')}>
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t('rep.enable')}</Label>
          <Switch checked={header.enabled} onCheckedChange={(v) => setHeader({ enabled: v })} />
        </div>
        {header.enabled && (
          <div className="grid grid-cols-3 gap-1.5">
            <Input placeholder={t('rep.alignLeft')} value={header.left} onChange={(e) => setHeader({ left: e.target.value })} className="h-8 text-xs" />
            <Input placeholder={t('rep.alignCenter')} value={header.center} onChange={(e) => setHeader({ center: e.target.value })} className="h-8 text-xs" />
            <Input placeholder={t('rep.alignRight')} value={header.right} onChange={(e) => setHeader({ right: e.target.value })} className="h-8 text-xs" />
          </div>
        )}
      </Section>
      <Section title={t('rep.footer')}>
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t('rep.enable')}</Label>
          <Switch checked={footer.enabled} onCheckedChange={(v) => setFooter({ enabled: v })} />
        </div>
        {footer.enabled && (
          <Input placeholder={t('rep.footerText')} value={footer.text} onChange={(e) => setFooter({ text: e.target.value })} className="h-8 text-xs" />
        )}
      </Section>
    </div>
  );
}