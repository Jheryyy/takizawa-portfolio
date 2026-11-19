'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

interface LiquidTransitionContextType {
  triggerTransition: (href: string, label?: string) => void;
  isTransitioning: boolean;
}

const LiquidTransitionContext = createContext<LiquidTransitionContextType>({
  triggerTransition: () => {},
  isTransitioning: false,
});

export const useLiquidTransition = () => useContext(LiquidTransitionContext);

interface LiquidTransitionProps {
  children?: React.ReactNode;
}

export function LiquidTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<SVGPathElement>(null);
  const layer2Ref = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<any>(null);

  // Helper to build path string from state
  const buildPath = (topY: number, c1: number, c2: number, botY: number) => {
    return `M 0 ${topY.toFixed(2)} C 30 ${c1.toFixed(2)} 70 ${c2.toFixed(2)} 100 ${topY.toFixed(2)} V ${botY.toFixed(2)} H 0 Z`;
  };

  const executeNavigation = useCallback((href: string) => {
    try {
      const isHash = href.includes('#');
      const targetHash = isHash ? href.split('#')[1] : null;
      const targetPath = href.split('#')[0] || '/';
      const normalizedCurrentPath = pathname || '/';
      const normalizedTargetPath = targetPath === '' ? '/' : targetPath;

      if (targetHash && (normalizedCurrentPath === normalizedTargetPath || (normalizedCurrentPath === '/' && targetPath === '/'))) {
        // In-page anchor scroll
        if (targetHash === 'home') {
          window.scrollTo({ top: 0, behavior: 'instant' });
          window.history.pushState(null, '', '/#home');
        } else {
          const el = document.getElementById(targetHash);
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            window.history.pushState(null, '', `#${targetHash}`);
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      } else {
        // Cross-route navigation
        router.push(href);
      }
    } catch (err) {
      console.error('Liquid transition navigation error:', err);
      router.push(href);
    }
  }, [pathname, router]);

  const triggerTransition = useCallback(async (href: string, label?: string) => {
    if (isTransitioning) return;

    // Detect section or page label if not passed
    let displayLabel = label || '';
    if (!displayLabel) {
      if (href.includes('#home')) displayLabel = 'HOME';
      else if (href.includes('#about')) displayLabel = 'ABOUT';
      else if (href.includes('/about')) displayLabel = 'DETAIL';
      else if (href.includes('#projects')) displayLabel = 'PROJECTS';
      else if (href.includes('#guestbook')) displayLabel = 'GUESTBOOK';
      else if (href.includes('#contact')) displayLabel = 'CONTACT';
    }
    setActiveLabel(displayLabel);

    const layer1 = layer1Ref.current;
    const layer2 = layer2Ref.current;
    const container = containerRef.current;
    const labelEl = labelRef.current;

    if (!layer1 || !layer2 || !container) {
      executeNavigation(href);
      return;
    }

    setIsTransitioning(true);

    const { default: gsap } = await import('gsap');

    // Initial values: both layers are below the viewport
    const l1 = { topY: 100, c1: 100, c2: 100, botY: 100 };
    const l2 = { topY: 100, c1: 100, c2: 100, botY: 100 };

    layer1.setAttribute('d', buildPath(100, 100, 100, 100));
    layer2.setAttribute('d', buildPath(100, 100, 100, 100));

    if (timelineRef.current) timelineRef.current.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        // Reset states
        layer1.setAttribute('d', buildPath(100, 100, 100, 100));
        layer2.setAttribute('d', buildPath(100, 100, 100, 100));
        setIsTransitioning(false);
        setActiveLabel('');
      },
    });

    timelineRef.current = tl;

    // Phase 1: Surge upwards with dynamic liquid crest
    // Layer 1 (Accent wave) leads
    tl.to(
      l1,
      {
        topY: 0,
        c1: -32,
        c2: -18,
        duration: 0.42,
        ease: 'power2.in',
        onUpdate: () => {
          layer1.setAttribute('d', buildPath(l1.topY, l1.c1, l1.c2, l1.botY));
        },
      },
      0
    )
    .to(
      l1,
      {
        c1: 0,
        c2: 0,
        duration: 0.16,
        ease: 'power2.out',
        onUpdate: () => {
          layer1.setAttribute('d', buildPath(l1.topY, l1.c1, l1.c2, l1.botY));
        },
      },
      0.42
    );

    // Layer 2 (Canvas wave) follows 0.08s behind with counter-crest
    tl.to(
      l2,
      {
        topY: 0,
        c1: -16,
        c2: -35,
        duration: 0.42,
        ease: 'power2.in',
        onUpdate: () => {
          layer2.setAttribute('d', buildPath(l2.topY, l2.c1, l2.c2, l2.botY));
        },
      },
      0.08
    )
    .to(
      l2,
      {
        c1: 0,
        c2: 0,
        duration: 0.18,
        ease: 'power2.out',
        onUpdate: () => {
          layer2.setAttribute('d', buildPath(l2.topY, l2.c1, l2.c2, l2.botY));
        },
      },
      0.5
    );

    // Center Badge Label appearance at peak
    if (labelEl) {
      tl.fromTo(
        labelEl,
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'back.out(1.5)' },
        0.48
      );
    }

    // Midpoint: Screen is fully enveloped in Layer 2
    tl.call(() => {
      executeNavigation(href);
    }, undefined, 0.68);

    // Fade out Center Badge Label
    if (labelEl) {
      tl.to(
        labelEl,
        { opacity: 0, y: -14, duration: 0.18, ease: 'power2.in' },
        0.72
      );
    }

    // Phase 2: Sweep upwards off the top of the viewport
    // Layer 1 exits first
    tl.to(
      l1,
      {
        botY: 0,
        c1: -28,
        c2: -15,
        duration: 0.38,
        ease: 'power2.in',
        onUpdate: () => {
          layer1.setAttribute('d', buildPath(l1.topY, l1.c1, l1.c2, l1.botY));
        },
      },
      0.75
    )
    .to(
      l1,
      {
        c1: 0,
        c2: 0,
        duration: 0.14,
        ease: 'power2.out',
        onUpdate: () => {
          layer1.setAttribute('d', buildPath(l1.topY, l1.c1, l1.c2, l1.botY));
        },
      },
      1.13
    );

    // Layer 2 exits 0.08s later with counter-crest
    tl.to(
      l2,
      {
        botY: 0,
        c1: -14,
        c2: -30,
        duration: 0.38,
        ease: 'power2.in',
        onUpdate: () => {
          layer2.setAttribute('d', buildPath(l2.topY, l2.c1, l2.c2, l2.botY));
        },
      },
      0.83
    )
    .to(
      l2,
      {
        c1: 0,
        c2: 0,
        duration: 0.16,
        ease: 'power2.out',
        onUpdate: () => {
          layer2.setAttribute('d', buildPath(l2.topY, l2.c1, l2.c2, l2.botY));
        },
      },
      1.21
    );
  }, [isTransitioning, executeNavigation]);

  return (
    <LiquidTransitionContext.Provider value={{ triggerTransition, isTransitioning }}>
      {children}

      {/* Full-screen SVG Liquid Transition Overlay */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`fixed inset-0 w-screen h-screen z-[99999] transition-all ${
          isTransitioning ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ visibility: isTransitioning ? 'visible' : 'hidden' }}
      >
        <svg
          className="w-full h-full absolute inset-0 block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Primary Liquid Gradient */}
            <linearGradient id="liquid-accent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFA057" />
              <stop offset="50%" stopColor="#FF5A1F" />
              <stop offset="100%" stopColor="#D93800" />
            </linearGradient>
            <filter id="liquid-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#FF5A1F" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Underlayer: Vibrant Orange Liquid Wave */}
          <path
            ref={layer1Ref}
            fill="url(#liquid-accent)"
            filter="url(#liquid-glow)"
            d="M 0 100 C 30 100 70 100 100 100 V 100 H 0 Z"
          />

          {/* Top Layer: Deep Studio Canvas Wave */}
          <path
            ref={layer2Ref}
            fill="#0A0A0C"
            d="M 0 100 C 30 100 70 100 100 100 V 100 H 0 Z"
          />
        </svg>

        {/* Center Minimalist Transition Monogram */}
        <div
          ref={labelRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0"
        >
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
            <div className="relative h-10 w-28 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Takizawa Logo"
                width={669}
                height={373}
                className="w-auto h-full max-h-none scale-[2.6] translate-y-[5%] object-contain"
              />
            </div>
            {activeLabel && (
              <>
                <span className="text-white/30 font-mono text-xs">/</span>
                <span className="text-xs uppercase font-mono tracking-widest font-semibold text-[#FF9E6D]">
                  {activeLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </LiquidTransitionContext.Provider>
  );
}

export default LiquidTransitionProvider;
