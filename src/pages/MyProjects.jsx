import { useState, useMemo } from 'react';
import { Search, FolderOpen, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { useProjects } from '@/lib/useProjects';
import ProjectCard from '@/components/ProjectCard';
import EmptyState from '@/components/EmptyState';
import RenameDialog from '@/components/RenameDialog';
import DeleteDialog from '@/components/DeleteDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const filters = [
  { value: 'all', key: 'projects.filter.all' },
  { value: 'presentation', key: 'projects.filter.presentations' },
  { value: 'poster', key: 'projects.filter.posters' },
  { value: 'report', key: 'projects.filter.reports' },
];

export default function MyProjects() {
  const { t } = useApp();
  const { projects, loading, rename, duplicate, remove, removeAll } = useProjects();

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = projects;
    if (filter !== 'all') list = list.filter((p) => p.type === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const cmp = new Date(a.updated_date) - new Date(b.updated_date);
      return sortDesc ? -cmp : cmp;
    });
    return list;
  }, [projects, filter, query, sortDesc]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('projects.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('projects.subtitle')}</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('projects.search')}
            className="ps-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {t(f.key)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSortDesc((v) => !v)}>
              {t('projects.sort')}: {sortDesc ? '↓' : '↑'}
            </Button>
            {projects.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteAllOpen(true)}>
                <Trash2 className="h-4 w-4" /> {t('projects.deleteAll')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={query || filter !== 'all' ? t('projects.empty') : t('home.recent.empty')}
          subtitle={t('projects.empty.sub')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
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

      <Dialog open={deleteAllOpen} onOpenChange={(o) => setDeleteAllOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('projects.deleteAll.title')}</DialogTitle>
            <DialogDescription>{t('projects.deleteAll.message')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteAllOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={async () => { await removeAll(); setDeleteAllOpen(false); }}>{t('projects.deleteAll.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}