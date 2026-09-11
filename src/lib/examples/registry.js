// Unified read-only example registry across all three editors.
// Examples are master templates; user projects are editable copies (see useExample).

import { createId, nowISO, createProjectShell } from '@/lib/db';
import { createNewContent, buildExampleSlides } from '@/lib/presentationModel';
import { buildDesignedPoster } from '@/lib/examples/posterExamples';
import { buildReportExampleProject } from '@/lib/examples/reportExamples';
import presentationExamples from '@/lib/examples/presentationExamples';
import posterExamples from '@/lib/examples/posterExamples';
import reportExamples from '@/lib/examples/reportExamples';

function buildPresentationProject(example, t) {
  const slides = buildExampleSlides(example, t);
  const content = createNewContent(example.language);
  content.slides = slides;
  content.topic = { ...content.topic, title: example.name, subtitle: example.description || '' };
  content.slideCount = slides.length;
  content.language = example.language;
  content.ratio = '16:9';
  content.step = 4; // open directly in the visual editor
  content.design = { ...content.design, theme: example.templateId };
  const shell = createProjectShell('presentation', example.name);
  shell.status = 'draft';
  shell.content = content;
  return shell;
}

function buildPosterProject(example) {
  const built = buildDesignedPoster(example);
  const shell = createProjectShell('poster', example.name);
  shell.status = 'draft';
  shell.content = {
    size: built.size,
    language: example.language,
    background: built.background,
    elements: built.elements,
    templateId: built.templateId,
  };
  return shell;
}

function buildReportProject(example) {
  return buildReportExampleProject(example);
}

const builders = {
  presentation: buildPresentationProject,
  poster: buildPosterProject,
  report: buildReportProject,
};

function makeEntry(ex, type) {
  const count = type === 'presentation'
    ? { n: ex.outline.length, unit: 'slides' }
    : type === 'poster'
      ? { n: 1, unit: 'poster', size: ex.sizeId }
      : { n: (ex.build().match(/<h2/g) || []).length, unit: 'sections' };
  return {
    id: ex.id,
    name: ex.name,
    type,
    category: ex.category,
    style: ex.style,
    language: ex.language,
    description: ex.description,
    templateId: ex.templateId || ex.template,
    count,
    buildProject: (t) => builders[type](ex, t),
  };
}

export const allExamples = [
  ...presentationExamples.map((e) => makeEntry(e, 'presentation')),
  ...posterExamples.map((e) => makeEntry(e, 'poster')),
  ...reportExamples.map((e) => makeEntry(e, 'report')),
];

export function getExamplesByType(type) {
  return allExamples.filter((e) => e.type === type);
}

export function getExampleById(id) {
  return allExamples.find((e) => e.id === id);
}

export const exampleCategories = [
  'Information Technology', 'Computer Science', 'Business', 'Science', 'Research',
  'Education', 'Environment', 'Health', 'General', 'Minimal', 'Creative',
];

export const exampleStyles = ['Modern', 'Minimal', 'Academic', 'Technology', 'Creative', 'Dark', 'Professional'];

export const exampleLanguages = ['en', 'ku', 'ar'];

export const exampleTypes = [
  { id: 'presentation', key: 'ex.type.presentation' },
  { id: 'poster', key: 'ex.type.poster' },
  { id: 'report', key: 'ex.type.report' },
];

// Create a fresh editable copy of an example and persist it to IndexedDB.
// The master example definition is never mutated. Returns the new project.
export async function createExampleCopy(example, t, saveProject) {
  const project = example.buildProject(t);
  // Force a brand-new unique id and a "— Copy" name for the user's copy.
  const copy = {
    ...project,
    id: createId(),
    name: `${example.name} — Copy`,
    created_date: nowISO(),
    updated_date: nowISO(),
  };
  // Deep-clone content so the copy shares no references with the master build.
  copy.content = JSON.parse(JSON.stringify(project.content));
  await saveProject(copy);
  return copy;
}

export const editorRoute = {
  presentation: '/presentation-builder',
  poster: '/poster-maker',
  report: '/report-assignment',
};