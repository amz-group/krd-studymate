// DOCX export for the Report & Assignment Maker. Parses the body HTML into
// native docx paragraphs, headings, lists, tables, and images so the result is
// fully editable in Microsoft Word / Word Online. Supports RTL for Kurdish and
// Arabic, cover page, headers/footers, page numbers, and a live Table of
// Contents field.
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow,
  TableCell, WidthType, ImageRun, PageBreak, TableOfContents,
  convertMillimetersToTwip, convertInchesToTwip, LevelFormat, ShadingType,
  TabStopType, PageNumber, ExternalHyperlink, UnderlineType,
  Header, Footer,
} from 'docx';
import { getPageSize, isRtl, buildReferencesHtml } from './reportModel';
import { fontStack } from './reportAssets';

const PX_PER_MM = 3.7795;
const ptHalf = (pt) => Math.round(pt * 2);
const pxHalfPt = (px) => Math.round(px * 1.5);

function parseColor(c) {
  if (!c) return undefined;
  const m = c.match(/#([0-9a-f]{3,6})/i);
  if (m) return m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
  const rgb = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgb) return [1, 2, 3].map((i) => Number(rgb[i]).toString(16).padStart(2, '0')).join('');
  return undefined;
}

// Parse inline nodes into TextRun[] with inherited formatting.
function parseInline(node, style = {}, rtl) {
  const runs = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.nodeValue.replace(/\u00a0/g, ' ');
      if (text) runs.push(new TextRun({ text, ...style, rightToLeft: rtl ? true : undefined }));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      const next = { ...style };
      if (tag === 'b' || tag === 'strong') next.bold = true;
      if (tag === 'i' || tag === 'em') next.italics = true;
      if (tag === 'u') next.underline = { type: UnderlineType.SINGLE };
      if (tag === 's' || tag === 'strike' || tag === 'del') next.strike = true;
      if (tag === 'span') {
        const cs = child.style;
        if (cs.fontWeight === 'bold' || Number(cs.fontWeight) >= 600) next.bold = true;
        if (cs.fontStyle === 'italic') next.italics = true;
        if (cs.textDecoration.includes('underline')) next.underline = { type: UnderlineType.SINGLE };
        if (cs.textDecoration.includes('line-through')) next.strike = true;
        if (cs.color) next.color = parseColor(cs.color);
        if (cs.backgroundColor) next.highlight = parseColor(cs.backgroundColor);
        if (cs.fontSize) next.size = pxHalfPt(parseFloat(cs.fontSize));
        if (cs.fontFamily) next.font = cs.fontFamily.split(',')[0].replace(/"/g, '');
      }
      if (tag === 'br') { runs.push(new TextRun({ break: 1 })); return; }
      if (tag === 'a') {
        const href = child.getAttribute('href') || '';
        const inner = parseInline(child, next, rtl);
        if (href) {
          runs.push(new ExternalHyperlink({ link: href, children: inner }));
        } else {
          runs.push(...inner);
        }
        return;
      }
      runs.push(...parseInline(child, next, rtl));
    }
  });
  return runs;
}

function alignOf(cssAlign, rtl) {
  if (cssAlign === 'center') return AlignmentType.CENTER;
  if (cssAlign === 'right') return rtl ? AlignmentType.LEFT : AlignmentType.RIGHT;
  if (cssAlign === 'justify') return AlignmentType.JUSTIFIED;
  return rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
}

function loadImageSize(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 600, h: img.naturalHeight || 400 });
    img.onerror = () => resolve({ w: 600, h: 400 });
    img.src = src;
  });
}

async function dataUrlToUint8(src) {
  if (src.startsWith('data:')) {
    const b = atob(src.split(',')[1]);
    const arr = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) arr[i] = b.charCodeAt(i);
    return arr;
  }
  const res = await fetch(src);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

function buildTable(el, rtl) {
  const rows = Array.from(el.querySelectorAll('tr'));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((tr) => new TableRow({
      children: Array.from(tr.children).map((cell) => new TableCell({
        shading: cell.style.backgroundColor ? { fill: parseColor(cell.style.backgroundColor), type: ShadingType.CLEAR, color: 'auto' } : undefined,
        children: [new Paragraph({
          alignment: alignOf(cell.style.textAlign, rtl),
          bidirectional: rtl ? true : undefined,
          children: parseInline(cell, {}, rtl),
        })],
      })),
    })),
  });
}

async function buildFigure(el, contentWidthPx, rtl) {
  const img = el.querySelector('img');
  const caption = el.querySelector('.rd-caption');
  const out = [];
  if (img) {
    const src = img.getAttribute('src') || '';
    const size = await loadImageSize(src);
    const widthPct = parseFloat((img.style.width || '70%')) / 100 || 0.7;
    const w = Math.round(contentWidthPx * widthPct);
    const h = Math.round(w * (size.h / size.w));
    const data = await dataUrlToUint8(src);
    const mime = (src.match(/data:(image\/[\w.]+)/) || [])[1] || 'image/png';
    const imgType = mime.includes('png') ? 'png' : 'jpg';
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data, transformation: { width: w, height: h }, type: imgType })],
    }));
  }
  if (caption && caption.textContent) {
    out.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: caption.textContent, italics: true, color: '64748B', size: 20 })] }));
  }
  return out;
}

