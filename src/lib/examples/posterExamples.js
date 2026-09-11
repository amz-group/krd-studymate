// Master poster examples (read-only templates).
// Each spec builds a full designed poster { background, elements } at a given size.
// Helpers reimplement posterModel's internal fractional spec -> element mapping,
// but with real content per example instead of placeholder text.

import { newElement } from '@/lib/presentationModel';
import { defaultTextContent } from '@/lib/presentationAssets';
import { getPosterTemplate, getPosterSize } from '@/lib/posterModel';

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

// ---- Layout archetypes driven by real content ----
function techColumns(p, c) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.16, { fill: accent, opacity: 0.18 }),
    txt('heading', 0.04, 0.04, 0.92, 0.07, c.title, { font: fonts.heading, color: H, sizeFrac: 0.06, bold: true }),
    txt('subheading', 0.04, 0.115, 0.92, 0.03, c.subtitle, { font: fonts.body, color: sub, sizeFrac: 0.024 }),
    txt('body', 0.04, 0.155, 0.92, 0.03, c.authors, { font: fonts.body, color: sub, sizeFrac: 0.02 }),
  ];
  const cols = c.sections.slice(0, 3);
  cols.forEach((sec, i) => {
    const fx = i === 0 ? 0.04 : i === 1 ? 0.36 : 0.68;
    if (sec.icon) out.push(icn(fx + 0.08, 0.205, 0.12, 0.10, sec.icon, { color: H, sizeFrac: 0.05 }));
    out.push(txt('heading', fx, 0.315, 0.28, 0.032, sec.title, { font: fonts.heading, color: H, sizeFrac: 0.028, bold: true }));
    out.push(txt('body', fx, 0.35, 0.28, 0.20, sec.bullets ? sec.bullets.join('\n') : sec.body, { font: fonts.body, color: body, sizeFrac: 0.02, listType: sec.bullets ? 'bullet' : 'none' }));
  });
  out.push(img(0.04, 0.57, 0.44, 0.20, { radius: 10 }));
  const disc = c.sections[3] || { title: 'Discussion', body: c.conclusion };
  out.push(txt('heading', 0.52, 0.57, 0.44, 0.032, disc.title, { font: fonts.heading, color: H, sizeFrac: 0.028, bold: true }));
  out.push(txt('body', 0.52, 0.605, 0.44, 0.16, disc.bullets ? disc.bullets.join('\n') : disc.body, { font: fonts.body, color: body, sizeFrac: 0.02, listType: disc.bullets ? 'bullet' : 'none' }));
  out.push(txt('heading', 0.04, 0.80, 0.92, 0.035, 'Conclusion', { font: fonts.heading, color: H, sizeFrac: 0.032, bold: true }));
  out.push(txt('body', 0.04, 0.835, 0.92, 0.07, c.conclusion, { font: fonts.body, color: body, sizeFrac: 0.02 }));
  out.push(txt('caption', 0.04, 0.915, 0.92, 0.04, 'References', { font: fonts.heading, color: sub, sizeFrac: 0.022, bold: true }));
  out.push(txt('caption', 0.04, 0.95, 0.92, 0.035, c.refs, { font: fonts.body, color: sub, sizeFrac: 0.018 }));
  return out;
}

