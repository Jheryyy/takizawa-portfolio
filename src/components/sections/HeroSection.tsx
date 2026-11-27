'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ProjectCategory } from '@/types/portfolio';
import { defaultSiteContent, fetchRemoteSiteContent, getStoredSiteContent } from '@/data/portfolio-data';
import TextType from '@/components/ui/TextType';
import Magnetic from '@/components/ui/Magnetic';

interface HeroSectionProps {
  onSelectCategory?: (category: ProjectCategory | 'All') => void;
}

let hasPlayedHeroIntro = false;

export function HeroSection({ onSelectCategory: _onSelectCategory }: HeroSectionProps) {
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [wibTime, setWibTime] = useState<string | null>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const updateClock = () => setWibTime(formatter.format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
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
    window.addEventListener('site-content-updated', handleUpdate);

    if (typeof window === 'undefined' || !heroContainerRef.current) {
      return () => {
        cancelled = true;
        window.removeEventListener('site-content-updated', handleUpdate);
      };
    }

    if (hasPlayedHeroIntro) {
      return () => {
        cancelled = true;
        window.removeEventListener('site-content-updated', handleUpdate);
      };
    }

    hasPlayedHeroIntro = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        '.hero-greeting',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, clearProps: 'transform' }
      )
        .fromTo(
          '.hero-title',
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, clearProps: 'transform' },
          '-=0.25'
        )
        .fromTo(
          '.hero-typing',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35 },
          '-=0.28'
        )
        .fromTo(
          '.hero-philosophy',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4 },
          '-=0.25'
        )
        .fromTo(
          '.hero-actions',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35 },
          '-=0.25'
        )
        .fromTo(
          '.hero-scroll-indicator',
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.3 },
          '-=0.2'
        );
    }, heroContainerRef);

    return () => {
      cancelled = true;
      ctx.revert();
      window.removeEventListener('site-content-updated', handleUpdate);
    };
  }, []);

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
      className="relative w-full bg-canvas overflow-hidden select-none"
    >
      <div className="studio-hero-gradient relative w-full min-h-[86vh] pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 border-b border-hairline overflow-hidden flex flex-col justify-center">
        {/* Subtle Architectural Grid Mask */}
        <div className="hero-grid-pattern pointer-events-none absolute inset-0 z-0" />

        {/* Dynamic Mouse Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-80"
          style={{
            background:
              'radial-gradient(560px circle at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(var(--color-primary-rgb, 255, 90, 31), 0.11), transparent 70%)',
          }}
        />

        {/* Main Content */}
        <div className="relative z-20 max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center">
          {/* Greeting, Display Name & Typing Role */}
          <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto">
            <p className="hero-greeting text-neutral-500 dark:text-neutral-400 font-display font-medium text-base sm:text-xl md:text-2xl tracking-tight">
              {siteContent.heroGreeting}
            </p>

            <h1 className="hero-title font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[102px] xl:text-[114px] leading-[0.96] tracking-[-0.04em] text-neutral-950 dark:text-white">
              {siteContent.heroName}
            </h1>

            <div className="hero-typing flex items-center justify-center gap-2.5 font-display font-bold text-xl sm:text-3xl md:text-4xl text-primary tracking-tight min-h-[38px] sm:min-h-[48px] pt-1">
              <span className="text-neutral-400 dark:text-neutral-500 font-medium text-lg sm:text-2xl">
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
                cursorColor={siteContent.primaryColor || '#FF5A1F'}
                cursorGlide
                showCursor
                cursorBlinkDuration={0.6}
                className="inline-block"
              />
            </div>
          </div>

          {/* Editorial Philosophy Statement */}
          <div className="hero-philosophy max-w-2xl mx-auto mt-8 sm:mt-10 space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-2xl leading-snug text-neutral-900 dark:text-neutral-100 tracking-tight whitespace-pre-line">
              {siteContent.heroPhilosophyTitle}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans max-w-lg mx-auto">
              {siteContent.heroPhilosophyDesc}
            </p>
          </div>

          {/* Balanced Action CTAs */}
          <div className="hero-actions mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Magnetic strength={0.25}>
              <Link
                href="/#projects"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary hover:bg-tertiary font-sans text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-primary/25 active:scale-[0.97] cursor-pointer"
              >
                <span>Explore Works</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>

            <Magnetic strength={0.2}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-surface/80 hover:bg-surface backdrop-blur-md border border-hairline text-neutral-900 dark:text-white font-sans text-xs sm:text-sm font-semibold transition-all duration-300 hover:border-primary/40 active:scale-[0.97] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>View CV &amp; Credentials</span>
              </Link>
            </Magnetic>
          </div>

          {/* Minimal Scroll Indicator */}
          <div className="hero-scroll-indicator mt-12 sm:mt-14 flex flex-col items-center justify-center">
            <a
              href="#about"
              className="group inline-flex flex-col items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-primary transition-colors cursor-pointer"
              aria-label="Scroll to explore"
            >
              <span className="text-[10px] font-mono font-medium uppercase tracking-[0.25em]">
                Scroll
              </span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-primary/80 to-transparent relative overflow-hidden">
                <span className="block w-full h-3 bg-primary animate-bounce" />
              </div>
            </a>
          </div>

          {/* Bottom Editorial Telemetry Bar */}
          <div className="hero-meta mt-10 sm:mt-12 pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" aria-hidden="true" />
              <span>DEPOK, ID</span>
              <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-600">&bull;</span>
              <span className="tabular-nums text-neutral-700 dark:text-neutral-200">
                {wibTime ?? '--:--:--'} WIB
              </span>
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 text-center sm:text-right">
              NEXT.JS 15 &bull; REACT 19 &bull; FIGMA &bull; TYPESCRIPT
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSection;
