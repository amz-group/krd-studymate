// Pure DOM helpers for the report contentEditable editor. Each function takes
// the editor element as its first argument. No React — keeps the editor
// uncontrolled and avoids focus/typing bugs.

function focusEditor(editor) {
  if (editor && document.activeElement !== editor) editor.focus();
}

export function exec(editor, cmd, value = null) {
  focusEditor(editor);
  try { document.execCommand && document.execCommand(cmd, false, value); } catch { /* noop */ }
  editor && editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function enableCssStyling(editor) {
  try { document.execCommand && document.execCommand('styleWithCSS', false, true); } catch { /* noop */ }
}

export function applyFormatBlock(editor, tag) {
  exec(editor, 'formatBlock', tag.startsWith('<') ? tag : `<${tag}>`);
}

export function applyFontName(editor, stack) {
  exec(editor, 'fontName', stack);
}

export function applyFontSize(editor, px) {
  focusEditor(editor);
  try {
    document.execCommand('fontSize', false, '7');
    const fonts = editor.querySelectorAll('font[size="7"]');
    fonts.forEach((f) => {
      const span = document.createElement('span');
      span.style.fontSize = `${px}px`;
      while (f.firstChild) span.appendChild(f.firstChild);
      f.replaceWith(span);
    });
  } catch { /* noop */ }
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function applyColor(editor, color) { exec(editor, 'foreColor', color); }
export function applyHighlight(editor, color) {
  try { document.execCommand('styleWithCSS', false, true); document.execCommand('hiliteColor', false, color); }
  catch { try { document.execCommand('backColor', false, color); } catch { /* noop */ } }
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function insertHtml(editor, html) {
  focusEditor(editor);
  try { document.execCommand('insertHTML', false, html); }
  catch {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const tpl = document.createElement('template');
      tpl.innerHTML = html;
      range.insertNode(tpl.content);
    }
  }
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function insertImage(editor, dataUrl, { width = '70%', align = 'center', caption = '' } = {}) {
  const fig = `<div class="rd-fig" style="text-align:${align};" data-rd-fig="1"><img src="${dataUrl}" style="width:${width};border-radius:6px;" alt=""><p class="rd-caption" style="text-align:center;color:#64748b;font-size:13px;">${caption}</p></div><p><br></p>`;
  insertHtml(editor, fig);
}

export function insertTable(editor, rows = 3, cols = 3) {
  const head = `<thead><tr>${Array.from({ length: cols }).map(() => '<th style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9;text-align:left;">Header</th>').join('')}</tr></thead>`;
  const body = `<tbody>${Array.from({ length: Math.max(1, rows - 1) }).map(() => `<tr>${Array.from({ length: cols }).map(() => '<td style="border:1px solid #cbd5e1;padding:8px;">Cell</td>').join('')}</tr>`).join('')}</tbody>`;
  insertHtml(editor, `<table style="border-collapse:collapse;width:100%;">${head}${body}</table><p><br></p>`);
}

export function insertPageBreak(editor) {
  insertHtml(editor, '<div class="rd-page-break" data-pagebreak="1" contenteditable="false"></div><p><br></p>');
}

export function insertToc(editor) {
  insertHtml(editor, '<div class="rd-toc" data-toc="1" contenteditable="false"></div><p><br></p>');
}

export function insertSection(editor, label) {
  const id = 'sec-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) + '-' + Date.now().toString(36).slice(-4);
  insertHtml(editor, `<h2 data-rd-id="${id}">${escapeHtml(label)}</h2><p>Write about ${escapeHtml(label.toLowerCase())} here.</p>`);
}

export function insertReferencesBlock(editor) {
  insertHtml(editor, '<div class="rd-refs" data-rd-refs="1" contenteditable="false"></div><p><br></p>');
}

export function createLink(editor, url) {
  if (!url) return;
  const href = url.includes('@') && !/^https?:\/\//.test(url) && !url.startsWith('mailto:') ? `mailto:${url}` : url;
  exec(editor, 'createLink', href);
}

// --- Table operations on the cell containing the current selection ---
function currentCell(editor) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  let node = sel.anchorNode;
  while (node && node !== editor) {
    if (node.nodeType === 1 && node.tagName === 'TD') return node;
    if (node.nodeType === 1 && node.tagName === 'TH') return node;
    node = node.parentNode;
  }
  return null;
}

function currentTable(editor) {
  const cell = currentCell(editor);
  if (!cell) return null;
  let node = cell.parentNode;
  while (node && node !== editor) {
    if (node.tagName === 'TABLE') return node;
    node = node.parentNode;
  }
  return null;
}

export function tableAddRow(editor) {
  const cell = currentCell(editor); if (!cell) return;
  const tr = cell.parentNode;
  const newRow = tr.cloneNode(true);
  Array.from(newRow.querySelectorAll('td,th')).forEach((c) => { c.textContent = c.tagName === 'TH' ? 'Header' : 'Cell'; });
  tr.parentNode.insertBefore(newRow, tr.nextSibling);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function tableDeleteRow(editor) {
  const cell = currentCell(editor); if (!cell) return;
  const tr = cell.parentNode;
  const table = currentTable(editor);
  if (!table || table.rows.length <= 1) return;
  tr.parentNode.removeChild(tr);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function tableAddColumn(editor) {
  const cell = currentCell(editor); if (!cell) return;
  const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
  const table = currentTable(editor); if (!table) return;
  Array.from(table.rows).forEach((tr) => {
    const ref = tr.children[cellIndex];
    const newCell = document.createElement(ref.tagName === 'TH' ? 'th' : 'td');
    newCell.style.cssText = ref.style.cssText;
    newCell.textContent = ref.tagName === 'TH' ? 'Header' : 'Cell';
    tr.insertBefore(newCell, ref.nextSibling);
  });
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function tableDeleteColumn(editor) {
  const cell = currentCell(editor); if (!cell) return;
  const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
  const table = currentTable(editor); if (!table) return;
  if (table.rows[0] && table.rows[0].children.length <= 1) return;
  Array.from(table.rows).forEach((tr) => { if (tr.children[cellIndex]) tr.removeChild(tr.children[cellIndex]); });
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setCellBackground(editor, color) {
  const cell = currentCell(editor); if (!cell) return;
  cell.style.backgroundColor = color;
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setCellAlign(editor, align) {
  const cell = currentCell(editor); if (!cell) return;
  cell.style.textAlign = align;
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setTableBorder(editor, color) {
  const table = currentTable(editor); if (!table) return;
  Array.from(table.querySelectorAll('td,th')).forEach((c) => { c.style.borderColor = color; });
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

// --- Image operations ---
function currentImage(editor) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  let node = sel.anchorNode;
  while (node && node !== editor) {
    if (node.nodeType === 1 && node.tagName === 'IMG') return node;
    node = node.parentNode;
  }
  return null;
}

export function setImageWidth(editor, pct) {
  const img = currentImage(editor); if (!img) return;
  img.style.width = pct + '%'; img.style.height = 'auto';
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setImageAlign(editor, align) {
  const img = currentImage(editor); if (!img) return;
  const fig = img.closest('.rd-fig'); if (fig) fig.style.textAlign = align;
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function replaceImage(editor, dataUrl) {
  const img = currentImage(editor); if (!img) return;
  img.src = dataUrl;
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function deleteImage(editor) {
  const img = currentImage(editor); if (!img) return;
  const fig = img.closest('.rd-fig');
  if (fig) fig.remove(); else img.remove();
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

// --- Outline / TOC ---
export function getHeadings(editor) {
  const els = editor.querySelectorAll('h1, h2, h3');
  const out = [];
  els.forEach((el, i) => {
    const text = (el.textContent || '').trim();
    if (!text) return;
    let id = el.getAttribute('data-rd-id');
    if (!id) { id = `h-${i}`; el.setAttribute('data-rd-id', id); }
    out.push({ id, level: Number(el.tagName.slice(1)), text, el });
  });
  return out;
}

export function updateToc(editor) {
  const headings = getHeadings(editor).map(({ id, level, text }) => ({ id, level, text }));
  const tocDivs = editor.querySelectorAll('.rd-toc');
  const inner = headings.length
    ? `<div class="rd-toc-block"><h2>Table of Contents</h2>${headings.map((h) => `<div class="rd-toc-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #cbd5e1;"><span style="padding-left:${(h.level - 1) * 18}px;">${escapeHtml(h.text)}</span><span></span></div>`).join('')}</div>`
    : '<p style="color:#94a3b8;">No headings found. Add headings to generate the table of contents.</p>';
  tocDivs.forEach((d) => { d.innerHTML = inner; });
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function scrollToHeading(editor, id) {
  const el = editor.querySelector(`[data-rd-id="${cssEscape(id)}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const r = document.createRange(); r.selectNodeContents(el);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
}

// --- Find & Replace (text-node walker) ---
export function findInEditor(editor, query, { fromStart = false } = {}) {
  if (!query) return false;
  const sel = window.getSelection();
  let startNode = null, startOffset = 0;
  if (!fromStart && sel && sel.anchorNode && editor.contains(sel.anchorNode)) {
    startNode = sel.anchorNode; startOffset = sel.anchorOffset;
  }
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  let passedStart = fromStart || !startNode;
  while (node) {
    const text = node.nodeValue;
    let from = 0;
    if (!passedStart && node === startNode) { from = startOffset; passedStart = true; }
    const idx = text.indexOf(query, from);
    if (idx >= 0) {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + query.length);
      sel.removeAllRanges(); sel.addRange(range);
      const rect = range.getBoundingClientRect();
      if (rect.top || rect.left) node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    node = walker.nextNode();
  }
  // wrap around
  if (!fromStart) return findInEditor(editor, query, { fromStart: true });
  return false;
}

export function replaceInEditor(editor, query, replacement) {
  const sel = window.getSelection();
  if (sel && sel.toString() === query && sel.anchorNode && editor.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replacement));
    sel.removeAllRanges();
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    return findInEditor(editor, query);
  }
  return findInEditor(editor, query);
}

export function replaceAllInEditor(editor, query, replacement) {
  if (!query) return 0;
  let count = 0;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!node.nodeValue || !node.nodeValue.includes(query)) return;
    const parts = node.nodeValue.split(query);
    const parent = node.parentNode;
    const frag = document.createDocumentFragment();
    parts.forEach((p, i) => {
      if (i > 0) { frag.appendChild(document.createTextNode(replacement)); count++; }
      if (p) frag.appendChild(document.createTextNode(p));
    });
    parent.replaceChild(frag, node);
  });
  if (count) editor.dispatchEvent(new Event('input', { bubbles: true }));
  return count;
}

// Live formatting state for the toolbar (bold/italic/align/block/table/image).
export function getSelectionState(editor) {
  const state = { bold: false, italic: false, underline: false, strike: false, bullet: false, number: false, align: '', block: 'p', fontId: '', inTable: false, inImage: false };
  if (!editor) return state;
  try {
    state.bold = !!document.queryCommandState('bold');
    state.italic = !!document.queryCommandState('italic');
    state.underline = !!document.queryCommandState('underline');
    state.strike = !!document.queryCommandState('strikeThrough');
    state.bullet = !!document.queryCommandState('insertUnorderedList');
    state.number = !!document.queryCommandState('insertOrderedList');
    if (document.queryCommandState('justifyCenter')) state.align = 'center';
    else if (document.queryCommandState('justifyRight')) state.align = 'right';
    else if (document.queryCommandState('justifyFull')) state.align = 'justify';
    else state.align = 'left';
    const blk = (document.queryCommandValue('formatBlock') || '').toLowerCase().replace(/[<>]/g, '');
    if (blk) state.block = blk === 'blockquote' ? 'blockquote' : blk;
  } catch { /* noop */ }
  const sel = window.getSelection();
  if (sel && sel.rangeCount && editor.contains(sel.anchorNode)) {
    let node = sel.anchorNode;
    while (node && node !== editor) {
      if (node.nodeType === 1) {
        if (node.tagName === 'TD' || node.tagName === 'TH') state.inTable = true;
        if (node.tagName === 'IMG') state.inImage = true;
      }
      node = node.parentNode;
    }
  }
  return state;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function cssEscape(s) {
  return String(s).replace(/"/g, '\\"');
}