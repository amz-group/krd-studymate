import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Presentation, Image as ImageIcon, FileText,
  ShieldCheck, HardDrive, WifiOff, ServerOff, UserCog, Save,
  Globe, ExternalLink, ArrowRight, Target, Sparkles, Languages,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

const KRD_URL = 'https://krdgroup.dev';
const LOGO_URL = 'https://media.base44.com/images/public/6aa3de887f8efa551a56a159/381faf02d_StudayMate.png';

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

  const features = [
    { icon: Presentation, title: t('about.features.presentation.title'), desc: t('about.features.presentation.desc'), accent: 'from-violet-500 to-indigo-500' },
    { icon: ImageIcon, title: t('about.features.poster.title'), desc: t('about.features.poster.desc'), accent: 'from-sky-500 to-cyan-500' },
    { icon: FileText, title: t('about.features.report.title'), desc: t('about.features.report.desc'), accent: 'from-emerald-500 to-teal-500' },
  ];

  const privacyPoints = [
    { icon: HardDrive, label: t('about.privacy.local') },
    { icon: WifiOff, label: t('about.privacy.offline') },
    { icon: ServerOff, label: t('about.privacy.nodb') },
    { icon: UserCog, label: t('about.privacy.user') },
    { icon: Save, label: t('about.privacy.autosave') },
  ];

  const appInfo = [
    { label: t('about.info.product'), value: 'KRD StudyMate' },
    { label: t('about.info.developer'), value: 'KRD GROUP' },
    { label: t('about.info.category'), value: t('about.info.value.category') },
    { label: t('about.info.languages'), value: t('about.info.value.languages') },
    { label: t('about.info.storage'), value: t('about.info.value.storage') },
    { label: t('about.info.platform'), value: t('about.info.value.platform') },
    { label: t('about.info.status'), value: t('about.info.value.status') },
  ];

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Hero */}
      <Section className="text-center mb-16 md:mb-20">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full" />
            <Image src={LOGO_URL} alt="KRD StudyMate" fittingType="fit" className="relative h-24 w-48 md:h-28 md:w-56" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
          {t('about.about.title')}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
          {t('about.hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button size="lg" className="gap-2" onClick={scrollToFeatures}>
            <Sparkles className="h-4 w-4" /> {t('about.hero.explore')}
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href={KRD_URL} target="_blank" rel="noopener noreferrer">
              {t('about.hero.visitKrd')} <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </Section>

      {/* About KRD StudyMate */}
      <Section className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10 card-shadow">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">{t('about.about.title')}</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            {t('about.about.p1')}
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {t('about.about.p2')}
          </p>
        </div>
      </Section>

      {/* Main Features */}
      <Section className="mb-16 md:mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('about.features.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('about.features.subtitle')}</p>
        </div>
        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 scroll-mt-24">
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
            <h2 className="text-xl md:text-2xl font-semibold">{t('about.privacy.title')}</h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
            {t('about.privacy.desc')}
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
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('about.languages.title')}</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {['English', 'کوردی', 'العربية'].map((lang) => (
              <span key={lang} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium card-shadow">
                {lang}
              </span>
            ))}
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            {t('about.languages.desc')}
          </p>
        </div>
      </Section>

      {/* Created by KRD GROUP */}
      <Section className="mb-16 md:mb-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-cyan-600 p-8 md:p-12 text-center text-white">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('about.created.title')}</h2>
            <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl mx-auto mb-6">
              {t('about.created.desc')}
            </p>
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a href={KRD_URL} target="_blank" rel="noopener noreferrer">
                {t('about.created.visit')} <ExternalLink className="h-4 w-4" />
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
          <h2 className="text-xl md:text-2xl font-semibold mb-3">{t('about.mission.title')}</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {t('about.mission.desc')}
          </p>
        </div>
      </Section>

      {/* App Information */}
      <Section className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 card-shadow">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('about.info.title')}</h2>
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
          {t('about.footer.tagline')}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('about.footer.developedBy')}{' '}
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