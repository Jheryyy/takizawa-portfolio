'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import ScrollVelocity from '@/components/ui/ScrollVelocity';

export function CrossedScrollVelocity() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <div className="relative w-full py-16 sm:py-24 my-6 sm:my-10 overflow-hidden select-none">
      {/* Background ambient glow behind intersection */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-36 bg-primary/20 blur-3xl rounded-full" />
      </div>

      {/* Crossed Kinetic Ribbons Container */}
      <div className="relative w-full min-h-[170px] sm:min-h-[210px] flex items-center justify-center">
        {/* Ribbon 1: Angled -rotate-[2.5deg] (White background & Black text in Light Mode, Dark Charcoal in Dark Mode) */}
        <div className="absolute w-[120vw] -left-[10vw] -rotate-[2.5deg] z-10 py-3.5 sm:py-4.5 bg-white dark:bg-[#161616] text-black dark:text-white border-y border-neutral-300 dark:border-white/15 shadow-xl transition-colors">
          <ScrollVelocity
            texts={[
              'FRONTEND DEVELOPER ✦ UI/UX ARCHITECT ✦ CREATIVE CODER ✦ NEXT.JS SPECIALIST ✦ WEB DEVELOPMENT ENTHUSIAST ✦ REACT 19'
            ]}
            velocity={75}
            draggable={true}
            skewWithVelocity={14}
            scaleWithVelocity={0.12}
            gap={32}
            separator="✦"
            fontSize="clamp(1.25rem, 2.8vw, 2.1rem)"
            fontWeight={900}
            color="currentColor"
            className="font-display tracking-wider text-black dark:text-white uppercase drop-shadow-sm"
          />
        </div>

        {/* Ribbon 2: Angled +rotate-[2.5deg] (Vibrant Studio Orange ribbon crossing over) */}
        <div className="absolute w-[120vw] -left-[10vw] rotate-[2.5deg] z-20 py-3.5 sm:py-4.5 bg-primary text-white border-y border-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-transform">
          <ScrollVelocity
            texts={[
              'UI/UX DESIGN ENTHUSIAST ✦ TYPESCRIPT CRAFTSMAN ✦ FIGMA DESIGN TOKENS ✦ CLEAN CODE ARCHITECTURE ✦ MOTION & SPEED'
            ]}
            velocity={-75}
            draggable={true}
            skewWithVelocity={14}
            scaleWithVelocity={0.12}
            gap={32}
            separator="✦"
            fontSize="clamp(1.25rem, 2.8vw, 2.1rem)"
            fontWeight={900}
            color="#FFFFFF"
            className="font-display tracking-wider text-white uppercase drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

export default CrossedScrollVelocity;
