import { useEffect, useMemo, useRef, useState } from 'react';
import ScaledSlide from '@/components/presentation/editor/ScaledSlide';
import ReportPagesView from '@/components/examples/ReportPagesView';
import { useApp } from '@/lib/AppContext';

// Lazily renders a real designed preview of an example (only when scrolled into view).
export default function ExampleThumbnail({ example, widthPx = 260, maxReportPages = 2 }) {
  const { t } = useApp();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const project = useMemo(() => (visible ? example.buildProject(t) : null), [visible, example, t]);

  return (
    <div ref={ref} className="w-full overflow-hidden rounded-lg border border-border bg-muted/30" style={{ aspectRatio: example.type === 'poster' ? undefined : '16 / 9' }}>
      {!visible || !project ? (
        <div className="flex h-full w-full items-center justify-center bg-muted/40">
          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
        </div>
      ) : example.type === 'presentation' ? (
        <ScaledSlide slide={project.content.slides[0]} baseW={1280} baseH={720} language={example.language} className="w-full" />
      ) : example.type === 'poster' ? (
        <ScaledSlide slide={project.content} baseW={project.content.size.w} baseH={project.content.size.h} language={example.language} className="w-full" />
      ) : (
        <div className="flex justify-center p-2" style={{ minHeight: 150 }}>
          <ReportPagesView doc={project.content} widthPx={widthPx} maxPages={maxReportPages} />
        </div>
      )}
    </div>
  );
}