import { NavLink } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { navItems } from './navConfig';
import { cn } from '@/lib/utils';

// Bottom navigation for mobile (hidden on md+ where the sidebar shows).
export default function MobileNav() {
  const { t } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="flex items-stretch overflow-x-auto no-scrollbar">
        {navItems.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 min-w-[4.5rem] flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="truncate max-w-full px-0.5">{t(key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}