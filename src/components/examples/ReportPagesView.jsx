import { useMemo } from 'react';
import { paginateDocument } from '@/lib/reportPaginate';
import { fontStack } from '@/lib/reportAssets';
import { isRtl } from '@/lib/reportModel';
import CoverPage from '@/components/report/CoverPage';

const MM_TO_PX = 96 / 25.4;

// Renders a report's cover + body pages, each scaled to `widthPx` device pixels.
// Used for example thumbnails and full-screen previews.
export default function ReportPagesView({ doc, widthPx = 240, maxPages = Infinity }) {
  const rtl = isRtl(doc.language);
  const { pages, coverEnabled, ps } = useMemo(() => paginateDocument(doc), [doc]);
  const naturalW = ps.w * MM_TO_PX;
  const scale = widthPx / naturalW;

  const all = [];
  if (coverEnabled) all.push({ type: 'cover' });
  pages.forEach((pg, i) => all.push({ type: 'body', page: pg, index: i }));
  const shown = all.slice(0, maxPages);

  const vars = {
    '--rd-para-space': `${doc.paragraphSpacing}px`,
    '--rd-line-height': String(doc.lineHeight),
    '--rd-primary': doc.cover.primaryColor || '#1e293b',
    fontFamily: fontStack(doc.fontFamily),
    fontSize: `${doc.fontSize}pt`,
    direction: rtl ? 'rtl' : 'ltr',
  };

  return (
    <div className="flex flex-col items-center gap-3" style={{ width: widthPx }}>
      {shown.map((item, i) => {
        const pageW = `${ps.w}mm`;
        const pageH = `${ps.h}mm`;
        if (item.type === 'cover') {
          return (
            <div key={i} style={{ width: pageW, minHeight: pageH, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: `scale(${scale})`, transformOrigin: 'top center' }}>
              <CoverPage cover={{ ...doc.cover, _rtl: rtl }} info={doc.studentInfo} pageSize={doc.pageSize} />
            </div>
          );
        }
        return (
          <div key={i} style={{ width: pageW, minHeight: pageH, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', padding: `${doc.margin.top}mm ${doc.margin.right}mm ${doc.margin.bottom}mm ${doc.margin.left}mm`, boxSizing: 'border-box', transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            <div className="rd-editor" style={vars} dangerouslySetInnerHTML={{ __html: item.page.html }} />
          </div>
        );
      })}
    </div>
  );
}