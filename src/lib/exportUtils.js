import React from 'react';
import { createRoot } from 'react-dom/client';
import { iconMap } from '@/lib/presentationAssets';
import { baseDimensions, isRtl } from '@/lib/presentationModel';

// PowerPoint slide dimensions in inches (16:9 widescreen, 4:3 standard).
export function pptxLayoutInches(ratio) {
  return ratio === '4:3' ? { w: 10, h: 7.5 } : { w: 13.333, h: 7.5 };
}

// Conversion layer: editor logical px -> normalized -> PowerPoint inches.
// Export is independent of the editor zoom; it always uses the base slide size.
export function editorToInches(ratio) {
  const { w: baseW, h: baseH } = baseDimensions(ratio);
  const { w: pw, h: ph } = pptxLayoutInches(ratio);
  return { sx: pw / baseW, sy: ph / baseH, baseW, baseH, pw, ph };
}

// Editor font sizes are in px at the base slide size; PowerPoint uses points (1in = 72pt).
export function fontSizePxToPt(sizePx, ratio) {
  const { sx } = editorToInches(ratio);
  return Math.round((sizePx || 28) * sx * 72 * 10) / 10;
}

export function sanitizeFileName(name) {
  const base = (name || 'presentation').trim() || 'presentation';
  const cleaned = base.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-');
  return cleaned || 'presentation';
}

// Normalize any CSS color to an uppercase RRGGBB hex string (no '#'), or null for transparent.
export function toHex(color) {
  if (!color || color === 'transparent') return null;
  if (color.startsWith('#')) {
    let c = color.slice(1);
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    if (c.length === 6) return c.toUpperCase();
    if (c.length === 8) return c.slice(0, 6).toUpperCase(); // #RRGGBBAA
    return null;
  }
  const m = String(color).match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
    const [r, g, b, a] = parts;
    if (a === 0) return null;
    return [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return null;
}

// 0..1 opacity -> PptxGenJS transparency 0..100 (0 = opaque, 100 = invisible).
export function opacityToTransparency(opacity) {
  if (opacity == null || opacity >= 1) return 0;
  if (opacity <= 0) return 100;
  return Math.round((1 - opacity) * 100);
}

// Arabic / Kurdish (Sorani) script detection for font fallback.
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
export function hasArabicScript(text) {
  return ARABIC_RE.test(text || '');
}

// Map an editor font to a PowerPoint-safe font. Arabic-script text always uses an
// Arabic-capable font so characters stay connected and readable in PowerPoint.
export function pptxFont(fontId, text, language) {
  if (hasArabicScript(text) || isRtl(language)) {
    if (fontId === 'Noto Naskh Arabic' || fontId === 'Vazirmatn') return fontId;
    return 'Arial';
  }
  return fontId || 'Arial';
}

// Convert any image src (data URL, http(s), blob) to a data URL. Returns null on failure.
export async function imageToDataUrl(src) {
  if (!src) return null;
  if (src.startsWith('data:')) return src;
  try {
    const res = await fetch(src, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// PptxGenJS only embeds PNG/JPEG. Convert unsupported formats (e.g. WEBP) to PNG via canvas.
export async function imageToPngDataUrl(src) {
  const data = await imageToDataUrl(src);
  if (!data) return null;
  if (/data:image\/(png|jpeg|jpg);/i.test(data)) return data;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 256;
        canvas.height = img.naturalHeight || 256;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(data);
      }
    };
    img.onerror = () => resolve(data);
    img.src = data;
  });
}

// Render a lucide icon component to a PNG data URL (transparent background), cached per key.
const iconCache = new Map();
export async function iconToPng(name, size, color) {
  const key = `${name}_${size}_${color}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const Comp = iconMap[name] || iconMap.GraduationCap;
  const px = Math.max(16, Math.round(size || 64));
  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${px}px;height:${px}px;`;
  document.body.appendChild(container);
  const root = createRoot(container);
  await new Promise((res) => {
    root.render(React.createElement(Comp, { size: px, color: color || '#000000', strokeWidth: 2 }));
    setTimeout(res, 16);
  });
  const svg = container.querySelector('svg');
  let dataUrl = null;
  if (svg) {
    svg.setAttribute('width', px);
    svg.setAttribute('height', px);
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    dataUrl = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = px * 2;
        canvas.height = px * 2;
        canvas.getContext('2d').drawImage(img, 0, 0, px * 2, px * 2);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }
  root.unmount();
  container.remove();
  if (dataUrl) iconCache.set(key, dataUrl);
  return dataUrl;
}

export const languageLabel = { en: 'English', ku: 'Kurdish (Sorani)', ar: 'Arabic' };