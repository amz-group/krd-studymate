import { createId, createProjectShell } from './db';
import { newElement } from './presentationModel';
import { defaultTextContent } from './presentationAssets';
import { rtlLanguages } from './translations';

export function isRtl(language) {
  return rtlLanguages.includes(language);
}

const PX_TO_MM = 25.4 / 96;

// ---- Poster sizes ----
export const posterSizes = [
  { id: 'a4-portrait', label: 'A4 Portrait', w: 794, h: 1123, mm: { w: 210, h: 297 } },
  { id: 'a4-landscape', label: 'A4 Landscape', w: 1123, h: 794, mm: { w: 297, h: 210 } },
  { id: 'a3-portrait', label: 'A3 Portrait', w: 1123, h: 1587, mm: { w: 297, h: 420 } },
  { id: 'a3-landscape', label: 'A3 Landscape', w: 1587, h: 1123, mm: { w: 420, h: 297 } },
  { id: '16:9', label: '16:9 Widescreen', w: 1280, h: 720 },
  { id: 'square', label: 'Square', w: 1000, h: 1000 },
];

export function getPosterSize(id) {
  return posterSizes.find((s) => s.id === id) || posterSizes[0];
}

export function posterMm(size) {
  if (size.mm) return size.mm;
  return { w: +(size.w * PX_TO_MM).toFixed(2), h: +(size.h * PX_TO_MM).toFixed(2) };
}

export function makeCustomSize(w, h, unit) {
  let pxW, pxH, mmW, mmH;
  if (unit === 'mm') { pxW = w / PX_TO_MM; pxH = h / PX_TO_MM; mmW = w; mmH = h; }
  else if (unit === 'cm') { pxW = (w * 10) / PX_TO_MM; pxH = (h * 10) / PX_TO_MM; mmW = w * 10; mmH = h * 10; }
  else { pxW = w; pxH = h; mmW = w * PX_TO_MM; mmH = h * PX_TO_MM; }
  pxW = Math.max(200, Math.round(pxW));
  pxH = Math.max(200, Math.round(pxH));
  return { id: 'custom', label: 'Custom', w: pxW, h: pxH, mm: { w: +mmW.toFixed(2), h: +mmH.toFixed(2) } };
}

// ---- Fractional spec helpers (0..1 of poster width/height) ----
function txt(role, fx, fy, fw, fh, text, opts = {}) {
  return { type: 'text', role, fx, fy, fw, fh, content: { text, ...opts } };
}
function img(fx, fy, fw, fh, opts = {}) {
  return { type: 'image', fx, fy, fw, fh, content: { src: '', fit: 'cover', radius: 12, shadow: false, opacity: 1, ...opts } };
}
function shp(fx, fy, fw, fh, opts = {}) {
  return { type: 'shape', fx, fy, fw, fh, content: { shape: 'rect', fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: 0, opacity: 1, ...opts } };
}
function icn(fx, fy, fw, fh, name, opts = {}) {
  return { type: 'icon', fx, fy, fw, fh, content: { name, color: '#2563eb', size: 64, opacity: 1, ...opts } };
}

// Convert fractional specs to real elements at a given size.
function realize(specs, size) {
  return specs.map((s, i) => {
    let content = { ...s.content };
    if (s.type === 'text') {
      content = { ...defaultTextContent(s.role || 'body'), ...s.content };
      if (content.sizeFrac) { content.size = Math.round(content.sizeFrac * size.w); delete content.sizeFrac; }
    } else if (s.type === 'icon' && content.sizeFrac) {
      content.size = Math.round(content.sizeFrac * size.w);
      delete content.sizeFrac;
    }
    return newElement(s.type, {
      role: s.role || null,
      x: Math.round(s.fx * size.w),
      y: Math.round(s.fy * size.h),
      width: Math.round(s.fw * size.w),
      height: Math.round(s.fh * size.h),
      zIndex: i,
      content,
    });
  });
}

