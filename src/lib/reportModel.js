// Report & Assignment Maker — data model, content generation, and helpers.
import { createId, createProjectShell, nowISO } from './db';
import { rtlLanguages } from './translations';
import {
  pageSizes, defaultMargin, getTemplate, reportExamples, sectionText, PLACEHOLDER_IMG, fontStack,
} from './reportAssets';

export function isRtl(language) {
  return rtlLanguages.includes(language);
}

export function getPageSize(id) {
  return pageSizes[id] || pageSizes.a4;
}

export function sanitizeFileName(name) {
  return String(name || 'document')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'document';
}

export function defaultStudent() {
  return { name: '', id: '' };
}

export function defaultStudentInfo() {
  return {
    title: '',
    subtitle: '',
    subject: '',
    students: [defaultStudent()],
    university: '',
    college: '',
    department: '',
    stage: '',
    group: '',
    supervisor: '',
    academicYear: '',
    date: new Date().toISOString().slice(0, 10),
  };
}

export function defaultCover() {
  return {
    enabled: true,
    layout: 'classic',
    logo: '',
    logoSize: 110, // px on the rendered page
    primaryColor: '#1e3a8a',
    fontFamily: 'inter',
    show: {
      logo: true, university: true, department: true, title: true, subtitle: true,
      subject: false, student: true, supervisor: true, academicYear: true, date: true,
    },
  };
}

