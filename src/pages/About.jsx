import { GraduationCap, ShieldCheck, Info } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function About() {
  const { t } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('about.title')}</h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 card-shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">KRD StudyMate</h2>
            <p className="text-sm text-muted-foreground">{t('about.tagline')}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{t('about.description')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('about.localFirst')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('about.localFirst.desc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('about.version')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">1.0 · Step 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}