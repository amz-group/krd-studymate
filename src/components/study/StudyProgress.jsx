import { BarChart3, FileText, Type, Layers, HelpCircle, ClipboardCheck, Trophy, Clock, RotateCcw } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { countWords } from '@/lib/studyModel';

export default function StudyProgress({ content }) {
  const { t } = useApp();
  const c = content;
  const words = countWords(c.text);
  const pages = c.pages?.length || 1;
  const cards = c.flashcards?.length || 0;
  const studied = c.flashcards?.filter((x) => x.studied).length || 0;
  const questions = c.questions?.length || 0;
  const needsReview = c.questions?.filter((q) => q.needsReview).length || 0;
  const attempts = c.quizHistory?.length || 0;
  const best = c.progress?.bestScore || 0;
  const last = c.progress?.lastStudied;

  const stats = [
    { icon: FileText, label: 'study.progress.pages', value: pages },
    { icon: Type, label: 'study.progress.words', value: words.toLocaleString() },
    { icon: Layers, label: 'study.progress.flashcards', value: `${cards}` },
    { icon: Layers, label: 'study.progress.studied', value: `${studied}` },
    { icon: HelpCircle, label: 'study.progress.questions', value: `${questions}` },
    { icon: RotateCcw, label: 'study.progress.needsReview', value: `${needsReview}` },
    { icon: ClipboardCheck, label: 'study.progress.quizAttempts', value: `${attempts}` },
    { icon: Trophy, label: 'study.progress.bestScore', value: `${best}%` },
    { icon: Clock, label: 'study.progress.lastStudied', value: last ? new Date(last).toLocaleDateString() : t('study.progress.never') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">{t('study.progress.title')}</h2></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <Icon className="h-5 w-5 text-muted-foreground mb-2" />
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t(s.label)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}