// ---- Structural archetypes ----
function academicSections(p, t) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.135, { fill: accent, opacity: 0.14 }),
    txt('heading', 0.04, 0.03, 0.72, 0.07, t('poster.placeholder.title'), { font: fonts.heading, color: H, sizeFrac: 0.058, bold: true }),
    txt('subheading', 0.04, 0.105, 0.72, 0.028, t('poster.placeholder.subtitle'), { font: fonts.body, color: sub, sizeFrac: 0.024 }),
    img(0.80, 0.03, 0.16, 0.085, { radius: 8 }),
    txt('body', 0.04, 0.15, 0.92, 0.03, t('poster.placeholder.authors'), { font: fonts.body, color: sub, sizeFrac: 0.022 }),
    txt('heading', 0.04, 0.20, 0.92, 0.035, t('poster.sec.intro'), { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }),
    txt('body', 0.04, 0.245, 0.92, 0.09, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.022 }),
  ];
  const cols = [
    { fx: 0.04, fw: 0.44, secs: ['objectives', 'methodology'] },
    { fx: 0.52, fw: 0.44, secs: ['results', 'discussion'] },
  ];
  cols.forEach((c) => {
    c.secs.forEach((sec, i) => {
      const y = 0.355 + i * 0.215;
      out.push(txt('heading', c.fx, y, c.fw, 0.032, t(`poster.sec.${sec}`), { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }));
      out.push(txt('body', c.fx, y + 0.038, c.fw, 0.15, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }));
    });
  });
  out.push(txt('heading', 0.04, 0.80, 0.92, 0.035, t('poster.sec.conclusion'), { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }));
  out.push(txt('body', 0.04, 0.845, 0.92, 0.07, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.022 }));
  out.push(txt('caption', 0.04, 0.925, 0.92, 0.04, t('poster.sec.references'), { font: fonts.body, color: sub, sizeFrac: 0.02 }));
  return out;
}

function researchGrid(p, t) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.12, { fill: H, opacity: 1 }),
    txt('heading', 0.04, 0.035, 0.7, 0.06, t('poster.placeholder.title'), { font: fonts.heading, color: '#ffffff', sizeFrac: 0.05, bold: true }),
    txt('subheading', 0.04, 0.095, 0.7, 0.025, t('poster.placeholder.subtitle'), { font: fonts.body, color: '#e2e8f0', sizeFrac: 0.022 }),
    img(0.78, 0.03, 0.18, 0.075, { radius: 8 }),
    txt('heading', 0.04, 0.14, 0.92, 0.032, t('poster.sec.abstract'), { font: fonts.heading, color: H, sizeFrac: 0.032, bold: true }),
    txt('body', 0.04, 0.175, 0.92, 0.10, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }),
  ];
  const grid = [
    { fx: 0.04, fy: 0.29, fw: 0.29, sec: 'methodology' },
    { fx: 0.355, fy: 0.29, fw: 0.29, sec: 'results' },
    { fx: 0.67, fy: 0.29, fw: 0.29, sec: 'discussion' },
    { fx: 0.04, fy: 0.55, fw: 0.29, sec: 'objectives' },
    { fx: 0.355, fy: 0.55, fw: 0.29, sec: 'conclusion' },
    { fx: 0.67, fy: 0.55, fw: 0.29, sec: 'acknowledgment' },
  ];
  grid.forEach((g) => {
    out.push(shp(g.fx, g.fy, g.fw, 0.22, { fill: accent, opacity: 0.08, radius: 10 }));
    out.push(txt('heading', g.fx + 0.015, g.fy + 0.012, g.fw - 0.03, 0.03, t(`poster.sec.${g.sec}`), { font: fonts.heading, color: H, sizeFrac: 0.026, bold: true }));
    out.push(txt('body', g.fx + 0.015, g.fy + 0.05, g.fw - 0.03, 0.15, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.018 }));
  });
  out.push(img(0.04, 0.80, 0.45, 0.16, { radius: 10 }));
  out.push(txt('heading', 0.52, 0.80, 0.44, 0.03, t('poster.sec.references'), { font: fonts.heading, color: H, sizeFrac: 0.026, bold: true }));
  out.push(txt('body', 0.52, 0.835, 0.44, 0.12, t('poster.placeholder.body'), { font: fonts.body, color: sub, sizeFrac: 0.018 }));
  return out;
}

