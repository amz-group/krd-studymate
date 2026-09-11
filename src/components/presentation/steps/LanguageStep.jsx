import { useApp } from '@/lib/AppContext';
import OptionGroup from '@/components/OptionGroup';

const options = [
  { value: 'en', labelKey: 'pb.language.en' },
  { value: 'ku', labelKey: 'pb.language.ku' },
  { value: 'ar', labelKey: 'pb.language.ar' },
];

export default function LanguageStep({ presentation, update }) {
  const { t } = useApp();
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('pb.language.question')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('pb.language.desc')}</p>
      </div>
      <OptionGroup
        options={options}
        value={presentation.content.language}
        onChange={(v) => update((c) => ({ ...c, language: v }))}
        getKey={(o) => t(o.labelKey)}
      />
    </div>
  );
}