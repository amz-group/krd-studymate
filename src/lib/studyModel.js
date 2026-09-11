// Study Assistant data model — local-first, stored via the existing IndexedDB project store.
import { createId, nowISO } from './db';

// Default content for a fresh study project.
export function defaultStudyContent() {
  return {
    sourceType: 'text',          // 'pdf' | 'paste' | 'text'
    file: null,                  // { name, size, type, pages } | null
    pages: [],                   // [{ index, text }] for PDF page boundaries
    text: '',                    // full extracted text (all sources)
    range: { mode: 'all', page: 0, from: 1, to: 1, text: '' },
    outLang: 'same',             // 'same' | 'en' | 'ku' | 'ar'
    summary: { type: 'standard', text: '', updatedAt: null, sourceLabel: '' },
    keyPoints: [],               // [{ id, text }]
    questions: [],               // [{ id, type, question, answer, learned, needsReview }]
    flashcards: [],              // [{ id, front, back, difficulty, studied }]
    quizHistory: [],             // [{ id, date, type, length, score, total, percentage }]
    notes: '',                   // html
    terms: [],                   // [{ id, term, explanation }]
    highlights: [],              // [{ id, page, text, color, note }]
    progress: { cardsStudied: 0, quizAttempts: 0, bestScore: 0, lastStudied: null, needsReview: 0 },
  };
}

export function createStudyProject({ name, sourceType, file, pages, text }) {
  const ts = nowISO();
  return {
    id: createId(),
    name: name || 'Untitled Study',
    type: 'study',
    content: {
      ...defaultStudyContent(),
      sourceType,
      file: file || null,
      pages: pages || [],
      text: text || '',
    },
    created_date: ts,
    updated_date: ts,
  };
}

// Normalize a loaded project so missing fields never crash the UI.
export function normalizeStudyProject(proj) {
  if (!proj || proj.type !== 'study') return proj;
  const base = defaultStudyContent();
  const c = proj.content || {};
  return {
    ...proj,
    content: {
      ...base,
      ...c,
      range: { ...base.range, ...(c.range || {}) },
      summary: { ...base.summary, ...(c.summary || {}) },
      progress: { ...base.progress, ...(c.progress || {}) },
      keyPoints: Array.isArray(c.keyPoints) ? c.keyPoints : [],
      questions: Array.isArray(c.questions) ? c.questions : [],
      flashcards: Array.isArray(c.flashcards) ? c.flashcards : [],
      quizHistory: Array.isArray(c.quizHistory) ? c.quizHistory : [],
      terms: Array.isArray(c.terms) ? c.terms : [],
      highlights: Array.isArray(c.highlights) ? c.highlights : [],
      pages: Array.isArray(c.pages) ? c.pages : [],
    },
  };
}

export function newId() {
  return createId();
}

export function countWords(text) {
  if (!text) return 0;
  const m = text.trim().match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

// Resolve the source text for the active study range.
export function getRangeText(content) {
  const { range, pages, text } = content;
  if (!range) return text || '';
  if (range.mode === 'page') {
    const p = pages[range.page];
    return p ? p.text : (text || '');
  }
  if (range.mode === 'pages') {
    const from = Math.max(1, range.from || 1);
    const to = Math.min(pages.length, range.to || pages.length);
    let out = '';
    for (let i = from - 1; i < to; i++) out += (pages[i]?.text || '') + '\n\n';
    return out || text || '';
  }
  if (range.mode === 'text') return range.text || text || '';
  return text || '';
}

// Human-readable label for the active range.
export function rangeLabel(content, t) {
  const { range, pages, file } = content;
  if (!range) return '';
  if (range.mode === 'all') return t('study.ws.rangeAll');
  if (range.mode === 'page') return t('study.doc.pageOf', { n: (range.page || 0) + 1, total: pages.length });
  if (range.mode === 'pages') return `${t('study.ws.rangePages')}: ${range.from}–${range.to}`;
  if (range.mode === 'text') return t('study.ws.rangeText');
  return '';
}