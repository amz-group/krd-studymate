import {
  GraduationCap, BookOpen, Cpu, Laptop, ShieldCheck, Lock, Briefcase, Building2,
  FlaskConical, Atom, HeartPulse, Stethoscope, MessageSquare, Mail, Globe, Languages,
  BarChart3, PieChart, TrendingUp, Users, User, Target, Rocket, Lightbulb, Code,
  Database, Network, Cloud, Sun, Star, Award, Calendar, Clock, MapPin, Search,
  Settings, Bell, Camera, Image, FileText, Folder, Wifi, Zap, Bug, Cog, Server, QrCode,
} from 'lucide-react';

export const fonts = [
  { id: 'Inter', label: 'Inter', stack: "'Inter', sans-serif" },
  { id: 'Poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { id: 'Roboto', label: 'Roboto', stack: "'Roboto', sans-serif" },
  { id: 'Montserrat', label: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { id: 'Open Sans', label: 'Open Sans', stack: "'Open Sans', sans-serif" },
  { id: 'Noto Naskh Arabic', label: 'Noto Naskh Arabic', stack: "'Noto Naskh Arabic', sans-serif" },
  { id: 'Vazirmatn', label: 'Vazirmatn', stack: "'Vazirmatn', sans-serif" },
];

export function fontStack(id) {
  const f = fonts.find((x) => x.id === id);
  return f ? f.stack : "'Inter', sans-serif";
}

export const iconMap = {
  GraduationCap, BookOpen, Cpu, Laptop, ShieldCheck, Lock, Briefcase, Building2,
  FlaskConical, Atom, HeartPulse, Stethoscope, MessageSquare, Mail, Globe, Languages,
  BarChart3, PieChart, TrendingUp, Users, User, Target, Rocket, Lightbulb, Code,
  Database, Network, Cloud, Sun, Star, Award, Calendar, Clock, MapPin, Search,
  Settings, Bell, Camera, Image, FileText, Folder, Wifi, Zap, Bug, Cog, Server, QrCode,
};

export const iconCategories = [
  { id: 'education', label: 'Education', icons: ['GraduationCap', 'BookOpen', 'Award', 'Lightbulb'] },
  { id: 'technology', label: 'Technology', icons: ['Cpu', 'Laptop', 'Code', 'Server', 'Database', 'Network', 'Cloud', 'Wifi', 'Bug', 'Cog'] },
  { id: 'security', label: 'Security', icons: ['ShieldCheck', 'Lock'] },
  { id: 'business', label: 'Business', icons: ['Briefcase', 'Building2', 'Users', 'Target', 'TrendingUp', 'BarChart3', 'PieChart'] },
  { id: 'science', label: 'Science', icons: ['FlaskConical', 'Atom'] },
  { id: 'health', label: 'Health', icons: ['HeartPulse', 'Stethoscope'] },
  { id: 'communication', label: 'Communication', icons: ['MessageSquare', 'Mail', 'Bell'] },
  { id: 'general', label: 'General', icons: ['Globe', 'Languages', 'Rocket', 'Star', 'Calendar', 'Clock', 'MapPin', 'Search', 'Settings', 'Camera', 'Image', 'FileText', 'Folder', 'Sun', 'Zap', 'User', 'QrCode'] },
];

export function defaultTextContent(role = 'body') {
  const base = {
    text: '', font: 'Inter', size: 28, bold: false, italic: false, underline: false,
    color: '#0f172a', highlight: 'transparent', align: 'start',
    lineHeight: 1.4, letterSpacing: 0, opacity: 1, listType: 'none',
  };
  if (role === 'heading') return { ...base, size: 48, bold: true };
  if (role === 'subheading') return { ...base, size: 28, color: '#475569' };
  if (role === 'caption') return { ...base, size: 20, color: '#64748b' };
  if (role === 'quote') return { ...base, size: 36, italic: true, color: '#334155' };
  return base;
}

function textSpec(role, x, y, w, h, overrides = {}) {
  return { type: 'text', role, x, y, w, h, content: { ...defaultTextContent(role), ...overrides } };
}
function imageSpec(x, y, w, h, overrides = {}) {
  return { type: 'image', x, y, w, h, content: { src: '', fit: 'cover', radius: 12, shadow: false, opacity: 1, ...overrides } };
}
function shapeSpec(x, y, w, h, overrides = {}) {
  return { type: 'shape', x, y, w, h, content: { shape: 'rect', fill: '#2563eb', border: 'transparent', borderWidth: 0, radius: 0, opacity: 1, ...overrides } };
}

// Layouts return element specs (base coords 1280x720). IDs assigned on creation.
export function getLayoutSpec(layoutId, t) {
  switch (layoutId) {
    case 'blank': return [];
    case 'title':
      return [
        textSpec('heading', 140, 250, 1000, 160, { size: 64, align: 'center', text: t('slide.title.default') }),
        textSpec('subheading', 300, 430, 680, 60, { align: 'center', text: '' }),
      ];
    case 'titleContent':
    case 'titleParagraph':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: t('slide.intro') }),
        textSpec('body', 80, 190, 1120, 420, { text: '' }),
      ];
    case 'titleBullets':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: t('slide.mainPoint') }),
        textSpec('body', 80, 190, 1120, 420, { listType: 'bullet', text: `${t('slide.bullet')} 1\n${t('slide.bullet')} 2\n${t('slide.bullet')} 3` }),
      ];
    case 'twoColumns':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: '' }),
        textSpec('body', 80, 190, 520, 420, { text: '' }),
        textSpec('body', 680, 190, 520, 420, { text: '' }),
      ];
    case 'threeColumns':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: '' }),
        textSpec('body', 80, 190, 340, 420, { text: '' }),
        textSpec('body', 470, 190, 340, 420, { text: '' }),
        textSpec('body', 860, 190, 340, 420, { text: '' }),
      ];
    case 'imageText':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: '' }),
        imageSpec(80, 190, 480, 460),
        textSpec('body', 620, 190, 580, 460, { text: '' }),
      ];
    case 'textImage':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: '' }),
        textSpec('body', 80, 190, 580, 460, { text: '' }),
        imageSpec(680, 190, 520, 460),
      ];
    case 'largeImage':
      return [imageSpec(0, 0, 1280, 720, { radius: 0 })];
    case 'quote':
      return [textSpec('quote', 160, 260, 960, 200, { align: 'center', text: '' })];
    case 'section':
      return [textSpec('heading', 80, 300, 1120, 160, { size: 72, align: 'center', text: '' })];
    case 'comparison':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: '' }),
        textSpec('body', 80, 190, 520, 420, { text: '' }),
        textSpec('body', 680, 190, 520, 420, { text: '' }),
      ];
    case 'conclusion':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: t('slide.conclusion') }),
        textSpec('body', 80, 190, 1120, 360, { text: '' }),
      ];
    case 'references':
      return [
        textSpec('heading', 80, 70, 1120, 90, { text: t('slide.references') }),
        textSpec('body', 80, 190, 1120, 420, { text: '' }),
      ];
    case 'thankYou':
      return [textSpec('heading', 80, 300, 1120, 160, { size: 64, align: 'center', text: 'Thank You' })];
    default:
      return [textSpec('body', 80, 80, 1120, 400, { text: '' })];
  }
}

