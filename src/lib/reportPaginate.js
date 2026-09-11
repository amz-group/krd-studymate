// Pagination engine for the report. Renders the body HTML into a hidden
// A4-content-width measuring container, walks the block elements, and greedily
// packs them into pages. Page-break dividers force a new page; the TOC block is
// placed on its own page and filled in once heading page numbers are known.
import { getPageSize, buildReferencesHtml, buildTocHtml, headingsFromHtml, isRtl } from './reportModel';
import { fontStack } from './reportAssets';

const PX_PER_MM = 3.7795;

export function paginateDocument(doc) {
  const ps = getPageSize(doc.pageSize);
  const contentW = (ps.w - doc.margin.left - doc.margin.right) * PX_PER_MM;
  const headerH = doc.header && doc.header.enabled ? 26 : 0;
  const footerH = (doc.footer && doc.footer.enabled) || (doc.pageNumber && doc.pageNumber.enabled) ? 26 : 0;
  const contentH = (ps.h - doc.margin.top - doc.margin.bottom) * PX_PER_MM - headerH - footerH;
  const coverEnabled = doc.cover && doc.cover.enabled;
  const rtl = isRtl(doc.language);

  // Prepare body: replace rd-refs placeholders with a References heading + items.
  const container = document.createElement('div');
  container.innerHTML = doc.html || '';
  container.querySelectorAll('.rd-refs').forEach((el) => {
    const frag = document.createDocumentFragment();
    const h = document.createElement('h2');
    h.textContent = 'References'; h.setAttribute('data-rd-id', 'sec-references');
    frag.appendChild(h);
    const tmp = document.createElement('div');
    tmp.innerHTML = buildReferencesHtml(doc.references);
    while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    el.replaceWith(frag);
  });

  // Measuring container — uses the same .rd-editor styles as the live editor.
  const measure = document.createElement('div');
  measure.className = 'rd-editor';
  measure.style.cssText = `width:${contentW}px;position:absolute;left:-99999px;top:0;visibility:hidden;`;
  measure.style.setProperty('--rd-para-space', `${doc.paragraphSpacing}px`);
  measure.style.setProperty('--rd-line-height', String(doc.lineHeight));
  measure.style.setProperty('--rd-primary', doc.cover.primaryColor || '#1e293b');
  measure.style.fontFamily = fontStack(doc.fontFamily);
  measure.style.fontSize = `${doc.fontSize}pt`;
  measure.style.direction = rtl ? 'rtl' : 'ltr';
  measure.innerHTML = container.innerHTML;
  document.body.appendChild(measure);

  const blocks = Array.from(measure.children);
  const pages = [];
  let cur = []; let curH = 0;
  let tocPageIndex = -1;
  const headingPage = {};

  const pushPage = () => { pages.push({ html: cur.map((n) => n.outerHTML).join(''), isToc: false }); cur = []; curH = 0; };

  for (const block of blocks) {
    const cls = block.className || '';
    if (cls.includes('rd-page-break')) { if (cur.length) pushPage(); continue; }
    if (cls.includes('rd-toc')) {
      if (cur.length) pushPage();
      pages.push({ html: '', isToc: true });
      tocPageIndex = pages.length - 1;
      cur = []; curH = 0;
      continue;
    }
    if (/^H[123]$/.test(block.tagName) && block.getAttribute('data-rd-id')) {
      headingPage[block.getAttribute('data-rd-id')] = pages.length;
    }
    const h = block.offsetHeight || 0;
    if (h > contentH && cur.length) { pushPage(); continue; }
    if (curH + h > contentH) pushPage();
    cur.push(block);
    curH += h;
  }
  if (cur.length) pushPage();
  document.body.removeChild(measure);

  const offset = coverEnabled ? 1 : 0;
  const headingPages = {};
  Object.entries(headingPage).forEach(([id, p]) => { headingPages[id] = p + 1 + offset; });

  const headings = headingsFromHtml(doc.html);
  if (tocPageIndex >= 0) {
    pages[tocPageIndex].html = buildTocHtml(headings, headingPages);
  }

  return { pages, coverEnabled, headingPages, totalPages: pages.length + offset, ps, headerH, footerH, rtl };
}