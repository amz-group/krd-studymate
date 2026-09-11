import { Image } from 'lucide-react';
import ToolPlaceholder from '@/components/ToolPlaceholder';

export default function PosterMaker() {
  return (
    <ToolPlaceholder
      icon={Image}
      titleKey="tool.poster.title"
      subtitleKey="tool.poster.subtitle"
      placeholderKey="tool.poster.placeholder"
      accent={{ bg: '#e0f2fe', fg: '#0369a1' }}
    />
  );
}