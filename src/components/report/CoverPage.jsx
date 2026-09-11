import { fontStack } from '@/lib/reportAssets';
import { getPageSize } from '@/lib/reportModel';

// Renders a cover page (page 1) from structured cover + studentInfo data.
// Shared by the cover editor preview, the document preview, and PDF export.
export default function CoverPage({ cover, info, pageSize }) {
  const ps = getPageSize(pageSize);
  const s = cover.show || {};
  const font = fontStack(cover.fontFamily || 'inter');
  const primary = cover.primaryColor || '#1e3a8a';
  const students = (info.students || []).filter((x) => x.name).map((x) => x.name).join(', ');
  const wrap = (inner) => (
    <div style={{
      width: `${ps.w}mm`, minHeight: `${ps.h}mm`, boxSizing: 'border-box', background: '#fff',
      padding: '24mm 22mm', display: 'flex', flexDirection: 'column', color: '#0f172a',
      fontFamily: font, direction: (cover._rtl ? 'rtl' : 'ltr'),
    }}>{inner}</div>
  );

  const Logo = s.logo && cover.logo ? (
    <img src={cover.logo} alt="" style={{ width: `${cover.logoSize || 110}px`, height: 'auto', objectFit: 'contain' }} />
  ) : null;

  const Title = s.title && info.title ? <div style={{ fontSize: '30pt', fontWeight: 800, color: primary, lineHeight: 1.2 }}>{info.title}</div> : null;
  const Subtitle = s.subtitle && info.subtitle ? <div style={{ fontSize: '15pt', color: '#475569', marginTop: 8 }}>{info.subtitle}</div> : null;
  const Uni = s.university && info.university ? <div style={{ fontSize: '16pt', fontWeight: 700 }}>{info.university}</div> : null;
  const Dept = s.department && info.department ? <div style={{ fontSize: '13pt', color: '#475569' }}>{info.department}</div> : null;
  const Subject = s.subject && info.subject ? <div style={{ fontSize: '12pt', color: '#64748b' }}>{info.subject}</div> : null;
  const Student = s.student && students ? <div style={{ fontSize: '12pt' }}><b>{cover._rtl ? 'ئامادەکراو لەلایەن' : 'Prepared by'}:</b> {students}</div> : null;
  const Sup = s.supervisor && info.supervisor ? <div style={{ fontSize: '12pt' }}><b>{cover._rtl ? 'سەرپەرشتیار' : 'Supervisor'}:</b> {info.supervisor}</div> : null;
  const Year = s.academicYear && info.academicYear ? <div style={{ fontSize: '12pt' }}>{info.academicYear}</div> : null;
  const Date = s.date && info.date ? <div style={{ fontSize: '12pt' }}>{info.date}</div> : null;

  if (cover.layout === 'modern') {
    return wrap(
      <>
        {Logo && <div style={{ marginBottom: 16 }}>{Logo}</div>}
        <div style={{ borderInlineStart: `6px solid ${primary}`, paddingInlineStart: 16, marginBottom: 24 }}>
          {Uni}{Dept}
        </div>
        <div style={{ marginTop: 'auto' }}>
          {Title}{Subtitle}{Subject}
        </div>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 6, borderTop: `2px solid ${primary}`, paddingTop: 16 }}>
          {Student}{Sup}{Year}{Date}
        </div>
      </>
    );
  }
  if (cover.layout === 'minimal') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 10 }}>
        {Logo && <div>{Logo}</div>}
        {Uni}{Dept}
        <div style={{ margin: '20px 0' }}>{Title}{Subtitle}</div>
        {Student}{Sup}{Year}{Date}
      </div>
    );
  }
  if (cover.layout === 'formal') {
    return wrap(
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {Logo}
          <div style={{ textAlign: 'end' }}>{Uni}{Dept}{Subject}</div>
        </div>
        <div style={{ border: `2px solid ${primary}`, borderRadius: 8, padding: 24, margin: '40px 0', textAlign: 'center' }}>
          {Title}{Subtitle}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Student}{Sup}{Year}{Date}
        </div>
      </>
    );
  }
  // classic (default): centered
  return wrap(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, paddingTop: 24 }}>
      {Logo && <div style={{ marginBottom: 12 }}>{Logo}</div>}
      {Uni}{Dept}{Subject}
      <div style={{ margin: '28px 0 12px' }}>{Title}{Subtitle}</div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Student}{Sup}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>{Year}{Date}</div>
      </div>
    </div>
  );
}