function techColumns(p, t) {
  const { fonts, colors, bg } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.16, { fill: accent, opacity: 0.18 }),
    txt('heading', 0.04, 0.04, 0.92, 0.07, t('poster.placeholder.title'), { font: fonts.heading, color: H, sizeFrac: 0.06, bold: true }),
    txt('subheading', 0.04, 0.115, 0.92, 0.03, t('poster.placeholder.subtitle'), { font: fonts.body, color: sub, sizeFrac: 0.024 }),
  ];
  const cols = [
    { fx: 0.04, icon: 'ShieldCheck', sec: 'objectives' },
    { fx: 0.36, icon: 'Cpu', sec: 'methodology' },
    { fx: 0.68, icon: 'Target', sec: 'results' },
  ];
  cols.forEach((c) => {
    out.push(icn(c.fx + 0.08, 0.21, 0.12, 0.10, c.icon, { color: H, sizeFrac: 0.05 }));
    out.push(txt('heading', c.fx, 0.32, 0.28, 0.032, t(`poster.sec.${c.sec}`), { font: fonts.heading, color: H, sizeFrac: 0.028, bold: true }));
    out.push(txt('body', c.fx, 0.355, 0.28, 0.20, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }));
  });
  out.push(img(0.04, 0.57, 0.44, 0.20, { radius: 10 }));
  out.push(txt('heading', 0.52, 0.57, 0.44, 0.032, t('poster.sec.discussion'), { font: fonts.heading, color: H, sizeFrac: 0.028, bold: true }));
  out.push(txt('body', 0.52, 0.605, 0.44, 0.16, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }));
  out.push(txt('heading', 0.04, 0.80, 0.92, 0.035, t('poster.sec.conclusion'), { font: fonts.heading, color: H, sizeFrac: 0.032, bold: true }));
  out.push(txt('body', 0.04, 0.835, 0.92, 0.08, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }));
  out.push(txt('caption', 0.04, 0.925, 0.92, 0.04, t('poster.sec.references'), { font: fonts.body, color: sub, sizeFrac: 0.02 }));
  return out;
}

