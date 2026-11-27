'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Code2, Eye, ArrowUpRight } from 'lucide-react';
import { useThemeColor } from '@/components/theme/ThemeColorProvider';
import { BlueprintCrosshairs } from '@/components/ui/BlueprintCrosshairs';
import { hexToRgb } from '@/lib/theme-colors';

type RadiusPreset = '0px' | '12px' | '20px' | '28px';
type ElevationPreset = 'flat' | 'subtle' | 'elevated' | 'glow';
type MotionPreset = 'snappy' | 'editorial' | 'spring';
type SurfacePreset = 'glass' | 'solid';

const MOTION_CURVES: Record<MotionPreset, { label: string; duration: string; easing: string }> = {
  snappy: {
    label: 'Snappy (150ms)',
    duration: '150ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  editorial: {
    label: 'Editorial (350ms)',
    duration: '350ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  spring: {
    label: 'Spring (480ms)',
    duration: '480ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

export function DesignTokenLab() {
  const { primaryColor } = useThemeColor();
  const { rgbString } = hexToRgb(primaryColor);

  const [radius, setRadius] = useState<RadiusPreset>('20px');
  const [elevation, setElevation] = useState<ElevationPreset>('elevated');
  const [motion, setMotion] = useState<MotionPreset>('editorial');
  const [surface, setSurface] = useState<SurfacePreset>('glass');
  const [previewPressed, setPreviewPressed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeToggle, setActiveToggle] = useState(true);

  const getBoxShadow = () => {
    switch (elevation) {
      case 'flat':
        return 'none';
      case 'subtle':
        return '0 8px 24px -10px rgba(0, 0, 0, 0.16)';
      case 'elevated':
        return '0 20px 44px -14px rgba(0, 0, 0, 0.32)';
      case 'glow':
        return `0 18px 46px -12px rgba(${rgbString}, 0.38)`;
    }
  };

  const motionSpec = MOTION_CURVES[motion];

  const cssTokenOutput = `:root {
  --radius-card: ${radius};
  --radius-control: ${radius === '0px' ? '0px' : radius === '28px' ? '9999px' : '12px'};
  --surface-bg: ${surface === 'glass' ? 'rgba(20, 20, 30, 0.58)' : 'var(--color-surface)'};
  --surface-blur: ${surface === 'glass' ? 'blur(20px) saturate(160%)' : 'none'};
  --shadow-card: ${getBoxShadow()};
  --motion-duration: ${motionSpec.duration};
  --motion-ease: ${motionSpec.easing};
  --accent-primary: ${primaryColor};
}`;

  const handleCopyTokens = () => {
    navigator.clipboard?.writeText(cssTokenOutput).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    setRadius('20px');
    setElevation('elevated');
    setMotion('editorial');
    setSurface('glass');
    setActiveToggle(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Controls Panel */}
      <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-canvas border border-hairline space-y-5 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                Token Controls
              </span>
              <h4 className="font-display font-bold text-sm text-neutral-950 dark:text-white">
                Adjust Design System Live
              </h4>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-hairline text-[11px] font-mono text-neutral-500 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Corner Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Border Radius</span>
              <span className="font-mono text-[11px] text-primary font-bold">{radius}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['0px', '12px', '20px', '28px'] as RadiusPreset[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`py-1.5 rounded-lg text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                    radius === r
                      ? 'bg-primary border-primary font-bold'
                      : 'bg-surface border-hairline text-neutral-600 dark:text-neutral-400 hover:border-primary/40'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Surface Style */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Surface Material
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['glass', 'solid'] as SurfacePreset[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSurface(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold border capitalize transition-all cursor-pointer ${
                    surface === s
                      ? 'bg-primary border-primary font-bold'
                      : 'bg-surface border-hairline text-neutral-600 dark:text-neutral-400 hover:border-primary/40'
                  }`}
                >
                  {s === 'glass' ? 'Frosted Glass' : 'Solid Card'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Elevation */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Shadow / Elevation
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['flat', 'subtle', 'elevated', 'glow'] as ElevationPreset[]).map((el) => (
                <button
                  key={el}
                  type="button"
                  onClick={() => setElevation(el)}
                  className={`py-1.5 rounded-lg text-[11px] font-mono font-semibold border capitalize transition-all cursor-pointer ${
                    elevation === el
                      ? 'bg-primary border-primary font-bold'
                      : 'bg-surface border-hairline text-neutral-600 dark:text-neutral-400 hover:border-primary/40'
                  }`}
                >
                  {el}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Motion Curve */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Motion &amp; Easing Curve
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(MOTION_CURVES) as MotionPreset[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotion(m)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-semibold border capitalize transition-all cursor-pointer ${
                    motion === m
                      ? 'bg-primary border-primary font-bold'
                      : 'bg-surface border-hairline text-neutral-600 dark:text-neutral-400 hover:border-primary/40'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Generated CSS Snippet */}
        <div className="pt-4 border-t border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>CSS Design Tokens</span>
            </span>
            <button
              type="button"
              onClick={handleCopyTokens}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-hairline hover:border-primary/40 text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-neutral-950 text-neutral-200 border border-white/10 text-[10.5px] font-mono overflow-x-auto leading-relaxed">
            {cssTokenOutput}
          </pre>
        </div>
      </div>

      {/* Right Interactive Preview Stage */}
      <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-canvas border border-hairline relative overflow-hidden flex flex-col justify-between min-h-[380px]">
        <BlueprintCrosshairs />
        {/* Ambient Accent Backdrop so Glass Blur is visibly testable */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-6">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Component Stage</span>
          </span>
          <span>{motionSpec.label}</span>
        </div>

        {/* Live Reactive Preview Component */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-4">
          <div
            onMouseDown={() => setPreviewPressed(true)}
            onMouseUp={() => setPreviewPressed(false)}
            onMouseLeave={() => setPreviewPressed(false)}
            className="w-full max-w-md p-6 border border-hairline cursor-pointer select-none"
            style={{
              borderRadius: radius,
              boxShadow: getBoxShadow(),
              backgroundColor:
                surface === 'glass' ? 'rgba(var(--color-primary-rgb), 0.06)' : 'var(--color-surface)',
              backdropFilter: surface === 'glass' ? 'blur(20px) saturate(160%)' : 'none',
              WebkitBackdropFilter: surface === 'glass' ? 'blur(20px) saturate(160%)' : 'none',
              transform: previewPressed ? 'scale(0.975)' : 'scale(1)',
              transitionProperty: 'all',
              transitionDuration: motionSpec.duration,
              transitionTimingFunction: motionSpec.easing,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold bg-primary/15 text-primary border border-primary/25"
                style={{
                  borderRadius: radius === '0px' ? '0px' : '9999px',
                  transition: `all ${motionSpec.duration} ${motionSpec.easing}`,
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>UI Token Card</span>
              </span>

              {/* Interactive Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={activeToggle}
                aria-label="Toggle preview state"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToggle((prev) => !prev);
                }}
                className="w-11 h-6 p-0.5 flex items-center border border-hairline cursor-pointer"
                style={{
                  borderRadius: radius === '0px' ? '2px' : '9999px',
                  backgroundColor: activeToggle ? primaryColor : 'var(--color-elevated)',
                  transition: `all ${motionSpec.duration} ${motionSpec.easing}`,
                }}
              >
                <span
                  className="w-4 h-4 bg-white shadow-sm block"
                  style={{
                    borderRadius: radius === '0px' ? '1px' : '9999px',
                    transform: activeToggle ? 'translateX(20px)' : 'translateX(0px)',
                    transition: `transform ${motionSpec.duration} ${motionSpec.easing}`,
                  }}
                />
              </button>
            </div>

            <h5 className="font-display font-bold text-lg text-neutral-950 dark:text-white">
              Crafted Design System
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
              Klik atau tahan kartu ini untuk menguji kurva animasi{' '}
              <strong className="text-primary">{motion}</strong>, radius{' '}
              <strong className="text-primary">{radius}</strong>, dan material{' '}
              <strong className="text-primary">{surface}</strong>.
            </p>

            <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-neutral-500">
                State: {activeToggle ? 'Active' : 'Muted'}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary font-sans text-xs font-bold shadow-sm hover:opacity-90"
                style={{
                  borderRadius: radius === '0px' ? '0px' : radius === '28px' ? '9999px' : '12px',
                  transition: `all ${motionSpec.duration} ${motionSpec.easing}`,
                }}
              >
                <span>Test Action</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-center text-[11px] font-mono text-neutral-400 pt-2">
          Tip: Coba klik &amp; tahan kartu atau ubah switch di kanan atas kartu
        </p>
      </div>
    </div>
  );
}

export default DesignTokenLab;
