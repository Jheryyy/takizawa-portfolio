'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  THEME_COLOR_PRESETS,
  DEFAULT_THEME_COLOR,
  DEFAULT_TERTIARY_COLOR,
  ThemeColorPreset,
  applyThemeColors,
  getStoredThemeColor,
  deriveTertiaryColor,
} from '@/lib/theme-colors';
import { supabase } from '@/lib/supabase';

interface ThemeColorContextType {
  primaryColor: string;
  tertiaryColor: string;
  presetId: string;
  presets: ThemeColorPreset[];
  setColor: (hex: string, presetId?: string) => Promise<void>;
  resetColor: () => Promise<void>;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  primaryColor: DEFAULT_THEME_COLOR,
  tertiaryColor: DEFAULT_TERTIARY_COLOR,
  presetId: 'orange',
  presets: THEME_COLOR_PRESETS,
  setColor: async () => {},
  resetColor: async () => {},
});

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_THEME_COLOR);
  const [tertiaryColor, setTertiaryColor] = useState<string>(DEFAULT_TERTIARY_COLOR);
  const [presetId, setPresetId] = useState<string>('orange');

  // Initialize and apply theme colors on mount
  useEffect(() => {
    // 1. Immediately read from localStorage
    const stored = getStoredThemeColor();
    setPrimaryColor(stored.primary);
    setTertiaryColor(stored.tertiary);
    setPresetId(stored.presetId);
    applyThemeColors(stored.primary, stored.tertiary, stored.presetId);

    // 2. Fetch from Supabase site_content in background
    let isCancelled = false;
    const fetchRemoteTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'primary')
          .maybeSingle();

        if (!error && data && data.content && !isCancelled) {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          if (parsed.primaryColor && parsed.primaryColor.startsWith('#')) {
            const remotePrimary = parsed.primaryColor;
            const remoteTertiary = parsed.tertiaryColor || deriveTertiaryColor(remotePrimary);
            const remotePreset = parsed.colorPresetId || 'custom';

            setPrimaryColor(remotePrimary);
            setTertiaryColor(remoteTertiary);
            setPresetId(remotePreset);
            applyThemeColors(remotePrimary, remoteTertiary, remotePreset);
          }
        }
      } catch {
        // Silently catch network or offline errors
      }
    };

    fetchRemoteTheme();

    // 3. Listen to local broadcast events
    const handleThemeUpdate = (e: any) => {
      if (e.detail && e.detail.primary) {
        setPrimaryColor(e.detail.primary);
        if (e.detail.tertiary) setTertiaryColor(e.detail.tertiary);
        if (e.detail.presetId) setPresetId(e.detail.presetId);
      }
    };

    const handleSiteContentUpdate = (e: any) => {
      if (e.detail && e.detail.primaryColor) {
        const pColor = e.detail.primaryColor;
        const tColor = e.detail.tertiaryColor || deriveTertiaryColor(pColor);
        const pPreset = e.detail.colorPresetId || 'custom';
        setPrimaryColor(pColor);
        setTertiaryColor(tColor);
        setPresetId(pPreset);
      }
    };

    window.addEventListener('theme-color-updated', handleThemeUpdate);
    window.addEventListener('site-content-updated', handleSiteContentUpdate);

    return () => {
      isCancelled = true;
      window.removeEventListener('theme-color-updated', handleThemeUpdate);
      window.removeEventListener('site-content-updated', handleSiteContentUpdate);
    };
  }, []);

  const setColor = useCallback(async (hex: string, newPresetId?: string) => {
    const tertiary = deriveTertiaryColor(hex);
    const resolvedPreset = newPresetId || (
      THEME_COLOR_PRESETS.find((p) => p.primary.toLowerCase() === hex.toLowerCase())?.id || 'custom'
    );

    setPrimaryColor(hex);
    setTertiaryColor(tertiary);
    setPresetId(resolvedPreset);

    // Apply to DOM immediately
    applyThemeColors(hex, tertiary, resolvedPreset);

    // Update takizawa_site_content in localStorage & Supabase
    try {
      const rawContent = localStorage.getItem('takizawa_site_content');
      let currentContent: any = {};
      if (rawContent) {
        try {
          currentContent = JSON.parse(rawContent);
        } catch {
          currentContent = {};
        }
      }
      const updatedContent = {
        ...currentContent,
        primaryColor: hex,
        tertiaryColor: tertiary,
        colorPresetId: resolvedPreset,
      };

      localStorage.setItem('takizawa_site_content', JSON.stringify(updatedContent));

      try {
        await supabase
          .from('site_content')
          .upsert({
            id: 'primary',
            content: JSON.stringify(updatedContent),
            updated_at: new Date().toISOString(),
          });
      } catch {
        // Ignored if table or network unavailable
      }
    } catch {
      // Ignored
    }
  }, []);

  const resetColor = useCallback(async () => {
    await setColor(DEFAULT_THEME_COLOR, 'orange');
  }, [setColor]);

  return (
    <ThemeColorContext.Provider
      value={{
        primaryColor,
        tertiaryColor,
        presetId,
        presets: THEME_COLOR_PRESETS,
        setColor,
        resetColor,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  return context;
}
