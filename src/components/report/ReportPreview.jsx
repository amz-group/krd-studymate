import { useMemo } from 'react';
import { ArrowLeft, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { paginateDocument } from '@/lib/reportPaginate';
import { fontStack } from '@/lib/reportAssets';
import { isRtl } from '@/lib/reportModel';
import CoverPage from './CoverPage';

function pageText(style, n, total) {
  if (style === 'page') return `Page ${n}`;
  if (style === 'pageof') return `Page ${n} of ${total}`;
  return String(n);
}

export default function ReportPreview({ doc, project, onExit, onExport }) {
  const { t } = useApp();
  const rtl = isRtl(doc.language);
  const { pages, coverEnabled, totalPages, ps, headerH, footerH } = useMemo(() => paginateDocument(doc), [doc]);
  const pn = doc.pageNumber;
  const hdr = doc.header;
  const ftr = doc.footer;

  const allPages = [];
  if (coverEnabled) allPages.push({ type: 'cover' });
  pages.forEach((p, i) => allPages.push({ type: 'body', page: p, index: i }));

  const vars = {
    '--rd-para-space': `${doc.paragraphSpacing}px`,
    '--rd-line-height': String(doc.lineHeight),
    '--rd-primary': doc.cover.primaryColor || '#1e293b',
    fontFamily: fontStack(doc.fontFamily),
    fontSize: `${doc.fontSize}pt`,
    direction: rtl ? 'rtl' : 'ltr',
  };

  const HeaderBar = (n) => (
    <div style={{ minHeight: headerH, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, fontSize: '10pt', color: '#475569' }}>
      <span style={{ flex: 1, textAlign: 'start' }}>{hdr.left || ''}</span>
      <span style={{ flex: 1, textAlign: 'center' }}>{hdr.center || ''}</span>
      <span style={{ flex: 1, textAlign: 'end' }}>{hdr.right || ''}</span>
    </div>
  );
  const FooterBar = (n) => {
    const showNum = pn.enabled && !(coverEnabled && pn.hideOnCover && false); // body pages always numbered
    const numText = showNum ? pageText(pn.style, n, totalPages) : '';
    const align = { left: 'start', center: 'center', right: 'end' }[pn.position] || 'center';
    return (
      <div style={{ minHeight: footerH, display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 4, marginTop: 8, fontSize: '10pt', color: '#475569' }}>
        <span style={{ flex: 1, textAlign: 'start' }}>{ftr.enabled ? ftr.text : ''}</span>
        {pn.enabled && pn.position === 'left' && <span style={{ flex: 1, textAlign: 'start' }}>{numText}</span>}
        {pn.enabled && pn.position === 'center' && <span style={{ flex: 1, textAlign: 'center' }}>{numText}</span>}
        {pn.enabled && pn.position === 'right' && <span style={{ flex: 1, textAlign: 'end' }}>{numText}</span>}
        {!pn.enabled && <span style={{ flex: 1 }} />}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExit} title={t('common.back')}><ArrowLeft className="h-4 w-4" /></Button>
        <p className="text-sm font-semibold flex-1">{t('rep.preview')} · {project.name}</p>
        <span className="text-xs text-muted-foreground">{totalPages} {t('rep.pages')}</span>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onExport}><Download className="h-4 w-4" /> {t('rep.export')}</Button>
        <Button variant="default" size="sm" className="h-8 gap-1.5" onClick={onExit}><X className="h-4 w-4" /> {t('rep.exitPreview')}</Button>
      </div>
      <div className="flex-1 overflow-auto bg-[#525659] p-4 md:p-8">
        <div className="flex flex-col items-center gap-6">
          {allPages.map((p, i) => {
            const absPageNum = i + 1;
            if (p.type === 'cover') {
              return (
                <div key={i} style={{ width: `${ps.w}mm`, minHeight: `${ps.h}mm`, background: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }}>
                  <CoverPage cover={{ ...doc.cover, _rtl: rtl }} info={doc.studentInfo} pageSize={doc.pageSize} />
                </div>
              );
            }
            const bodyNum = coverEnabled ? absPageNum : absPageNum;
            const showNum = pn.enabled && !(p.index === 0 && coverEnabled && pn.hideOnCover);
            return (
              <div key={i} style={{ width: `${ps.w}mm`, minHeight: `${ps.h}mm`, background: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.35)', padding: `${doc.margin.top}mm ${doc.margin.right}mm ${doc.margin.bottom}mm ${doc.margin.left}mm`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                {hdr.enabled && HeaderBar(bodyNum)}
                <div className="rd-editor" style={{ ...vars, flex: 1 }} dangerouslySetInnerHTML={{ __html: p.page.html }} />
                {FooterBar(showNum ? bodyNum : '')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}