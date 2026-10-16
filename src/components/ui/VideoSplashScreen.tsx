'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2 } from 'lucide-react';

export function VideoSplashScreen() {
  const pathname = usePathname();
  const isDashboardRoute = Boolean(
    pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')
  );

  const [isMounted, setIsMounted] = useState(!isDashboardRoute);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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

    // Select video based on initial viewport width
    const isMobileViewport = window.innerWidth < 768;
    setIsMobile(isMobileViewport);

    // Lock body scroll while splash screen is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Try to start music right away on splash screen mount
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-music'));
    }

    const handleMusicStatus = (e: any) => {
      setIsMusicPlaying(Boolean(e.detail?.isPlaying));
    };
    window.addEventListener('music-status', handleMusicStatus);

    // Safety timeout: automatically dismiss after 12s if video stalls or freezes
    timeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, 12000);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('music-status', handleMusicStatus);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

    // Wait for the swipe up animation to complete before unmounting
    setTimeout(() => {
      setIsMounted(false);
    }, 850);
  };

  const handleVideoEnded = () => {
    handleDismiss();
  };

  const handleVideoError = () => {
    handleDismiss();
  };

  if (!isMounted || isDashboardRoute) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Splash Screen"
      onClick={triggerMusic}
      onPointerDown={triggerMusic}
      className={`fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform select-none ${
        isDismissing ? '-translate-y-full rounded-b-[40px] sm:rounded-b-[80px] shadow-2xl' : 'translate-y-0'
      }`}
    >
      {/* Background Video Player */}
      {isMobile !== null && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onPlay={triggerMusic}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className="w-full h-full object-cover select-none pointer-events-none"
        >
          {isMobile ? (
            <source src="/mobile.mp4" type="video/mp4" />
          ) : (
            <>
              <source src="/dekstop.mp4" type="video/mp4" />
              <source src="/desktop.mp4" type="video/mp4" />
            </>
          )}
        </video>
      )}

      {/* Subtle Overlay Gradient for Cinematic Feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

      {/* Top Controls: Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/50 text-white/90 hover:text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
          aria-label="Skip splash screen"
        >
          <span>Skip</span>
          <span className="text-primary font-bold transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </button>
      </div>

      {/* Bottom Hint & Audio Indicator */}
      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center gap-2.5 z-10 pointer-events-auto">
        {isMusicPlaying ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono text-white/90 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-primary font-bold">Now Playing:</span>
            <span>Timeless</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerMusic}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-primary/60 text-xs font-mono text-white shadow-xl animate-pulse cursor-pointer transition-all hover:scale-105"
          >
            <Volume2 className="w-3.5 h-3.5 text-primary" />
            <span>Tap anywhere to enable sound &bull; Timeless</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoSplashScreen;
