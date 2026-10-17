'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Music2 } from 'lucide-react';

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

    const tryPlay = () => {
      const audio = getAudio();
      if (audio.paused) {
        if (audio.currentTime < 17) {
          try {
            audio.currentTime = 17;
          } catch {}
        }
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            cleanupAutoPlayListeners();
          })
          .catch(() => {
            // Autoplay blocked until trusted user gesture
          });
      }
    };

    const interactionEvents = ['click', 'touchstart', 'pointerdown'];

    const cleanupAutoPlayListeners = () => {
      interactionEvents.forEach(evt => {
        window.removeEventListener(evt, tryPlay);
      });
    };

    interactionEvents.forEach(evt => {
      window.addEventListener(evt, tryPlay, { passive: true, once: true });
    });

    const handleStartMusicEvent = () => {
      tryPlay();
    };

    window.addEventListener('start-music', handleStartMusicEvent);

    return () => {
      window.removeEventListener('start-music', handleStartMusicEvent);
      cleanupAutoPlayListeners();
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
    <aside
      aria-label="Background Music Player"
      className="fixed bottom-6 right-6 z-40 select-none cursor-pointer"
      onClick={() => togglePlay()}
      title={isPlaying ? 'Click to pause music' : 'Click to play music'}
    >
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-white/90 dark:bg-[#0E0E12]/90 backdrop-blur-xl border border-neutral-300/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 group">
        {/* Play / Pause Circular Action Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary hover:bg-tertiary text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md shrink-0 cursor-pointer"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          )}
        </button>

        {/* Animated Sound Wave Equalizer Bars */}
        <div className="flex items-end gap-1 h-4 px-0.5 shrink-0">
          <span
            className={`w-0.5 rounded-full bg-primary transition-all duration-200 ${isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite] h-3.5' : 'h-1.5 opacity-40'
              }`}
          />
          <span
            className={`w-0.5 rounded-full bg-primary transition-all duration-200 ${isPlaying ? 'animate-[bounce_1.1s_ease-in-out_0.2s_infinite] h-4' : 'h-2 opacity-40'
              }`}
          />
          <span
            className={`w-0.5 rounded-full bg-primary transition-all duration-200 ${isPlaying ? 'animate-[bounce_0.9s_ease-in-out_0.4s_infinite] h-2.5' : 'h-1 opacity-40'
              }`}
          />
          <span
            className={`w-0.5 rounded-full bg-primary transition-all duration-200 ${isPlaying ? 'animate-[bounce_1.2s_ease-in-out_0.1s_infinite] h-3.5' : 'h-2 opacity-40'
              }`}
          />
        </div>

        {/* Music Title: Timeless */}
        <div className="flex items-center gap-1.5 pr-1">
          <Music2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-mono text-xs font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
            Timeless
          </span>
        </div>

        {/* Mute / Unmute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

export default MusicPlayer;
