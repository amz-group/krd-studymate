import { NavLink } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useApp } from '@/lib/AppContext';
import { navItems } from './navConfig';
import { cn } from '@/lib/utils';

const LOGO_URL = 'https://media.base44.com/images/public/6aa3de887f8efa551a56a159/381faf02d_StudayMate.png';

export default function Sidebar() {
  const { t } = useApp();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <Image src={LOGO_URL} alt="KRD StudyMate" fittingType="fit" className="h-10 w-[180px]" />
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