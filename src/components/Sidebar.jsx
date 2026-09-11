import { NavLink } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { navItems } from './navConfig';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { t } = useApp();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm">KRD StudyMate</p>
          <p className="text-[11px] text-muted-foreground">{t('app.tagline')}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground text-center">
          {t('about.localFirst')} · {t('about.version')} 1.0
        </p>
      </div>
    </aside>
  );
}