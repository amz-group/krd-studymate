import { useApp } from '@/lib/AppContext';

// A labeled settings section wrapper.
export default function SettingsRow({ titleKey, descKey, children }) {
  const { t } = useApp();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 card-shadow">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{t(titleKey)}</h3>
        {descKey && <p className="text-sm text-muted-foreground mt-1">{t(descKey)}</p>}
      </div>
      {children}
    </div>
  );
}