import { useMemo } from 'react';
import { X, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ScaledSlide from '@/components/presentation/editor/ScaledSlide';
import ReportPagesView from '@/components/examples/ReportPagesView';

const typeKey = { presentation: 'ex.type.presentation', poster: 'ex.type.poster', report: 'ex.type.report' };
const langLabel = { en: 'English', ku: 'کوردی', ar: 'العربية' };

export default function ExamplePreview({ example, onClose, onUse, favorite, onToggleFavorite }) {
  const { t, dir } = useApp();
  const project = useMemo(() => example.buildProject(t), [example, t]);

  const countText = example.type === 'presentation'
    ? `${example.count.n} ${t('ex.slides')}`
    : example.type === 'poster'
      ? example.count.size.replace('-', ' ')
      : `${example.count.n} ${t('ex.sections')}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose} aria-label={t('common.back')}><X className="h-5 w-5" /></Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold truncate">{example.name}</h2>
          <p className="text-xs text-muted-foreground truncate">{example.description}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{t(typeKey[example.type])}</span>
          <span>{example.category}</span>
          <span>·</span>
          <span>{example.style}</span>
          <span>·</span>
          <span>{langLabel[example.language]}</span>
          <span>·</span>
          <span>{countText}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onToggleFavorite} aria-label={t('ex.favorite')}>
          <Heart className="h-5 w-5" fill={favorite ? 'currentColor' : 'none'} color={favorite ? '#f43f5e' : 'currentColor'} />
        </Button>
        <Button className="gap-1.5" onClick={onUse}>
          {t('ex.use')} <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto bg-[#525659] p-4 md:p-8">
        <div className="mx-auto" style={{ maxWidth: example.type === 'poster' ? 900 : 1100 }}>
          {example.type === 'presentation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {project.content.slides.map((s, i) => (
                <div key={s.id} className="rounded-xl overflow-hidden border border-black/20 bg-white shadow-lg">
                  <ScaledSlide slide={s} baseW={1280} baseH={720} language={example.language} className="w-full" />
                </div>
              ))}
            </div>
          )}
          {example.type === 'poster' && (
            <div className="rounded-xl overflow-hidden border border-black/20 bg-white shadow-lg mx-auto" style={{ maxWidth: 800 }}>
              <ScaledSlide slide={project.content} baseW={project.content.size.w} baseH={project.content.size.h} language={example.language} className="w-full" />
            </div>
          )}
          {example.type === 'report' && (
            <div className="flex justify-center">
              <ReportPagesView doc={project.content} widthPx={620} maxPages={Infinity} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}