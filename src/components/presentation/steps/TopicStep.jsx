import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/AppContext';
import { saveProject } from '@/lib/db';
import RecommendedExamples from '@/components/examples/RecommendedExamples';
import ExamplePreview from '@/components/examples/ExamplePreview';
import { createExampleCopy } from '@/lib/examples/registry';

export default function TopicStep({ presentation, update }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const topic = presentation.content.topic;
  const set = (patch) => update((c) => ({ ...c, topic: { ...c.topic, ...patch } }));
  const [previewEx, setPreviewEx] = useState(null);

  const instantiateExample = async (ex) => {
    const copy = await createExampleCopy(ex, t, saveProject);
    setPreviewEx(null);
    navigate(`/presentation-builder?id=${copy.id}`);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h2 className="text-xl font-semibold">{t('pb.topic.question')}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('pb.topic.title')} <span className="text-destructive">*</span></Label>
            <Input value={topic.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('pb.topic.titlePlaceholder')} autoFocus />
          </div>
          <div className="space-y-2">
            <Label>{t('pb.topic.subtitle')}</Label>
            <Input value={topic.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder={t('pb.topic.subtitlePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label>{t('pb.topic.subject')}</Label>
            <Input value={topic.subject} onChange={(e) => set({ subject: e.target.value })} placeholder={t('pb.topic.subjectPlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label>{t('pb.topic.description')}</Label>
            <Textarea value={topic.description} onChange={(e) => set({ description: e.target.value })} placeholder={t('pb.topic.descriptionPlaceholder')} rows={4} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-10">
        <RecommendedExamples type="presentation" onPreview={setPreviewEx} />
      </div>

      {previewEx && (
        <ExamplePreview
          example={previewEx}
          favorite={false}
          onToggleFavorite={() => {}}
          onClose={() => setPreviewEx(null)}
          onUse={() => instantiateExample(previewEx)}
        />
      )}
    </>
  );
}