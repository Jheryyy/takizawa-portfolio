'use client';

import React from 'react';
import { Palette, RefreshCw, Save, Sparkles, Check, Sliders, Copy, Moon, Sun } from 'lucide-react';
import {
  THEME_COLOR_PRESETS,
  ThemeColorPreset,
  deriveTertiaryColor,
  getContrastTextColor,
} from '@/lib/theme-colors';

interface AdminThemeTabProps {
  isDark: boolean;
  selectedThemeColor: string;
  selectedPresetId: string;
  customHexInput: string;
  themeStyle: 'solid' | 'glass';
  isSavingThemeColor: boolean;
  onResetThemeColor: () => void;
  onSaveThemeColor: () => void;
  onToggleThemeStyle: (style: 'solid' | 'glass') => void;
  onSelectPresetColor: (preset: ThemeColorPreset) => void;
  onCustomHexChange: (val: string) => void;
  onCopyHex: (hex: string) => void;
}

export function AdminThemeTab({
  isDark,
  selectedThemeColor,
  selectedPresetId,
  customHexInput,
  themeStyle,
  isSavingThemeColor,
  onResetThemeColor,
  onSaveThemeColor,
  onToggleThemeStyle,
  onSelectPresetColor,
  onCustomHexChange,
  onCopyHex,
}: AdminThemeTabProps) {
  const onPrimaryColor = getContrastTextColor(selectedThemeColor);
  const tertiaryColor = deriveTertiaryColor(selectedThemeColor);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-primary/5 border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <span>Kustomisasi Warna &amp; Tema Web Portofolio</span>
            </h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Ubah warna aksen utama &amp; efek tampilan (Liquid Glass / Solid) secara real-time tanpa menimpa pilihan Dark/Light pengunjung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetThemeColor}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-2 ${
              isDark
                ? 'border-white/10 hover:bg-white/10 text-neutral-300'
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={onSaveThemeColor}
            disabled={isSavingThemeColor}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-primary hover:opacity-90 shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSavingThemeColor ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingThemeColor ? 'Menyimpan...' : 'Simpan & Terapkan'}</span>
          </button>
        </div>
      </div>

      {/* Active Color Overview */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#101016] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: selectedThemeColor,
                boxShadow: `0 10px 30px ${selectedThemeColor}40`,
                color: onPrimaryColor,
              }}
            >
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                  Warna Utama Aktif
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 font-bold">
                  {selectedPresetId === 'custom' ? 'Kustom' : 'Preset Siap Pakai'}
                </span>
              </div>
              <h4 className="font-display font-extrabold text-2xl tracking-tight mt-0.5">
                {THEME_COLOR_PRESETS.find((p) => p.id === selectedPresetId)?.name || 'Custom Theme Accent'}
              </h4>
              <p className={`text-xs mt-1 font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                HEX: <strong className="text-primary font-bold">{selectedThemeColor}</strong> &bull; Tertiary: {tertiaryColor}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: selectedThemeColor, color: onPrimaryColor }}
            >
              <span>CTA Button</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-primary/15 text-primary border border-primary/30">
              Tag Badge
            </div>
          </div>
        </div>
      </div>

      {/* Theme Style: Glass vs Solid */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#101016] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-inherit">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Gaya Visual Tampilan (Theme Style)</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Pilih antara tampilan kaca buram transparan (Frosted Glassmorphism) atau tampilan pekat minimalis (Solid Editorial).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onToggleThemeStyle('glass')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
              themeStyle === 'glass'
                ? 'border-primary ring-2 ring-primary/30 shadow-xl'
                : isDark
                ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base">Frosted Glassmorphism</h4>
                  <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Kaca Buram Transparan &amp; Efek Aurora
                  </span>
                </div>
              </div>
              {themeStyle === 'glass' && (
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => onToggleThemeStyle('solid')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
              themeStyle === 'solid'
                ? 'border-primary ring-2 ring-primary/30 shadow-xl'
                : isDark
                ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    isDark ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base">Solid Editorial</h4>
                  <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Klasik Pekat &amp; Garis Tegas
                  </span>
                </div>
              </div>
              {themeStyle === 'solid' && (
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl">Palet Warna Unggulan ({THEME_COLOR_PRESETS.length} Pilihan)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_COLOR_PRESETS.map((preset) => {
            const isSelected =
              selectedPresetId === preset.id &&
              selectedThemeColor.toLowerCase() === preset.primary.toLowerCase();
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPresetColor(preset)}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-[#151520] border-primary shadow-lg ring-2 ring-primary/30'
                      : 'bg-white border-primary shadow-lg ring-2 ring-primary/30'
                    : isDark
                    ? 'bg-[#101016] border-white/10 hover:border-white/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
                style={{ borderColor: isSelected ? preset.primary : undefined }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl shadow-md border border-white/20 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.tertiary} 100%)`,
                        }}
                      />
                      <div>
                        <h4 className="font-display font-bold text-sm leading-tight">{preset.name}</h4>
                        <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                          {preset.label}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: preset.primary, color: getContrastTextColor(preset.primary) }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className={`text-xs line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-inherit text-[10px] font-mono">
                  <span
                    className="font-bold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${preset.primary}18`, color: preset.primary }}
                  >
                    {preset.primary}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-white/5 text-neutral-300' : 'bg-slate-100 text-slate-600'}`}>
                    {preset.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Picker + Live Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div
          className={`lg:col-span-6 p-6 rounded-3xl border space-y-5 ${
            isDark ? 'bg-[#101016] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span>Pemilih Warna Kustom (HEX)</span>
          </h3>

          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <input
                type="color"
                value={selectedThemeColor}
                onChange={(e) => onCustomHexChange(e.target.value)}
                className="w-14 h-14 rounded-2xl cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div
                className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-lg flex items-center justify-center"
                style={{ backgroundColor: selectedThemeColor, color: onPrimaryColor }}
              >
                <Palette className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div
                className={`flex items-center px-3.5 py-2.5 rounded-xl border font-mono text-sm flex-1 ${
                  isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <span className="text-neutral-500 select-none mr-1">#</span>
                <input
                  type="text"
                  value={customHexInput.replace(/^#/, '')}
                  onChange={(e) => onCustomHexChange('#' + e.target.value)}
                  maxLength={7}
                  className="bg-transparent border-none outline-none font-mono uppercase tracking-wider w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => onCopyHex(selectedThemeColor)}
                className={`p-2.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  isDark ? 'border-white/10 hover:bg-white/10 text-neutral-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
                title="Salin HEX Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: 'Lime', hex: '#84CC16' },
              { name: 'Sky', hex: '#0EA5E9' },
              { name: 'Fuchsia', hex: '#D946EF' },
              { name: 'Teal', hex: '#14B8A6' },
              { name: 'Gold', hex: '#EAB308' },
              { name: 'Ruby', hex: '#E11D48' },
            ].map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => onCustomHexChange(swatch.hex)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all hover:scale-105 cursor-pointer border-inherit"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                <span>{swatch.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Cards */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[#0A0A0C] border border-white/10 text-white space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Dark Canvas
              </span>
              <span style={{ color: selectedThemeColor }}>{selectedThemeColor}</span>
            </div>
            <h4 className="font-display font-bold text-base">Shaping Digital Experiences</h4>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-md"
              style={{ backgroundColor: selectedThemeColor, color: onPrimaryColor }}
            >
              Explore Works
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-[#FAFAFA] border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Canvas
              </span>
              <span style={{ color: selectedThemeColor }}>{selectedThemeColor}</span>
            </div>
            <h4 className="font-display font-bold text-base">Shaping Digital Experiences</h4>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-md"
              style={{ backgroundColor: selectedThemeColor, color: onPrimaryColor }}
            >
              Explore Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
