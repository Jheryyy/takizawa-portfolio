'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Cpu, ArrowUpRight, Sliders } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SkillCategory } from '@/types/portfolio';
import { skillsData, defaultSiteContent, fetchRemoteSiteContent, getStoredSiteContent } from '@/data/portfolio-data';
import { techLogos } from '@/data/tech-logos';
import LogoLoop from '@/components/ui/LogoLoop';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Magnetic from '@/components/ui/Magnetic';
import { BlueprintCrosshairs } from '@/components/ui/BlueprintCrosshairs';
import { updateSpotlightPos } from '@/lib/utils';

const AnimatedBeamSkills = dynamic(
  () => import('@/components/magicui/animated-beam-skills').then((mod) => mod.AnimatedBeamSkills),
  {
    loading: () => <div className="min-h-[260px] w-full" />,
    ssr: false,
  }
);

const DesignTokenLab = dynamic(
  () => import('@/components/sections/DesignTokenLab').then((mod) => mod.DesignTokenLab),
  {
    loading: () => <div className="min-h-[380px] w-full" />,
    ssr: false,
  }
);

interface AboutSectionProps {
  onOpenDetailAbout?: () => void;
}

export function AboutSection({ onOpenDetailAbout }: AboutSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [activeSkillCategory, setActiveSkillCategory] = useState<'all' | SkillCategory>('all');
  const [activeBentoMode, setActiveBentoMode] = useState<'stack' | 'lab'>('stack');

  useEffect(() => {
    setMounted(true);
    setSiteContent(getStoredSiteContent());
    let cancelled = false;
    fetchRemoteSiteContent().then((remote) => {
      if (!cancelled) setSiteContent(remote);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSiteContent(e.detail);
      }
    };
    const handleOpenLab = () => {
      setActiveBentoMode('lab');
      document.getElementById('design-lab')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener('site-content-updated', handleUpdate);
    window.addEventListener('open-design-lab', handleOpenLab);
    return () => {
      cancelled = true;
      window.removeEventListener('site-content-updated', handleUpdate);
      window.removeEventListener('open-design-lab', handleOpenLab);
    };
  }, []);

  const currentSkills = siteContent.skills?.length > 0 ? siteContent.skills : skillsData;

  const filteredSkills =
    activeSkillCategory === 'all'
      ? currentSkills
      : currentSkills.filter((s) => s.category === activeSkillCategory);

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <section
      id="about"
      className="space-y-14 sm:space-y-20 scroll-mt-28 w-full py-12 sm:py-16 about-solid-section bg-[#08080C] dark:bg-[#08080C] light:bg-[#F8FAFC] transition-colors"
    >
      {/* Editorial 2-Column Bio Split */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-primary font-mono font-semibold text-xs uppercase tracking-wider">
                {siteContent.aboutEyebrow}
              </p>
            </div>
            <ScrollReveal
              highlightColor={isLight ? '#111827' : siteContent.primaryColor || '#FF5A1F'}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.06}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.55 : 0.5}
              baseRotation={0}
              baseOffset={0}
              enableBlur={!isLight}
              blurStrength={3}
              containerClassName="my-0"
              textClassName="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-[-0.025em] text-neutral-950 dark:text-white"
            >
              {siteContent.aboutTitle}
            </ScrollReveal>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-hairline font-mono text-[11px] text-primary font-semibold">
                {siteContent.aboutSchoolBadge}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6 lg:pt-1">
            <ScrollReveal
              as="p"
              highlightColor={isLight ? '#111827' : siteContent.primaryColor || '#FF5A1F'}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.022}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.55 : 0.55}
              baseRotation={0}
              baseOffset={0}
              enableBlur={!isLight}
              blurStrength={2}
              containerClassName="my-0"
              textClassName="font-display text-base sm:text-xl text-neutral-900 dark:text-white/95 leading-relaxed font-medium"
            >
              {siteContent.aboutBioP1}
            </ScrollReveal>

            <ScrollReveal
              as="p"
              highlightColor={isLight ? '#111827' : siteContent.primaryColor || '#FF5A1F'}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.02}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.55 : 0.55}
              baseRotation={0}
              baseOffset={0}
              enableBlur={false}
              containerClassName="my-0"
              textClassName="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans"
            >
              {siteContent.aboutBioP2}
            </ScrollReveal>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-hairline">
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Explore Full Background
                </p>
                <p className="text-xs text-neutral-900 dark:text-white/85 font-semibold">
                  Jheryco Takizawa &bull; Education, Stack &amp; Process
                </p>
              </div>

              <Magnetic strength={0.22}>
                <Link
                  href="/about"
                  onClick={() => onOpenDetailAbout?.()}
                  className="group inline-flex items-center gap-3 bg-primary hover:bg-tertiary font-bold text-xs sm:text-sm pl-5 pr-2 py-2 rounded-full orange-glow-hover transition-all cursor-pointer w-fit active:scale-[0.97]"
                >
                  <span>Detail Profile &amp; CV</span>
                  <span className="w-7 h-7 rounded-full bg-neutral-950 text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* SKILLS & INTERACTIVE DESIGN LAB SECTION */}
      <div id="design-lab" className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 scroll-mt-24">
        <div className="relative bg-surface border border-hairline rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                {activeBentoMode === 'lab' ? <Sliders className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
              </span>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold block">
                  {activeBentoMode === 'lab'
                    ? 'Interactive Playground • UI Tokens'
                    : 'Technical Craft • Skills Matrix'}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-950 dark:text-white">
                  {activeBentoMode === 'lab' ? 'Design & Code Token Lab' : 'Modern Web Tech Stack'}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {/* Primary Mode Switcher: Tech Stack vs Design Lab */}
              <div className="inline-flex p-1 rounded-full bg-elevated border border-hairline">
                <button
                  type="button"
                  onClick={() => setActiveBentoMode('stack')}
                  className={`px-3.5 py-1.5 min-h-[34px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeBentoMode === 'stack'
                      ? 'bg-primary font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                  }`}
                >
                  Tech Stack
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBentoMode('lab')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[34px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeBentoMode === 'lab'
                      ? 'bg-primary font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Design Lab</span>
                </button>
              </div>

              {activeBentoMode === 'stack' && (
                <div className="inline-flex p-1 rounded-full bg-elevated border border-hairline">
                  {(['all', 'frontend', 'uiux', 'backend'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveSkillCategory(cat)}
                      className={`px-3 py-1.5 min-h-[34px] rounded-full text-xs font-semibold transition-all capitalize cursor-pointer ${
                        activeSkillCategory === cat
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                      }`}
                    >
                      {cat === 'uiux' ? 'UI/UX' : cat}
                    </button>
                  ))}
                </div>
              )}

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-elevated border border-hairline text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 hover:text-primary hover:border-primary/40 transition-all cursor-pointer group"
              >
                <span>Academic Path</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {activeBentoMode === 'lab' ? (
            <DesignTokenLab />
          ) : (
            <>
              {/* Interactive Architecture Beam */}
              <div className="rounded-2xl bg-canvas border border-hairline p-5 sm:p-7 overflow-hidden relative">
                <div className="mb-2 text-center space-y-1">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary font-semibold">
                    Interactive Architecture Beam
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                    Foundational web tools connected to core engineering disciplines
                  </p>
                </div>
                <AnimatedBeamSkills />
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.name}
                    onMouseMove={updateSpotlightPos}
                    className="spotlight-border group p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs mb-3">
                        <span className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                          {skill.name}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                          {skill.level}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
                          style={{ width: skill.level }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      <span>{skill.tag}</span>
                      <span className="uppercase">{skill.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Bottom Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-hairline">
            <div className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                15<span className="text-primary">+</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                Web &amp; UI Projects Delivered
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                99<span className="text-primary">%</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                Lighthouse Performance &amp; A11y Focus
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                8px<span className="text-primary"> Grid</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                Intentional Design System Craft
              </p>
            </div>
          </div>
          <BlueprintCrosshairs />
        </div>
      </div>

      {/* Edge-to-Edge LogoLoop Strip with clean CSS mask */}
      <div className="hero-logoloop-strip w-full border-y border-hairline bg-white dark:bg-[#0A0A0A] py-7 sm:py-9 overflow-hidden">
        <div
          className="w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <LogoLoop
            logos={techLogos}
            speed={44}
            direction="left"
            logoHeight={42}
            gap={60}
            pauseOnHover={true}
            scaleOnHover={true}
            fadeOut={false}
            ariaLabel="Technologies and tools"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