function generalHeader(p, t) {
  const { fonts, colors, background: bg } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.18, { fill: H, opacity: 1 }),
    txt('heading', 0.04, 0.045, 0.7, 0.07, t('poster.placeholder.title'), { font: fonts.heading, color: '#ffffff', sizeFrac: 0.058, bold: true }),
    txt('subheading', 0.04, 0.12, 0.7, 0.03, t('poster.placeholder.subtitle'), { font: fonts.body, color: '#e2e8f0', sizeFrac: 0.024 }),
    img(0.80, 0.04, 0.16, 0.10, { radius: 8 }),
    txt('body', 0.04, 0.20, 0.92, 0.03, t('poster.placeholder.authors'), { font: fonts.body, color: sub, sizeFrac: 0.022 }),
    txt('heading', 0.04, 0.25, 0.92, 0.035, t('poster.sec.intro'), { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }),
    txt('body', 0.04, 0.295, 0.92, 0.09, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.022 }),
    txt('heading', 0.04, 0.40, 0.44, 0.032, t('poster.sec.objectives'), { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
    txt('body', 0.04, 0.435, 0.44, 0.16, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02, listType: 'bullet' }),
    txt('heading', 0.52, 0.40, 0.44, 0.032, t('poster.sec.methodology'), { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
    txt('body', 0.52, 0.435, 0.44, 0.16, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02, listType: 'bullet' }),
    img(0.04, 0.62, 0.44, 0.20, { radius: 10 }),
    txt('heading', 0.52, 0.62, 0.44, 0.032, t('poster.sec.results'), { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
    txt('body', 0.52, 0.655, 0.44, 0.16, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.02 }),
    txt('heading', 0.04, 0.84, 0.92, 0.035, t('poster.sec.conclusion'), { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }),
    txt('body', 0.04, 0.875, 0.92, 0.07, t('poster.placeholder.body'), { font: fonts.body, color: body, sizeFrac: 0.022 }),
    txt('caption', 0.04, 0.945, 0.92, 0.035, t('poster.sec.references'), { font: fonts.body, color: sub, sizeFrac: 0.02 }),
  ];
  return out;
}

// ---- 15 templates ----
export const posterTemplates = [
  // Academic
  { id: 'clean-academic', name: 'Clean Academic', category: 'academic', fonts: { heading: 'Montserrat', body: 'Open Sans' }, colors: { primary: '#0f172a', accent: '#475569', text: '#1e293b', subtext: '#64748b' }, background: { type: 'solid', color: '#ffffff' }, build: academicSections },
  { id: 'university-classic', name: 'University Classic', category: 'academic', fonts: { heading: 'Montserrat', body: 'Open Sans' }, colors: { primary: '#92400e', accent: '#d97706', text: '#1f2937', subtext: '#6b7280' }, background: { type: 'solid', color: '#fefce8' }, build: academicSections },
  { id: 'research-poster', name: 'Research Poster', category: 'academic', fonts: { heading: 'Inter', body: 'Inter' }, colors: { primary: '#0ea5e9', accent: '#0ea5e9', text: '#0f172a', subtext: '#475569' }, background: { type: 'solid', color: '#ffffff' }, build: researchGrid },
  { id: 'scientific-poster', name: 'Scientific Poster', category: 'academic', fonts: { heading: 'Inter', body: 'Inter' }, colors: { primary: '#0d9488', accent: '#14b8a6', text: '#0f172a', subtext: '#475569' }, background: { type: 'solid', color: '#f0fdfa' }, build: researchGrid },
  { id: 'minimal-academic', name: 'Minimal Academic', category: 'academic', fonts: { heading: 'Inter', body: 'Inter' }, colors: { primary: '#111827', accent: '#6b7280', text: '#111827', subtext: '#6b7280' }, background: { type: 'solid', color: '#ffffff' }, build: academicSections },
  // Technology
  { id: 'cyber-security', name: 'Cyber Security', category: 'technology', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#22d3ee', accent: '#22d3ee', text: '#e2e8f0', subtext: '#94a3b8' }, background: { type: 'solid', color: '#020617' }, build: techColumns },
  { id: 'artificial-intelligence', name: 'Artificial Intelligence', category: 'technology', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#818cf8', accent: '#818cf8', text: '#e2e8f0', subtext: '#94a3b8' }, background: { type: 'solid', color: '#0f172a' }, build: techColumns },
  { id: 'programming', name: 'Programming', category: 'technology', fonts: { heading: 'Roboto', body: 'Inter' }, colors: { primary: '#22c55e', accent: '#22c55e', text: '#e2e8f0', subtext: '#94a3b8' }, background: { type: 'solid', color: '#18181b' }, build: techColumns },
  { id: 'modern-technology', name: 'Modern Technology', category: 'technology', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#3b82f6', accent: '#60a5fa', text: '#0f172a', subtext: '#475569' }, background: { type: 'solid', color: '#f8fafc' }, build: generalHeader },
  { id: 'dark-tech', name: 'Dark Tech', category: 'technology', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#a78bfa', accent: '#a78bfa', text: '#e2e8f0', subtext: '#94a3b8' }, background: { type: 'solid', color: '#000000' }, build: techColumns },
  // General
  { id: 'modern-blue', name: 'Modern Blue', category: 'general', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#2563eb', accent: '#3b82f6', text: '#0f172a', subtext: '#475569' }, background: { type: 'solid', color: '#ffffff' }, build: generalHeader },
  { id: 'elegant-green', name: 'Elegant Green', category: 'general', fonts: { heading: 'Poppins', body: 'Open Sans' }, colors: { primary: '#047857', accent: '#10b981', text: '#064e3b', subtext: '#475569' }, background: { type: 'solid', color: '#ffffff' }, build: generalHeader },
  { id: 'purple-gradient', name: 'Purple Gradient', category: 'general', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#7c3aed', accent: '#a78bfa', text: '#1e1b4b', subtext: '#6b7280' }, background: { type: 'gradient', color: '#7c3aed', color2: '#a78bfa' }, build: generalHeader },
  { id: 'professional-business', name: 'Professional Business', category: 'general', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#0f172a', accent: '#f59e0b', text: '#334155', subtext: '#64748b' }, background: { type: 'solid', color: '#ffffff' }, build: generalHeader },
  { id: 'creative-student', name: 'Creative Student', category: 'general', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#db2777', accent: '#f97316', text: '#1f2937', subtext: '#6b7280' }, background: { type: 'gradient', color: '#f97316', color2: '#ec4899' }, build: generalHeader },
];

export function getPosterTemplate(id) {
  return posterTemplates.find((t) => t.id === id) || posterTemplates[0];
}

export function buildPosterFromTemplate(template, size, t) {
  const specs = template.build(template, t);
  return { background: { ...template.background }, elements: realize(specs, size) };
}

// Restyle an existing poster with a template (keep text content, restyle fonts/colors/bg).
export function applyPosterTemplate(poster, template) {
  const next = { ...poster, background: { ...template.background } };
  next.elements = poster.elements.map((el) => {
    if (el.type === 'text') {
      const role = el.role || (el.content.size >= 40 ? 'heading' : 'body');
      let color = template.colors.text;
      if (role === 'heading') color = template.colors.primary;
      if (role === 'subheading' || role === 'caption') color = template.colors.subtext;
      const font = role === 'heading' ? template.fonts.heading : template.fonts.body;
      return { ...el, content: { ...el.content, font, color } };
    }
    if (el.type === 'shape') return { ...el, content: { ...el.content, fill: template.colors.accent } };
    if (el.type === 'icon') return { ...el, content: { ...el.content, color: template.colors.primary } };
    return el;
  });
  return next;
}

// ---- Poster layouts (structure only) ----
export const posterLayouts = [
  {
    id: 'one-column', name: 'One Column',
    build: () => [
      txt('heading', 0.06, 0.05, 0.88, 0.08, ''),
      txt('body', 0.06, 0.16, 0.88, 0.76, ''),
    ],
  },
  {
    id: 'two-columns', name: 'Two Columns',
    build: () => [
      txt('heading', 0.06, 0.05, 0.88, 0.08, ''),
      txt('body', 0.06, 0.16, 0.42, 0.76, ''),
      txt('body', 0.52, 0.16, 0.42, 0.76, ''),
    ],
  },
  {
    id: 'three-columns', name: 'Three Columns',
    build: () => [
      txt('heading', 0.05, 0.05, 0.90, 0.08, ''),
      txt('body', 0.05, 0.16, 0.28, 0.76, ''),
      txt('body', 0.36, 0.16, 0.28, 0.76, ''),
      txt('body', 0.67, 0.16, 0.28, 0.76, ''),
    ],
  },
  {
    id: 'header-two-cols', name: 'Header + Two Columns',
    build: () => [
      shp(0, 0, 1, 0.14, { fill: '#2563eb', opacity: 1 }),
      txt('heading', 0.06, 0.04, 0.88, 0.07, '', { color: '#ffffff' }),
      txt('body', 0.06, 0.18, 0.42, 0.74, ''),
      txt('body', 0.52, 0.18, 0.42, 0.74, ''),
    ],
  },
  {
    id: 'header-three-cols', name: 'Header + Three Columns',
    build: () => [
      shp(0, 0, 1, 0.14, { fill: '#2563eb', opacity: 1 }),
      txt('heading', 0.06, 0.04, 0.88, 0.07, '', { color: '#ffffff' }),
      txt('body', 0.05, 0.18, 0.28, 0.74, ''),
      txt('body', 0.36, 0.18, 0.28, 0.74, ''),
      txt('body', 0.67, 0.18, 0.28, 0.74, ''),
    ],
  },
  {
    id: 'large-image-text', name: 'Large Image + Text',
    build: () => [
      img(0.05, 0.06, 0.50, 0.88, { radius: 12 }),
      txt('heading', 0.58, 0.06, 0.38, 0.08, ''),
      txt('body', 0.58, 0.16, 0.38, 0.76, ''),
    ],
  },
  {
    id: 'research-grid', name: 'Research Grid',
    build: () => [
      txt('heading', 0.05, 0.04, 0.90, 0.07, ''),
      txt('body', 0.05, 0.14, 0.28, 0.38, ''),
      txt('body', 0.36, 0.14, 0.28, 0.38, ''),
      txt('body', 0.67, 0.14, 0.28, 0.38, ''),
      txt('body', 0.05, 0.55, 0.28, 0.38, ''),
      txt('body', 0.36, 0.55, 0.28, 0.38, ''),
      txt('body', 0.67, 0.55, 0.28, 0.38, ''),
    ],
  },
  {
    id: 'modern-cards', name: 'Modern Cards',
    build: () => [
      txt('heading', 0.06, 0.05, 0.88, 0.08, ''),
      shp(0.05, 0.18, 0.28, 0.30, { fill: '#e0f2fe', radius: 14, opacity: 1 }),
      shp(0.36, 0.18, 0.28, 0.30, { fill: '#dcfce7', radius: 14, opacity: 1 }),
      shp(0.67, 0.18, 0.28, 0.30, { fill: '#fae8ff', radius: 14, opacity: 1 }),
      txt('body', 0.07, 0.21, 0.24, 0.24, ''),
      txt('body', 0.38, 0.21, 0.24, 0.24, ''),
      txt('body', 0.69, 0.21, 0.24, 0.24, ''),
    ],
  },
  {
    id: 'minimal-academic', name: 'Minimal Academic',
    build: () => [
      txt('heading', 0.08, 0.08, 0.84, 0.06, ''),
      shp(0.08, 0.15, 0.10, 0.005, { fill: '#111827', opacity: 1 }),
      txt('body', 0.08, 0.18, 0.84, 0.72, ''),
    ],
  },
  {
    id: 'full-visual', name: 'Full Visual',
    build: () => [
      img(0, 0, 1, 1, { radius: 0 }),
      shp(0, 0.78, 1, 0.22, { fill: '#000000', opacity: 0.45 }),
      txt('heading', 0.06, 0.82, 0.88, 0.10, '', { color: '#ffffff' }),
    ],
  },
];

export function buildPosterFromLayout(layout, size, t, existing) {
  const specs = layout.build();
  const elements = realize(specs, size);
  // Preserve existing text content where roles match.
  if (existing && existing.length) {
    return elements.map((el) => {
      if (el.type !== 'text' || !el.role) return el;
      const match = existing.find((e) => e.type === 'text' && e.role === el.role && e.content && e.content.text);
      if (match) return { ...el, content: { ...el.content, text: match.content.text } };
      return el;
    });
  }
  return elements;
}

// ---- Academic section blocks (addable) ----
export const sectionBlocks = [
  { id: 'title', labelKey: 'poster.sec.title', build: (size) => realize([txt('heading', 0.06, 0.04, 0.88, 0.10, '', { sizeFrac: 0.05, bold: true })], size) },
  { id: 'introduction', labelKey: 'poster.sec.intro', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'abstract', labelKey: 'poster.sec.abstract', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'objectives', labelKey: 'poster.sec.objectives', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022, listType: 'bullet' }),
  ], size) },
  { id: 'methodology', labelKey: 'poster.sec.methodology', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'results', labelKey: 'poster.sec.results', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'discussion', labelKey: 'poster.sec.discussion', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'conclusion', labelKey: 'poster.sec.conclusion', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.03, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.14, '', { sizeFrac: 0.022 }),
  ], size) },
  { id: 'references', labelKey: 'poster.sec.references', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.028, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.12, '', { sizeFrac: 0.02 }),
  ], size) },
  { id: 'acknowledgment', labelKey: 'poster.sec.acknowledgment', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.028, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.10, '', { sizeFrac: 0.02 }),
  ], size) },
  { id: 'contact', labelKey: 'poster.sec.contact', build: (size) => realize([
    txt('heading', 0.06, 0.04, 0.88, 0.04, '', { sizeFrac: 0.028, bold: true }),
    txt('body', 0.06, 0.085, 0.88, 0.08, '', { sizeFrac: 0.02 }),
  ], size) },
  { id: 'qr', labelKey: 'poster.sec.qr', build: (size) => realize([
    shp(0.40, 0.04, 0.20, 0.20, { fill: '#ffffff', border: '#0f172a', borderWidth: 2, radius: 8 }),
    icn(0.43, 0.07, 0.14, 0.14, 'QrCode', { color: '#0f172a', size: 120 }),
  ], size) },
];

