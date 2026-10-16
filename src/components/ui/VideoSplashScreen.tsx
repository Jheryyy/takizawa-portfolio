'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const GREETINGS = [
  'Halo',
  'Hello',
  'こんにちは',
  'Hola',
  'Bonjour',
  'Ciao',
  '안녕하세요',
  'Hallo',
  '你好',
  'Olá',
  'Namaste',
  'Halo',
];

export function VideoSplashScreen() {
  const pathname = usePathname();
  const isDashboardRoute = Boolean(
    pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')
  );

  const [isMounted, setIsMounted] = useState(!isDashboardRoute);
  const [isDismissing, setIsDismissing] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Never show splash screen on admin or dashboard routes
    if (isDashboardRoute) {
      setIsMounted(false);
      return;
    }

    // Check if splash screen was already dismissed in this session
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('splash_dismissed') === 'true') {
        setIsMounted(false);
        return;
      }
    } catch {
      // Ignore private mode storage restrictions
    }

    // Lock body scroll while splash screen is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Try to trigger background music
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-music'));
    }

    // Safety timeout: automatically open after 3.2s
    timeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, 3200);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isDashboardRoute]);

  // Multilingual greeting cycling (175ms per language ~2.1s sequence)
  useEffect(() => {
    if (!isMounted || isDismissing) return;

    const interval = setInterval(() => {
      setGreetingIndex((prev) => {
        if (prev < GREETINGS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            handleDismiss();
          }, 260);
          return prev;
        }
      });
    }, 175);

    return () => clearInterval(interval);
  }, [isMounted, isDismissing]);

  const triggerMusic = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-music'));
    }
  };

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    document.body.style.overflow = '';

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('splash_dismissed', 'true');
      }
    } catch {
      // Ignore
    }

    triggerMusic();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('splash-dismissed'));
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Wait for the center curtain parting animation (850ms) before unmounting
    setTimeout(() => {
      setIsMounted(false);
    }, 850);
  };

  if (!isMounted || isDashboardRoute) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Splash Screen"
      onClick={handleDismiss}
      className="fixed inset-0 z-[999999] overflow-hidden select-none cursor-pointer"
    >
      {/* Left Curtain Door - slides -100% to left */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-black transition-transform duration-[850ms] ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isDismissing ? '-translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Right Curtain Door - slides +100% to right */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-black transition-transform duration-[850ms] ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isDismissing ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Center line glowing seam before parting */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-primary/40 to-transparent transition-opacity duration-300 pointer-events-none z-10 ${
          isDismissing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Top Right Skip Button */}
      <div className="absolute top-6 right-6 z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
          aria-label="Skip splash screen"
        >
          <span>Skip</span>
          <span className="text-primary font-bold transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </button>
      </div>

      {/* Center Multilingual Text: Studio Orange on Pure Black */}
      <div
        className={`relative z-20 w-full h-full flex items-center justify-center transition-all duration-300 ${
          isDismissing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-center justify-center px-6">
          <span className="font-display font-extrabold text-4xl sm:text-6xl text-primary tracking-tight drop-shadow-[0_0_30px_rgba(255,90,31,0.5)]">
            {GREETINGS[greetingIndex]}
          </span>
          <span className="inline-block w-3 h-3 rounded-full bg-primary ml-3 animate-pulse shadow-[0_0_12px_#FF5A1F]" />
        </div>
      </div>
    </div>
  );
}

export default VideoSplashScreen;
