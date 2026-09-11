import { useNavigate } from 'react-router-dom';
import { MoreVertical, FolderOpen, Pencil, Copy, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/AppContext';

const typeIcon = {
  presentation: { icon: FolderOpen, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-500/15' },
  poster: { icon: FolderOpen, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-500/15' },
  report: { icon: FolderOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ProjectCard({ project, onRename, onDuplicate, onDelete }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const meta = typeIcon[project.type] || typeIcon.report;
  const Icon = meta.icon;

  const openRoute = {
    presentation: '/presentation-builder',
    poster: '/poster-maker',
    report: '/report-assignment',
  }[project.type] || '/projects';

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${meta.bg} ${meta.color} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate flex items-center gap-2" title={project.name}>
            {project.name}
            {project.status === 'draft' && (
              <span className="text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 px-1.5 py-0.5 shrink-0">{t('pb.draft')}</span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t(`project.type.${project.type}`)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename(project)} className="gap-2">
              <Pencil className="h-4 w-4" /> {t('project.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(project)} className="gap-2">
              <Copy className="h-4 w-4" /> {t('project.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(project)} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> {t('project.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-5">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {t('project.created')}: {formatDate(project.created_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {t('project.edited')}: {formatDate(project.updated_date)}
        </span>
      </div>

      <Button variant="outline" className="mt-auto w-full" onClick={() => navigate(`${openRoute}?id=${project.id}`)}>
        {t('project.open')}
      </Button>
    </div>
  );
}