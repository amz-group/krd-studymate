import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

// Shared placeholder for the four tool pages (Steps 2–5 will replace these).
export default function ToolPlaceholder({ icon: Icon, titleKey, subtitleKey, placeholderKey, accent }) {
  const { t, dir } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/')}>
        <ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        {t('tool.backHome')}
      </Button>

      <div className="flex flex-col items-center text-center py-12 md:py-20 rounded-3xl border border-dashed border-border bg-card/50">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
          style={{ background: accent.bg, color: accent.fg }}
        >
          <Icon className="h-8 w-8" />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t(titleKey)}</h1>
        <p className="text-muted-foreground mt-2 max-w-md">{t(subtitleKey)}</p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">
          <Sparkles className="h-4 w-4" />
          {t('tool.comingSoon')}
        </div>

        <p className="mt-5 text-sm text-muted-foreground max-w-sm">{t(placeholderKey)}</p>
      </div>
    </div>
  );
}