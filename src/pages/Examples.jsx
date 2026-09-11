import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, Clock, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { saveProject } from '@/lib/db';
import {
  allExamples, getExamplesByType, exampleCategories, exampleStyles, exampleLanguages,
  createExampleCopy, editorRoute,
} from '@/lib/examples/registry';
import { getFavorites, getRecent, toggleFavorite, pushRecent } from '@/lib/examples/favorites';
import ExampleCard from '@/components/examples/ExampleCard';
import ExamplePreview from '@/components/examples/ExamplePreview';

const tabs = [
  { id: 'presentation', key: 'ex.tab.presentations' },
  { id: 'poster', key: 'ex.tab.posters' },
  { id: 'report', key: 'ex.tab.reports' },
];
const langLabel = { en: 'English', ku: 'کوردی', ar: 'العربية' };

export default function Examples() {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialType = params.get('type') === 'poster' ? 'poster' : params.get('type') === 'report' ? 'report' : 'presentation';
  const [tab, setTab] = useState(initialType);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('name');
  const [favOnly, setFavOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setFavorites(getFavorites());
    setRecent(getRecent());
  }, []);

  const setTabAndUrl = (id) => {
    setTab(id);
    setParams({ type: id }, { replace: true });
  };

  const refreshFav = (id) => {
    const next = toggleFavorite(id);
    setFavorites(next);
  };

  const handleUse = async (example) => {
    const copy = await createExampleCopy(example, t, saveProject);
    pushRecent(example.id);
    setRecent(getRecent());
    navigate(`${editorRoute[example.type]}?id=${copy.id}`);
  };

  const list = useMemo(() => {
    let arr = getExamplesByType(tab);
    if (favOnly) arr = arr.filter((e) => favorites.includes(e.id));
    if (category !== 'all') arr = arr.filter((e) => e.category === category);
    if (style !== 'all') arr = arr.filter((e) => e.style === style);
    if (language !== 'all') arr = arr.filter((e) => e.language === language);
    const q = query.trim().toLowerCase();
    if (q) arr = arr.filter((e) => (e.name + ' ' + e.description + ' ' + e.category).toLowerCase().includes(q));
    arr = [...arr].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category));
    return arr;
  }, [tab, favOnly, favorites, category, style, language, query, sort]);

  const recentExamples = useMemo(() => {
    return recent.map((id) => allExamples.find((e) => e.id === id)).filter(Boolean).slice(0, 6);
  }, [recent]);

  const selectClass = 'h-9 rounded-md border border-input bg-transparent px-2 text-sm';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header */}
      <section className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
          <Sparkles className="h-3.5 w-3.5" /> {t('ex.badge')}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('ex.title')}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{t('ex.subtitle')}</p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-xl border border-border bg-card p-1 gap-1">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTabAndUrl(tb.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === tb.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t(tb.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Recently used */}
      {recentExamples.length > 0 && !favOnly && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> {t('ex.recent')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentExamples.map((ex) => (
              <button key={ex.id} onClick={() => setPreview(ex)} className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden card-shadow text-start transition-all hover:border-primary/40 hover:-translate-y-0.5">
                <div className="w-full overflow-hidden rounded-t-lg border-b border-border bg-muted/30" style={{ aspectRatio: '16 / 9' }}>
                  <div className="flex h-full w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">{ex.name}</div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate">{ex.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ex.category}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('ex.search')}
              className={`${dir === 'rtl' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`} />
            {query && (
              <button onClick={() => setQuery('')} className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-2' : 'right-2'} text-muted-foreground hover:text-foreground`}><X className="h-4 w-4" /></button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="all">{t('ex.filter.category')}</option>
              {exampleCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={selectClass}>
              <option value="all">{t('ex.filter.style')}</option>
              {exampleStyles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
              <option value="all">{t('ex.filter.language')}</option>
              {exampleLanguages.map((l) => <option key={l} value={l}>{langLabel[l]}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
              <option value="name">{t('ex.sort.name')}</option>
              <option value="category">{t('ex.sort.category')}</option>
            </select>
            <Button variant={favOnly ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setFavOnly((v) => !v)}>
              <Star className="h-4 w-4" fill={favOnly ? 'currentColor' : 'none'} /> {t('ex.favorites')}
            </Button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{t('ex.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((ex) => (
              <ExampleCard
                key={ex.id}
                example={ex}
                favorite={favorites.includes(ex.id)}
                onToggleFavorite={() => refreshFav(ex.id)}
                onPreview={() => setPreview(ex)}
                onUse={() => handleUse(ex)}
              />
            ))}
          </div>
        )}
      </section>

      {preview && (
        <ExamplePreview
          example={preview}
          favorite={favorites.includes(preview.id)}
          onToggleFavorite={() => refreshFav(preview.id)}
          onClose={() => setPreview(null)}
          onUse={() => { setPreview(null); handleUse(preview); }}
        />
      )}
    </div>
  );
}