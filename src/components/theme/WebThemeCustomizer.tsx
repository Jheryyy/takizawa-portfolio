'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Palette,
  Sparkles,
  Check,
  X,
  Sun,
  Moon,
  RefreshCw,
  Sliders,
  Copy,
} from 'lucide-react';
import { useThemeColor } from './ThemeColorProvider';
import { ThemeColorPreset, deriveTertiaryColor, normalizeHex } from '@/lib/theme-colors';

export function WebThemeCustomizer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  const { resolvedTheme, setTheme } = useTheme();
  const {
    primaryColor,
    tertiaryColor,
    presetId,
    presets,
    themeStyle,
    setColor,
    setThemeStyle,
    resetColor,
  } = useThemeColor();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customHex, setCustomHex] = useState(primaryColor);
  const [copyNotice, setCopyNotice] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCustomHex(primaryColor);
  }, [primaryColor]);

  // Close when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-theme-customizer', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-theme-customizer', handleOpen);
    };
  }, []);

  // Close when clicking outside panel
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted || isAdminRoute) {
    return null;
  }

  const handleSelectPreset = async (preset: ThemeColorPreset) => {
    setCustomHex(preset.primary);
    await setColor(preset.primary, preset.id);
    if (preset.id === 'crystal-glass') {
      await setThemeStyle('glass');
    }
  };

  const handleCustomHexChange = async (val: string) => {
    setCustomHex(val);
    const clean = val.trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(clean)) {
      const normalized = normalizeHex(clean);
      await setColor(normalized, 'custom');
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(primaryColor);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {/* 1. Floating Quick Action Button on Bottom Left (Opposite Music Player on Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Kustomisasi Tema & Warna Website"
        title="Buka Pengatur Warna & Tema Web"
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-[#0E0E12]/90 backdrop-blur-xl border border-neutral-300/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group select-none"
        style={{
          boxShadow: isOpen ? `0 0 24px ${primaryColor}60` : undefined,
          borderColor: isOpen ? primaryColor : undefined,
        }}
      >
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0E0E12] shadow-sm animate-pulse"
          style={{ backgroundColor: primaryColor }}
        />
        <Palette className="w-5 h-5 text-primary transition-transform group-hover:rotate-12 duration-300" />
      </button>

      {/* 2. Frosted Glass Floating Theme Customizer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start p-4 sm:p-6 sm:pl-22 pointer-events-auto">
          {/* Subtle backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Card with High-End Glassmorphism */}
          <div
            ref={panelRef}
            className={`relative w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl transition-all duration-300 border ${
              isDark
                ? 'bg-[#101016]/92 border-white/15 text-white'
                : 'bg-white/92 border-slate-200 text-slate-900'
            }`}
            style={{
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              boxShadow: `0 24px 60px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,${isDark ? '0.15' : '0.8'})`,
            }}
          >
            {/* Ambient inner soft glow */}
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3.5 border-inherit relative z-10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base leading-tight">
                    Kustomisasi Tema Web
                  </h3>
                  <p className={`text-[11px] font-sans ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Ubah warna aksen &amp; gaya visual langsung
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Row 1: Visual Style & Dark/Light Switches */}
            <div className="grid grid-cols-2 gap-2 relative z-10 text-xs font-mono font-bold">
              {/* Glassmorphism vs Solid Toggle */}
              <div className={`p-1 rounded-xl flex items-center border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setThemeStyle('glass')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    themeStyle === 'glass'
                      ? 'bg-primary text-white shadow-sm'
                      : isDark
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Efek Kaca Transparan & Aurora"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Glass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeStyle('solid')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    themeStyle === 'solid'
                      ? 'bg-primary text-white shadow-sm'
                      : isDark
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Pekat Editorial"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Solid</span>
                </button>
              </div>

              {/* Dark / Light Toggle */}
              <div className={`p-1 rounded-xl flex items-center border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Row 2: Color Presets Grid */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={`font-semibold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Palet Warna Aksen
                </span>
                <span className="text-primary font-bold">
                  {presets.find((p) => p.id === presetId)?.name || 'Custom Color'}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isSelected = presetId === p.id || primaryColor.toLowerCase() === p.primary.toLowerCase();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`group p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 shadow-md bg-primary/10'
                          : isDark
                          ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title={`${p.name} (${p.primary})`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-110 flex items-center justify-center text-white"
                        style={{ backgroundColor: p.primary }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span className="text-[11px] font-mono font-bold truncate">
                        {p.name.replace('Signature ', '').replace('Cyber ', '').replace('Neon ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Custom Color Picker & Copy HEX */}
            <div className="space-y-2 relative z-10 pt-1">
              <div className="flex items-center gap-2">
                {/* Native Color Wheel */}
                <div className="relative group shrink-0">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer bg-transparent opacity-0 absolute inset-0 z-10"
                    title="Pilih warna kustom dengan color wheel"
                  />
                  <div
                    className="w-9 h-9 rounded-xl border-2 border-white/20 shadow-md flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Palette className="w-4 h-4 text-white drop-shadow" />
                  </div>
                </div>

                {/* HEX text input */}
                <div className={`flex items-center px-3 py-1.5 rounded-xl border font-mono text-xs flex-1 ${
                  isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}>
                  <span className="text-neutral-500 mr-1 select-none">#</span>
                  <input
                    type="text"
                    value={customHex.replace(/^#/, '')}
                    onChange={(e) => handleCustomHexChange('#' + e.target.value)}
                    placeholder="FF5A1F"
                    maxLength={7}
                    className="bg-transparent border-none outline-none font-mono uppercase tracking-wider w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyHex}
                  className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDark ? 'border-white/10 hover:bg-white/10 text-neutral-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Salin kode HEX"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyNotice ? 'Tersalin!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Footer Row: Reset button & Active preview chip */}
            <div className="flex items-center justify-between pt-3 border-t border-inherit text-xs font-mono relative z-10">
              <button
                type="button"
                onClick={async () => {
                  await resetColor();
                  await setThemeStyle('glass');
                  setCustomHex('#FF5A1F');
                }}
                className={`text-[11px] underline flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Bawaan</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                  {primaryColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WebThemeCustomizer;
