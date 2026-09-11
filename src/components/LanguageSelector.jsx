import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/AppContext';

const options = [
  { value: 'en', labelKey: 'lang.en' },
  { value: 'ku', labelKey: 'lang.ku' },
  { value: 'ar', labelKey: 'lang.ar' },
];

export default function LanguageSelector() {
  const { language, t, updateSettings } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('settings.language')}>
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => updateSettings({ language: opt.value })}
            className="flex items-center justify-between gap-2"
          >
            <span>{t(opt.labelKey)}</span>
            {language === opt.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}