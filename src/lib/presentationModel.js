import { createId, createProjectShell } from './db';
import { rtlLanguages } from './translations';
import {
  defaultTextContent, getLayoutSpec, getTemplate, templates, examples,
} from './presentationAssets';

export function baseDimensions(ratio) {
  return ratio === '4:3' ? { w: 1024, h: 768 } : { w: 1280, h: 720 };
}

export function isRtl(language) {
  return rtlLanguages.includes(language);
}

export function newElement(type, partial = {}) {
  const el = {
    id: createId(), type, x: 200, y: 200, width: 400, height: 120,
    rotation: 0, zIndex: 1, locked: false, styles: {}, content: {}, role: partial.role || null,
    ...partial,
  };
  if (type === 'text' && !partial.content) el.content = defaultTextContent(el.role || 'body');
  if (type === 'image' && !partial.content) el.content = { src: '', fit: 'cover', radius: 12, shadow: false, opacity: 1 };
  if (type === 'shape' && !partial.content) el.content = { shape: 'rect', fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: 0, opacity: 1 };
  if (type === 'icon' && !partial.content) el.content = { name: 'GraduationCap', color: '#2563eb', size: 64, opacity: 1 };
  return el;
}

export function newSlide(background, elements = [], notes = '') {
  return { id: createId(), background: background || { type: 'solid', color: '#ffffff' }, elements, notes };
}

export function buildSlideFromLayout(layoutId, t, background) {
  const specs = getLayoutSpec(layoutId, t);
  const elements = specs.map((s) => newElement(s.type, {
    x: s.x, y: s.y, width: s.w, height: s.h, role: s.role, content: s.content,
  }));
  return newSlide(background || { type: 'solid', color: '#ffffff' }, elements, '');
}

// Convert an old-style slide (title/body/bullets/image) to the element model.
export function migrateSlide(old, t) {
  if (old && Array.isArray(old.elements)) {
    return { ...old, notes: old.notes || '', elements: old.elements.map((e) => ({ ...newElement(e.type, e), ...e })) };
  }
  const bg = { type: 'solid', color: '#ffffff' };
  const els = [];
  if (old.type === 'title') {
    els.push(newElement('text', { role: 'heading', x: 140, y: 260, width: 1000, height: 140, content: { ...defaultTextContent('heading'), text: old.title || '', align: 'center', size: 64 } }));
    if (old.subtitle) els.push(newElement('text', { role: 'subheading', x: 300, y: 420, width: 680, height: 60, content: { ...defaultTextContent('subheading'), text: old.subtitle, align: 'center' } }));
  } else if (old.type === 'references') {
    els.push(newElement('text', { role: 'heading', x: 80, y: 70, width: 1120, height: 90, content: { ...defaultTextContent('heading'), text: old.title || t('slide.references') } }));
    els.push(newElement('text', { role: 'body', x: 80, y: 190, width: 1120, height: 420, content: { ...defaultTextContent('body'), text: '' } }));
  } else {
    els.push(newElement('text', { role: 'heading', x: 80, y: 70, width: 1120, height: 90, content: { ...defaultTextContent('heading'), text: old.title || '' } }));
    let y = 190;
    if (old.body) { els.push(newElement('text', { role: 'body', x: 80, y, width: 1120, height: 140, content: { ...defaultTextContent('body'), text: old.body } })); y += 160; }
    if (old.bullets && old.bullets.length) {
      els.push(newElement('text', { role: 'body', x: 80, y, width: 1120, height: 260, content: { ...defaultTextContent('body'), text: old.bullets.filter((b) => b).join('\n'), listType: 'bullet' } }));
    }
    if (old.image) els.push(newElement('image', { x: 480, y: 380, width: 320, height: 240, content: { src: old.image, fit: 'cover', radius: 12, shadow: false, opacity: 1 } }));
  }
  return newSlide(bg, els, old.notes || '');
}

// Apply a template to a slide, preserving element text content.
export function applyTemplate(slide, template, isCover) {
  const scheme = isCover ? template.cover : template.content;
  const next = { ...slide, background: scheme.bg };
  next.elements = slide.elements.map((el) => {
    if (el.type === 'text') {
      const role = el.role || (el.content.size >= 44 ? 'heading' : 'body');
      let color = isCover ? scheme.text : scheme.text;
      if (role === 'heading') color = isCover ? scheme.text : template.colors.primary;
      if (role === 'subheading' || role === 'caption') color = isCover ? scheme.subtext : template.colors.muted;
      return { ...el, content: { ...el.content, font: role === 'heading' ? template.fonts.heading : template.fonts.body, color } };
    }
    if (el.type === 'shape') return { ...el, content: { ...el.content, fill: template.colors.accent } };
    if (el.type === 'icon') return { ...el, content: { ...el.content, color: isCover ? scheme.text : template.colors.primary } };
    return el;
  });
  return next;
}