function researchGrid(p, c) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.12, { fill: H, opacity: 1 }),
    txt('heading', 0.04, 0.035, 0.74, 0.06, c.title, { font: fonts.heading, color: '#ffffff', sizeFrac: 0.046, bold: true }),
    txt('subheading', 0.04, 0.095, 0.74, 0.025, c.subtitle, { font: fonts.body, color: '#e2e8f0', sizeFrac: 0.022 }),
    img(0.80, 0.03, 0.16, 0.08, { radius: 8 }),
    txt('heading', 0.04, 0.14, 0.92, 0.032, 'Abstract', { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
    txt('body', 0.04, 0.175, 0.92, 0.09, c.intro, { font: fonts.body, color: body, sizeFrac: 0.02 }),
  ];
  const grid = c.sections.slice(0, 6);
  const positions = [
    [0.04, 0.29], [0.355, 0.29], [0.67, 0.29],
    [0.04, 0.55], [0.355, 0.55], [0.67, 0.55],
  ];
  grid.forEach((sec, i) => {
    const [fx, fy] = positions[i];
    out.push(shp(fx, fy, 0.29, 0.22, { fill: accent, opacity: 0.08, radius: 10 }));
    out.push(txt('heading', fx + 0.015, fy + 0.012, 0.26, 0.03, sec.title, { font: fonts.heading, color: H, sizeFrac: 0.026, bold: true }));
    out.push(txt('body', fx + 0.015, fy + 0.05, 0.26, 0.15, sec.bullets ? sec.bullets.join('\n') : sec.body, { font: fonts.body, color: body, sizeFrac: 0.018, listType: sec.bullets ? 'bullet' : 'none' }));
  });
  out.push(img(0.04, 0.80, 0.45, 0.16, { radius: 10 }));
  out.push(txt('heading', 0.52, 0.80, 0.44, 0.03, 'Conclusion', { font: fonts.heading, color: H, sizeFrac: 0.026, bold: true }));
  out.push(txt('body', 0.52, 0.835, 0.44, 0.12, c.conclusion, { font: fonts.body, color: sub, sizeFrac: 0.018 }));
  return out;
}

function headerTwoCol(p, c) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text, accent = colors.accent;
  const out = [
    shp(0, 0, 1, 0.18, { fill: H, opacity: 1 }),
    txt('heading', 0.04, 0.045, 0.7, 0.07, c.title, { font: fonts.heading, color: '#ffffff', sizeFrac: 0.058, bold: true }),
    txt('subheading', 0.04, 0.12, 0.7, 0.03, c.subtitle, { font: fonts.body, color: '#e2e8f0', sizeFrac: 0.024 }),
    img(0.80, 0.04, 0.16, 0.10, { radius: 8 }),
    txt('body', 0.04, 0.20, 0.92, 0.03, c.authors, { font: fonts.body, color: sub, sizeFrac: 0.022 }),
    txt('heading', 0.04, 0.25, 0.92, 0.035, 'Introduction', { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }),
    txt('body', 0.04, 0.295, 0.92, 0.09, c.intro, { font: fonts.body, color: body, sizeFrac: 0.022 }),
  ];
  const left = c.sections[0] || { title: 'Objectives', body: c.conclusion };
  const right = c.sections[1] || { title: 'Methodology', body: c.conclusion };
  out.push(txt('heading', 0.04, 0.40, 0.44, 0.032, left.title, { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }));
  out.push(txt('body', 0.04, 0.435, 0.44, 0.16, left.bullets ? left.bullets.join('\n') : left.body, { font: fonts.body, color: body, sizeFrac: 0.02, listType: left.bullets ? 'bullet' : 'none' }));
  out.push(txt('heading', 0.52, 0.40, 0.44, 0.032, right.title, { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }));
  out.push(txt('body', 0.52, 0.435, 0.44, 0.16, right.bullets ? right.bullets.join('\n') : right.body, { font: fonts.body, color: body, sizeFrac: 0.02, listType: right.bullets ? 'bullet' : 'none' }));
  out.push(img(0.04, 0.62, 0.44, 0.20, { radius: 10 }));
  const res = c.sections[2] || { title: 'Results', body: c.conclusion };
  out.push(txt('heading', 0.52, 0.62, 0.44, 0.032, res.title, { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }));
  out.push(txt('body', 0.52, 0.655, 0.44, 0.16, res.bullets ? res.bullets.join('\n') : res.body, { font: fonts.body, color: body, sizeFrac: 0.02, listType: res.bullets ? 'bullet' : 'none' }));
  out.push(txt('heading', 0.04, 0.84, 0.92, 0.035, 'Conclusion', { font: fonts.heading, color: H, sizeFrac: 0.034, bold: true }));
  out.push(txt('body', 0.04, 0.875, 0.92, 0.07, c.conclusion, { font: fonts.body, color: body, sizeFrac: 0.022 }));
  out.push(txt('caption', 0.04, 0.945, 0.92, 0.035, 'References', { font: fonts.body, color: sub, sizeFrac: 0.02 }));
  return out;
}

