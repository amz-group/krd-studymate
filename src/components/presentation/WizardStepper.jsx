import { Check } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';

export default function WizardStepper({ steps, current, onJump }) {
  const { t } = useApp();
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((key, i) => {
        const active = i === current;
        const done = i < current;
        const reachable = i <= current;
        return (
          <button
            key={key}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onJump(i)}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
              active ? 'bg-primary text-primary-foreground'
                : done ? 'bg-accent text-accent-foreground hover:bg-accent'
                : 'text-muted-foreground'
            )}
          >
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
              active ? 'bg-primary-foreground/20' : done ? 'bg-primary/15 text-primary' : 'bg-muted'
            )}>
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}