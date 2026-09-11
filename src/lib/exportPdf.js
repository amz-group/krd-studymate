import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SlideRenderer from '@/components/presentation/editor/SlideRenderer';
import { baseDimensions } from '@/lib/presentationModel';
import { sanitizeFileName, imageToDataUrl } from './exportUtils';

// Replace external image sources with data URLs so html2canvas can never produce a
// tainted canvas (which would make toDataURL throw). Data URLs pass through unchanged.
async function cleanSlideImages(slide) {
  const next = { ...slide, elements: (slide.elements || []).map((e) => ({ ...e, content: { ...e.content } })) };
  for (const el of next.elements) {
    if (el.type === 'image' && el.content.src && !el.content.src.startsWith('data:')) {
      const d = await imageToDataUrl(el.content.src);
      el.content.src = d || ''; // blank on failure so html2canvas can never taint the canvas
    }
  }
  const bg = next.background;
  if (bg && bg.type === 'image' && bg.image && !bg.image.startsWith('data:')) {
    const d = await imageToDataUrl(bg.image);
    if (d) next.background = { ...bg, image: d };
    else next.background = { type: 'solid', color: bg.color || '#ffffff' };
  }
  return next;
}

// Export the presentation to a multi-page PDF. Each slide becomes one page sized
// to the presentation ratio (no margins, no cropping). Slides are rendered with the
// same SlideRenderer used by Preview, captured at 2x for crisp text and images.
export async function exportToPdf(presentation, onProgress) {
  const content = presentation.content;
  const ratio = content.ratio === '4:3' ? '4:3' : '16:9';
  const language = content.language || 'en';
  const slides = content.slides || [];
  const { w: baseW, h: baseH } = baseDimensions(ratio);

  // PDF page in points, preserving the exact slide ratio.
  const pageW = ratio === '4:3' ? 720 : 960;
  const pageH = 540;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [pageW, pageH] });

  // Make sure web fonts are ready so text renders correctly.
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${baseW}px;height:${baseH}px;`;
  document.body.appendChild(container);
  const root = createRoot(container);

  const scale = 2;
  try {
    for (let i = 0; i < slides.length; i++) {
      onProgress?.({ slide: i + 1, total: slides.length, status: 'exporting' });
      const clean = await cleanSlideImages(slides[i]);
      await new Promise((res) => {
        root.render(React.createElement(SlideRenderer, { slide: clean, baseW, baseH, language }));
        setTimeout(res, 50);
      });
      const canvas = await html2canvas(container, {
        scale, useCORS: true, allowTaint: false, backgroundColor: '#ffffff',
        width: baseW, height: baseH, logging: false, imageTimeout: 15000,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage([pageW, pageH], 'landscape');
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    root.unmount();
    container.remove();
  }

  onProgress?.({ slide: slides.length, total: slides.length, status: 'finalizing' });
  pdf.save(sanitizeFileName(presentation.title) + '.pdf');
}