function minimalPoster(p, c) {
  const { fonts, colors } = p;
  const H = colors.primary, sub = colors.subtext, body = colors.text;
  const out = [
    txt('heading', 0.08, 0.08, 0.84, 0.10, c.title, { font: fonts.heading, color: H, sizeFrac: 0.06, bold: true }),
    shp(0.08, 0.19, 0.10, 0.006, { fill: H, opacity: 1 }),
    txt('subheading', 0.08, 0.205, 0.84, 0.03, c.subtitle, { font: fonts.body, color: sub, sizeFrac: 0.024 }),
    txt('heading', 0.08, 0.27, 0.84, 0.035, 'Introduction', { font: fonts.heading, color: H, sizeFrac: 0.03, bold: true }),
    txt('body', 0.08, 0.305, 0.84, 0.12, c.intro, { font: fonts.body, color: body, sizeFrac: 0.02 }),
  ];
  c.sections.slice(0, 3).forEach((sec, i) => {
    const fy = 0.45 + i * 0.16;
    out.push(txt('heading', 0.08, fy, 0.84, 0.03, sec.title, { font: fonts.heading, color: H, sizeFrac: 0.026, bold: true }));
    out.push(txt('body', 0.08, fy + 0.035, 0.84, 0.11, sec.bullets ? sec.bullets.join('\n') : sec.body, { font: fonts.body, color: body, sizeFrac: 0.018, listType: sec.bullets ? 'bullet' : 'none' }));
  });
  out.push(txt('caption', 0.08, 0.94, 0.84, 0.03, c.refs, { font: fonts.body, color: sub, sizeFrac: 0.016 }));
  return out;
}

const archetypes = {
  'tech-columns': techColumns,
  'research-grid': researchGrid,
  'header-twocol': headerTwoCol,
  minimal: minimalPoster,
};

export function buildDesignedPoster(example) {
  const template = getPosterTemplate(example.templateId);
  const size = getPosterSize(example.sizeId);
  const builder = archetypes[example.archetype] || techColumns;
  const specs = builder(template, example.content);
  return { size, background: { ...template.background }, elements: realize(specs, size), templateId: example.templateId };
}

