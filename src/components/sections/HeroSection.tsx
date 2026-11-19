'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ProjectCategory } from '@/types/portfolio';
import { defaultSiteContent, getStoredSiteContent } from '@/data/portfolio-data';
import TextType from '@/components/ui/TextType';

interface HeroSectionProps {
  onSelectCategory?: (category: ProjectCategory | 'All') => void;
}

export function HeroSection({ onSelectCategory }: HeroSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSiteContent(getStoredSiteContent());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSiteContent(e.detail);
      }
    };
    window.addEventListener('site-content-updated', handleUpdate);

    if (typeof window === 'undefined' || !heroContainerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.12,
      });

      // 1. Initial greeting fade & lift
      tl.fromTo(
        '.hero-greeting',
        { y: 16, opacity: 0.3 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform' }
      );

      // 2. Display Title (H1) smooth upward emergence - keep visible from frame 0 for instant LCP
      tl.fromTo(
        '.hero-title',
        { y: 18 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform' },
        '-=0.45'
      );

      // 3. Typing subtitle smooth fade & lift
      tl.fromTo(
        '.hero-typing',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.4'
      );

      // 4. Value proposition & philosophy placed below
      tl.fromTo(
        '.hero-philosophy',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.35'
      );
    }, heroContainerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('site-content-updated', handleUpdate);
    };
  }, []);

  return (
    <header id="home" ref={heroContainerRef} className="relative w-full bg-white dark:bg-canvas overflow-hidden">
      {/* Studio Hero Gradient Container with generous top gap */}
      <div className="studio-hero-gradient relative w-full pt-36 sm:pt-40 lg:pt-48 pb-28 sm:pb-36 lg:pb-40 border-b border-hairline overflow-hidden">
        {/* Ambient luminous glow overlay */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FF9E6D]/20 dark:bg-[#FF9E6D]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-white via-white/45 to-transparent dark:from-[#0D0A09] dark:via-[#0D0A09]/60 z-10" />

        {/* Hero Main Content Area - Centered Editorial Layout */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 flex flex-col items-center justify-center text-center">
          {/* Main Greeting & Massive Display Name */}
          <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto">
            <p className="hero-greeting text-black/75 dark:text-white/75 font-display font-medium text-xl sm:text-3xl md:text-4xl tracking-tight">
              {siteContent.heroGreeting}
            </p>

            <h1 className="hero-title font-display font-black text-6xl sm:text-8xl md:text-9xl lg:text-[112px] xl:text-[126px] leading-[1.0] tracking-[-0.04em] text-black dark:text-white dark:drop-shadow-[0_8px_28px_rgba(0,0,0,0.4)]">
              {siteContent.heroName}
            </h1>

            {/* Typing Text: slightly smaller than Jheryco Takizawa, darker tone with dynamic black/white shadow */}
            <div className="hero-typing flex items-center justify-center gap-2 sm:gap-3 font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#D03E0B] dark:text-[#E04F18] tracking-tight min-h-[48px] sm:min-h-[64px] drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)] [text-shadow:0_3px_12px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_0_22px_rgba(255,255,255,0.75)] dark:[text-shadow:0_0_20px_rgba(255,255,255,0.85),0_0_40px_rgba(255,255,255,0.45)]">
              <span className="text-black/60 dark:text-white/60 font-semibold text-xl sm:text-3xl md:text-4xl">a</span>
              <span className="sr-only">{siteContent.heroName} — </span>
              <TextType
                text={siteContent.heroTypingTexts}
                as="span"
                typingSpeed={55}
                initialDelay={400}
                pauseDuration={2000}
                deletingSpeed={22}
                deleteMode="select"
                typeEffect="blur"
                cursorStyle="bar"
                cursorColor="#D03E0B"
                cursorGlide
                showCursor
                cursorBlinkDuration={0.6}
                className="inline-block"
              />
            </div>
          </div>

          {/* Philosophy Section & Action Links - Positioned Below */}
          <div className="hero-philosophy max-w-2xl mx-auto mt-12 sm:mt-16 pt-8 border-t border-neutral-300/40 dark:border-white/10 space-y-4">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-snug text-black dark:text-white tracking-tight whitespace-pre-line">
              {siteContent.heroPhilosophyTitle}
            </h2>
            <p className="text-sm sm:text-base text-black/85 dark:text-white/75 leading-relaxed font-sans font-medium max-w-xl mx-auto">
              {siteContent.heroPhilosophyDesc}
            </p>
            <div className="hero-links pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-tertiary text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-primary/30 hover:scale-[1.02]"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>View CV &amp; Credentials</span>
              </Link>

              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface hover:bg-elevated border border-hairline text-black dark:text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:scale-[1.02]"
              >
                <span>Explore Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSection;
