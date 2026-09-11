// Local PDF text extraction using PDF.js (pdfjs-dist).
// Runs entirely in the browser — no external conversion API.
import * as pdfjsLib from 'pdfjs-dist';
// Vite resolves the worker bundle as a URL asset.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

// Extract text page-by-page with progress callbacks.
// onProgress(pageIndex, totalPages) fires per page.
// Returns { pages: [{index, text}], text, numPages, fileMeta }
export async function extractPdf(file, onProgress) {
  const buf = await file.arrayBuffer();
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buf, useSystemFonts: true }).promise;
  } catch (err) {
    const msg = String(err?.message || err || '');
    if (/password/i.test(msg)) throw new Error('PROTECTED');
    throw new Error('CORRUPT');
  }

  const numPages = pdf.numPages;
  const pages = [];
  let allText = '';

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    let pageText = '';
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Reconstruct lines from text items using their vertical positions.
      const items = content.items.map((it) => ({ str: it.str, h: Math.round(it.transform[5]), w: it.transform[4], eol: it.hasEOL }));
      let lastH = null;
      let line = '';
      const lines = [];
      for (const it of items) {
        if (lastH !== null && Math.abs(it.h - lastH) > 3) {
          lines.push(line.trim());
          line = '';
        }
        line += it.str + (it.eol ? '\n' : ' ');
        lastH = it.h;
      }
      if (line.trim()) lines.push(line.trim());
      pageText = lines.join('\n').trim();
    } catch {
      pageText = '';
    }
    pages.push({ index: i - 1, text: pageText });
    allText += pageText + '\n\n';
    // Yield to the event loop so the UI stays responsive on large PDFs.
    if (i % 4 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  return {
    pages,
    text: allText.trim(),
    numPages,
    fileMeta: {
      name: file.name,
      size: formatBytes(file.size),
      sizeBytes: file.size,
      type: file.type || 'application/pdf',
      pages: numPages,
    },
  };
}