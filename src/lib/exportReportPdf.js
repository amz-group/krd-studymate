// PDF export for the Report & Assignment Maker. Paginates the document, renders
// each page (cover + body) into a hidden DOM container, captures it with
// html2canvas, and assembles a multi-page jsPDF. Preserves RTL, images, tables,
// colors, headers/footers and page numbers.
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { paginateDocument } from './reportPaginate';
import { getPageSize, isRtl } from './reportModel';
import { fontStack } from './reportAssets';
import CoverPage from '../components/report/CoverPage';

const PX_PER_MM = 3.7795;
const mmPx = (mm) => mm * PX_PER_MM;

function pageText(style, n, total) {
  if (style === 'page') return `Page ${n}`;
  if (style === 'pageof') return `Page ${n} of ${total}`;
  return String(n);
}

function headerHtml(header) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:8px;font-size:10pt;color:#475569;">
    <span style="flex:1;text-align:start;">${header.left || ''}</span>
    <span style="flex:1;text-align:center;">${header.center || ''}</span>
    <span style="flex:1;text-align:end;">${header.right || ''}</span></div>`;
}

function footerHtml(doc, num, total) {
  const pn = doc.pageNumber; const ftr = doc.footer;
  const numText = pn.enabled ? pageText(pn.style, num, total) : '';
  const cells = [`<span style="flex:1;text-align:start;">${ftr.enabled ? ftr.text : ''}</span>`];
  const align = { left: 'start', center: 'center', right: 'end' }[pn.position] || 'center';
  if (pn.enabled) cells.push(`<span style="flex:1;text-align:${align};">${numText}</span>`);
  else cells.push('<span style="flex:1;"></span>');
  return `<div style="display:flex;align-items:center;gap:8px;border-top:1px solid #e2e8f0;padding-top:4px;margin-top:8px;font-size:10pt;color:#475569;">${cells.join('')}</div>`;
}

export async function exportReportPdf(doc, filename, onProgress) {
  const { pages, coverEnabled, totalPages, ps } = paginateDocument(doc);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: ps.id === 'letter' ? 'letter' : 'a4' });
  const pxW = ps.pxW, pxH = ps.pxH;
  const rtl = isRtl(doc.language);
  const vars = `font-family:${fontStack(doc.fontFamily)};font-size:${doc.fontSize}pt;line-height:${doc.lineHeight};--rd-para-space:${doc.paragraphSpacing}px;--rd-line-height:${doc.lineHeight};--rd-primary:${doc.cover.primaryColor || '#1e293b'};direction:${rtl ? 'rtl' : 'ltr'};`;

  const allPages = [];
  if (coverEnabled) allPages.push({ type: 'cover' });
  pages.forEach((p, i) => allPages.push({ type: 'body', page: p, index: i }));

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-99999px;top:0;background:#fff;';
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    for (let i = 0; i < allPages.length; i++) {
      onProgress?.(i + 1, allPages.length);
      const p = allPages[i];
      const pageDiv = document.createElement('div');
      pageDiv.style.cssText = `width:${pxW}px;min-height:${pxH}px;background:#fff;box-sizing:border-box;overflow:hidden;`;
      if (p.type === 'cover') {
        pageDiv.innerHTML = renderToStaticMarkup(
          React.createElement(CoverPage, { cover: { ...doc.cover, _rtl: rtl }, info: doc.studentInfo, pageSize: doc.pageSize })
        );
      } else {
        const bodyNum = i + 1;
        pageDiv.style.padding = `${mmPx(doc.margin.top)}px ${mmPx(doc.margin.right)}px ${mmPx(doc.margin.bottom)}px ${mmPx(doc.margin.left)}px`;
        pageDiv.style.display = 'flex';
        pageDiv.style.flexDirection = 'column';
        let inner = '';
        if (doc.header.enabled) inner += headerHtml(doc.header);
        inner += `<div class="rd-editor" style="${vars}flex:1;">${p.page.html}</div>`;
        if (doc.footer.enabled || doc.pageNumber.enabled) {
          const showNum = doc.pageNumber.enabled && !(p.index === 0 && coverEnabled && doc.pageNumber.hideOnCover);
          inner += footerHtml(doc, showNum ? bodyNum : '', totalPages);
        }
        pageDiv.innerHTML = inner;
      }
      container.appendChild(pageDiv);
      // Wait a tick for layout/fonts, then capture.
      await new Promise((r) => setTimeout(r, 30));
      const canvas = await html2canvas(pageDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: pxW, height: pxH, windowWidth: pxW });
      if (i > 0) pdf.addPage();
      const img = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(img, 'JPEG', 0, 0, ps.w, ps.h);
      container.removeChild(pageDiv);
    }
  } finally {
    document.body.removeChild(container);
  }
  pdf.save(filename);
}