// StudyGenerator — local-first study material engine.
// No external AI: uses sentence scoring, keyword frequency, heading/definition
// detection, term extraction and question templates. Structured as a service
// layer so a real AI provider can be swapped in later without touching the UI.

const STOP = new Set([
  // English
  'the','a','an','and','or','but','if','then','else','for','of','to','in','on','at','by','with','from','as','is','are','was','were','be','been','being','this','that','these','those','it','its','they','them','their','there','here','which','who','whom','whose','what','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','not','only','own','same','so','than','too','very','can','will','just','should','now','also','may','might','must','shall','do','does','did','done','have','has','had','having','about','into','through','during','before','after','above','below','up','down','out','off','over','under','again','further','once','because','while','whereas','however','therefore','thus','hence','between','within','without','upon','per','via','etc','ie','eg',
  // Arabic
  'في','من','على','إلى','الى','عن','مع','هذا','هذه','ذلك','تلك','هو','هي','هم','هن','كان','كانت','يكون','تكون','قد','لقد','كل','بعض','غير','بين','أو','او','و','ثم','لكن','إذا','اذا','أن','ان','ما','لا','لم','لن','كما','حيث','بحيث','أي','اي','كذلك','أيضا','ايضا','عند','عندما','بعد','قبل','حول','نحو','لذلك','لذا','بسبب','حتى','أكثر','أقل','مثل','دون','غير','ضمن','خلال','مما','لما','كي','لكي','سوف','س','قد','لقد',
  // Kurdish (Sorani) common particles
  'لە','لەگەڵ','بۆ','لەسەر','لەناو','لەدەر','وەک','کە','ئەوە','ئەمە','ئەوان','ئەمان','ئەگەر','بەڵام','یان','هەر','هەبوو','هەیە','بوو','دەبێت','دەکرێت','دەبێ','بۆیە','لەبەر','بەهۆی','هەروەها','بەدەم','بەپێی','چونکە','کاتێک','پاش','پێش','نزیک','دەوروبەر','ناو','دەرەوە','سەرەوە','خوارەوە','زۆر','کەم','هیچ','تەنیا','هەموو','چەند','بەڵگە','بەپێی',
]);

function isLetter(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  // Latin / digits
  if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57)) return true;
  // Arabic / Kurdish blocks + extensions
  if (c >= 0x0600 && c <= 0x06FF) return true;
  if (c >= 0x0750 && c <= 0x077F) return true;
  if (c >= 0xFB50 && c <= 0xFDFF) return true;
  if (c >= 0xFE70 && c <= 0xFEFF) return true;
  return false;
}

export function splitSentences(text) {
  if (!text) return [];
  // Normalize whitespace, split on sentence boundaries (Latin + Arabic/Kurdish).
  const parts = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?؟…])\s+|\n{2,}/u)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts;
}

export function tokenize(text) {
  if (!text) return [];
  const out = [];
  let cur = '';
  for (const ch of text) {
    if (isLetter(ch)) cur += ch;
    else {
      if (cur) { out.push(cur.toLowerCase()); cur = ''; }
    }
  }
  if (cur) out.push(cur.toLowerCase());
  return out;
}

