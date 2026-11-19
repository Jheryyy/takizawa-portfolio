'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function MusicPlayer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(encodeURI('/The Weeknd, Playboi Carti - Timeless.mp3'));
    audio.preload = 'none';
    audio.volume = 0.55;

    const setStartSecond = () => {
      try {
        if (audio.currentTime < 17) {
          audio.currentTime = 17;
        }
      } catch {
        // Metadata not ready yet
      }
    };

    audio.addEventListener('loadedmetadata', setStartSecond);
    audio.addEventListener('canplay', setStartSecond);

    // Loop back directly to second 17 on song end
    const handleEnded = () => {
      try {
        audio.currentTime = 17;
        audio.play().catch(() => { });
      } catch {
        // Ignored
      }
    };
    audio.addEventListener('ended', handleEnded);

    const handlePlay = () => {
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('music-status', { detail: { isPlaying: true } }));
    };

    const handlePause = () => {
      setIsPlaying(false);
      window.dispatchEvent(new CustomEvent('music-status', { detail: { isPlaying: false } }));
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    audioRef.current = audio;
    return audio;
  };

  useEffect(() => {
    if (isAdminRoute) return;

    // Listen to manual start request
    const handleStartMusicEvent = () => {
      const audio = getAudio();
      if (audio.paused) {
        if (audio.currentTime < 17) {
          try {
            audio.currentTime = 17;
          } catch {}
        }
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('start-music', handleStartMusicEvent);

    return () => {
      window.removeEventListener('start-music', handleStartMusicEvent);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [isAdminRoute]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.currentTime < 17) {
        try {
          audio.currentTime = 17;
        } catch {
          // Ignored
        }
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.log('Audio playback prevented:', err);
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-[#0E0E12]/90 backdrop-blur-xl border border-neutral-300/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 hover:border-primary/50 cursor-pointer group select-none"
      title={isPlaying ? 'Click to pause music' : 'Click to play music'}
    >
      {/* Animated Sound Wave Equalizer Bars Only - Stops/diem when paused */}
      <div className="flex items-end gap-[3px] h-5 px-0.5 shrink-0 justify-center">
        <span
          className={`w-[2.5px] rounded-full bg-primary transition-all duration-300 ${
            isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite] h-4' : 'h-1.5 opacity-40'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-primary transition-all duration-300 ${
            isPlaying ? 'animate-[bounce_1.1s_ease-in-out_0.2s_infinite] h-5' : 'h-3 opacity-40'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-primary transition-all duration-300 ${
            isPlaying ? 'animate-[bounce_0.9s_ease-in-out_0.4s_infinite] h-3' : 'h-1 opacity-40'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-primary transition-all duration-300 ${
            isPlaying ? 'animate-[bounce_1.2s_ease-in-out_0.1s_infinite] h-4.5' : 'h-2 opacity-40'
          }`}
        />
      </div>
    </button>
  );
}

export default MusicPlayer;
