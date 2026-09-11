import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Presentation, Image, FileText, GraduationCap, FolderOpen, ArrowRight, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { useProjects } from '@/lib/useProjects';
import ToolCard from '@/components/ToolCard';
import ProjectCard from '@/components/ProjectCard';
import EmptyState from '@/components/EmptyState';
import RenameDialog from '@/components/RenameDialog';
import DeleteDialog from '@/components/DeleteDialog';

const tools = [
  { to: '/presentation-builder', icon: Presentation, titleKey: 'home.presentation.title', descKey: 'home.presentation.desc', btnKey: 'home.presentation.btn', accent: { bg: '#ede9fe', fg: '#6d28d9' } },
  { to: '/poster-maker', icon: Image, titleKey: 'home.poster.title', descKey: 'home.poster.desc', btnKey: 'home.poster.btn', accent: { bg: '#e0f2fe', fg: '#0369a1' } },
  { to: '/report-assignment', icon: FileText, titleKey: 'home.report.title', descKey: 'home.report.desc', btnKey: 'home.report.btn', accent: { bg: '#d1fae5', fg: '#047857' } },
];

export default function Home() {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const { projects, rename, duplicate, remove } = useProjects();

  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const recent = projects.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Hero */}
      <section className="mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
          <GraduationCap className="h-3.5 w-3.5" />
          {t('app.tagline')}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('home.welcome')}</h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-2xl">{t('home.subtitle')}</p>
      </section>

      {/* Tools */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t('home.tools')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.to} {...tool} />
          ))}
        </div>
      </section>

      {/* Start from an Example */}
      <section className="mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('ex.startFromExample')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">{t('ex.startFromExample.desc')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { to: '/examples?type=presentation', icon: Presentation, label: t('ex.home.presentation'), accent: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400' },
            { to: '/examples?type=poster', icon: Image, label: t('ex.home.poster'), accent: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
            { to: '/examples?type=report', icon: FileText, label: t('ex.home.report'), accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
          ].map((c) => (
            <button key={c.to} onClick={() => navigate(c.to)}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-5 card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5 text-start">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accent} shrink-0`}>
                <c.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm flex-1">{c.label}</span>
              <ArrowRight className={`h-4 w-4 text-muted-foreground group-hover:text-primary ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>
      </section>

      {/* Recent projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('home.recent')}</h2>
          {recent.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate('/projects')}>
              {t('home.recent.viewAll')}
              <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState icon={FolderOpen} title={t('home.recent.empty')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recent.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onRename={setRenameTarget}
                onDuplicate={(proj) => duplicate(proj.id)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </section>

      <RenameDialog
        open={!!renameTarget}
        project={renameTarget}
        onClose={() => setRenameTarget(null)}
        onConfirm={async (name) => {
          await rename(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />
      <DeleteDialog
        open={!!deleteTarget}
        project={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}