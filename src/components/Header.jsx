import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import ProfileMenu from './ProfileMenu';
import { useApp } from '@/lib/AppContext';

export default function Header() {
  const { t } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-semibold text-sm">KRD StudyMate</span>
      </Link>

      <div className="hidden md:block">
        <h1 className="text-sm font-medium text-muted-foreground">{t('app.tagline')}</h1>
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <LanguageSelector />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}