function buildReferences(doc, rtl) {
  const out = [new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: rtl ? true : undefined, children: [new TextRun({ text: 'References', rightToLeft: rtl ? true : undefined })] })];
  const container = document.createElement('div');
  container.innerHTML = buildReferencesHtml(doc.references);
  Array.from(container.children).forEach((p) => {
    out.push(new Paragraph({ bidirectional: rtl ? true : undefined, children: parseInline(p, {}, rtl), spacing: { after: 120 } }));
  });
  return out;
}

function buildCover(doc, rtl) {
  const c = doc.cover; const s = c.show || {}; const info = doc.studentInfo;
  const center = AlignmentType.CENTER;
  const P = (text, opts = {}) => new Paragraph({ alignment: center, spacing: { after: 120, before: opts.before || 0 }, bidirectional: rtl ? true : undefined, children: [new TextRun({ text, ...opts.run })] });
  const out = [];
  if (s.logo && c.logo) {
    // logo image centered — load async handled by caller; skip if not data url
  }
  if (s.university && info.university) out.push(P(info.university, { run: { bold: true, size: 32 } }));
  if (s.department && info.department) out.push(P(info.department, { run: { size: 26, color: '475569' } }));
  if (s.subject && info.subject) out.push(P(info.subject, { run: { size: 24, color: '64748b' } }));
  out.push(new Paragraph({ spacing: { before: 400, after: 200 } }));
  if (s.title && info.title) out.push(P(info.title, { run: { bold: true, size: 60, color: parseColor(c.primaryColor) } }));
  if (s.subtitle && info.subtitle) out.push(P(info.subtitle, { run: { size: 30, color: '475569' } }));
  out.push(new Paragraph({ spacing: { before: 600, after: 200 } }));
  const students = (info.students || []).filter((x) => x.name).map((x) => x.name).join(', ');
  if (s.student && students) out.push(P(`${rtl ? 'ئامادەکراو لەلایەن' : 'Prepared by'}: ${students}`, { run: { size: 24 } }));
  if (s.supervisor && info.supervisor) out.push(P(`${rtl ? 'سەرپەرشتیار' : 'Supervisor'}: ${info.supervisor}`, { run: { size: 24 } }));
  if ((s.academicYear && info.academicYear) || (s.date && info.date)) out.push(P([info.academicYear, info.date].filter(Boolean).join(' · '), { run: { size: 24 } }));
  out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

function listNumbering(el) {
  return el.tagName === 'OL' ? 'rd-decimal' : 'rd-bullet';
}

function parseList(el, level, rtl, out) {
  Array.from(el.children).forEach((li) => {
    if (li.tagName === 'LI') {
      // inline content before nested lists
      const nested = Array.from(li.children).filter((c) => c.tagName === 'UL' || c.tagName === 'OL');
      const inlineNode = document.createElement('div');
      Array.from(li.childNodes).forEach((c) => { if (c.tagName !== 'UL' && c.tagName !== 'OL') inlineNode.appendChild(c.cloneNode(true)); });
      out.push(new Paragraph({
        numbering: { reference: listNumbering(el), level },
        bidirectional: rtl ? true : undefined,
        children: parseInline(inlineNode, {}, rtl),
      }));
      nested.forEach((n) => parseList(n, level + 1, rtl, out));
    }
  });
}

async function parseBody(doc) {
  const ps = getPageSize(doc.pageSize);
  const contentWidthPx = (ps.w - doc.margin.left - doc.margin.right) * PX_PER_MM;
  const rtl = isRtl(doc.language);
  const container = document.createElement('div');
  container.innerHTML = doc.html || '';
  const out = [];
  for (const block of Array.from(container.children)) {
    const tag = block.tagName;
    const cls = block.className || '';
    if (cls.includes('rd-page-break')) { out.push(new Paragraph({ children: [new PageBreak()] })); continue; }
    if (cls.includes('rd-toc')) {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Table of Contents')] }));
      out.push(new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }));
      out.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }
    if (cls.includes('rd-refs')) { out.push(...buildReferences(doc, rtl)); continue; }
    if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
      const level = Number(tag.slice(1));
      out.push(new Paragraph({
        heading: { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 }[level],
        alignment: alignOf(block.style.textAlign, rtl),
        bidirectional: rtl ? true : undefined,
        children: parseInline(block, {}, rtl),
      }));
    } else if (tag === 'P') {
      out.push(new Paragraph({
        alignment: alignOf(block.style.textAlign, rtl),
        bidirectional: rtl ? true : undefined,
        children: parseInline(block, {}, rtl),
      }));
    } else if (tag === 'BLOCKQUOTE') {
      out.push(new Paragraph({
        indent: { left: convertInchesToTwip(0.4) },
        bidirectional: rtl ? true : undefined,
        children: parseInline(block, { italics: true, color: '475569' }, rtl),
      }));
    } else if (tag === 'UL' || tag === 'OL') {
      parseList(block, 0, rtl, out);
    } else if (tag === 'TABLE') {
      out.push(buildTable(block, rtl));
      out.push(new Paragraph({ children: [] }));
    } else if (tag === 'DIV' && cls.includes('rd-fig')) {
      out.push(...(await buildFigure(block, contentWidthPx, rtl)));
    } else if (tag === 'DIV') {
      out.push(new Paragraph({ bidirectional: rtl ? true : undefined, children: parseInline(block, {}, rtl) }));
    } else {
      out.push(new Paragraph({ bidirectional: rtl ? true : undefined, children: parseInline(block, {}, rtl) }));
    }
  }
  return out;
}

