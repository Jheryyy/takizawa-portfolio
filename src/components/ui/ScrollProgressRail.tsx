'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  { id: 'home', index: '01', label: 'Home' },
  { id: 'about', index: '02', label: 'About' },
  { id: 'projects', index: '03', label: 'Works' },
  { id: 'guestbook', index: '04', label: 'Guestbook' },
  { id: 'contact', index: '05', label: 'Contact' },
];

export function ScrollProgressRail() {
  const pathname = usePathname();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>('home');

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (isAdminRoute) return;

    let raf = 0;
    const updateProgress = () => {
      raf = 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }

      if (isHomePage) {
        const scrollMid = window.scrollY + window.innerHeight * 0.38;
        let current = 'home';
        for (const sec of SECTIONS) {
          const el = document.getElementById(sec.id);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (scrollMid >= top) {
              current = sec.id;
            }
          }
        }
        setActiveId(current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isAdminRoute, isHomePage]);

  if (isAdminRoute) return null;

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Top 2px Reading Progress Line */}
      <div
        aria-hidden="true"
        className="no-print fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-transparent"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb,255,90,31),0.6)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Vertical Section Rail on Desktop Homepage */}
      {isHomePage && (
        <nav
          aria-label="Section progress navigation"
          className="no-print hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5"
        >
          {SECTIONS.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                aria-label={`Jump to ${sec.label}`}
                className="group flex items-center gap-2.5 py-0.5 cursor-pointer"
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all duration-200 border ${
                    isActive
                      ? 'opacity-100 translate-x-0 bg-surface/90 border-primary/40 text-primary font-bold shadow-xs'
                      : 'opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 bg-surface/90 border-hairline text-neutral-500 dark:text-neutral-300'
                  }`}
                >
                  {sec.index} {sec.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-6 bg-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb,255,90,31),0.6)]'
                      : 'w-2 h-2 bg-neutral-400/40 dark:bg-white/20 group-hover:bg-primary/70 group-hover:scale-125'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}

export default ScrollProgressRail;
