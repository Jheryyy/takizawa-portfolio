'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Cpu,
  ArrowUpRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { SkillCategory } from '@/types/portfolio';
import { skillsData, defaultSiteContent, getStoredSiteContent } from '@/data/portfolio-data';
import { techLogos } from '@/data/tech-logos';
import LogoLoop from '@/components/ui/LogoLoop';
import ScrollReveal from '@/components/ui/ScrollReveal';

const AnimatedBeamSkills = dynamic(
  () => import('@/components/magicui/animated-beam-skills').then((mod) => mod.AnimatedBeamSkills),
  {
    loading: () => <div className="min-h-[260px] w-full" />,
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
  const [activeSkillCategory, setActiveSkillCategory] = useState<
    'all' | SkillCategory
  >('all');

  useEffect(() => {
    setMounted(true);
    setSiteContent(getStoredSiteContent());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSiteContent(e.detail);
      }
    };
    window.addEventListener('site-content-updated', handleUpdate);
    return () => window.removeEventListener('site-content-updated', handleUpdate);
  }, []);

  const currentSkills = siteContent.skills?.length > 0 ? siteContent.skills : skillsData;

  const filteredSkills =
    activeSkillCategory === 'all'
      ? currentSkills
      : currentSkills.filter((s) => s.category === activeSkillCategory);

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <section id="about" className="space-y-12 sm:space-y-16 scroll-mt-28 w-full pt-8 sm:pt-14">
      {/* Editorial 2-Column Bio Split */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Orange Eyebrow + ScrollReveal H2 */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-primary font-display font-semibold text-sm sm:text-base tracking-tight">
              {siteContent.aboutEyebrow}
            </p>
            <ScrollReveal
              highlightColor={isLight ? '#000000' : (siteContent.primaryColor || '#FF5A1F')}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.06}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.65 : 0.6}
              baseRotation={0}
              baseOffset={0}
              enableBlur={!isLight}
              blurStrength={3}
              containerClassName="my-0"
              textClassName="font-display font-bold text-3xl sm:text-5xl leading-[1.12] tracking-[-0.02em] text-black dark:text-white"
            >
              {siteContent.aboutTitle}
            </ScrollReveal>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-hairline font-sans text-xs text-primary font-bold">
                {siteContent.aboutSchoolBadge}
              </span>
            </div>
          </div>

          {/* Right Column: Narrative with ScrollReveal + Signature Orange CTA Button */}
          <div className="lg:col-span-7 space-y-6 lg:pt-1">
            <ScrollReveal
              as="p"
              highlightColor={isLight ? '#000000' : (siteContent.primaryColor || '#FF5A1F')}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.022}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.65 : 0.6}
              baseRotation={0}
              baseOffset={0}
              enableBlur={!isLight}
              blurStrength={3}
              containerClassName="my-0"
              textClassName="font-display text-base sm:text-xl text-black dark:text-white/95 leading-relaxed font-sans font-medium"
            >
              Hello! I am Jheryco Takizawa Natal Kristiawan, a Software Engineering (PPLG) student at SMK Negeri 1 Depok with an immense passion for Web Development and UI/UX Design. I thrive on exploring modern web technologies, untangling complex algorithmic logic through clean, purposeful code, and sculpting interactive digital interfaces that elevate visual aesthetics to the highest standard.
            </ScrollReveal>

            <ScrollReveal
              as="p"
              highlightColor={isLight ? '#000000' : (siteContent.primaryColor || '#FF5A1F')}
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.02}
              duration={0.8}
              smoothing={0}
              baseOpacity={isLight ? 0.65 : 0.6}
              baseRotation={0}
              baseOffset={0}
              enableBlur={false}
              containerClassName="my-0"
              textClassName="text-sm sm:text-base text-black dark:text-white/85 leading-relaxed font-sans font-medium"
            >
              Driven by curiosity and a commitment to software craftsmanship, I bridge creative intuition with robust architecture—translating Figma designs into scalable Next.js and TypeScript applications. Every component, animation curve, and interaction I design is intentional—engineered to deliver lightning-fast performance, accessible user journeys, and seamless digital products that make the web simpler and more delightful to explore.
            </ScrollReveal>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-hairline">
              <div>
                <p className="text-xs text-black/70 dark:text-muted font-medium">Explore Full Background</p>
                <p className="text-xs text-black dark:text-white/80 font-bold">
                  Jheryco Takizawa &bull; Education, Stack &amp; Process
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  onClick={() => onOpenDetailAbout?.()}
                  className="group inline-flex items-center gap-3 bg-primary hover:bg-tertiary text-neutral-950 font-bold text-xs sm:text-sm pl-5 pr-1.5 py-1.5 rounded-full orange-glow-hover transition-all cursor-pointer shadow-md"
                >
                  <span className="text-neutral-950 font-black">Detail Profile &amp; CV</span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center transition-transform duration-300 group-hover:-rotate-45">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKILLS SECTION: Featuring MagicUI AnimatedBeam */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="bg-surface border border-hairline rounded-2.5xl p-6 sm:p-10 space-y-8 shadow-sm card-glow-hover">
          {/* Header + Category Tabs & Detail Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <span className="font-sans text-[11px] uppercase tracking-wider text-primary font-bold block">
                  TECHNICAL CRAFT &bull; SKILLS ARCHITECTURE
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">
                  Modern Web Tech Stack
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Skill Filter Pills */}
              <div className="inline-flex p-1 rounded-full bg-elevated border border-hairline">
                {(['all', 'frontend', 'uiux', 'backend'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveSkillCategory(cat)}
                    className={`px-3.5 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all capitalize cursor-pointer ${activeSkillCategory === cat
                        ? 'bg-primary text-neutral-950 font-bold shadow-sm'
                        : 'text-black dark:text-muted hover:text-primary'
                      }`}
                  >
                    {cat === 'uiux' ? 'UI/UX' : cat}
                  </button>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-elevated border border-hairline text-xs font-sans font-bold text-black dark:text-white hover:text-primary hover:border-primary/50 transition-all cursor-pointer group"
              >
                <span className="text-black dark:text-white font-bold">Academic Path</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-black dark:text-white group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* MagicUI AnimatedBeam Centerpiece: Center 'Skill' with Tech Nodes */}
          <div className="rounded-2xl bg-canvas border border-hairline p-4 sm:p-6 overflow-hidden relative">
            <div className="mb-2 text-center">
              <p className="font-sans text-xs uppercase tracking-wider text-primary font-bold">
                INTERACTIVE ARCHITECTURE BEAM
              </p>
              <p className="text-xs text-black/70 dark:text-muted font-sans font-medium">
                Live bidirectional reactive pipeline connecting foundational web tools to core development skills
              </p>
            </div>
            <AnimatedBeamSkills />
          </div>

          {/* Dynamic Skills Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="group p-3.5 rounded-xl bg-canvas border border-hairline hover:border-primary/60 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                    {skill.name}
                  </span>
                  <span className="font-mono text-[11px] font-extrabold text-primary">
                    {skill.level}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
                    style={{ width: skill.level }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-black/70 dark:text-muted font-medium">
                  <span>{skill.tag}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Metric Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-hairline">
            <div>
              <p className="font-mono text-xl sm:text-2xl font-extrabold text-black dark:text-white">
                15<span className="text-primary">+</span>
              </p>
              <p className="text-[11px] sm:text-xs text-black/70 dark:text-muted font-bold">
                Web &amp; UI Projects
              </p>
            </div>
            <div>
              <p className="font-mono text-xl sm:text-2xl font-extrabold text-black dark:text-white">
                99<span className="text-primary">%</span>
              </p>
              <p className="text-[11px] sm:text-xs text-black/70 dark:text-muted font-bold">
                Lighthouse A11y Goal
              </p>
            </div>
            <div>
              <p className="font-mono text-xl sm:text-2xl font-extrabold text-black dark:text-white">
                24<span className="text-primary">/7</span>
              </p>
              <p className="text-[11px] sm:text-xs text-black/70 dark:text-muted font-bold">
                Clean Code Obsession
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edge-to-Edge LogoLoop Strip directly beneath skills spanning 100% full width from left to right */}
      <div className="hero-logoloop-strip w-full border-y border-hairline bg-white dark:bg-[#0A0A0A] py-8 sm:py-10 overflow-hidden">
        <div className="w-full overflow-hidden bg-white dark:bg-[#0A0A0A]">
          <LogoLoop
            logos={techLogos}
            speed={48}
            direction="left"
            logoHeight={48}
            gap={64}
            pauseOnHover={true}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor={mounted && resolvedTheme === 'dark' ? '#0A0A0A' : '#FFFFFF'}
            ariaLabel="Technologies and tools"
            className="w-full bg-white dark:bg-[#0A0A0A]"
          />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