export const posterExamples = [
  {
    id: 'ex-post-cyber-security', name: 'Cyber Security Awareness', category: 'Information Technology', style: 'Dark', language: 'en',
    description: 'Dark blue/cyan awareness poster with threats, warning signs, and protection tips.',
    templateId: 'cyber-security', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Cyber Security Awareness', subtitle: 'Protecting Systems, Networks & Data', authors: 'University of KRD · Department of IT · 2026',
      intro: 'Cyber security is the practice of protecting systems, networks, and data from digital attacks.',
      sections: [
        { title: 'Objectives', icon: 'ShieldCheck', bullets: ['Understand threats', 'Learn protection', 'Promote safe habits'] },
        { title: 'Main Threats', icon: 'Bug', bullets: ['Malware & viruses', 'Phishing attacks', 'Ransomware', 'Man-in-the-middle'] },
        { title: 'Protection', icon: 'Lock', bullets: ['Strong passwords', 'Two-factor auth', 'Regular updates', 'Security training'] },
        { title: 'Warning Signs', bullets: ['Unexpected emails', 'Slow devices', 'Unknown accounts', 'Pop-up alerts'] },
      ],
      conclusion: 'Good cyber security habits keep your data, identity, and systems safe in a connected world.',
      refs: '1. NIST Cybersecurity Framework\n2. ISO/IEC 27001\n3. CIS Controls v8',
    },
  },
  {
    id: 'ex-post-ai', name: 'Artificial Intelligence', category: 'Computer Science', style: 'Technology', language: 'en',
    description: 'Modern futuristic poster about AI applications, advantages, and challenges.',
    templateId: 'artificial-intelligence', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Artificial Intelligence', subtitle: 'Machines that Learn and Reason', authors: 'Department of Computer Science',
      intro: 'AI is the science of making machines that can learn, reason, and act intelligently.',
      sections: [
        { title: 'Overview', icon: 'Cpu', body: 'AI systems perceive data, reason about it, and act to achieve goals.' },
        { title: 'Applications', icon: 'Network', bullets: ['Healthcare', 'Education', 'Finance', 'Transportation'] },
        { title: 'Advantages', icon: 'TrendingUp', bullets: ['Automation', 'Accuracy', 'Speed', 'Insights'] },
        { title: 'Challenges', bullets: ['Bias', 'Privacy', 'Job impact', 'Safety'] },
      ],
      conclusion: 'AI is shaping the future of every industry and transforming how we work.',
      refs: '1. Russell & Norvig, AI: A Modern Approach\n2. MIT AI Essentials',
    },
  },
  {
    id: 'ex-post-programming', name: 'Programming Seminar', category: 'Computer Science', style: 'Technology', language: 'en',
    description: 'Developer-style poster for a programming seminar.',
    templateId: 'programming', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Programming Seminar', subtitle: 'From Logic to Software', authors: 'Coding Club · 2026',
      intro: 'A seminar introducing the fundamentals of programming and software development.',
      sections: [
        { title: 'Topics', icon: 'Code', bullets: ['Variables', 'Conditions', 'Loops', 'Functions'] },
        { title: 'Languages', icon: 'Code', bullets: ['Python', 'JavaScript', 'Java', 'C++'] },
        { title: 'Practices', icon: 'Cog', bullets: ['Clean code', 'Testing', 'Version control', 'Debugging'] },
        { title: 'Projects', bullets: ['Web apps', 'Games', 'Automation', 'Data tools'] },
      ],
      conclusion: 'Programming turns ideas into working software that solves real problems.',
      refs: '1. Structure and Interpretation of Computer Programs\n2. Clean Code, R. Martin',
    },
  },
  {
    id: 'ex-post-research', name: 'Research Poster', category: 'Research', style: 'Academic', language: 'en',
    description: 'Academic research poster with abstract, objective, methodology, results, and references.',
    templateId: 'research-poster', sizeId: 'a3-portrait', archetype: 'research-grid',
    content: {
      title: 'Research Study', subtitle: 'An Academic Investigation', authors: 'Authors · University · Department',
      intro: 'A concise summary of the research problem, methods, and key findings.',
      sections: [
        { title: 'Objective', body: 'Define the research goal and questions.' },
        { title: 'Methodology', body: 'Study design, data collection, and analysis.' },
        { title: 'Results', body: 'Key quantitative and qualitative findings.' },
        { title: 'Discussion', body: 'Interpretation of results and implications.' },
        { title: 'Limitations', body: 'Constraints and scope of the study.' },
        { title: 'Future Work', body: 'Directions for further research.' },
      ],
      conclusion: 'Summary of insights and recommendations for future work.',
      refs: '1. Author, Title, Journal, Year',
    },
  },
  {
    id: 'ex-post-scientific', name: 'Scientific Research Poster', category: 'Research', style: 'Academic', language: 'en',
    description: 'Three-column academic layout for a scientific study.',
    templateId: 'scientific-poster', sizeId: 'a3-landscape', archetype: 'research-grid',
    content: {
      title: 'Scientific Study', subtitle: 'Three-Column Academic Layout', authors: 'Faculty of Science',
      intro: 'A structured presentation of a scientific experiment and its outcomes.',
      sections: [
        { title: 'Hypothesis', body: 'The proposed explanation being tested.' },
        { title: 'Method', body: 'Experimental setup and measurements.' },
        { title: 'Data', body: 'Collected observations and samples.' },
        { title: 'Analysis', body: 'Statistical treatment of results.' },
        { title: 'Findings', body: 'Significant outcomes of the study.' },
        { title: 'Impact', body: 'Contribution to the field.' },
      ],
      conclusion: 'The study confirms the hypothesis and opens new questions.',
      refs: '1. Journal of Science, 2023',
    },
  },
  {
    id: 'ex-post-university-seminar', name: 'University Seminar Poster', category: 'Education', style: 'Academic', language: 'en',
    description: 'Professional university seminar announcement poster.',
    templateId: 'university-classic', sizeId: 'a4-portrait', archetype: 'header-twocol',
    content: {
      title: 'University Seminar', subtitle: 'An Academic Presentation', authors: 'University · Department · 2026',
      intro: 'Join us for an academic seminar on emerging topics in the field.',
      sections: [
        { title: 'Topic', bullets: ['Background', 'Core concepts', 'Key arguments'] },
        { title: 'Schedule', bullets: ['Opening', 'Lecture', 'Q&A'] },
        { title: 'Details', body: 'Date, time, and venue to be announced.' },
      ],
      conclusion: 'All students and faculty are welcome to attend.',
      refs: 'Department of Academic Affairs',
    },
  },
  {
    id: 'ex-post-project-showcase', name: 'Project Showcase', category: 'Education', style: 'Modern', language: 'en',
    description: 'Modern cards and visuals showcasing a student project.',
    templateId: 'modern-blue', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Project Showcase', subtitle: 'Student Innovation in Action', authors: 'Graduation Project · 2026',
      intro: 'A showcase of a student-built project and its outcomes.',
      sections: [
        { title: 'Problem', icon: 'Target', body: 'The challenge the project addresses.' },
        { title: 'Solution', icon: 'Lightbulb', bullets: ['Concept', 'Design', 'Implementation'] },
        { title: 'Impact', icon: 'TrendingUp', bullets: ['Users reached', 'Efficiency gained', 'Feedback'] },
        { title: 'Future', bullets: ['New features', 'Scaling', 'Research'] },
      ],
      conclusion: 'The project demonstrates practical skills and real-world impact.',
      refs: '1. Project Documentation\n2. Supervisor Report',
    },
  },
  {
    id: 'ex-post-web-dev', name: 'Web Development Poster', category: 'Computer Science', style: 'Technology', language: 'en',
    description: 'HTML / CSS / JavaScript visual theme poster.',
    templateId: 'modern-technology', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Web Development', subtitle: 'Building the Modern Web', authors: 'IT Department',
      intro: 'An overview of modern web development technologies and practices.',
      sections: [
        { title: 'HTML', icon: 'Code', bullets: ['Structure', 'Semantics', 'Forms'] },
        { title: 'CSS', icon: 'Code', bullets: ['Layout', 'Responsive', 'Animation'] },
        { title: 'JavaScript', icon: 'Code', bullets: ['Interactivity', 'APIs', 'Frameworks'] },
        { title: 'Stack', bullets: ['Frontend', 'Backend', 'Database'] },
      ],
      conclusion: 'Modern web development combines design and engineering for great experiences.',
      refs: '1. MDN Web Docs\n2. Web.dev',
    },
  },
  {
    id: 'ex-post-database', name: 'Database Poster', category: 'Information Technology', style: 'Professional', language: 'en',
    description: 'Professional IT poster about database systems.',
    templateId: 'modern-blue', sizeId: 'a4-portrait', archetype: 'header-twocol',
    content: {
      title: 'Database Systems', subtitle: 'Organizing Data Efficiently', authors: 'Information Technology',
      intro: 'Databases store and organize data for fast, reliable access.',
      sections: [
        { title: 'Concepts', bullets: ['Tables', 'Keys', 'Relationships', 'Queries'] },
        { title: 'SQL', bullets: ['SELECT', 'JOIN', 'GROUP BY', 'ORDER BY'] },
        { title: 'Security', body: 'Permissions, encryption, and backups protect data.' },
      ],
      conclusion: 'Well-designed databases power reliable, scalable applications.',
      refs: '1. SQL Standard\n2. Database System Concepts',
    },
  },
  {
    id: 'ex-post-networking', name: 'Computer Networking Poster', category: 'Information Technology', style: 'Technology', language: 'en',
    description: 'Network-themed poster about protocols and topology.',
    templateId: 'dark-tech', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Computer Networking', subtitle: 'Connecting the World', authors: 'Network Engineering',
      intro: 'Networks connect devices to share resources and communicate.',
      sections: [
        { title: 'Types', icon: 'Network', bullets: ['LAN', 'WAN', 'MAN', 'Internet'] },
        { title: 'Protocols', icon: 'Wifi', bullets: ['TCP/IP', 'HTTP', 'DNS', 'FTP'] },
        { title: 'Topology', icon: 'Network', bullets: ['Star', 'Bus', 'Ring', 'Mesh'] },
        { title: 'Security', bullets: ['Firewall', 'VPN', 'Encryption'] },
      ],
      conclusion: 'Networks enable global communication and resource sharing.',
      refs: '1. Computer Networks, Tanenbaum',
    },
  },
  {
    id: 'ex-post-environment', name: 'Environmental Awareness', category: 'Environment', style: 'Modern', language: 'en',
    description: 'Green/nature awareness poster.',
    templateId: 'elegant-green', sizeId: 'a3-portrait', archetype: 'header-twocol',
    content: {
      title: 'Environmental Awareness', subtitle: 'Protecting Our Planet', authors: 'Green Club · 2026',
      intro: 'Sustainability means meeting present needs without harming future generations.',
      sections: [
        { title: 'Challenges', bullets: ['Climate change', 'Pollution', 'Deforestation'] },
        { title: 'Solutions', bullets: ['Renewable energy', 'Recycling', 'Conservation'] },
        { title: 'Action', body: 'Reduce, reuse, and recycle every day.' },
      ],
      conclusion: 'A sustainable future depends on everyone\u2019s daily choices.',
      refs: '1. UN Sustainable Development Goals',
    },
  },
  {
    id: 'ex-post-health', name: 'Health Awareness', category: 'Health', style: 'Modern', language: 'en',
    description: 'Clean healthcare awareness poster.',
    templateId: 'modern-blue', sizeId: 'a4-portrait', archetype: 'header-twocol',
    content: {
      title: 'Health Awareness', subtitle: 'Stay Healthy, Stay Safe', authors: 'Health Committee',
      intro: 'Simple daily habits keep you and your community healthy.',
      sections: [
        { title: 'Habits', bullets: ['Balanced diet', 'Exercise', 'Sleep', 'Hydration'] },
        { title: 'Prevention', bullets: ['Vaccines', 'Hygiene', 'Check-ups', 'Mental health'] },
        { title: 'Tips', body: 'Wash hands, stay active, and seek care early.' },
      ],
      conclusion: 'Prevention is better than cure — small habits make a big difference.',
      refs: '1. World Health Organization',
    },
  },
  {
    id: 'ex-post-business-event', name: 'Business Event', category: 'Business', style: 'Professional', language: 'en',
    description: 'Professional business event poster.',
    templateId: 'professional-business', sizeId: 'a3-portrait', archetype: 'header-twocol',
    content: {
      title: 'Business Summit 2026', subtitle: 'Innovation · Growth · Networks', authors: 'KRD Business Forum',
      intro: 'A premier gathering of entrepreneurs, leaders, and innovators.',
      sections: [
        { title: 'Agenda', bullets: ['Keynotes', 'Panels', 'Workshops', 'Networking'] },
        { title: 'Speakers', bullets: ['Industry leaders', 'Founders', 'Investors'] },
        { title: 'Details', body: 'Date and venue to be announced soon.' },
      ],
      conclusion: 'Connect, learn, and grow your business with industry peers.',
      refs: 'KRD Business Forum',
    },
  },
  {
    id: 'ex-post-tech-conference', name: 'Technology Conference', category: 'Information Technology', style: 'Dark', language: 'en',
    description: 'Premium modern technology conference poster.',
    templateId: 'dark-tech', sizeId: 'a3-portrait', archetype: 'tech-columns',
    content: {
      title: 'Tech Conference 2026', subtitle: 'The Future of Technology', authors: 'KRD Tech',
      intro: 'Explore the latest in AI, cloud, security, and the web.',
      sections: [
        { title: 'Tracks', icon: 'Cpu', bullets: ['AI & ML', 'Cloud', 'Security', 'Web'] },
        { title: 'Speakers', icon: 'Users', bullets: ['Experts', 'Researchers', 'Engineers'] },
        { title: 'Workshops', icon: 'Cog', bullets: ['Hands-on labs', 'Demos', 'Tutorials'] },
        { title: 'Info', bullets: ['Register online', 'Free for students'] },
      ],
      conclusion: 'Join the community shaping the future of technology.',
      refs: 'krdtech.dev/conference',
    },
  },
  {
    id: 'ex-post-graduation', name: 'Graduation Project', category: 'Education', style: 'Modern', language: 'en',
    description: 'University graduation project showcase poster.',
    templateId: 'modern-blue', sizeId: 'a3-portrait', archetype: 'research-grid',
    content: {
      title: 'Graduation Project', subtitle: 'Final Year Showcase', authors: 'Student · Supervisor · Department',
      intro: 'A final-year project demonstrating applied knowledge and skills.',
      sections: [
        { title: 'Objective', body: 'The goal the project achieves.' },
        { title: 'Design', body: 'Architecture and key components.' },
        { title: 'Implementation', body: 'Technologies and tools used.' },
        { title: 'Testing', body: 'Validation and quality assurance.' },
        { title: 'Results', body: 'Outcomes and performance.' },
        { title: 'Conclusion', body: 'Contributions and future work.' },
      ],
      conclusion: 'The project meets its objectives and is ready for presentation.',
      refs: '1. Project Report\n2. Supervisor Approval',
    },
  },
  {
    id: 'ex-post-minimal', name: 'Minimal Academic Poster', category: 'Minimal', style: 'Minimal', language: 'en',
    description: 'Very clean and simple academic poster.',
    templateId: 'minimal-academic', sizeId: 'a4-portrait', archetype: 'minimal',
    content: {
      title: 'A Minimal Study', subtitle: 'Clean and Focused',
      intro: 'A simple, elegant poster that lets the content speak for itself.',
      sections: [
        { title: 'Background', body: 'Context and motivation for the study.' },
        { title: 'Findings', bullets: ['First result', 'Second result', 'Third result'] },
        { title: 'Conclusion', body: 'A clear, concise takeaway.' },
      ],
      conclusion: 'Simplicity clarifies the message.',
      refs: 'Author, Year',
    },
  },
  {
    id: 'ex-post-creative', name: 'Creative Student Poster', category: 'Creative', style: 'Creative', language: 'en',
    description: 'Bold modern creative poster.',
    templateId: 'creative-student', sizeId: 'a3-portrait', archetype: 'header-twocol',
    content: {
      title: 'Create. Explore. Inspire.', subtitle: 'A Student Creative Showcase', authors: 'Art & Design Club',
      intro: 'Bold ideas and creative work from students across disciplines.',
      sections: [
        { title: 'Works', bullets: ['Illustration', 'Photography', 'Digital art', 'Motion'] },
        { title: 'Theme', bullets: ['Color', 'Contrast', 'Composition', 'Story'] },
        { title: 'Join', body: 'Submit your work and be featured.' },
      ],
      conclusion: 'Creativity turns imagination into impact.',
      refs: 'Art & Design Club · 2026',
    },
  },
  {
    id: 'ex-post-dark-pro', name: 'Dark Professional Poster', category: 'General', style: 'Dark', language: 'en',
    description: 'Elegant dark-themed professional poster.',
    templateId: 'dark-tech', sizeId: 'a3-landscape', archetype: 'tech-columns',
    content: {
      title: 'Excellence in Practice', subtitle: 'A Professional Showcase', authors: 'KRD GROUP',
      intro: 'A sleek, dark poster for professional presentations and events.',
      sections: [
        { title: 'Vision', icon: 'Target', body: 'A clear direction for growth.' },
        { title: 'Values', icon: 'Star', bullets: ['Quality', 'Integrity', 'Innovation'] },
        { title: 'Results', icon: 'Award', bullets: ['Awards', 'Clients', 'Projects'] },
        { title: 'Contact', bullets: ['krdgroup.dev', 'info@krdgroup.dev'] },
      ],
      conclusion: 'Professionalism delivered with elegance and clarity.',
      refs: 'KRD GROUP · 2026',
    },
  },
];

export default posterExamples;