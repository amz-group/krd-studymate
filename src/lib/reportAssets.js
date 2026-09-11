// Static data for the Report & Assignment Maker: page sizes, fonts, templates,
// cover layouts, academic sections, and example documents.

export const pageSizes = {
  a4: { id: 'a4', label: 'A4', w: 210, h: 297, pxW: 794, pxH: 1123 },
  letter: { id: 'letter', label: 'Letter', w: 215.9, h: 279.4, pxW: 816, pxH: 1056 },
};
export const defaultMargin = { top: 25, right: 25, bottom: 25, left: 25 }; // mm

export const reportFonts = [
  { id: 'inter', label: 'Inter', stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'poppins', label: 'Poppins', stack: '"Poppins", sans-serif' },
  { id: 'roboto', label: 'Roboto', stack: '"Roboto", sans-serif' },
  { id: 'montserrat', label: 'Montserrat', stack: '"Montserrat", sans-serif' },
  { id: 'opensans', label: 'Open Sans', stack: '"Open Sans", sans-serif' },
  { id: 'naskh', label: 'Noto Naskh', stack: '"Noto Naskh Arabic", serif' },
  { id: 'vazirmatn', label: 'Vazirmatn', stack: '"Vazirmatn", sans-serif' },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, "Noto Naskh Arabic", serif' },
  { id: 'times', label: 'Times', stack: '"Times New Roman", Times, serif' },
];
export function fontStack(id) {
  return (reportFonts.find((f) => f.id === id) || reportFonts[0]).stack;
}

export const documentCategories = [
  { id: 'report', key: 'rep.type.report' },
  { id: 'assignment', key: 'rep.type.assignment' },
  { id: 'research', key: 'rep.type.research' },
  { id: 'project', key: 'rep.type.project' },
  { id: 'essay', key: 'rep.type.essay' },
  { id: 'custom', key: 'rep.type.custom' },
];

export const academicSections = [
  { id: 'abstract', key: 'rep.sec.abstract' },
  { id: 'introduction', key: 'rep.sec.introduction' },
  { id: 'objectives', key: 'rep.sec.objectives' },
  { id: 'literature', key: 'rep.sec.literature' },
  { id: 'methodology', key: 'rep.sec.methodology' },
  { id: 'results', key: 'rep.sec.results' },
  { id: 'discussion', key: 'rep.sec.discussion' },
  { id: 'conclusion', key: 'rep.sec.conclusion' },
  { id: 'recommendations', key: 'rep.sec.recommendations' },
  { id: 'references', key: 'rep.sec.references' },
  { id: 'appendix', key: 'rep.sec.appendix' },
];

// Section labels used inside generated document content (English fallback text).
export const sectionText = {
  abstract: 'Abstract',
  introduction: 'Introduction',
  objectives: 'Objectives',
  literature: 'Literature Review',
  methodology: 'Methodology',
  results: 'Results',
  discussion: 'Discussion',
  conclusion: 'Conclusion',
  recommendations: 'Recommendations',
  references: 'References',
  appendix: 'Appendix',
};

// A small offline placeholder image (SVG data URL) so examples work without network.
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">' +
    '<rect width="640" height="360" fill="#eef2f7"/>' +
    '<rect x="0" y="0" width="640" height="360" fill="none" stroke="#cbd5e1" stroke-width="2"/>' +
    '<circle cx="320" cy="150" r="46" fill="#94a3b8"/>' +
    '<rect x="220" y="220" width="200" height="20" rx="6" fill="#94a3b8"/>' +
    '<rect x="260" y="255" width="120" height="14" rx="6" fill="#cbd5e1"/>' +
    '<text x="320" y="330" font-family="Inter,sans-serif" font-size="16" fill="#64748b" text-anchor="middle">Image placeholder</text>' +
    '</svg>'
  );

export const coverLayouts = [
  { id: 'classic', key: 'rep.cover.layout.classic' },
  { id: 'modern', key: 'rep.cover.layout.modern' },
  { id: 'minimal', key: 'rep.cover.layout.minimal' },
  { id: 'formal', key: 'rep.cover.layout.formal' },
];

