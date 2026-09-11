import { createId, createProjectShell } from './db';
import { rtlLanguages } from './translations';

// Six clean academic themes. Colors are fixed per theme (independent of app dark mode).
export const themes = [
  { id: 'modern-blue', nameKey: 'pb.theme.modernBlue', bg: '#ffffff', primary: '#2563eb', accent: '#60a5fa', text: '#0f172a', muted: '#64748b' },
  { id: 'minimal-light', nameKey: 'pb.theme.minimalLight', bg: '#ffffff', primary: '#111827', accent: '#6b7280', text: '#111827', muted: '#6b7280' },
  { id: 'dark-pro', nameKey: 'pb.theme.darkPro', bg: '#0f172a', primary: '#38bdf8', accent: '#818cf8', text: '#f1f5f9', muted: '#94a3b8' },
  { id: 'academic-green', nameKey: 'pb.theme.academicGreen', bg: '#ffffff', primary: '#047857', accent: '#10b981', text: '#064e3b', muted: '#6b7280' },
  { id: 'elegant-purple', nameKey: 'pb.theme.elegantPurple', bg: '#ffffff', primary: '#7c3aed', accent: '#a78bfa', text: '#1e1b4b', muted: '#6b7280' },
  { id: 'simple-gray', nameKey: 'pb.theme.simpleGray', bg: '#ffffff', primary: '#374151', accent: '#6b7280', text: '#111827', muted: '#6b7280' },
];

export function getTheme(id) {
  return themes.find((t) => t.id === id) || themes[0];
}

export function resolveDesign(design) {
  const theme = getTheme(design?.theme);
  return {
    ...design,
    theme,
    primary: design?.primaryColor || theme.primary,
    accent: design?.accentColor || theme.accent,
    bg: theme.bg,
    text: theme.text,
    muted: theme.muted,
  };
}

export function baseDimensions(ratio) {
  return ratio === '4:3' ? { w: 1024, h: 768 } : { w: 1280, h: 720 };
}

export function isRtl(language) {
  return rtlLanguages.includes(language);
}

export function newSlide(type = 'content', t) {
  return {
    id: createId(),
    type,
    title: '',
    body: '',
    bullets: type === 'content' ? ['', '', ''] : [],
    notes: '',
    image: '',
  };
}

// Build editable starter slides from the topic + count. No AI — local placeholders.
export function generateSlides(topic, count, t) {
  const title = topic?.title?.trim() || t('slide.title.default');
  const slides = [{
    id: createId(), type: 'title', title, subtitle: topic?.subtitle || '',
    body: '', bullets: [], notes: '', image: '',
  }];
  const middle = Math.max(0, count - 2);
  for (let i = 0; i < middle; i++) {
    let s;
    if (i === 0) {
      s = { id: createId(), type: 'content', title: t('slide.intro'), body: t('slide.body.intro'),
        bullets: [`${t('slide.bullet')} 1`, `${t('slide.bullet')} 2`, `${t('slide.bullet')} 3`], notes: '', image: '' };
    } else if (i === middle - 1 && middle >= 2) {
      s = { id: createId(), type: 'content', title: t('slide.conclusion'), body: t('slide.body.conclusion'),
        bullets: [`${t('slide.bullet')} 1`, `${t('slide.bullet')} 2`], notes: '', image: '' };
    } else {
      s = { id: createId(), type: 'content', title: `${t('slide.mainPoint')} ${i}`, body: t('slide.body.main'),
        bullets: [`${t('slide.bullet')} 1`, `${t('slide.bullet')} 2`, `${t('slide.bullet')} 3`], notes: '', image: '' };
    }
    slides.push(s);
  }
  if (count >= 2) {
    slides.push({ id: createId(), type: 'references', title: t('slide.references'), body: '', bullets: [], notes: '', image: '' });
  }
  return slides;
}

export function newReference() {
  return { id: createId(), title: '', author: '', year: '', link: '' };
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

// Merge a loaded project's content with defaults so missing fields never break the UI.
export function normalizeContent(content, t) {
  const base = createNewContent('en');
  const c = { ...base, ...(content || {}) };
  c.topic = { ...base.topic, ...(c.topic || {}) };
  c.studentInfo = { ...base.studentInfo, ...(c.studentInfo || {}) };
  c.studentInfo.fields = { ...base.studentInfo.fields, ...(c.studentInfo.fields || {}) };
  c.studentInfo.common = { ...base.studentInfo.common, ...(c.studentInfo.common || {}) };
  const rawStudents = Array.isArray(c.studentInfo.students) && c.studentInfo.students.length
    ? c.studentInfo.students : base.studentInfo.students;
  c.studentInfo.students = rawStudents.map((s) => ({ ...s, uid: s.uid || createId() }));
  c.design = { ...base.design, ...(c.design || {}) };
  c.design.background = { ...base.design.background, ...(c.design.background || {}) };
  c.slides = Array.isArray(c.slides) ? c.slides : [];
  c.references = Array.isArray(c.references) ? c.references : [];
  if (!c.slideCount || c.slideCount < 3) c.slideCount = base.slideCount;
  return c;
}

export function createNewProject(documentLanguage, t) {
  const shell = createProjectShell('presentation', t('pb.untitled'));
  shell.status = 'draft';
  shell.content = createNewContent(documentLanguage);
  return shell;
}