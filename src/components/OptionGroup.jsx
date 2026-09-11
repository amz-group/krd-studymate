import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// A row of selectable option buttons (used for language / theme / doc language).
export default function OptionGroup({ options, value, onChange, getKey }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
              active
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border bg-background hover:border-primary/40 hover:bg-accent/50'
            )}
          >
            <span className="flex items-center gap-2">
              {opt.icon && <opt.icon className="h-4 w-4" />}
              {getKey(opt)}
            </span>
            {active && <Check className="h-4 w-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}