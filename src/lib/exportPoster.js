import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SlideRenderer from '@/components/presentation/editor/SlideRenderer';
import { posterMm } from './posterModel';
import { sanitizeFileName, imageToDataUrl } from './exportUtils';

// Replace external image sources with data URLs so html2canvas can never taint the canvas.
async function cleanPosterImages(poster) {
  const next = { ...poster, elements: (poster.elements || []).map((e) => ({ ...e, content: { ...e.content } })) };
  for (const el of next.elements) {
    if (el.type === 'image' && el.content.src && !el.content.src.startsWith('data:')) {
      const d = await imageToDataUrl(el.content.src);
      el.content.src = d || '';
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

async function renderPosterCanvas(poster, scale) {
  const size = poster.size;
  const baseW = size.w, baseH = size.h;
  const clean = await cleanPosterImages(poster);
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${baseW}px;height:${baseH}px;`;
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await new Promise((res) => {
      root.render(React.createElement(SlideRenderer, { slide: clean, baseW, baseH, language: poster.language || 'en' }));
      setTimeout(res, 60);
    });
    const canvas = await html2canvas(container, {
      scale, useCORS: true, allowTaint: false, backgroundColor: null,
      width: baseW, height: baseH, logging: false, imageTimeout: 15000,
    });
    return canvas;
  } finally {
    root.unmount();
    container.remove();
  }
}

function exportScale(size) {
  const maxDim = Math.max(size.w, size.h);
  return Math.min(3, 4000 / maxDim);
}

export async function exportPosterPng(poster, onProgress) {
  onProgress?.({ status: 'exporting' });
  const canvas = await renderPosterCanvas(poster, exportScale(poster.size));
  onProgress?.({ status: 'finalizing' });
  const link = document.createElement('a');
  link.download = sanitizeFileName(poster.name || 'poster') + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportPosterPdf(poster, onProgress) {
  onProgress?.({ status: 'exporting' });
  const size = poster.size;
  const mm = posterMm(size);
  const canvas = await renderPosterCanvas(poster, exportScale(size));
  const orientation = mm.w > mm.h ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'mm', format: [mm.w, mm.h] });
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, mm.w, mm.h, undefined, 'FAST');
  onProgress?.({ status: 'finalizing' });
  pdf.save(sanitizeFileName(poster.name || 'poster') + '.pdf');
}