export function defaultHeader() {
  return { enabled: false, left: '', center: '', right: '' };
}
export function defaultFooter() {
  return { enabled: false, text: '' };
}
export function defaultPageNumber() {
  return { enabled: true, style: '1', position: 'center', hideOnCover: true, startAt: 1 };
}
export function defaultReferences() {
  return { style: 'apa', items: [] };
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Build the body HTML for a template: a TOC marker followed by academic sections.
export function buildTemplateContent(templateId) {
  const tpl = getTemplate(templateId);
  const parts = [];
  parts.push('<div class="rd-toc" data-toc="1"></div>');
  parts.push('<p><br></p>');
  for (const sec of tpl.sections) {
    const label = sectionText[sec] || sec;
    parts.push(`<h2 data-rd-id="sec-${sec}">${esc(label)}</h2>`);
    parts.push(`<p>Write about ${label.toLowerCase()} here.</p>`);
    parts.push('<p><br></p>');
  }
  return parts.join('');
}

// Build a references HTML block from reference items (for preview/export).
export function buildReferencesHtml(refs) {
  if (!refs || !refs.items || !refs.items.length) return '';
  const rows = refs.items.map((r, i) => {
    const parts = [];
    if (refs.style === 'ieee') {
      if (r.author) parts.push(esc(r.author) + ', ');
      if (r.title) parts.push(`"${esc(r.title)}," `);
      if (r.publisher) parts.push(esc(r.publisher) + ', ');
      if (r.year) parts.push(esc(r.year) + '.');
      if (r.link) parts.push(` [Online]. Available: ${esc(r.link)}`);
      return `<p data-rd-ref="${i}">[${i + 1}] ${parts.join('')}</p>`;
    }
    if (refs.style === 'simple') {
      if (r.author) parts.push(esc(r.author) + '. ');
      if (r.year) parts.push(`(${esc(r.year)}). `);
      if (r.title) parts.push(`${esc(r.title)}. `);
      if (r.publisher) parts.push(esc(r.publisher) + '.');
      if (r.link) parts.push(` ${esc(r.link)}`);
      return `<p data-rd-ref="${i}">${parts.join('')}</p>`;
    }
    // APA-like
    if (r.author) parts.push(esc(r.author) + '. ');
    if (r.year) parts.push(`(${esc(r.year)}). `);
    if (r.title) parts.push(`<i>${esc(r.title)}</i>. `);
    if (r.publisher) parts.push(esc(r.publisher) + '.');
    if (r.link) parts.push(` ${esc(r.link)}`);
    return `<p data-rd-ref="${i}">${parts.join('')}</p>`;
  });
  return rows.join('');
}

// Full content for an example document.
export function buildExampleContent(exampleId) {
  const ex = reportExamples.find((e) => e.id === exampleId);
  if (!ex) return buildTemplateContent('standard');
  if (ex.id === 'it-cybersecurity') return cyberSecurityExample();
  if (ex.id === 'academic-assignment') return assignmentExample();
  return researchExample();
}

function cyberSecurityExample() {
  const p = (t) => `<p>${esc(t)}</p>`;
  const h = (id, t) => `<h2 data-rd-id="sec-${id}">${esc(t)}</h2>`;
  const parts = [];
  parts.push('<div class="rd-toc" data-toc="1"></div>');
  parts.push(h('introduction', 'Introduction'));
  parts.push(p('Cyber security is the practice of protecting systems, networks, and programs from digital attacks. These attacks aim to access, change, or destroy sensitive information, extort money from users, or interrupt normal business processes.'));
  parts.push(p('In todays connected world, cyber security has become essential for individuals, organizations, and governments. This report introduces the most common cyber threats and the methods used to protect against them.'));
  parts.push(h('threats', 'Common Cyber Threats'));
  parts.push(p('There are several categories of cyber threats that target users and organizations every day:'));
  parts.push('<ul><li><b>Malware</b> — malicious software such as viruses, worms, and trojans.</li><li><b>Phishing</b> — fraudulent messages that trick users into revealing sensitive data.</li><li><b>Ransomware</b> — malware that encrypts files and demands payment to restore access.</li><li><b>Man-in-the-middle</b> — attackers intercept communication between two parties.</li></ul>');
  parts.push('<div class="rd-fig" style="text-align:center;" data-rd-fig="1"><img src="' + PLACEHOLDER_IMG + '" style="width:70%;border-radius:6px;" alt="Cyber threats diagram"><p class="rd-caption">Figure 1: Common cyber threat categories.</p></div>');
  parts.push(h('protection', 'Protection Methods'));
  parts.push(p('Effective protection combines technology, processes, and user awareness. The table below summarizes key protection methods:'));
  parts.push('<table style="border-collapse:collapse;width:100%;"><thead><tr style="background:#e2e8f0;"><th style="border:1px solid #cbd5e1;padding:8px;text-align:left;">Method</th><th style="border:1px solid #cbd5e1;padding:8px;text-align:left;">Description</th></tr></thead><tbody><tr><td style="border:1px solid #cbd5e1;padding:8px;">Strong passwords</td><td style="border:1px solid #cbd5e1;padding:8px;">Use long, unique passwords for each account.</td></tr><tr><td style="border:1px solid #cbd5e1;padding:8px;">Multi-factor authentication</td><td style="border:1px solid #cbd5e1;padding:8px;">Require a second verification step at login.</td></tr><tr><td style="border:1px solid #cbd5e1;padding:8px;">Software updates</td><td style="border:1px solid #cbd5e1;padding:8px;">Keep systems patched against known vulnerabilities.</td></tr><tr><td style="border:1px solid #cbd5e1;padding:8px;">Backups</td><td style="border:1px solid #cbd5e1;padding:8px;">Maintain offline copies of critical data.</td></tr></tbody></table>');
  parts.push('<p><br></p>');
  parts.push(h('conclusion', 'Conclusion'));
  parts.push(p('Cyber security is an ongoing process that requires attention from every user. By understanding common threats and applying basic protection methods, individuals and organizations can greatly reduce their risk of compromise.'));
  parts.push('<div class="rd-refs" data-rd-refs="1"></div>');
  return parts.join('');
}

function assignmentExample() {
  const p = (t) => `<p>${esc(t)}</p>`;
  const h = (id, t) => `<h2 data-rd-id="sec-${id}">${esc(t)}</h2>`;
  return [
    '<div class="rd-toc" data-toc="1"></div>',
    h('introduction', 'Introduction'),
    p('This assignment discusses the chosen topic and presents the main arguments supported by evidence.'),
    h('discussion', 'Main Discussion'),
    p('The discussion develops the key points, analyzes different perspectives, and connects them to the introduction.'),
    '<ul><li>First key point with supporting detail.</li><li>Second key point with an example.</li><li>Third key point and its implications.</li></ul>',
    h('conclusion', 'Conclusion'),
    p('The conclusion summarizes the findings and restates the main argument of the assignment.'),
    '<div class="rd-refs" data-rd-refs="1"></div>',
  ].join('');
}

function researchExample() {
  const p = (t) => `<p>${esc(t)}</p>`;
  const h = (id, t) => `<h2 data-rd-id="sec-${id}">${esc(t)}</h2>`;
  return [
    '<div class="rd-toc" data-toc="1"></div>',
    h('abstract', 'Abstract'),
    p('This research report presents the study objectives, methodology, main results, and conclusions in a concise summary.'),
    h('introduction', 'Introduction'),
    p('The introduction outlines the research problem, its significance, and the questions this study addresses.'),
    h('methodology', 'Methodology'),
    p('The methodology describes the approach, data collection, and analysis techniques used in the study.'),
    h('results', 'Results'),
    p('The results section presents the findings obtained from the applied methodology.'),
    h('discussion', 'Discussion'),
    p('The discussion interprets the results and compares them with previous work.'),
    h('conclusion', 'Conclusion'),
    p('The conclusion states the main outcomes and suggests directions for future research.'),
    '<div class="rd-refs" data-rd-refs="1"></div>',
  ].join('');
}

// Create a brand-new report project from wizard choices.
export function createReportProject(opts = {}) {
  const shell = createProjectShell('report', opts.title || 'Untitled Report');
  const templateId = opts.templateId || 'standard';
  const tpl = getTemplate(templateId);
  const language = opts.language || 'en';
  const html = opts.blank ? '<p><br></p>' : (opts.exampleId ? buildExampleContent(opts.exampleId) : buildTemplateContent(templateId));
  const info = { ...defaultStudentInfo(), ...(opts.studentInfo || {}), title: opts.title || '' };
  if (opts.subtitle) info.subtitle = opts.subtitle;
  shell.content = {
    category: opts.category || 'report',
    language,
    pageSize: 'a4',
    margin: { ...defaultMargin },
    template: templateId,
    fontFamily: tpl.fonts.body,
    fontSize: 12, // pt
    lineHeight: 1.5,
    paragraphSpacing: 8, // px
    studentInfo: info,
    cover: { ...defaultCover(), primaryColor: tpl.colors.primary, fontFamily: tpl.fonts.heading, layout: 'classic' },
    header: { ...defaultHeader() },
    footer: { ...defaultFooter() },
    pageNumber: { ...defaultPageNumber() },
    references: { ...defaultReferences(), items: opts.exampleId ? exampleReferences() : [] },
    html,
  };
  return shell;
}

function exampleReferences() {
  return [
    { author: 'Smith, J.', title: 'Introduction to Cyber Security', year: '2022', publisher: 'Academic Press', link: 'https://example.com/cybersecurity' },
    { author: 'Khan, R.', title: 'Modern Threat Detection Techniques', year: '2023', publisher: 'IEEE', link: 'https://example.com/threats' },
  ];
}

// Ensure a loaded content object has every expected field (migration-safe).
export function normalizeReportContent(content) {
  if (!content) content = {};
  const base = {
    category: 'report',
    language: 'en',
    pageSize: 'a4',
    margin: { ...defaultMargin },
    template: 'standard',
    fontFamily: 'inter',
    fontSize: 12,
    lineHeight: 1.5,
    paragraphSpacing: 8,
    studentInfo: defaultStudentInfo(),
    cover: defaultCover(),
    header: defaultHeader(),
    footer: defaultFooter(),
    pageNumber: defaultPageNumber(),
    references: defaultReferences(),
    html: '<p><br></p>',
  };
  const out = { ...base, ...content };
  out.margin = { ...base.margin, ...(content.margin || {}) };
  out.studentInfo = { ...base.studentInfo, ...(content.studentInfo || {}) };
  out.studentInfo.students = Array.isArray(out.studentInfo.students) && out.studentInfo.students.length
    ? out.studentInfo.students : [defaultStudent()];
  out.cover = { ...base.cover, ...(content.cover || {}), show: { ...base.cover.show, ...((content.cover || {}).show || {}) } };
  out.header = { ...base.header, ...(content.header || {}) };
  out.footer = { ...base.footer, ...(content.footer || {}) };
  out.pageNumber = { ...base.pageNumber, ...(content.pageNumber || {}) };
  out.references = { ...base.references, ...(content.references || {}), items: (content.references && content.references.items) || [] };
  if (typeof out.html !== 'string') out.html = '<p><br></p>';
  return out;
}

// Parse headings from an HTML string for outline / TOC.
export function headingsFromHtml(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, 'text/html');
  const els = doc.querySelectorAll('#r h1, #r h2, #r h3');
  const out = [];
  els.forEach((el, i) => {
    const text = (el.textContent || '').trim();
    if (!text) return;
    out.push({ id: el.getAttribute('data-rd-id') || `h-${i}`, level: Number(el.tagName.slice(1)), text });
  });
  return out;
}

// Build a Table of Contents HTML block from headings + a map of heading id -> page.
export function buildTocHtml(headings, pageMap = {}) {
  if (!headings.length) return '<p style="color:#94a3b8;">No headings found.</p>';
  const items = headings.map((h) => {
    const page = pageMap[h.id] || '';
    const indent = (h.level - 1) * 18;
    return `<div class="rd-toc-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #cbd5e1;"><span style="padding-left:${indent}px;">${esc(h.text)}</span><span>${page}</span></div>`;
  });
  return `<div class="rd-toc-block"><h2 data-rd-toc="1">Table of Contents</h2>${items.join('')}</div>`;
}

// Count words / characters from HTML.
export function countWords(html) {
  if (!html) return { words: 0, chars: 0 };
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const words = trimmed ? trimmed.split(' ').length : 0;
  return { words, chars: text.length };
}