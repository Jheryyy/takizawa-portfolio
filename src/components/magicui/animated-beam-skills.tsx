'use client';

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/registry/magicui/animated-beam';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFigma,
  SiNodedotjs,
} from 'react-icons/si';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; label?: string }
>(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        ref={ref}
        className={cn(
          'z-10 flex size-12 sm:size-14 items-center justify-center rounded-full border border-hairline bg-white dark:bg-[#141414] p-2.5 sm:p-3 shadow-md transition-all duration-300 group-hover:scale-115 group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(255,90,31,0.25)]',
          className
        )}
      >
        {children}
      </div>
      {label && (
        <span className="text-[10px] sm:text-xs font-mono font-bold text-black/70 dark:text-muted tracking-tight transition-colors group-hover:text-primary">
          {label}
        </span>
      )}
    </div>
  );
});

Circle.displayName = 'Circle';

export function AnimatedBeamSkills({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null); // Center: "Skill"
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isLight = mounted && resolvedTheme === 'light';
  const pathColor = isLight ? '#E5E7EB' : '#262626';
  const pathOpacity = isLight ? 0.9 : 0.45;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden py-6 sm:py-10 px-4 select-none',
        className
      )}
    >
      {/* 3-Column Node Structure: Left Techs | Center "Skill" | Right Techs */}
      <div className="flex w-full max-w-xl items-center justify-between gap-4 sm:gap-8 z-10">
        {/* Left Column: Frontend Core */}
        <div className="flex flex-col items-center justify-between gap-6 sm:gap-9">
          <Circle ref={div1Ref} label="Next.js">
            <SiNextdotjs className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
          </Circle>
          <Circle ref={div2Ref} label="React 19">
            <SiReact className="w-5 h-5 sm:w-6 sm:h-6 text-[#00D8FF] dark:text-[#61DAFB]" />
          </Circle>
          <Circle ref={div3Ref} label="TypeScript">
            <SiTypescript className="w-5 h-5 sm:w-6 sm:h-6 text-[#3178C6]" />
          </Circle>
        </div>

        {/* Center Node: "Skill" */}
        <div className="flex flex-col items-center">
          <Circle
            ref={div4Ref}
            className="size-20 sm:size-24 border-2 border-primary/60 bg-gradient-to-b from-white to-neutral-50 dark:from-[#1A1A1A] dark:to-[#121212] shadow-[0_0_35px_-5px_rgba(255,90,31,0.45)] dark:shadow-[0_0_40px_-5px_rgba(255,90,31,0.55)] cursor-default hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-display font-black text-sm sm:text-base text-black dark:text-white uppercase tracking-wider">
                Skill
              </span>
              <span className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[9px] font-bold text-primary tracking-widest uppercase">
                  Core
                </span>
              </span>
            </div>
          </Circle>
        </div>

        {/* Right Column: Styling, Design & Runtime */}
        <div className="flex flex-col items-center justify-between gap-6 sm:gap-9">
          <Circle ref={div5Ref} label="Tailwind">
            <SiTailwindcss className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8]" />
          </Circle>
          <Circle ref={div6Ref} label="Figma">
            <SiFigma className="w-5 h-5 sm:w-6 sm:h-6 text-[#F24E1E]" />
          </Circle>
          <Circle ref={div7Ref} label="Node.js">
            <SiNodedotjs className="w-5 h-5 sm:w-6 sm:h-6 text-[#5FA04E]" />
          </Circle>
        </div>
      </div>

      {/* Animated Beams: Render only when within viewport */}
      {isInView && (
        <>
          {/* Animated Beams: Left to Center */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div4Ref}
            curvature={-65}
            endYOffset={-10}
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={4.2}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div4Ref}
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={3.8}
            delay={0.2}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div4Ref}
            curvature={65}
            endYOffset={10}
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={4.5}
            delay={0.4}
          />

          {/* Animated Beams: Right to Center (Reverse flow) */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div4Ref}
            curvature={-65}
            endYOffset={-10}
            reverse
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={4.2}
            delay={0.1}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div4Ref}
            reverse
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={3.8}
            delay={0.3}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div7Ref}
            toRef={div4Ref}
            curvature={65}
            endYOffset={10}
            reverse
            pathColor={pathColor}
            pathOpacity={pathOpacity}
            gradientStartColor="#FF5A1F"
            gradientStopColor="#FF8552"
            duration={4.5}
            delay={0.5}
          />
        </>
      )}
    </div>
  );
}

export default AnimatedBeamSkills;
