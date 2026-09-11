import { Presentation } from 'lucide-react';
import ToolPlaceholder from '@/components/ToolPlaceholder';

export default function PresentationBuilder() {
  return (
    <ToolPlaceholder
      icon={Presentation}
      titleKey="tool.presentation.title"
      subtitleKey="tool.presentation.subtitle"
      placeholderKey="tool.presentation.placeholder"
      accent={{ bg: '#ede9fe', fg: '#6d28d9' }}
    />
  );
}