export const layoutList = [
  { id: 'blank', label: 'Blank' },
  { id: 'title', label: 'Title Slide' },
  { id: 'titleContent', label: 'Title + Content' },
  { id: 'titleParagraph', label: 'Title + Paragraph' },
  { id: 'titleBullets', label: 'Title + Bullets' },
  { id: 'twoColumns', label: 'Two Columns' },
  { id: 'threeColumns', label: 'Three Columns' },
  { id: 'imageText', label: 'Image + Text' },
  { id: 'textImage', label: 'Text + Image' },
  { id: 'largeImage', label: 'Large Image' },
  { id: 'quote', label: 'Quote' },
  { id: 'section', label: 'Section Header' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'references', label: 'References' },
  { id: 'thankYou', label: 'Thank You' },
];

// New-slide choices for the + New Slide menu.
export const newSlideLayouts = [
  'blank', 'title', 'titleContent', 'twoColumns', 'imageText', 'largeImage',
  'quote', 'section', 'comparison', 'conclusion', 'references',
];

export const templates = [
  { id: 'modern-blue', name: 'Modern Blue', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#2563eb', accent: '#3b82f6', muted: '#64748b' }, cover: { bg: { type: 'solid', color: '#1e3a8a' }, text: '#ffffff', subtext: '#bfdbfe' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#0f172a', subtext: '#475569' } },
  { id: 'clean-academic', name: 'Clean Academic', fonts: { heading: 'Montserrat', body: 'Open Sans' }, colors: { primary: '#0f172a', accent: '#475569', muted: '#64748b' }, cover: { bg: { type: 'solid', color: '#f8fafc' }, text: '#0f172a', subtext: '#475569' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#0f172a', subtext: '#475569' } },
  { id: 'dark-technology', name: 'Dark Technology', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#38bdf8', accent: '#818cf8', muted: '#94a3b8' }, cover: { bg: { type: 'solid', color: '#0f172a' }, text: '#38bdf8', subtext: '#cbd5e1' }, content: { bg: { type: 'solid', color: '#0f172a' }, text: '#e2e8f0', subtext: '#94a3b8' } },
  { id: 'minimal-white', name: 'Minimal White', fonts: { heading: 'Inter', body: 'Inter' }, colors: { primary: '#111827', accent: '#6b7280', muted: '#6b7280' }, cover: { bg: { type: 'solid', color: '#ffffff' }, text: '#111827', subtext: '#6b7280' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#111827', subtext: '#6b7280' } },
  { id: 'elegant-green', name: 'Elegant Green', fonts: { heading: 'Poppins', body: 'Open Sans' }, colors: { primary: '#047857', accent: '#10b981', muted: '#6b7280' }, cover: { bg: { type: 'solid', color: '#064e3b' }, text: '#d1fae5', subtext: '#a7f3d0' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#064e3b', subtext: '#475569' } },
  { id: 'pro-business', name: 'Professional Business', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#0f172a', accent: '#f59e0b', muted: '#64748b' }, cover: { bg: { type: 'solid', color: '#1e293b' }, text: '#f1f5f9', subtext: '#cbd5e1' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#334155', subtext: '#64748b' } },
  { id: 'purple-gradient', name: 'Purple Gradient', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#7c3aed', accent: '#a78bfa', muted: '#6b7280' }, cover: { bg: { type: 'gradient', color: '#7c3aed', color2: '#a78bfa' }, text: '#ffffff', subtext: '#ede9fe' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#1e1b4b', subtext: '#64748b' } },
  { id: 'cyber-security', name: 'Cyber Security', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#22d3ee', accent: '#22d3ee', muted: '#94a3b8' }, cover: { bg: { type: 'solid', color: '#020617' }, text: '#22d3ee', subtext: '#cbd5e1' }, content: { bg: { type: 'solid', color: '#0f172a' }, text: '#e2e8f0', subtext: '#94a3b8' } },
  { id: 'university-classic', name: 'University Classic', fonts: { heading: 'Montserrat', body: 'Open Sans' }, colors: { primary: '#92400e', accent: '#d97706', muted: '#64748b' }, cover: { bg: { type: 'solid', color: '#1f2937' }, text: '#fef3c7', subtext: '#fde68a' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#1f2937', subtext: '#64748b' } },
  { id: 'research', name: 'Research Presentation', fonts: { heading: 'Inter', body: 'Inter' }, colors: { primary: '#0ea5e9', accent: '#0ea5e9', muted: '#64748b' }, cover: { bg: { type: 'solid', color: '#ffffff' }, text: '#0f172a', subtext: '#64748b' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#0f172a', subtext: '#64748b' } },
  { id: 'modern-black', name: 'Modern Black', fonts: { heading: 'Montserrat', body: 'Inter' }, colors: { primary: '#000000', accent: '#6b7280', muted: '#6b7280' }, cover: { bg: { type: 'solid', color: '#000000' }, text: '#ffffff', subtext: '#9ca3af' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#111827', subtext: '#6b7280' } },
  { id: 'creative-student', name: 'Creative Student', fonts: { heading: 'Poppins', body: 'Inter' }, colors: { primary: '#db2777', accent: '#f97316', muted: '#6b7280' }, cover: { bg: { type: 'gradient', color: '#f97316', color2: '#ec4899' }, text: '#ffffff', subtext: '#fff7ed' }, content: { bg: { type: 'solid', color: '#ffffff' }, text: '#1f2937', subtext: '#64748b' } },
];

export function getTemplate(id) {
  return templates.find((t) => t.id === id) || templates[0];
}

export const examples = [
  {
    id: 'cyber-security', name: 'Cyber Security', templateId: 'cyber-security',
    outline: [
      { layout: 'title', title: 'Cyber Security' },
      { layout: 'titleContent', title: 'Introduction', body: 'Cyber security protects systems, networks, and data from digital attacks.' },
      { layout: 'titleBullets', title: 'Threats', bullets: ['Malware', 'Phishing', 'Ransomware', 'Man-in-the-middle'] },
      { layout: 'titleBullets', title: 'Types of Attacks', bullets: ['Network intrusion', 'Social engineering', 'Password attacks', 'Denial of service'] },
      { layout: 'titleBullets', title: 'Protection', bullets: ['Strong passwords', 'Two-factor authentication', 'Regular updates', 'Awareness training'] },
      { layout: 'conclusion', title: 'Conclusion', body: 'Good cyber security habits keep your data and identity safe.' },
      { layout: 'references', title: 'References' },
    ],
  },
  {
    id: 'ai', name: 'Artificial Intelligence', templateId: 'dark-technology',
    outline: [
      { layout: 'title', title: 'Artificial Intelligence' },
      { layout: 'titleContent', title: 'Introduction', body: 'AI is the science of making machines that can learn and reason.' },
      { layout: 'titleBullets', title: 'Applications', bullets: ['Healthcare', 'Education', 'Finance', 'Transportation'] },
      { layout: 'imageText', title: 'Machine Learning' },
      { layout: 'titleBullets', title: 'Benefits', bullets: ['Automation', 'Accuracy', 'Speed', 'Insights'] },
      { layout: 'conclusion', title: 'Conclusion', body: 'AI is shaping the future of every industry.' },
      { layout: 'references', title: 'References' },
    ],
  },
  {
    id: 'business-plan', name: 'Business Plan', templateId: 'pro-business',
    outline: [
      { layout: 'title', title: 'Business Plan' },
      { layout: 'titleContent', title: 'Executive Summary', body: 'A clear overview of the business, market, and goals.' },
      { layout: 'titleBullets', title: 'Market Analysis', bullets: ['Target customers', 'Competitors', 'Opportunities', 'Risks'] },
      { layout: 'comparison', title: 'Strategy' },
      { layout: 'titleBullets', title: 'Financial Plan', bullets: ['Revenue', 'Costs', 'Break-even', 'Funding'] },
      { layout: 'conclusion', title: 'Next Steps', body: 'Launch, measure, and iterate.' },
      { layout: 'references', title: 'References' },
    ],
  },
  {
    id: 'university-seminar', name: 'University Seminar', templateId: 'clean-academic',
    outline: [
      { layout: 'title', title: 'University Seminar' },
      { layout: 'titleContent', title: 'Introduction', body: 'An overview of the seminar topic and objectives.' },
      { layout: 'titleBullets', title: 'Key Points', bullets: ['Background', 'Method', 'Results', 'Discussion'] },
      { layout: 'titleContent', title: 'Analysis', body: 'Detailed analysis of the findings.' },
      { layout: 'conclusion', title: 'Conclusion', body: 'Summary of insights and future work.' },
      { layout: 'references', title: 'References' },
    ],
  },
];