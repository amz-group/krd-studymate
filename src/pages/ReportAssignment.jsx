import { FileText } from 'lucide-react';
import ToolPlaceholder from '@/components/ToolPlaceholder';

export default function ReportAssignment() {
  return (
    <ToolPlaceholder
      icon={FileText}
      titleKey="tool.report.title"
      subtitleKey="tool.report.subtitle"
      placeholderKey="tool.report.placeholder"
      accent={{ bg: '#d1fae5', fg: '#047857' }}
    />
  );
}