'use client';

import React from 'react';
import ScrollVelocity from '@/components/ui/ScrollVelocity';

export function CrossedScrollVelocity() {
  return (
    <div className="relative w-full py-12 sm:py-16 my-4 sm:my-8 overflow-hidden select-none">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[420px] h-28 bg-primary/15 blur-3xl rounded-full" />
      </div>

      {/* Sleek Crossed Editorial Ticker */}
      <div className="relative w-full min-h-[130px] sm:min-h-[160px] flex items-center justify-center">
        <div className="absolute w-[120vw] -left-[10vw] -rotate-[2deg] z-10 py-2.5 sm:py-3 bg-white dark:bg-[#141418] text-neutral-900 dark:text-white border-y border-neutral-200 dark:border-white/10 shadow-md transition-colors">
          <ScrollVelocity
            texts={[
              'FRONTEND DEVELOPER • UI/UX ARCHITECT • CREATIVE CODER • NEXT.JS SPECIALIST • REACT 19'
            ]}
            velocity={65}
            draggable={true}
            skewWithVelocity={10}
            scaleWithVelocity={0.08}
            gap={28}
            separator="•"
            fontSize="clamp(0.95rem, 1.9vw, 1.4rem)"
            fontWeight={800}
            color="currentColor"
            className="font-display tracking-wider text-neutral-900 dark:text-white uppercase"
          />
        </div>

        <div
          className="absolute w-[120vw] -left-[10vw] rotate-[2deg] z-20 py-2.5 sm:py-3 bg-primary border-y border-white/20 shadow-lg"
          style={{ color: 'var(--color-on-primary, #FFFFFF)' }}
        >
          <ScrollVelocity
            texts={[
              'UI/UX DESIGN • TYPESCRIPT CRAFTSMAN • FIGMA DESIGN TOKENS • CLEAN ARCHITECTURE • PERFORMANCE'
            ]}
            velocity={-65}
            draggable={true}
            skewWithVelocity={10}
            scaleWithVelocity={0.08}
            gap={28}
            separator="•"
            fontSize="clamp(0.95rem, 1.9vw, 1.4rem)"
            fontWeight={800}
            color="var(--color-on-primary, #FFFFFF)"
            className="font-display tracking-wider uppercase"
          />
        </div>
      </div>
    </div>
  );
}

export default CrossedScrollVelocity;
