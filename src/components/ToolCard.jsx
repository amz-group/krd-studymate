import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

// One of the four main tool cards on the Home dashboard.
export default function ToolCard({ to, icon: Icon, titleKey, descKey, btnKey, accent }) {
  const { t, dir } = useApp();
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl mb-5"
        style={{ background: accent.bg, color: accent.fg }}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-semibold mb-1.5">{t(titleKey)}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{t(descKey)}</p>

      <Button
        onClick={() => navigate(to)}
        className="w-full gap-2 group-hover:gap-3 transition-all"
      >
        {t(btnKey)}
        <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}