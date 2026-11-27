'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Monitor, Smartphone, Eye, Columns2, Grid3x3, MoveHorizontal } from 'lucide-react';
import { ProjectItem } from '@/types/portfolio';

interface ProjectShowcaseFrameProps {
  project: ProjectItem;
}

type DeviceMode = 'desktop' | 'mobile';
type InspectMode = 'final' | 'compare' | 'wireframe';

export function ProjectShowcaseFrame({ project }: ProjectShowcaseFrameProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [inspectMode, setInspectMode] = useState<InspectMode>('compare');
  const [sliderPos, setSliderPos] = useState<number>(36);
  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateSliderFromClientX = (clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(96, Math.max(4, pct)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inspectMode !== 'compare') return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || inspectMode !== 'compare') return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const effectiveClipPercent =
    inspectMode === 'final' ? 0 : inspectMode === 'wireframe' ? 100 : sliderPos;

  return (
    <section className="space-y-4">
      {/* Interactive Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 rounded-2xl bg-surface border border-hairline">
        {/* Device Switcher */}
        <div className="inline-flex items-center p-1 rounded-full bg-canvas border border-hairline">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              device === 'desktop'
                ? 'bg-primary font-bold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              device === 'mobile'
                ? 'bg-primary font-bold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Wireframe / Compare / Final UI Switcher */}
        <div className="inline-flex items-center p-1 rounded-full bg-canvas border border-hairline">
          <button
            type="button"
            onClick={() => setInspectMode('final')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              inspectMode === 'final'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Final UI</span>
          </button>
          <button
            type="button"
            onClick={() => setInspectMode('compare')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              inspectMode === 'compare'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
          <button
            type="button"
            onClick={() => setInspectMode('wireframe')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              inspectMode === 'wireframe'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* Stage Container */}
      <div className="p-4 sm:p-8 rounded-3xl bg-surface border border-hairline flex items-center justify-center overflow-hidden">
        {device === 'desktop' ? (
          /* DESKTOP BROWSER FRAME */
          <div className="w-full rounded-2xl border border-hairline bg-[#0B0B10] overflow-hidden shadow-2xl">
            {/* Browser Top Chrome */}
            <div className="px-4 py-2.5 bg-[#121218] border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400 truncate max-w-xs sm:max-w-md">
                {project.liveUrl || `https://jtakizawa.my.id/projects/${project.id}`}
              </div>
              <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                1440 &times; 810
              </span>
            </div>

            {/* Interactive Compare Viewport */}
            <div
              ref={stageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative w-full aspect-[16/9] sm:aspect-[21/9] select-none overflow-hidden ${
                inspectMode === 'compare' ? 'cursor-ew-resize' : ''
              }`}
            >
              {/* Layer 1: Final UI */}
              <Image
                src={project.image}
                alt={project.title}
                fill
                unoptimized={project.image?.startsWith('data:')}
                sizes="100vw"
                priority
                className="object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

              {/* Layer 2: Wireframe / Blueprint Overlay clipped to sliderPos */}
              {effectiveClipPercent > 0 && (
                <div
                  className="absolute inset-0 bg-[#0A0F1A] text-sky-300 pointer-events-none overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - effectiveClipPercent}% 0 0)`,
                    WebkitClipPath: `inset(0 ${100 - effectiveClipPercent}% 0 0)`,
                  }}
                >
                  {/* Blueprint Grid */}
                  <div
                    className="absolute inset-0 opacity-35"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(56,189,248,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.22) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />
                  {/* Architectural Wireframe Skeleton */}
                  <div className="relative z-10 h-full w-full p-6 sm:p-10 flex flex-col justify-between">
                    <div className="flex items-center justify-between border border-dashed border-sky-400/40 rounded-xl p-3 bg-sky-950/30">
                      <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase">
                        FIGMA WIREFRAME &bull; 8PX GRID
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-12 h-2.5 rounded bg-sky-400/30" />
                        <span className="w-12 h-2.5 rounded bg-sky-400/30" />
                        <span className="w-16 h-5 rounded-full border border-sky-400/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 my-auto py-4">
                      <div className="col-span-7 space-y-2.5">
                        <span className="inline-block px-2 py-0.5 border border-sky-400/40 rounded text-[10px] font-mono">
                          HERO CONTAINER • {project.category.toUpperCase()}
                        </span>
                        <div className="h-6 sm:h-9 w-4/5 rounded border border-dashed border-sky-400/50 bg-sky-400/10 flex items-center px-3 font-mono text-[11px] truncate">
                          H1: {project.title}
                        </div>
                        <div className="h-3 w-3/4 rounded bg-sky-400/20" />
                        <div className="h-3 w-1/2 rounded bg-sky-400/15" />
                        <div className="flex gap-2 pt-2">
                          <span className="h-7 w-24 rounded-full border border-sky-400/60 bg-sky-400/15" />
                          <span className="h-7 w-24 rounded-full border border-dashed border-sky-400/40" />
                        </div>
                      </div>
                      <div className="col-span-5 rounded-xl border border-dashed border-sky-400/50 bg-sky-950/40 flex flex-col items-center justify-center p-4 text-center">
                        <span className="font-mono text-[10px] text-sky-300/80">MEDIA SLOT</span>
                        <span className="font-mono text-[9px] text-sky-400/60 mt-1">
                          {project.arch}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-sky-300/80 border-t border-dashed border-sky-400/30 pt-2">
                      <span>ROLE: {project.role.toUpperCase()}</span>
                      <span>OUTCOME: {project.outcome.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Slider Handle */}
              {inspectMode === 'compare' && (
                <div
                  className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)] pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-neutral-950 shadow-xl border border-black/15 flex items-center justify-center">
                    <MoveHorizontal className="w-4 h-4" />
                  </div>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-sky-950/90 border border-sky-400/40 text-sky-300 font-mono text-[9px] uppercase whitespace-nowrap">
                    Wireframe
                  </span>
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 border border-white/20 text-white font-mono text-[9px] uppercase whitespace-nowrap">
                    Final UI
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-white text-[11px] font-mono pointer-events-none">
                <span>Production Deployment &bull; {project.outcome}</span>
                <span>{project.arch}</span>
              </div>
            </div>
          </div>
        ) : (
          /* MOBILE DEVICE FRAME */
          <div className="w-full flex flex-col items-center py-2">
            <div className="relative w-full max-w-[300px] sm:max-w-[330px] rounded-[42px] border-[6px] border-neutral-800 dark:border-neutral-700 bg-[#0B0B10] shadow-2xl overflow-hidden">
              {/* Dynamic Island */}
              <div className="relative z-30 pt-3 pb-2 flex justify-center bg-black/40 backdrop-blur-md">
                <div className="w-24 h-5 rounded-full bg-black border border-white/10 flex items-center justify-end pr-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-950 border border-indigo-400/30" />
                </div>
              </div>

              <div
                ref={stageRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative w-full aspect-[9/16] select-none overflow-hidden ${
                  inspectMode === 'compare' ? 'cursor-ew-resize' : ''
                }`}
              >
                <Image
                  src={project.image}
                  alt={`${project.title} Mobile Preview`}
                  fill
                  unoptimized={project.image?.startsWith('data:')}
                  sizes="330px"
                  priority
                  className="object-cover pointer-events-none"
                />

                {effectiveClipPercent > 0 && (
                  <div
                    className="absolute inset-0 bg-[#0A0F1A] text-sky-300 pointer-events-none overflow-hidden"
                    style={{
                      clipPath: `inset(0 ${100 - effectiveClipPercent}% 0 0)`,
                      WebkitClipPath: `inset(0 ${100 - effectiveClipPercent}% 0 0)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-35"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(56,189,248,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.22) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between border border-dashed border-sky-400/40 rounded-lg px-2.5 py-2">
                        <span className="font-mono text-[9px]">MOBILE WIREFRAME</span>
                        <span className="w-5 h-3 border border-sky-400/40 rounded" />
                      </div>
                      <div className="space-y-3 my-auto">
                        <div className="h-28 rounded-xl border border-dashed border-sky-400/50 bg-sky-950/40 flex items-center justify-center font-mono text-[10px]">
                          MEDIA CANVAS
                        </div>
                        <div className="h-5 w-4/5 rounded border border-sky-400/40 bg-sky-400/10" />
                        <div className="h-3 w-full rounded bg-sky-400/20" />
                        <div className="h-3 w-2/3 rounded bg-sky-400/15" />
                        <div className="h-9 w-full rounded-full border border-sky-400/60 bg-sky-400/15" />
                      </div>
                      <div className="text-[9px] font-mono text-center text-sky-300/75">
                        390 &times; 844 VIEWPORT
                      </div>
                    </div>
                  </div>
                )}

                {inspectMode === 'compare' && (
                  <div
                    className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-neutral-950 shadow-xl flex items-center justify-center">
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator */}
              <div className="py-2.5 flex justify-center bg-black/50">
                <div className="w-24 h-1 rounded-full bg-white/35" />
              </div>
            </div>
          </div>
        )}
      </div>

      {inspectMode === 'compare' && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-[11px] font-mono text-neutral-500">Wireframe</span>
          <input
            type="range"
            min={4}
            max={96}
            value={Math.round(sliderPos)}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            aria-label="Compare wireframe and final UI"
            className="w-48 accent-[var(--color-primary)] cursor-pointer"
          />
          <span className="text-[11px] font-mono text-neutral-500">Final UI</span>
        </div>
      )}
    </section>
  );
}

export default ProjectShowcaseFrame;
