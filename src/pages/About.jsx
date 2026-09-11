import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Presentation, Image as ImageIcon, FileText, BookOpen,
  ShieldCheck, HardDrive, WifiOff, ServerOff, UserCog, Save,
  Globe, ExternalLink, ArrowRight, Target, Sparkles, Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

const KRD_URL = 'https://krdgroup.dev';

const features = [
  {
    icon: Presentation,
    title: 'Presentation Builder',
    desc: 'Create and customize professional academic presentations with templates, images, text, shapes, visual editing, and PowerPoint/PDF export.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    icon: ImageIcon,
    title: 'Poster Maker',
    desc: 'Design academic, research, seminar, and project posters using professional templates and a fully customizable visual editor.',
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Report & Assignment Maker',
    desc: 'Create organized reports and assignments with cover pages, tables, images, references, page numbers, and Word/PDF export.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BookOpen,
    title: 'Study Assistant',
    desc: 'Turn study materials and PDF documents into summaries, key points, flashcards, questions, quizzes, and study notes.',
    accent: 'from-amber-500 to-orange-500',
  },
];

const privacyPoints = [
  { icon: HardDrive, label: 'Local project storage' },
  { icon: WifiOff, label: 'Offline-friendly' },
  { icon: ServerOff, label: 'No external project database' },
  { icon: UserCog, label: 'User-controlled data' },
  { icon: Save, label: 'Local auto-save' },
];

const appInfo = [
  { label: 'Product', value: 'KRD StudyMate' },
  { label: 'Developer', value: 'KRD GROUP' },
  { label: 'Category', value: 'Education & Productivity' },
  { label: 'Languages', value: 'Kurdish, English, Arabic' },
  { label: 'Storage', value: 'Local-first' },
  { label: 'Platform', value: 'Web / PWA' },
  { label: 'Status', value: 'Active Development' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function Section({ children, className = '' }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function About() {
  const { t } = useApp();
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Hero */}
      <Section className="text-center mb-16 md:mb-20">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full" />
            <div className="relative flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-cyan-500 text-white shadow-lg">
              <GraduationCap className="h-10 w-10 md:h-12 md:w-12" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
          About KRD StudyMate
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
          A complete academic productivity platform designed to help students study, create, and achieve more.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button size="lg" className="gap-2" onClick={scrollToFeatures}>
            <Sparkles className="h-4 w-4" /> Explore Features
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href={KRD_URL} target="_blank" rel="noopener noreferrer">
              Visit KRD GROUP <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </Section>

      {/* About KRD StudyMate */}
      <Section className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10 card-shadow">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">About KRD StudyMate</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            KRD StudyMate is an all-in-one academic productivity application designed for university and college students. It brings the essential tools students need for presentations, posters, reports, assignments, and studying into one simple and professional platform.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Our goal is to make academic work easier, faster, more organized, and more professional while giving students full control over their projects.
          </p>
        </div>
      </Section>

      {/* Main Features */}
      <Section className="mb-16 md:mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Main Features</h2>
          <p className="text-muted-foreground mt-2">Everything students need, in one place.</p>
        </div>
        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5 scroll-mt-24">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="group rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:border-primary/40 hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} text-white mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Local-First Privacy */}
      <Section className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-cyan-500/5 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold">Your Data. Your Device.</h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
            KRD StudyMate is designed with a local-first approach. Your projects, study materials, presentations, posters, and documents are stored directly on your device instead of being stored in an external cloud database.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {privacyPoints.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Languages */}
      <Section className="mb-16 md:mb-20">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Languages className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Made for More Students</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {['English', 'کوردی', 'العربية'].map((lang) => (
              <span key={lang} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium card-shadow">
                {lang}
              </span>
            ))}
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            KRD StudyMate supports English, Kurdish Sorani, and Arabic with both LTR and RTL interfaces.
          </p>
        </div>
      </Section>

      {/* Created by KRD GROUP */}
      <Section className="mb-16 md:mb-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-cyan-600 p-8 md:p-12 text-center text-white">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Created by KRD GROUP</h2>
            <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl mx-auto mb-6">
              KRD StudyMate is developed by KRD GROUP, a development team focused on building useful websites, applications, systems, and digital solutions for students, individuals, and organizations.
            </p>
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a href={KRD_URL} target="_blank" rel="noopener noreferrer">
                Visit KRD GROUP <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Section>

      {/* Mission */}
      <Section className="mb-16 md:mb-20">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Our mission is to create practical digital tools that simplify everyday work, improve productivity, and help students turn their ideas into professional results.
          </p>
        </div>
      </Section>

      {/* App Information */}
      <Section className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 card-shadow">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">App Information</h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {appInfo.map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-medium text-end">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Footer */}
      <footer className="text-center pt-8 border-t border-border">
        <p className="text-base font-semibold tracking-tight">
          KRD StudyMate — Study • Create • Achieve
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Developed by{' '}
          <a href={KRD_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            KRD GROUP
          </a>
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-6 transition-colors"
        >
          {t('tool.backHome')} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </div>
  );
}