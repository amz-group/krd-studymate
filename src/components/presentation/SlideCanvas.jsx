import { useRef, useEffect, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { resolveDesign, baseDimensions, isRtl } from '@/lib/presentationModel';

function bgCss(design) {
  const { bg, primary, accent } = design;
  if (design.background?.type === 'gradient') {
    return { background: `linear-gradient(135deg, ${bg}, ${primary}22 55%, ${accent}33)` };
  }
  if (design.background?.type === 'pattern') {
    return { backgroundColor: bg, backgroundImage: `radial-gradient(${primary}1f 1.5px, transparent 1.5px)`, backgroundSize: '26px 26px' };
  }
  return { backgroundColor: bg };
}

function flexAlign(a) {
  return a === 'center' ? 'center' : a === 'right' || a === 'end' ? 'flex-end' : 'flex-start';
}

function TitleBody({ slide, design, fs, presentation, t }) {
  const si = presentation.content.studentInfo;
  const show = si.fields;
  const names = si.students.map((s) => s.name).filter(Boolean).join(' · ');
  const lines = [];
  if (show.supervisor && si.common.supervisor) lines.push(`${t('pb.student.supervisor')}: ${si.common.supervisor}`);
  if (show.university && si.common.university) lines.push(si.common.university);
  if (show.college && si.common.college) lines.push(si.common.college);
  if (show.department && si.common.department) lines.push(si.common.department);
  if (show.academicYear && si.common.academicYear) lines.push(si.common.academicYear);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 88px', textAlign: design.titleAlign }}>
      <div style={{ height: 6, width: 130, background: design.accent, marginBottom: 34, alignSelf: flexAlign(design.titleAlign) }} />
      <div style={{ fontSize: 56 * fs, fontWeight: 800, lineHeight: 1.1, color: design.primary }}>{slide.title}</div>
      {slide.subtitle ? <div style={{ fontSize: 30 * fs, color: design.muted, marginTop: 18 }}>{slide.subtitle}</div> : null}
      <div style={{ marginTop: 54, fontSize: 23 * fs, color: design.text, lineHeight: 1.7 }}>
        {show.name && names ? <div style={{ fontWeight: 600 }}>{names}</div> : null}
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

function ContentBody({ slide, design, fs }) {
  const bullets = (slide.bullets || []).filter((b) => b && b.trim());
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '58px 80px', textAlign: design.bodyAlign === 'start' ? 'inherit' : design.bodyAlign }}>
      <div style={{ height: 6, width: 96, background: design.accent, marginBottom: 22, alignSelf: flexAlign(design.titleAlign) }} />
      <div style={{ fontSize: 44 * fs, fontWeight: 700, color: design.primary, marginBottom: 26, textAlign: design.titleAlign }}>{slide.title}</div>
      {slide.body ? <div style={{ fontSize: 26 * fs, lineHeight: 1.45, color: design.text, marginBottom: 20 }}>{slide.body}</div> : null}
      {bullets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, fontSize: 24 * fs, color: design.text }}>
              <span style={{ color: design.accent, fontWeight: 700 }}>◆</span>
              <span style={{ flex: 1 }}>{b}</span>
            </div>
          ))}
        </div>
      ) : null}
      {slide.image ? <img src={slide.image} alt="" style={{ marginTop: 22, maxWidth: '55%', maxHeight: '40%', borderRadius: 14, objectFit: 'cover', alignSelf: flexAlign(design.bodyAlign) }} /> : null}
    </div>
  );
}

function refText(r) {
  const parts = [];
  if (r.author) parts.push(r.author);
  if (r.year) parts.push(`(${r.year})`);
  if (r.title) parts.push(r.title);
  let s = parts.join('. ');
  if (r.link) s += `. ${r.link}`;
  return s || '—';
}

function ReferencesBody({ slide, design, fs, presentation }) {
  const refs = presentation.content.references || [];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '58px 80px' }}>
      <div style={{ height: 6, width: 96, background: design.accent, marginBottom: 22, alignSelf: flexAlign(design.titleAlign) }} />
      <div style={{ fontSize: 44 * fs, fontWeight: 700, color: design.primary, marginBottom: 28, textAlign: design.titleAlign }}>{slide.title}</div>
      {refs.length > 0 ? (
        <ol style={{ fontSize: 23 * fs, color: design.text, lineHeight: 1.7, margin: 0, paddingInlineStart: 28 }}>
          {refs.map((r, i) => <li key={r.id || i} style={{ marginBottom: 10 }}>{refText(r)}</li>)}
        </ol>
      ) : <div style={{ fontSize: 23 * fs, color: design.muted }}>—</div>}
    </div>
  );
}

export default function SlideCanvas({ slide, presentation, className }) {
  const { t } = useApp();
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  const design = resolveDesign(presentation.content.design);
  const { w, h } = baseDimensions(presentation.content.ratio);
  const fs = { sm: 0.85, md: 1, lg: 1.18 }[design.fontSize] || 1;
  const rtl = isRtl(presentation.content.language);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  return (
    <div ref={ref} className={className} style={{ aspectRatio: `${w} / ${h}`, direction: rtl ? 'rtl' : 'ltr' }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', ...bgCss(design), color: design.text, overflow: 'hidden', position: 'relative' }}>
        {slide.type === 'title'
          ? <TitleBody slide={slide} design={design} fs={fs} presentation={presentation} t={t} />
          : slide.type === 'references'
            ? <ReferencesBody slide={slide} design={design} fs={fs} presentation={presentation} />
            : <ContentBody slide={slide} design={design} fs={fs} />}
      </div>
    </div>
  );
}