function headerParagraph(doc, contentWidthTwip) {
  const h = doc.header;
  const mid = Math.round(contentWidthTwip / 2);
  const end = Math.round(contentWidthTwip);
  return new Paragraph({
    tabStops: [{ type: TabStopType.CENTER, position: mid }, { type: TabStopType.RIGHT, position: end }],
    children: [new TextRun(h.left || ''), new TextRun('\t'), new TextRun(h.center || ''), new TextRun('\t'), new TextRun(h.right || '')],
  });
}

function footerParagraph(doc) {
  const pn = doc.pageNumber; const ftr = doc.footer;
  const align = { left: AlignmentType.LEFT, center: AlignmentType.CENTER, right: AlignmentType.RIGHT }[pn.position] || AlignmentType.CENTER;
  const children = [];
  if (ftr.enabled && ftr.text) children.push(new TextRun(ftr.text + '   '));
  if (pn.enabled) {
    if (pn.style === 'page') children.push(new TextRun('Page '), new TextRun({ children: [PageNumber.CURRENT] }));
    else if (pn.style === 'pageof') children.push(new TextRun('Page '), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(' of '), new TextRun({ children: [PageNumber.TOTAL_PAGES] }));
    else children.push(new TextRun({ children: [PageNumber.CURRENT] }));
  }
  return new Paragraph({ alignment: align, children });
}

export async function exportReportDocx(doc, filename, onProgress) {
  onProgress?.('preparing');
  const ps = getPageSize(doc.pageSize);
  const rtl = isRtl(doc.language);
  const contentWidthTwip = convertMillimetersToTwip(ps.w - doc.margin.left - doc.margin.right);

  const children = [];
  if (doc.cover && doc.cover.enabled) children.push(...buildCover(doc, rtl));
  children.push(...(await parseBody(doc)));

  const numberingConfig = {
    config: [
      { reference: 'rd-bullet', levels: [0, 1, 2, 3].map((lvl) => ({ level: lvl, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5 + lvl * 0.5), hanging: convertInchesToTwip(0.25) } } } })) },
      { reference: 'rd-decimal', levels: [0, 1, 2, 3].map((lvl) => ({ level: lvl, format: LevelFormat.DECIMAL, text: `%${lvl + 1}.`, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5 + lvl * 0.5), hanging: convertInchesToTwip(0.25) } } } })) },
    ],
  };

  const headers = {}; const footers = {};
  if (doc.header.enabled) headers.default = new Header({ children: [headerParagraph(doc, contentWidthTwip)] });
  if (doc.footer.enabled || doc.pageNumber.enabled) footers.default = new Footer({ children: [footerParagraph(doc)] });
  const titlePage = doc.cover && doc.cover.enabled && doc.pageNumber.hideOnCover;
  if (titlePage) { headers.first = new Header({ children: [] }); footers.first = new Footer({ children: [] }); }

  const docx = new Document({
    numbering: numberingConfig,
    styles: { default: { document: { run: { font: fontStack(doc.fontFamily).split(',')[0].replace(/"/g, ''), size: ptHalf(doc.fontSize) } } } },
    sections: [{
      properties: {
        page: {
          size: { width: convertMillimetersToTwip(ps.w), height: convertMillimetersToTwip(ps.h) },
          margin: { top: convertMillimetersToTwip(doc.margin.top), right: convertMillimetersToTwip(doc.margin.right), bottom: convertMillimetersToTwip(doc.margin.bottom), left: convertMillimetersToTwip(doc.margin.left) },
        },
        bidi: rtl ? true : undefined,
        titlePage: titlePage || undefined,
      },
      headers, footers,
      children,
    }],
  });

  onProgress?.('packing');
  const blob = await Packer.toBlob(docx);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}