function wordFrequencies(text) {
  const freq = new Map();
  for (const w of tokenize(text)) {
    if (w.length < 3 || STOP.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return freq;
}

function scoreSentences(sentences, freq) {
  return sentences.map((s, i) => {
    const words = tokenize(s).filter((w) => w.length >= 3 && !STOP.has(w));
    if (!words.length) return { i, s, score: 0 };
    let sum = 0;
    for (const w of words) sum += freq.get(w) || 0;
    const avg = sum / Math.sqrt(words.length || 1);
    // Position bonus: first and last sentences often carry key ideas.
    const pos = (i === 0 || i === sentences.length - 1) ? 1.15 : 1;
    // Length penalty for very short or very long sentences.
    let lenF = 1;
    if (words.length < 4) lenF = 0.7;
    if (words.length > 40) lenF = 0.85;
    return { i, s, score: avg * pos * lenF };
  });
}

function topSentences(sentences, n) {
  const freq = wordFrequencies(sentences.join(' '));
  const scored = scoreSentences(sentences, freq);
  const ordered = [...scored].sort((a, b) => b.score - a.score).slice(0, n);
  // Restore original order for readability.
  return ordered.sort((a, b) => a.i - b.i).map((o) => o.s);
}

function detectHeadings(text) {
  // Lines that are short, not ending with punctuation, often title-cased or numbered.
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.filter((l) => {
    const words = l.split(/\s+/);
    return words.length >= 1 && words.length <= 8 && !/[.!?؟]$/.test(l) && l.length < 60;
  });
}

// ---------- Public API ----------

export const studyGenerator = {
  generateSummary(text, type = 'standard') {
    if (!text || !text.trim()) return '';
    const sentences = splitSentences(text);
    const n = type === 'short' ? Math.min(3, sentences.length)
      : type === 'detailed' ? Math.min(18, sentences.length)
      : Math.min(7, sentences.length);
    let picked = topSentences(sentences, Math.max(1, n));
    if (type === 'detailed' && picked.length > 6) {
      // Group into rough sections using detected headings as anchors when available.
      const heads = detectHeadings(text).slice(0, 4);
      const out = [];
      if (heads.length) {
        for (const h of heads) out.push(`■ ${h}`);
        out.push('');
      }
      out.push(...picked);
      return out.join('\n\n');
    }
    return picked.join(' ');
  },

  generateKeyPoints(text) {
    if (!text || !text.trim()) return [];
    const sentences = splitSentences(text);
    const picked = topSentences(sentences, Math.min(10, sentences.length));
    return picked.map((s) => ({ id: rid(), text: s }));
  },

  generateQuestions(text, types = ['short', 'definition', 'concept']) {
    if (!text || !text.trim()) return [];
    const sentences = splitSentences(text);
    const key = topSentences(sentences, Math.min(12, sentences.length));
    const out = [];
    const defRe = /([A-Z][\w\u0600-\u06FF-]{2,}(?:\s[\w\u0600-\u06FF-]+){0,3})\s+(?:is|are|means|refers to|defined as|refers|denotes|represents|يُعرف|هو|هي|ويعني|يعني)\s+(.{8,})/u;

    for (const s of key) {
      const m = s.match(defRe);
      if (m && types.includes('definition')) {
        out.push({
          id: rid(),
          type: 'definition',
          question: `What is ${m[1].trim()}?`,
          answer: s,
          learned: false,
          needsReview: false,
        });
        continue;
      }
      if (types.includes('concept')) {
        const topic = firstKeywords(s, 3);
        out.push({
          id: rid(),
          type: 'concept',
          question: `Explain the concept: ${topic}`,
          answer: s,
          learned: false,
          needsReview: false,
        });
        continue;
      }
      if (types.includes('short')) {
        out.push({
          id: rid(),
          type: 'short',
          question: `According to the material: ${truncate(s, 80)}?`,
          answer: s,
          learned: false,
          needsReview: false,
        });
      }
    }
    // Ensure short-answer coverage if requested
    if (types.includes('review') && key.length) {
      const topic = firstKeywords(key[0], 3);
      out.push({
        id: rid(),
        type: 'review',
        question: `Review question: summarize the key ideas about ${topic}.`,
        answer: key.slice(0, 3).join(' '),
        learned: false,
        needsReview: false,
      });
    }
    return dedupeQuestions(out).slice(0, 15);
  },

  generateFlashcards(text) {
    if (!text || !text.trim()) return [];
    const sentences = splitSentences(text);
    const key = topSentences(sentences, Math.min(12, sentences.length));
    const out = [];
    const defRe = /([A-Z][\w\u0600-\u06FF-]{2,}(?:\s[\w\u0600-\u06FF-]+){0,2})\s+(?:is|are|means|refers to|defined as|represents|هو|هي|يعني)\s+(.{8,})/u;
    for (const s of key) {
      const m = s.match(defRe);
      if (m) {
        out.push({ id: rid(), front: m[1].trim(), back: s, difficulty: null, studied: false });
      } else {
        const topic = firstKeywords(s, 3);
        out.push({ id: rid(), front: `What does the material say about ${topic}?`, back: s, difficulty: null, studied: false });
      }
    }
    return out.slice(0, 12);
  },

  generateQuiz(text, type = 'mc', length = 10) {
    if (!text || !text.trim()) return [];
    const sentences = splitSentences(text).filter((s) => s.split(/\s+/).length >= 5);
    const key = topSentences(sentences, Math.min(30, sentences.length));
    const terms = extractTermsList(text);
    const n = Math.min(length, key.length || terms.length || 0);
    if (!n) return [];

    const items = [];
    for (let i = 0; i < n; i++) {
      const s = key[i % key.length];
      if (type === 'mc') items.push(buildMC(s, terms, i));
      else if (type === 'tf') items.push(buildTF(s, terms, i));
      else if (type === 'sa') items.push(buildSA(s, i));
      else items.push([buildMC, buildTF, buildSA][i % 3](s, terms, i));
    }
    return items.filter(Boolean);
  },

  extractTerms(text) {
    return extractTermsList(text).map((t) => ({
      id: rid(),
      term: t.term,
      explanation: t.explanation || '',
    }));
  },

  explainSimply(text, level = 'student') {
    if (!text || !text.trim()) return '';
    const sentences = splitSentences(text);
    if (!sentences.length) return '';
    // Local simplification: pick the clearest shortest sentences and reorder.
    const scored = sentences.map((s) => {
      const words = tokenize(s);
      const complexity = words.filter((w) => w.length > 8).length;
      return { s, len: words.length, complexity };
    });
    scored.sort((a, b) => (a.complexity - b.complexity) || (a.len - b.len));
    let count = level === 'verySimple' ? 2 : level === 'detailed' ? 6 : 3;
    const picked = scored.slice(0, Math.min(count, scored.length)).map((x) => x.s);
    // Reorder picked by original appearance
    const order = picked.map((s) => sentences.indexOf(s)).sort((a, b) => a - b).map((i) => sentences[i]);
    if (level === 'detailed') return order.join(' ');
    return order.join(' ');
  },
};

// ---------- helpers ----------

function rid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function firstKeywords(sentence, n) {
  const words = tokenize(sentence).filter((w) => w.length >= 4 && !STOP.has(w));
  return [...new Set(words)].slice(0, n).join(', ') || words.slice(0, n).join(', ');
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n).trim() + '…' : s;
}

function dedupeQuestions(list) {
  const seen = new Set();
  return list.filter((q) => {
    if (seen.has(q.question)) return false;
    seen.add(q.question);
    return true;
  });
}

function extractTermsList(text) {
  if (!text) return [];
  const freq = wordFrequencies(text);
  // Candidate terms: frequent capitalized words, or frequent long words.
  const capTerms = new Map();
  const wordRe = /([A-Z][\w\u0600-\u06FF-]{2,}(?:\s[\w\u0600-\u06FF-]+){0,1})/gu;
  let m;
  while ((m = wordRe.exec(text)) !== null) {
    const term = m[1].trim();
    if (term.length < 3) continue;
    capTerms.set(term, (capTerms.get(term) || 0) + 1);
  }
  let candidates = [...capTerms.entries()]
    .filter(([t, c]) => c >= 1 && !STOP.has(t.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => ({ term: t, explanation: findDefinition(text, t) }));

  // Supplement with frequent important words if too few capitalized terms.
  if (candidates.length < 6) {
    const extra = [...freq.entries()]
      .filter(([w, c]) => c >= 2 && w.length >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => ({ term: w, explanation: findDefinition(text, w) }));
    candidates = [...candidates, ...extra];
  }
  // Dedupe by term (case-insensitive)
  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    const k = c.term.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out.slice(0, 14);
}

function findDefinition(text, term) {
  const re = new RegExp(`${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:is|are|means|refers to|defined as|represents|denotes|هو|هي|يعني|ويعني)\\s+([^.!؟\\n]{8,120})`, 'iu');
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function buildMC(sentence, terms, idx) {
  // Use a definition-style sentence; blank the key term if detectable, else ask about the sentence.
  const defRe = /([A-Z][\w\u0600-\u06FF-]{2,}(?:\s[\w\u0600-\u06FF-]+){0,2})\s+(?:is|are|means|refers to|defined as|represents|هو|هي|يعني)\s+(.{8,})/u;
  const m = sentence.match(defRe);
  if (m) {
    const answer = m[1].trim();
    const stem = sentence.replace(answer, '_____');
    const distractors = terms
      .map((t) => t.term)
      .filter((t) => t.toLowerCase() !== answer.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([answer, ...distractors]);
    return { id: rid(), type: 'mc', question: `Fill the blank: ${stem}`, options, answer };
  }
  // Fallback: ask which statement is correct
  const distractors = terms.slice(0, 3).map((t) => `Related to: ${t.term}`);
  if (distractors.length < 3) return null;
  const options = shuffle([sentence, ...distractors]);
  return { id: rid(), type: 'mc', question: 'Which statement matches the material?', options, answer: sentence };
}

function buildTF(sentence, terms, idx) {
  // Alternate true/false; ~60% true, ~40% false (swap a term).
  const makeFalse = idx % 3 === 2 && terms.length > 2;
  if (makeFalse) {
    const other = terms[idx % terms.length].term;
    const defRe = /([A-Z][\w\u0600-\u06FF-]{2,}(?:\s[\w\u0600-\u06FF-]+){0,2})\s+(?:is|are|means|refers to|defined as|represents|هو|هي|يعني)\s+/u;
    const m = sentence.match(defRe);
    if (m) {
      const wrong = sentence.replace(m[1], other);
      return { id: rid(), type: 'tf', question: wrong, answer: false };
    }
  }
  return { id: rid(), type: 'tf', question: sentence, answer: true };
}

function buildSA(sentence, idx) {
  const topic = firstKeywords(sentence, 3);
  return { id: rid(), type: 'sa', question: `Explain in your own words: ${topic}`, answer: sentence };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default studyGenerator;