// ---- Examples ----
export const posterExamples = [
  {
    id: 'cyber-security', name: 'Cyber Security Awareness', templateId: 'cyber-security', sizeId: 'a3-portrait',
    build: (t) => {
      const p = getPosterTemplate('cyber-security');
      const H = p.colors.primary, sub = p.colors.subtext, body = p.colors.text, accent = p.colors.accent;
      const specs = [
        shp(0, 0, 1, 0.13, { fill: accent, opacity: 0.16 }),
        txt('heading', 0.04, 0.03, 0.74, 0.07, 'Cyber Security Awareness', { font: p.fonts.heading, color: H, sizeFrac: 0.052, bold: true }),
        txt('subheading', 0.04, 0.10, 0.74, 0.028, 'Protecting Systems, Networks & Data', { font: p.fonts.body, color: sub, sizeFrac: 0.024 }),
        img(0.82, 0.03, 0.14, 0.085, { radius: 8 }),
        txt('body', 0.04, 0.145, 0.92, 0.03, 'University of KRD  ·  Department of IT  ·  2026', { font: p.fonts.body, color: sub, sizeFrac: 0.02 }),
        txt('heading', 0.04, 0.19, 0.92, 0.035, 'Introduction', { font: p.fonts.heading, color: H, sizeFrac: 0.032, bold: true }),
        txt('body', 0.04, 0.235, 0.92, 0.085, 'Cyber security is the practice of protecting systems, networks, and data from digital attacks, theft, and damage.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        icn(0.04, 0.33, 0.04, 0.04, 'ShieldCheck', { color: H, size: 56 }),
        txt('heading', 0.09, 0.335, 0.39, 0.03, 'Objectives', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.09, 0.37, 0.39, 0.13, 'Understand threats\nLearn protection methods\nPromote safe habits', { font: p.fonts.body, color: body, sizeFrac: 0.02, listType: 'bullet' }),
        icn(0.52, 0.33, 0.04, 0.04, 'Bug', { color: H, size: 56 }),
        txt('heading', 0.57, 0.335, 0.39, 0.03, 'Main Threats', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.57, 0.37, 0.39, 0.13, 'Malware & viruses\nPhishing attacks\nRansomware\nMan-in-the-middle', { font: p.fonts.body, color: body, sizeFrac: 0.02, listType: 'bullet' }),
        icn(0.04, 0.52, 0.04, 0.04, 'Lock', { color: H, size: 56 }),
        txt('heading', 0.09, 0.525, 0.39, 0.03, 'Protection Methods', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.09, 0.56, 0.39, 0.13, 'Strong passwords\nTwo-factor authentication\nRegular updates\nSecurity training', { font: p.fonts.body, color: body, sizeFrac: 0.02, listType: 'bullet' }),
        img(0.52, 0.52, 0.44, 0.18, { radius: 10, shadow: true }),
        shp(0.04, 0.74, 0.92, 0.005, { fill: accent, opacity: 0.6 }),
        txt('heading', 0.04, 0.76, 0.92, 0.035, 'Conclusion', { font: p.fonts.heading, color: H, sizeFrac: 0.032, bold: true }),
        txt('body', 0.04, 0.805, 0.92, 0.07, 'Good cyber security habits keep your data, identity, and systems safe in a connected world.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        txt('caption', 0.04, 0.885, 0.92, 0.035, 'References', { font: p.fonts.heading, color: sub, sizeFrac: 0.022, bold: true }),
        txt('caption', 0.04, 0.925, 0.92, 0.04, '1. NIST Cybersecurity Framework\n2. ISO/IEC 27001\n3. CIS Controls v8', { font: p.fonts.body, color: sub, sizeFrac: 0.018 }),
      ];
      return specs;
    },
  },
  {
    id: 'artificial-intelligence', name: 'Artificial Intelligence', templateId: 'artificial-intelligence', sizeId: 'a3-portrait',
    build: (t) => {
      const p = getPosterTemplate('artificial-intelligence');
      const H = p.colors.primary, sub = p.colors.subtext, body = p.colors.text, accent = p.colors.accent;
      const secs = [
        ['overview', 'Overview', 'AI is the science of making machines that can learn, reason, and act intelligently.'],
        ['applications', 'Applications', 'Healthcare\nEducation\nFinance\nTransportation'],
        ['advantages', 'Advantages', 'Automation\nAccuracy\nSpeed\nInsights'],
        ['challenges', 'Challenges', 'Bias\nPrivacy\nJob impact\nSafety'],
        ['future', 'Future', 'Smarter assistants\nAutonomous systems\nHuman-AI collaboration'],
        ['conclusion', 'Conclusion', 'AI is shaping the future of every industry.'],
      ];
      const specs = [
        shp(0, 0, 1, 0.14, { fill: accent, opacity: 0.18 }),
        txt('heading', 0.04, 0.035, 0.92, 0.07, 'Artificial Intelligence', { font: p.fonts.heading, color: H, sizeFrac: 0.05, bold: true }),
        txt('subheading', 0.04, 0.105, 0.92, 0.028, 'Machines that Learn and Reason', { font: p.fonts.body, color: sub, sizeFrac: 0.024 }),
      ];
      secs.slice(0, 5).forEach((s, i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const fx = col === 0 ? 0.04 : 0.52; const fy = 0.17 + row * 0.245;
        specs.push(txt('heading', fx, fy, 0.44, 0.032, s[1], { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }));
        specs.push(txt('body', fx, fy + 0.038, 0.44, 0.18, s[2], { font: p.fonts.body, color: body, sizeFrac: 0.02, listType: s[2].includes('\n') ? 'bullet' : 'none' }));
      });
      specs.push(txt('heading', 0.04, 0.79, 0.92, 0.035, 'Conclusion', { font: p.fonts.heading, color: H, sizeFrac: 0.032, bold: true }));
      specs.push(txt('body', 0.04, 0.83, 0.92, 0.06, secs[5][2], { font: p.fonts.body, color: body, sizeFrac: 0.02 }));
      specs.push(txt('caption', 0.04, 0.905, 0.92, 0.035, 'References', { font: p.fonts.heading, color: sub, sizeFrac: 0.022, bold: true }));
      specs.push(txt('caption', 0.04, 0.945, 0.92, 0.04, '1. Russell & Norvig, AI: A Modern Approach\n2. MIT AI Essentials', { font: p.fonts.body, color: sub, sizeFrac: 0.018 }));
      return specs;
    },
  },
  {
    id: 'research-poster', name: 'Research Poster', templateId: 'research-poster', sizeId: 'a3-portrait',
    build: (t) => {
      const p = getPosterTemplate('research-poster');
      const H = p.colors.primary, sub = p.colors.subtext, body = p.colors.text, accent = p.colors.accent;
      const specs = [
        shp(0, 0, 1, 0.12, { fill: H, opacity: 1 }),
        txt('heading', 0.04, 0.035, 0.74, 0.06, 'Research Study', { font: p.fonts.heading, color: '#ffffff', sizeFrac: 0.046, bold: true }),
        txt('subheading', 0.04, 0.095, 0.74, 0.025, 'An Academic Investigation', { font: p.fonts.body, color: '#e2e8f0', sizeFrac: 0.022 }),
        img(0.80, 0.03, 0.16, 0.08, { radius: 8 }),
        txt('heading', 0.04, 0.14, 0.92, 0.032, 'Abstract', { font: p.fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
        txt('body', 0.04, 0.175, 0.92, 0.09, 'A concise summary of the research problem, methods, and key findings.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        txt('heading', 0.04, 0.28, 0.44, 0.03, 'Methodology', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.04, 0.315, 0.44, 0.16, 'Study design, data collection, and analysis approach.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        txt('heading', 0.52, 0.28, 0.44, 0.03, 'Results', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.52, 0.315, 0.44, 0.16, 'Key quantitative and qualitative findings.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        txt('heading', 0.04, 0.49, 0.92, 0.032, 'Discussion', { font: p.fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
        txt('body', 0.04, 0.525, 0.92, 0.10, 'Interpretation of results and implications.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        img(0.04, 0.64, 0.44, 0.18, { radius: 10 }),
        txt('heading', 0.52, 0.64, 0.44, 0.03, 'Conclusion', { font: p.fonts.heading, color: H, sizeFrac: 0.028, bold: true }),
        txt('body', 0.52, 0.675, 0.44, 0.14, 'Summary of insights and future work.', { font: p.fonts.body, color: body, sizeFrac: 0.02 }),
        txt('caption', 0.04, 0.86, 0.92, 0.03, 'References', { font: p.fonts.heading, color: sub, sizeFrac: 0.022, bold: true }),
        txt('caption', 0.04, 0.895, 0.92, 0.05, '1. Author, Title, Journal, Year\n2. Author, Title, Conference, Year', { font: p.fonts.body, color: sub, sizeFrac: 0.018 }),
      ];
      return specs;
    },
  },
];

export function buildExamplePoster(example, t) {
  const size = getPosterSize(example.sizeId);
  const specs = example.build(t);
  const template = getPosterTemplate(example.templateId);
  return {
    size,
    background: { ...template.background },
    elements: realize(specs, size),
    templateId: example.templateId,
  };
}

// ---- Project creation / normalization ----
export function createNewPosterContent(size, language, t) {
  return {
    size,
    language: language || 'en',
    background: { type: 'solid', color: '#ffffff' },
    elements: [],
    templateId: null,
  };
}

export function createNewPosterProject(size, language, name, t) {
  const shell = createProjectShell('poster', name || t('poster.untitled'));
  shell.status = 'draft';
  shell.content = createNewPosterContent(size, language, t);
  return shell;
}

export function normalizePosterContent(content, t) {
  const base = createNewPosterContent(posterSizes[0], 'en', t);
  const c = { ...base, ...(content || {}) };
  c.size = c.size && c.size.w ? c.size : base.size;
  c.background = { ...base.background, ...(c.background || {}) };
  c.elements = (Array.isArray(c.elements) ? c.elements : []).map((e) => ({ ...newElement(e.type, e), ...e, content: { ...e.content } }));
  c.language = c.language || 'en';
  c.templateId = c.templateId || null;
  return c;
}