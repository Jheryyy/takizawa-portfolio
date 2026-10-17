'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MusicPlayer = dynamic(() => import('@/components/ui/MusicPlayer'), { ssr: false });
const VideoSplashScreen = dynamic(() => import('@/components/ui/VideoSplashScreen'), { ssr: false });
const TargetCursor = dynamic(() => import('@/components/ui/TargetCursor'), { ssr: false });

export function ClientEnhancements() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768 && window.matchMedia('(pointer: fine)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop, { passive: true });
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      <MusicPlayer />
      {isDesktop && <VideoSplashScreen />}
      {isDesktop && (
        <TargetCursor
          spinDuration={0}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.35}
          size={30}
          cornerSize={10}
          thickness={1.5}
          padding={8}
          targetSelector="a, button, input, textarea, select, [role='button'], .cursor-target"
        />
      )}
    </>
  );
}