// 10 professional, editable templates. Each defines colors, fonts, and the
// academic sections to seed the document body with.
export const reportTemplates = [
  { id: 'standard', key: 'rep.template.standard', category: 'academic',
    colors: { primary: '#1e3a8a', accent: '#2563eb', text: '#1e293b', bg: '#ffffff' },
    fonts: { heading: 'inter', body: 'inter' },
    sections: ['introduction', 'objectives', 'methodology', 'results', 'discussion', 'conclusion', 'references'] },
  { id: 'assignment', key: 'rep.template.assignment', category: 'academic',
    colors: { primary: '#0f766e', accent: '#14b8a6', text: '#134e4a', bg: '#ffffff' },
    fonts: { heading: 'poppins', body: 'opensans' },
    sections: ['introduction', 'discussion', 'conclusion', 'references'] },
  { id: 'research', key: 'rep.template.research', category: 'academic',
    colors: { primary: '#7c2d12', accent: '#ea580c', text: '#1c1917', bg: '#ffffff' },
    fonts: { heading: 'georgia', body: 'times' },
    sections: ['abstract', 'introduction', 'literature', 'methodology', 'results', 'discussion', 'conclusion', 'references'] },
  { id: 'itproject', key: 'rep.template.itproject', category: 'technology',
    colors: { primary: '#0c4a6e', accent: '#0ea5e9', text: '#0f172a', bg: '#ffffff' },
    fonts: { heading: 'montserrat', body: 'roboto' },
    sections: ['introduction', 'objectives', 'methodology', 'results', 'discussion', 'conclusion', 'references'] },
  { id: 'minimal', key: 'rep.template.minimal', category: 'general',
    colors: { primary: '#334155', accent: '#64748b', text: '#1e293b', bg: '#ffffff' },
    fonts: { heading: 'inter', body: 'inter' },
    sections: ['introduction', 'conclusion'] },
  { id: 'problue', key: 'rep.template.problue', category: 'general',
    colors: { primary: '#1d4ed8', accent: '#3b82f6', text: '#0f172a', bg: '#ffffff' },
    fonts: { heading: 'montserrat', body: 'inter' },
    sections: ['introduction', 'objectives', 'methodology', 'results', 'conclusion', 'references'] },
  { id: 'classic', key: 'rep.template.classic', category: 'academic',
    colors: { primary: '#3730a3', accent: '#6366f1', text: '#1e1b4b', bg: '#ffffff' },
    fonts: { heading: 'georgia', body: 'times' },
    sections: ['introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'] },
  { id: 'scientific', key: 'rep.template.scientific', category: 'academic',
    colors: { primary: '#14532d', accent: '#16a34a', text: '#052e16', bg: '#ffffff' },
    fonts: { heading: 'inter', body: 'times' },
    sections: ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'] },
  { id: 'business', key: 'rep.template.business', category: 'general',
    colors: { primary: '#713f12', accent: '#ca8a04', text: '#1c1917', bg: '#ffffff' },
    fonts: { heading: 'poppins', body: 'inter' },
    sections: ['introduction', 'results', 'recommendations', 'conclusion', 'references'] },
  { id: 'cleanmodern', key: 'rep.template.cleanmodern', category: 'general',
    colors: { primary: '#0f172a', accent: '#6366f1', text: '#0f172a', bg: '#ffffff' },
    fonts: { heading: 'inter', body: 'inter' },
    sections: ['introduction', 'methodology', 'results', 'conclusion', 'references'] },
];

export function getTemplate(id) {
  return reportTemplates.find((t) => t.id === id) || reportTemplates[0];
}

// Example documents — full editable starting points.
export const reportExamples = [
  {
    id: 'it-cybersecurity', key: 'rep.example.it', category: 'project',
    template: 'itproject',
    title: 'Cyber Security Report',
    subtitle: 'An Introduction to Cyber Security Threats and Protection',
    sections: ['introduction', 'threats', 'protection', 'conclusion', 'references'],
  },
  {
    id: 'academic-assignment', key: 'rep.example.assignment', category: 'assignment',
    template: 'assignment',
    title: 'Academic Assignment',
    subtitle: '',
    sections: ['introduction', 'discussion', 'conclusion', 'references'],
  },
  {
    id: 'research-report', key: 'rep.example.research', category: 'research',
    template: 'research',
    title: 'Research Report',
    subtitle: '',
    sections: ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'],
  },
];