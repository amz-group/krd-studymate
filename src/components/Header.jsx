import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import LanguageSelector from './LanguageSelector';

const LOGO_URL = 'https://media.base44.com/images/public/6aa3de887f8efa551a56a159/381faf02d_StudayMate.png';
import ThemeToggle from './ThemeToggle';
import ProfileMenu from './ProfileMenu';
import { useApp } from '@/lib/AppContext';

export default function Header() {
  const { t } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <Image src={LOGO_URL} alt="KRD StudyMate" fittingType="fit" className="h-9 w-[150px]" />
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