import { useApp } from '@/lib/AppContext';

// Reusable clean empty state.
export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  const { t } = useApp();
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border bg-card/50">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground mb-4">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <p className="text-base font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}