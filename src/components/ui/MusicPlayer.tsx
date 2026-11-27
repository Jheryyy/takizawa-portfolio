'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

const BGM_SRC =
  process.env.NEXT_PUBLIC_BGM_URL || encodeURI('/The Weeknd, Playboi Carti - Timeless.mp3');

export function MusicPlayer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(BGM_SRC);
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

    const handleEnded = () => {
      try {
        audio.currentTime = 17;
        audio.play().catch(() => {});
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
        .catch((err) => {
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
    <div className="no-print fixed bottom-6 right-6 z-40 select-none">
      <div
        className={`flex items-center h-11 rounded-full bg-white/90 dark:bg-[#0E0E12]/90 backdrop-blur-xl border border-neutral-300/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden ${
          isPlaying ? 'pl-3.5 pr-1.5 gap-2.5 border-primary/40' : 'w-11 justify-center hover:scale-105 hover:border-primary/50'
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          title={isPlaying ? 'Click to pause music' : 'Click to play music'}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Equalizer Bars */}
          <div className="flex items-end gap-[2.5px] h-4 shrink-0 justify-center">
            <span
              className={`w-[2px] rounded-full bg-primary transition-all duration-300 ${
                isPlaying && !isMuted ? 'animate-[bounce_0.8s_ease-in-out_infinite] h-3.5' : 'h-1.5 opacity-45'
              }`}
            />
            <span
              className={`w-[2px] rounded-full bg-primary transition-all duration-300 ${
                isPlaying && !isMuted ? 'animate-[bounce_1.1s_ease-in-out_0.2s_infinite] h-4' : 'h-2.5 opacity-45'
              }`}
            />
            <span
              className={`w-[2px] rounded-full bg-primary transition-all duration-300 ${
                isPlaying && !isMuted ? 'animate-[bounce_0.9s_ease-in-out_0.4s_infinite] h-2.5' : 'h-1 opacity-45'
              }`}
            />
            <span
              className={`w-[2px] rounded-full bg-primary transition-all duration-300 ${
                isPlaying && !isMuted ? 'animate-[bounce_1.2s_ease-in-out_0.1s_infinite] h-3.5' : 'h-2 opacity-45'
              }`}
            />
          </div>

          {/* Expandable Now Playing label */}
          {isPlaying && (
            <div className="hidden sm:flex flex-col items-start text-left leading-none pr-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                {isMuted ? 'Muted' : 'Playing'}
              </span>
              <span className="text-[11px] font-sans font-semibold text-neutral-800 dark:text-neutral-200 max-w-[96px] truncate">
                Timeless
              </span>
            </div>
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1 pl-1.5 border-l border-neutral-200 dark:border-white/10">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute music' : 'Mute music'}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicPlayer;
