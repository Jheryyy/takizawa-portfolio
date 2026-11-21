'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
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
  Lock,
  ShieldCheck,
  ExternalLink,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useThemeColor } from './ThemeColorProvider';
import { ThemeColorPreset, normalizeHex, isUserAdmin, syncThemeToSupabase } from '@/lib/theme-colors';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved'>('idle');

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCustomHex(primaryColor);
    setIsAdmin(isUserAdmin());
  }, [primaryColor]);

  // Update isAdmin whenever panel opens
  useEffect(() => {
    if (isOpen) {
      setIsAdmin(isUserAdmin());
    }
  }, [isOpen]);

  // Close when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleOpen = () => {
      setIsAdmin(isUserAdmin());
      setIsOpen(true);
    };

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
    if (!isAdmin) return;
    setCustomHex(preset.primary);
    await setColor(preset.primary, preset.id);
    if (preset.id === 'crystal-glass') {
      await setThemeStyle('glass');
    }
    triggerSyncFeedback();
  };

  const handleCustomHexChange = async (val: string) => {
    if (!isAdmin) return;
    setCustomHex(val);
    const clean = val.trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(clean)) {
      const normalized = normalizeHex(clean);
      await setColor(normalized, 'custom');
      triggerSyncFeedback();
    }
  };

  const triggerSyncFeedback = () => {
    setSyncStatus('saved');
    setTimeout(() => {
      setSyncStatus('idle');
    }, 2500);
  };

  const handleManualSync = async () => {
    if (!isAdmin) return;
    setSyncStatus('syncing');
    try {
      await syncThemeToSupabase({
        primaryColor,
        tertiaryColor,
        colorPresetId: presetId,
        themeStyle,
      });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('idle');
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(primaryColor);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const isDark = resolvedTheme === 'dark';
  const activePreset = presets.find((p) => p.id === presetId);

  return (
    <>
      {/* Floating Quick Action Button on Bottom Left */}
      <button
        type="button"
        onClick={() => {
          setIsAdmin(isUserAdmin());
          setIsOpen((prev) => !prev);
        }}
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

      {/* Floating Modal Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start p-4 sm:p-6 sm:pl-22 pointer-events-auto">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div
            ref={panelRef}
            className={`relative w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl transition-all duration-300 border ${
              isDark
                ? 'bg-[#101018]/92 border-white/15 text-white'
                : 'bg-white/94 border-slate-200 text-slate-900'
            }`}
            style={{
              backdropFilter: 'blur(32px) saturate(210%)',
              WebkitBackdropFilter: 'blur(32px) saturate(210%)',
              boxShadow: `0 24px 60px -12px rgba(0,0,0,0.5), inset 0 1.5px 0 0 rgba(255,255,255,${isDark ? '0.2' : '0.9'})`,
            }}
          >
            {/* Ambient soft glow */}
            <div
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: primaryColor }}
            />

            {/* CASE 1: USER IS NOT LOGGED IN AS ADMIN -> ADMIN GATE DIALOG */}
            {!isAdmin ? (
              <div className="space-y-5 relative z-10">
                {/* Header with Locked status */}
                <div className="flex items-start justify-between border-b pb-4 border-inherit">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Akses Terbatas: Admin Only</span>
                      </div>
                      <h3 className="font-display font-black text-lg leading-tight">
                        Kustomisasi Tema Terkunci
                      </h3>
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

                {/* Description */}
                <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                  Pengaturan warna aksen dan tema <strong>Liquid Glass</strong> website ini disinkronkan langsung ke cloud Supabase dan berlaku untuk seluruh pengunjung di semua perangkat.
                  Untuk menjaga konsistensi tampilan portofolio, <strong>perubahan tema hanya dapat dilakukan oleh Administrator setelah login</strong>.
                </p>

                {/* Current Active Theme Status Card */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Status Tema Aktif Saat Ini:
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-muted">Gaya Visual:</span>
                    <span className="font-bold flex items-center gap-1.5 text-primary">
                      {themeStyle === 'glass' ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Liquid Glass (Frosted Glassmorphism)</span>
                        </>
                      ) : (
                        <>
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Solid Minimalist Editorial</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-muted">Palet Aksen:</span>
                    <span className="font-bold flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span>{activePreset?.name || 'Custom'}</span>
                      <span className="font-mono text-[11px] text-muted">({primaryColor})</span>
                    </span>
                  </div>
                </div>

                {/* Dark/Light mode switcher still allowed for visitor comfort */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-muted">
                    Mode Penglihatan Pribadi:
                  </div>
                  <div className={`p-1 rounded-xl flex items-center border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-mono font-bold ${
                        isDark
                          ? 'bg-white text-black shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      <span>Dark Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-mono font-bold ${
                        !isDark
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-slate-900'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>Light Mode</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-sans font-bold text-xs shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Masuk Dashboard Admin untuk Mengubah Tema</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-sans font-semibold transition-colors cursor-pointer border ${
                      isDark
                        ? 'border-white/10 hover:bg-white/5 text-neutral-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* CASE 2: USER IS LOGGED IN AS ADMIN -> FULL STUDIO CONTROLS */
              <div className="space-y-4 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-3 border-inherit">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Admin Studio • Live Sync</span>
                      </div>
                      <h3 className="font-display font-extrabold text-base leading-tight">
                        Kustomisasi Tema Web
                      </h3>
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

                {/* Cloud Sync Status Banner */}
                <div
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-mono border transition-all ${
                    syncStatus === 'saved'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : isDark
                      ? 'bg-white/5 text-neutral-400 border-white/10'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {syncStatus === 'saved'
                        ? 'Tersinkron ke seluruh pengunjung!'
                        : syncStatus === 'syncing'
                        ? 'Menyinkronkan ke Supabase...'
                        : 'Sinkronisasi otomatis ke semua pengunjung'}
                    </span>
                  </div>
                  {syncStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                {/* Row 1: Visual Style (Liquid Glass vs Solid) & Dark/Light Switches */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                  {/* Glassmorphism vs Solid Toggle */}
                  <div className={`p-1 rounded-xl flex items-center border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={async () => {
                        await setThemeStyle('glass');
                        triggerSyncFeedback();
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        themeStyle === 'glass'
                          ? 'bg-primary text-white shadow-sm'
                          : isDark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Efek Liquid Glass Transparan & Aurora"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Liquid Glass</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await setThemeStyle('solid');
                        triggerSyncFeedback();
                      }}
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-semibold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Palet Warna Aksen (9 Pilihan)
                    </span>
                    <span className="text-primary font-bold">
                      {activePreset?.name || 'Custom Color'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
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
                <div className="space-y-2 pt-0.5">
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
                        placeholder="38BDF8"
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

                {/* Action Row: Manual sync button */}
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white font-sans font-bold text-xs shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Simpan &amp; Publikasikan ke Semua Pengunjung</span>
                </button>

                {/* Footer Row: Reset button & Active preview chip */}
                <div className="flex items-center justify-between pt-2.5 border-t border-inherit text-xs font-mono">
                  <button
                    type="button"
                    onClick={async () => {
                      await resetColor();
                      await setThemeStyle('glass');
                      setCustomHex('#38BDF8');
                      triggerSyncFeedback();
                    }}
                    className={`text-[11px] underline flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset ke Crystal Glass</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                    <span className="text-[11px] font-bold" style={{ color: primaryColor }}>
                      {primaryColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default WebThemeCustomizer;