export function buildExampleSlides(example, t) {
  const template = getTemplate(example.templateId);
  return example.outline.map((item, i) => {
    const slide = buildSlideFromLayout(item.layout, t);
    const heading = slide.elements.find((e) => e.role === 'heading');
    if (heading && item.title) heading.content.text = item.title;
    const body = slide.elements.find((e) => e.role === 'body');
    if (body && item.body) body.content.text = item.body;
    if (body && item.bullets) { body.content.listType = 'bullet'; body.content.text = item.bullets.join('\n'); }
    return applyTemplate(slide, template, i === 0);
  });
}

export function generateSlides(topic, count, t) {
  const title = topic?.title?.trim() || t('slide.title.default');
  const slides = [];
  const cover = buildSlideFromLayout('title', t, { type: 'solid', color: '#ffffff' });
  cover.elements[0].content.text = title;
  if (topic?.subtitle && cover.elements[1]) cover.elements[1].content.text = topic.subtitle;
  slides.push(cover);
  const middle = Math.max(0, count - 2);
  for (let i = 0; i < middle; i++) {
    let s;
    if (i === 0) s = buildSlideFromLayout('titleBullets', t);
    else if (i === middle - 1 && middle >= 2) s = buildSlideFromLayout('conclusion', t);
    else s = buildSlideFromLayout('titleBullets', t);
    const heading = s.elements.find((e) => e.role === 'heading');
    if (heading) heading.content.text = (i === 0) ? t('slide.intro') : (i === middle - 1 && middle >= 2) ? t('slide.conclusion') : `${t('slide.mainPoint')} ${i}`;
    slides.push(s);
  }
  if (count >= 2) {
    const r = buildSlideFromLayout('references', t);
    slides.push(r);
  }
  return slides;
}

export function defaultStudentInfo() {
  return {
    fields: { name: true, id: false, university: true, college: true, department: true, stage: true, group: false, supervisor: true, academicYear: true },
    common: { university: '', college: '', department: '', supervisor: '', academicYear: '' },
    students: [{ uid: createId(), name: '', id: '', stage: '', group: '' }],
  };
}

export function defaultDesign() {
  return { theme: 'modern-blue', primaryColor: null, accentColor: null, fontSize: 'md', titleAlign: 'center', bodyAlign: 'start', background: { type: 'solid' } };
}

export function createNewContent(documentLanguage) {
  return {
    step: 0,
    topic: { title: '', subtitle: '', subject: '', description: '' },
    language: documentLanguage || 'en',
    slideCount: 7,
    ratio: '16:9',
    studentInfo: defaultStudentInfo(),
    slides: [],
    references: [],
    design: defaultDesign(),
  };
}

export function normalizeContent(content, t) {
  const base = createNewContent('en');
  const c = { ...base, ...(content || {}) };
  c.topic = { ...base.topic, ...(c.topic || {}) };
  c.studentInfo = { ...base.studentInfo, ...(c.studentInfo || {}) };
  c.studentInfo.fields = { ...base.studentInfo.fields, ...(c.studentInfo.fields || {}) };
  c.studentInfo.common = { ...base.studentInfo.common, ...(c.studentInfo.common || {}) };
  const rawStudents = Array.isArray(c.studentInfo.students) && c.studentInfo.students.length ? c.studentInfo.students : base.studentInfo.students;
  c.studentInfo.students = rawStudents.map((s) => ({ ...s, uid: s.uid || createId() }));
  c.design = { ...base.design, ...(c.design || {}) };
  c.design.background = { ...base.design.background, ...(c.design.background || {}) };
  c.slides = (Array.isArray(c.slides) ? c.slides : []).map((s) => migrateSlide(s, t));
  if (Array.isArray(content && content.references) && content.references.length) {
    const refSlide = c.slides.find((s) => s.elements.some((e) => e.role === 'heading' && e.content.text === t('slide.references')));
    if (refSlide) {
      const body = refSlide.elements.find((e) => e.role === 'body');
      if (body) body.content.text = content.references.map((r) => [r.author, r.year ? `(${r.year})` : '', r.title, r.link].filter(Boolean).join('. ')).join('\n');
    }
  }
  c.references = [];
  if (!c.slideCount || c.slideCount < 3) c.slideCount = base.slideCount;
  c.step = Math.max(0, Math.min(c.step || 0, 5));
  return c;
}

export function createNewProject(documentLanguage, t) {
  const shell = createProjectShell('presentation', t('pb.untitled'));
  shell.status = 'draft';
  shell.content = createNewContent(documentLanguage);
  return shell;
}

export { templates, examples };