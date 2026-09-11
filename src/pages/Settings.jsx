import { Sun, Moon, Monitor, Globe, FileText, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/lib/AppContext';
import SettingsRow from '@/components/SettingsRow';
import OptionGroup from '@/components/OptionGroup';

const languageOptions = [
  { value: 'en', labelKey: 'lang.en' },
  { value: 'ku', labelKey: 'lang.ku' },
  { value: 'ar', labelKey: 'lang.ar' },
];

const themeOptions = [
  { value: 'light', labelKey: 'theme.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', icon: Moon },
  { value: 'system', labelKey: 'theme.system', icon: Monitor },
];

const docLanguageOptions = [
  { value: 'en', labelKey: 'lang.en', icon: FileText },
  { value: 'ku', labelKey: 'lang.ku', icon: FileText },
  { value: 'ar', labelKey: 'lang.ar', icon: FileText },
];

export default function Settings() {
  const { t, language, theme, documentLanguage, autoSave, updateSettings } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('settings.subtitle')}</p>
      </header>

      <div className="space-y-5">
        <SettingsRow titleKey="settings.language" descKey="settings.language.desc">
          <OptionGroup
            options={languageOptions}
            value={language}
            onChange={(v) => updateSettings({ language: v })}
            getKey={(o) => t(o.labelKey)}
          />
        </SettingsRow>

        <SettingsRow titleKey="settings.theme" descKey="settings.theme.desc">
          <OptionGroup
            options={themeOptions}
            value={theme}
            onChange={(v) => updateSettings({ theme: v })}
            getKey={(o) => t(o.labelKey)}
          />
        </SettingsRow>

        <SettingsRow titleKey="settings.docLanguage" descKey="settings.docLanguage.desc">
          <OptionGroup
            options={docLanguageOptions}
            value={documentLanguage}
            onChange={(v) => updateSettings({ documentLanguage: v })}
            getKey={(o) => t(o.labelKey)}
          />
        </SettingsRow>

        <SettingsRow titleKey="settings.autoSave" descKey="settings.autoSave.desc">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Save className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{t('settings.autoSave.toggle')}</span>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={(v) => updateSettings({ autoSave: v })}
              aria-label={t('settings.autoSave.toggle')}
            />
          </div>
        </SettingsRow>
      </div>
    </div>
  );
}