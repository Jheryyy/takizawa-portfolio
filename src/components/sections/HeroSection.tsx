'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ProjectCategory } from '@/types/portfolio';
import TextType from '@/components/ui/TextType';

interface HeroSectionProps {
  onSelectCategory?: (category: ProjectCategory | 'All') => void;
}

export function HeroSection({ onSelectCategory }: HeroSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined' || !heroContainerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.12,
      });

      // 1. Initial greeting fade & lift
      tl.fromTo(
        '.hero-greeting',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );

      // 2. Display Title (H1) smooth upward emergence
      tl.fromTo(
        '.hero-title',
        { y: 38, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.05, ease: 'power4.out' },
        '-=0.65'
      );

      // 3. Right Column: Quote & value proposition
      tl.fromTo(
        '.hero-philosophy',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.75'
      );

      // 4. Action links
      tl.fromTo(
        '.hero-links',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.55'
      );

      // 5. 4-column service index staggered reveal
      tl.fromTo(
        '.hero-service-item',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power2.out',
          force3D: true,
          clearProps: 'transform',
        },
        '-=0.45'
      );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  const handleServiceClick = (category: ProjectCategory | 'All') => {
    onSelectCategory?.(category);
    const projSection = document.getElementById('projects');
    if (projSection) {
      projSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header id="home" ref={heroContainerRef} className="relative w-full bg-white dark:bg-canvas overflow-hidden">
      {/* Studio Hero Gradient Container: comfortable breathing gap on mobile */}
      <div className="studio-hero-gradient relative w-full pt-28 sm:pt-22 lg:pt-24 pb-36 sm:pb-48 lg:pb-64 border-b border-hairline overflow-hidden">
        {/* Ambient luminous glow overlay */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FF9E6D]/20 dark:bg-[#FF9E6D]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-white via-white/45 to-transparent dark:from-[#0D0A09] dark:via-[#0D0A09]/60 z-10" />

        {/* Hero Main Content Area */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12">
          {/* Asymmetric Editorial Split: Left Giant Display H1 / Right Philosophy */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-10 items-end min-h-[290px] sm:min-h-[360px]">
            {/* Left Column: Greeting + Massive H1 */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-3">
              <p className="hero-greeting text-black dark:text-white/80 font-display font-medium text-lg sm:text-2xl tracking-tight">
                Hey, I&apos;m <span className="font-bold text-black dark:text-white">Jheryco Takizawa</span>, a
              </p>
              <h1 className="hero-title font-display font-extrabold text-[40px] sm:text-[66px] md:text-[80px] leading-[1.05] tracking-[-0.04em] text-black dark:text-white dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] min-h-[90px] sm:min-h-[145px] md:min-h-[175px] flex items-center">
                <span className="sr-only">Jheryco Takizawa Natal Kristiawan (Jheryco) — </span>
                <TextType
                  text={[
                    'Frontend Developer',
                    'UI/UX Designer',
                    'Creative Thinker',
                    'Web Craftsman',
                  ]}
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
              </h1>
            </div>

            {/* Right Column: Value Proposition & UI/UX Philosophy */}
            <div className="hero-philosophy lg:col-span-5 lg:pl-8 pt-4 sm:pt-0 pb-2 sm:pb-6 space-y-4 max-w-md lg:ml-auto">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-snug text-black dark:text-white tracking-tight">
                Great interfaces should
                <br />
                feel invisible.
              </h2>
              <p className="text-sm sm:text-base text-black/85 dark:text-white/75 leading-relaxed font-sans font-medium">
                From Figma design tokens to scalable Next.js architecture, I craft web
                experiences that connect, perform, and convert with effortless fluidity.
              </p>
              <div className="hero-links pt-2 flex items-center gap-4">
                <Link
                  href="/#projects"
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black hover:text-neutral-800 dark:text-primary dark:hover:text-tertiary transition-colors"
                >
                  <span className="underline underline-offset-4 decoration-black/40 hover:decoration-black dark:no-underline">Explore Selected Work</span>
                  <span className="font-mono text-xs transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </Link>
                <span className="text-neutral-400 dark:text-neutral-600">&bull;</span>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black dark:text-white/90 hover:text-neutral-700 dark:hover:text-primary transition-colors"
                >
                  <span>Read Profile</span>
                  <span className="font-mono text-xs transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom 4-Column Numbered Service Index (01 - 04) */}
          <div className="relative z-20 mt-16 sm:mt-24 pt-8 pb-10 sm:pb-16 border-t border-neutral-300/60 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <button
              type="button"
              className="hero-service-item group text-left cursor-pointer focus:outline-none will-change-transform min-h-[48px] py-1"
              onClick={() => handleServiceClick('Frontend Web')}
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <p className="font-mono text-xs font-extrabold text-primary tracking-wider transition-colors group-hover:text-tertiary">
                  01
                </p>
                <p className="mt-1.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white/90 group-hover:text-primary transition-colors">
                  Frontend Engineering
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1 font-medium">
                  Next.js 15 &bull; React 19 &bull; TS
                </p>
              </div>
            </button>

            <button
              type="button"
              className="hero-service-item group text-left cursor-pointer focus:outline-none will-change-transform min-h-[48px] py-1"
              onClick={() => handleServiceClick('UI/UX Case Study')}
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <p className="font-mono text-xs font-extrabold text-primary tracking-wider transition-colors group-hover:text-tertiary">
                  02
                </p>
                <p className="mt-1.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white/90 group-hover:text-primary transition-colors">
                  UI/UX Architecture
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1 font-medium">
                  Figma &bull; Design Tokens &bull; a11y
                </p>
              </div>
            </button>

            <button
              type="button"
              className="hero-service-item group text-left cursor-pointer focus:outline-none will-change-transform min-h-[48px] py-1"
              onClick={() => handleServiceClick('Fullstack')}
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <p className="font-mono text-xs font-extrabold text-primary tracking-wider transition-colors group-hover:text-tertiary">
                  03
                </p>
                <p className="mt-1.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white/90 group-hover:text-primary transition-colors">
                  Interactive Web Apps
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1 font-medium">
                  Fullstack &bull; APIs &bull; Motion
                </p>
              </div>
            </button>

            <Link
              href="/about"
              className="hero-service-item group text-left cursor-pointer focus:outline-none block will-change-transform min-h-[48px] py-1"
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <p className="font-mono text-xs font-extrabold text-primary tracking-wider transition-colors group-hover:text-tertiary">
                  04
                </p>
                <p className="mt-1.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white/90 group-hover:text-primary transition-colors">
                  Credentials &amp; About
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1 font-medium">
                  Full Resume &bull; Education &bull; Path
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSection;
