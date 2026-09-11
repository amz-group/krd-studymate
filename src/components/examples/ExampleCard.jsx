import { Heart, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ExampleThumbnail from '@/components/examples/ExampleThumbnail';

const typeKey = { presentation: 'ex.type.presentation', poster: 'ex.type.poster', report: 'ex.type.report' };
const langLabel = { en: 'English', ku: 'کوردی', ar: 'العربية' };

export default function ExampleCard({ example, onPreview, onUse, favorite, onToggleFavorite }) {
  const { t, dir } = useApp();
  const countText = example.type === 'presentation'
    ? `${example.count.n} ${t('ex.slides')}`
    : example.type === 'poster'
      ? example.count.size.replace('-', ' ')
      : `${example.count.n} ${t('ex.sections')}`;

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5">
      <div className="relative">
        <button onClick={onPreview} className="block w-full" aria-label={t('ex.preview')}>
          <ExampleThumbnail example={example} />
        </button>
        <button
          onClick={onToggleFavorite}
          aria-label={t('ex.favorite')}
          className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} h-8 w-8 rounded-full flex items-center justify-center backdrop-blur bg-background/70 border border-border transition-colors ${favorite ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{example.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-medium rounded-full bg-accent text-accent-foreground px-2 py-0.5">{t(typeKey[example.type])}</span>
          <span className="text-[10px] font-medium rounded-full bg-muted text-muted-foreground px-2 py-0.5">{example.category}</span>
          <span className="text-[10px] font-medium rounded-full bg-muted text-muted-foreground px-2 py-0.5">{example.style}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{example.description}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{langLabel[example.language] || example.language}</span>
          <span>·</span>
          <span>{countText}</span>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5" /> {t('ex.preview')}
          </Button>
          <Button size="sm" className="flex-1 gap-1.5" onClick={onUse}>
            {t('ex.use')} <ArrowRight className={`h-3.5 w-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}