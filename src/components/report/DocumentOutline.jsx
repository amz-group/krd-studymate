import { ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';

// Left-side document outline. Headings are passed in; clicking scrolls the
// editor to that heading.
export default function DocumentOutline({ t, headings, onNavigate, sections, onInsertSection }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
          <ListTree className="h-3.5 w-3.5" /> {t('rep.outline')}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {headings.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3">{t('rep.outline.empty')}</p>
        ) : (
          <ol className="space-y-0.5">
            {headings.map((h, i) => (
              <li key={h.id + i}>
                <button
                  onClick={() => onNavigate(h.id)}
                  className={cn('w-full text-start rounded-md px-2 py-1 text-xs hover:bg-accent truncate',
                    h.level === 1 ? 'font-semibold' : 'text-muted-foreground')}
                  style={{ paddingInlineStart: `${(h.level - 1) * 12 + 8}px` }}
                  title={h.text}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="border-t border-border p-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 px-1">{t('rep.sections')}</p>
        <div className="flex flex-wrap gap-1">
          {sections.map((s) => (
            <button key={s.id}
              onClick={() => onInsertSection(s.id)}
              className="text-[11px] rounded-md border border-border px-2 py-1 hover:bg-accent"
            >
              {t(s.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}