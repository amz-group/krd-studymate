import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { getExamplesByType } from '@/lib/examples/registry';
import ExampleThumbnail from '@/components/examples/ExampleThumbnail';

// A compact "Recommended" row shown on each editor's start screen.
export default function RecommendedExamples({ type, onUse, onPreview }) {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const items = getExamplesByType(type).slice(0, 6);
  if (!items.length) return null;
  const titleKey = { presentation: 'ex.recommended.presentations', poster: 'ex.recommended.posters', report: 'ex.recommended.documents' }[type];

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t(titleKey)}</h2>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/examples?type=${type}`)}>
          {t('ex.viewAll')} <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((ex) => (
          <button key={ex.id} onClick={() => onPreview(ex)} className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden card-shadow text-start transition-all hover:border-primary/40 hover:-translate-y-0.5">
            <ExampleThumbnail example={ex} widthPx={180} maxReportPages={1} />
            <div className="p-2.5">
              <p className="text-xs font-medium truncate">{ex.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{ex.category}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}