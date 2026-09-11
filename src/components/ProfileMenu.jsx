import { useNavigate } from 'react-router-dom';
import { User, FolderOpen, Settings, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/AppContext';

export default function ProfileMenu() {
  const { t } = useApp();
  const navigate = useNavigate();

  const go = (path) => () => navigate(path);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 rounded-full px-1.5 hover:bg-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            S
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">{t('profile.profile')}</p>
          <p className="text-xs text-muted-foreground mt-1">KRD StudyMate</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={go('/projects')} className="gap-2">
          <FolderOpen className="h-4 w-4" /> {t('profile.projects')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={go('/settings')} className="gap-2">
          <Settings className="h-4 w-4" /> {t('profile.settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={go('/about')} className="gap-2">
          <Info className="h-4 w-4" /> {t('profile.about')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}