import { GraduationCap } from 'lucide-react';
import ToolPlaceholder from '@/components/ToolPlaceholder';

export default function StudyAssistant() {
  return (
    <ToolPlaceholder
      icon={GraduationCap}
      titleKey="tool.study.title"
      subtitleKey="tool.study.subtitle"
      placeholderKey="tool.study.placeholder"
      accent={{ bg: '#fef3c7', fg: '#b45309' }}
    />
  );
}