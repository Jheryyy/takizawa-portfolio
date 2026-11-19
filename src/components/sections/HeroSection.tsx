'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ProjectCategory } from '@/types/portfolio';
import { defaultSiteContent, getStoredSiteContent } from '@/data/portfolio-data';
import TextType from '@/components/ui/TextType';

interface HeroSectionProps {
  onSelectCategory?: (category: ProjectCategory | 'All') => void;
}

export function HeroSection({ onSelectCategory }: HeroSectionProps) {
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
        delay: 0.1,
      });

      // 1. Initial greeting fade & lift
      tl.fromTo(
        '.hero-greeting',
        { y: 14, opacity: 0.3 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform' }
      );

      // 2. Display Title (H1) smooth upward emergence
      tl.fromTo(
        '.hero-title',
        { y: 18 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform' },
        '-=0.45'
      );

      // 3. Typing subtitle
      tl.fromTo(
        '.hero-typing',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // 4. Value proposition & philosophy
      tl.fromTo(
        '.hero-philosophy',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.35'
      );

      // 5. Action CTA buttons
      tl.fromTo(
        '.hero-actions',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.35'
      );

      // 6. Scroll indicator
      tl.fromTo(
        '.hero-scroll-indicator',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55 },
        '-=0.25'
      );
    }, heroContainerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('site-content-updated', handleUpdate);
    };
  }, []);

  // Smooth mouse spotlight tracking without React state re-renders (120 FPS performance)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroContainerRef.current) return;
    const rect = heroContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroContainerRef.current.style.setProperty('--mouse-x', `${x}px`);
    heroContainerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <header
      id="home"
      ref={heroContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full bg-white dark:bg-canvas overflow-hidden select-none"
    >
      {/* Studio Hero Gradient Container: Compact top gap & balanced vertical breathing room */}
      <div className="studio-hero-gradient relative w-full pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 border-b border-hairline overflow-hidden flex flex-col justify-center">
        {/* Dynamic Mouse Spotlight: Follows cursor softly across the canvas */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-75"
          style={{
            background:
              'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(255, 90, 31, 0.12), transparent 70%)',
          }}
        />

        {/* Ambient luminous glow spheres on edges for depth */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FF9E6D]/20 dark:bg-[#FF9E6D]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-white via-white/45 to-transparent dark:from-[#0D0A09] dark:via-[#0D0A09]/60 z-10" />

        {/* Hero Main Content Area - Clean, Focused Editorial Hierarchy */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center">
          {/* Main Greeting & Massive Display Name */}
          <div className="space-y-2.5 sm:space-y-3 max-w-5xl mx-auto">
            <p className="hero-greeting text-black/70 dark:text-white/70 font-display font-medium text-lg sm:text-2xl md:text-3xl tracking-tight">
              {siteContent.heroGreeting}
            </p>

            <h1 className="hero-title font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] xl:text-[118px] leading-[0.98] tracking-[-0.04em] text-black dark:text-white">
              {siteContent.heroName}
            </h1>

            {/* Dynamic Typing Subtitle: Crisp and cleanly rendered */}
            <div className="hero-typing flex items-center justify-center gap-2 sm:gap-3 font-display font-bold text-xl sm:text-3xl md:text-4xl lg:text-5xl text-primary tracking-tight min-h-[40px] sm:min-h-[52px]">
              <span className="text-black/50 dark:text-white/50 font-semibold text-lg sm:text-2xl md:text-3xl">
                a
              </span>
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
                cursorColor="#FF5A1F"
                cursorGlide
                showCursor
                cursorBlinkDuration={0.6}
                className="inline-block"
              />
            </div>
          </div>

          {/* Philosophy Statement & Core Narrative */}
          <div className="hero-philosophy max-w-2xl mx-auto mt-6 sm:mt-8 space-y-2 sm:space-y-2.5">
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl leading-snug text-black dark:text-white tracking-tight whitespace-pre-line">
              {siteContent.heroPhilosophyTitle}
            </h2>
            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans font-medium max-w-lg mx-auto">
              {siteContent.heroPhilosophyDesc}
            </p>
          </div>

          {/* Action CTAs: High-contrast, clean & balanced */}
          <div className="hero-actions mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/#projects"
              className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-primary hover:bg-tertiary text-white font-sans text-xs sm:text-sm font-bold transition-all duration-300 shadow-md hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Explore Works</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-surface/80 hover:bg-surface backdrop-blur-md border border-neutral-300/70 dark:border-white/15 text-neutral-900 dark:text-white font-sans text-xs sm:text-sm font-bold transition-all duration-300 shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>View CV &amp; Credentials</span>
            </Link>
          </div>

          {/* Minimalist Animated Scroll Indicator */}
          <div className="hero-scroll-indicator mt-10 sm:mt-12 flex flex-col items-center justify-center">
            <a
              href="#about"
              className="group inline-flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors cursor-pointer"
              aria-label="Scroll to explore"
            >
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] transition-colors group-hover:text-primary">
                Scroll to explore
              </span>
              <div className="w-5 h-8 rounded-full border-2 border-neutral-400/50 dark:border-white/20 group-hover:border-primary/60 transition-colors flex justify-center pt-1.5 shadow-xs">
                <span className="w-1 h-2 rounded-full bg-primary animate-bounce" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSection;
