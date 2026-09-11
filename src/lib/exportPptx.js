import pptxgen from 'pptxgenjs';
import {
  editorToInches, fontSizePxToPt, sanitizeFileName, toHex, opacityToTransparency,
  pptxFont, iconToPng, imageToPngDataUrl,
} from './exportUtils';

// Generate a real .pptx file in the browser from the presentation data model.
// Content is exported as native, editable PowerPoint objects (text, shapes, images).
export async function exportToPptx(presentation, onProgress) {
  const content = presentation.content;
  const ratio = content.ratio === '4:3' ? '4:3' : '16:9';
  const language = content.language || 'en';
  const slides = content.slides || [];

  const pptx = new pptxgen();
  const inches = ratio === '4:3' ? { width: 10, height: 7.5 } : { width: 13.333, height: 7.5 };
  const layoutName = ratio === '4:3' ? 'KRD_4x3' : 'KRD_16x9';
  pptx.defineLayout({ name: layoutName, width: inches.width, height: inches.height });
  pptx.layout = layoutName;
  pptx.author = 'KRD StudyMate';
  pptx.title = presentation.title || 'Presentation';

  const { sx, sy } = editorToInches(ratio);

  for (let i = 0; i < slides.length; i++) {
    onProgress?.({ slide: i + 1, total: slides.length, status: 'exporting' });
    const src = slides[i];
    const slide = pptx.addSlide();
    await paintBackground(pptx, slide, src.background, inches);
    const elements = [...(src.elements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const el of elements) {
      await addElement(pptx, slide, el, sx, sy, ratio, language);
    }
    // Yield to the event loop so the UI thread can update progress.
    await new Promise((r) => setTimeout(r, 0));
  }

  onProgress?.({ slide: slides.length, total: slides.length, status: 'finalizing' });
  const fileName = sanitizeFileName(presentation.title) + '.pptx';
  await pptx.writeFile({ fileName });
}

async function paintBackground(pptx, slide, bg, inches) {
  const background = bg || { type: 'solid', color: '#ffffff' };
  if (background.type === 'image' && background.image) {
    const data = await imageToPngDataUrl(background.image);
    if (data) {
      slide.addImage({ data, x: 0, y: 0, w: inches.width, h: inches.height });
      return;
    }
  }
  // Gradients are not natively supported; fall back to the first color.
  slide.background = { color: toHex(background.color) || 'FFFFFF' };
  if (background.overlay) {
    const oc = toHex(background.overlay);
    if (oc) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: inches.width, h: inches.height,
        fill: { color: oc, transparency: opacityToTransparency(1 - (background.overlayOpacity ?? 0.3)) },
        line: { type: 'none' },
      });
    }
  }
}

async function addElement(pptx, slide, el, sx, sy, ratio, language) {
  const x = el.x * sx;
  const y = el.y * sy;
  const w = el.width * sx;
  const h = el.height * sy;
  const opacity = el.content?.opacity ?? 1;
  const transparency = opacityToTransparency(opacity);

  if (el.type === 'text') {
    addTextElement(pptx, slide, el.content, { x, y, w, h, sx, sy, ratio, language, transparency });
  } else if (el.type === 'image') {
    const data = await imageToPngDataUrl(el.content.src);
    if (data) slide.addImage({ data, x, y, w, h, transparency });
  } else if (el.type === 'shape') {
    addShapeElement(pptx, slide, el.content, { x, y, w, h, sx, transparency });
  } else if (el.type === 'icon') {
    const png = await iconToPng(el.content.name, el.content.size || 64, el.content.color || '#000000');
    if (png) {
      const sz = Math.min(w, h);
      slide.addImage({ data: png, x: x + (w - sz) / 2, y: y + (h - sz) / 2, w: sz, h: sz, transparency });
    }
  }
}

function addTextElement(pptx, slide, c, o) {
  const text = c.text || '';
  const fontFace = pptxFont(c.font, text, o.language);
  const fontSize = fontSizePxToPt(c.size || 28, o.ratio);
  const color = toHex(c.color) || '000000';
  const align = c.align === 'center' ? 'center' : c.align === 'end' ? 'right' : 'left';
  // Match the editor's 4px text padding.
  const pad = 4 * o.sx;
  const base = {
    x: o.x + pad, y: o.y + pad, w: Math.max(0, o.w - pad * 2), h: Math.max(0, o.h - pad * 2),
    fontSize, fontFace, color, bold: !!c.bold, italic: !!c.italic, underline: !!c.underline,
    align, valign: 'top', rtlMode: !!requireRtl(o.language, text),
    lineSpacingMultiple: c.lineHeight || 1, charSpacing: Math.round((c.letterSpacing || 0) * o.sx * 72),
    transparency: o.transparency, wrap: true, fit: 'none', autoFit: false,
  };
  if (c.highlight && c.highlight !== 'transparent') {
    const hl = toHex(c.highlight);
    if (hl) base.highlight = hl;
  }
  if (c.listType === 'bullet' || c.listType === 'number') {
    const lines = text.split('\n');
    const bullet = c.listType === 'number' ? { type: 'number' } : true;
    const arr = lines.map((l) => ({ text: l, options: { bullet } }));
    slide.addText(arr, base);
  } else {
    slide.addText(text, base);
  }
}

function requireRtl(language, text) {
  // rtlLanguages check via dynamic import would be circular; replicate the small list.
  return language === 'ku' || language === 'ar' || /[\u0600-\u06FF]/.test(text || '');
}

function addShapeElement(pptx, slide, c, o) {
  const fill = toHex(c.fill);
  if (c.shape === 'line' || c.shape === 'arrow') {
    const lineColor = toHex(c.fill) || '000000';
    const widthPt = Math.max(0.5, (c.borderWidth || 4) * o.sx * 72);
    slide.addShape(pptx.ShapeType.line, {
      x: o.x, y: o.y + o.h / 2, w: o.w, h: 0,
      line: { color: lineColor, width: widthPt, cap: 'flat' },
    });
    if (c.shape === 'arrow') {
      slide.addShape(pptx.ShapeType.triangle, {
        x: o.x + o.w - 0.18, y: o.y + o.h / 2 - 0.09, w: 0.18, h: 0.18,
        rotate: 90, fill: { color: lineColor }, line: { type: 'none' },
      });
    }
    return;
  }
  const shapeType = c.shape === 'circle' ? pptx.ShapeType.ellipse
    : c.shape === 'rounded' ? pptx.ShapeType.roundRect
    : pptx.ShapeType.rect;
  const opts = {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: fill ? { color: fill, transparency: o.transparency } : { type: 'none' },
    line: c.borderWidth ? { color: toHex(c.border) || '000000', width: Math.max(0.5, c.borderWidth * o.sx * 72) } : { type: 'none' },
  };
  if (c.shape === 'rounded' && c.radius) opts.rectRadius = Math.max(0, c.radius * o.sx);
  slide.addShape(shapeType, opts);
}