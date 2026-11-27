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
  applyThemeStyle,
  getStoredThemeStyle,
  syncThemeToSupabase,
  fetchRemoteThemeFromSupabase,
  checkAdminSession,
} from '@/lib/theme-colors';
import { supabase } from '@/lib/supabase';

interface ThemeColorContextType {
  primaryColor: string;
  tertiaryColor: string;
  presetId: string;
  presets: ThemeColorPreset[];
  themeStyle: 'solid' | 'glass';
  isAdmin: boolean;
  setColor: (hex: string, presetId?: string) => Promise<void>;
  setThemeStyle: (style: 'solid' | 'glass') => Promise<void>;
  resetColor: () => Promise<void>;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  primaryColor: DEFAULT_THEME_COLOR,
  tertiaryColor: DEFAULT_TERTIARY_COLOR,
  presetId: 'orange',
  presets: THEME_COLOR_PRESETS,
  themeStyle: 'glass',
  isAdmin: false,
  setColor: async () => {},
  setThemeStyle: async () => {},
  resetColor: async () => {},
});

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_THEME_COLOR);
  const [tertiaryColor, setTertiaryColor] = useState<string>(DEFAULT_TERTIARY_COLOR);
  const [presetId, setPresetId] = useState<string>('orange');
  const [themeStyle, setThemeStyleState] = useState<'solid' | 'glass'>('glass');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const applyRemoteConfig = useCallback(
    (config: {
      primaryColor?: string;
      tertiaryColor?: string;
      colorPresetId?: string;
      themeStyle?: 'solid' | 'glass';
    }) => {
      if (config.primaryColor && config.primaryColor.startsWith('#')) {
        const p = config.primaryColor;
        const t = config.tertiaryColor || deriveTertiaryColor(p);
        const pr = config.colorPresetId || 'custom';
        setPrimaryColor(p);
        setTertiaryColor(t);
        setPresetId(pr);
        applyThemeColors(p, t, pr);
      }
      if (config.themeStyle === 'solid' || config.themeStyle === 'glass') {
        setThemeStyleState(config.themeStyle);
        applyThemeStyle(config.themeStyle);
      }
    },
    []
  );

  useEffect(() => {
    let isCancelled = false;

    const refreshAdminState = async () => {
      const ok = await checkAdminSession();
      if (!isCancelled) setIsAdmin(ok);
    };
    refreshAdminState();

    // 1. Immediately read from localStorage
    const stored = getStoredThemeColor();
    const storedStyle = getStoredThemeStyle();

    setPrimaryColor(stored.primary);
    setTertiaryColor(stored.tertiary);
    setPresetId(stored.presetId);
    setThemeStyleState(storedStyle);

    applyThemeColors(stored.primary, stored.tertiary, stored.presetId);
    applyThemeStyle(storedStyle);

    // 2. Fetch global accent & glass style from Supabase (never overrides visitor's own light/dark mode)
    const fetchRemoteTheme = async () => {
      try {
        const remote = await fetchRemoteThemeFromSupabase();
        if (remote && !isCancelled) {
          applyRemoteConfig(remote);
        }
      } catch (err) {
        console.warn('Could not read remote theme from Supabase:', err);
      }
    };

    fetchRemoteTheme();

    // 3. Realtime subscription on site_content.theme_config
    const themeChannel = supabase
      .channel('takizawa-global-theme-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
          filter: 'id=eq.theme_config',
        },
        (payload: any) => {
          if (payload.new?.content) {
            try {
              const msg =
                typeof payload.new.content === 'string'
                  ? JSON.parse(payload.new.content)
                  : payload.new.content;
              applyRemoteConfig(msg);
            } catch (err) {
              console.warn('Error applying realtime theme update:', err);
            }
          }
        }
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAdminState();
        fetchRemoteTheme();
      }
    };
    const handleAuthChange = () => {
      refreshAdminState();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('admin-auth-updated', handleAuthChange);

    const intervalId = setInterval(() => {
      fetchRemoteTheme();
    }, 60000);

    const handleThemeUpdate = (e: any) => {
      if (e.detail?.primary) {
        setPrimaryColor(e.detail.primary);
        if (e.detail.tertiary) setTertiaryColor(e.detail.tertiary);
        if (e.detail.presetId) setPresetId(e.detail.presetId);
      }
    };

    const handleThemeStyleUpdate = (e: any) => {
      if (e.detail?.style === 'solid' || e.detail?.style === 'glass') {
        setThemeStyleState(e.detail.style);
      }
    };

    const handleSiteContentUpdate = (e: any) => {
      if (e.detail?.primaryColor) {
        const pColor = e.detail.primaryColor;
        const tColor = e.detail.tertiaryColor || deriveTertiaryColor(pColor);
        const pPreset = e.detail.colorPresetId || 'custom';
        setPrimaryColor(pColor);
        setTertiaryColor(tColor);
        setPresetId(pPreset);
      }
      if (e.detail?.themeStyle === 'solid' || e.detail?.themeStyle === 'glass') {
        setThemeStyleState(e.detail.themeStyle);
      }
    };

    window.addEventListener('theme-color-updated', handleThemeUpdate);
    window.addEventListener('theme-style-updated', handleThemeStyleUpdate);
    window.addEventListener('site-content-updated', handleSiteContentUpdate);

    return () => {
      isCancelled = true;
      supabase.removeChannel(themeChannel);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('admin-auth-updated', handleAuthChange);
      clearInterval(intervalId);
      window.removeEventListener('theme-color-updated', handleThemeUpdate);
      window.removeEventListener('theme-style-updated', handleThemeStyleUpdate);
      window.removeEventListener('site-content-updated', handleSiteContentUpdate);
    };
  }, [applyRemoteConfig]);

  const setColor = useCallback(
    async (hex: string, newPresetId?: string) => {
      const authorized = await checkAdminSession();
      if (!authorized) {
        console.warn('Perubahan tema hanya dapat dilakukan oleh Administrator setelah login.');
        return;
      }

      const tertiary = deriveTertiaryColor(hex);
      const resolvedPreset =
        newPresetId ||
        THEME_COLOR_PRESETS.find((p) => p.primary.toLowerCase() === hex.toLowerCase())?.id ||
        'custom';

      setPrimaryColor(hex);
      setTertiaryColor(tertiary);
      setPresetId(resolvedPreset);
      applyThemeColors(hex, tertiary, resolvedPreset);

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
        localStorage.setItem(
          'takizawa_site_content',
          JSON.stringify({
            ...currentContent,
            primaryColor: hex,
            tertiaryColor: tertiary,
            colorPresetId: resolvedPreset,
            themeStyle,
          })
        );

        await syncThemeToSupabase({
          primaryColor: hex,
          tertiaryColor: tertiary,
          colorPresetId: resolvedPreset,
          themeStyle,
        });
      } catch {
        // Ignored
      }
    },
    [themeStyle]
  );

  const setThemeStyle = useCallback(
    async (style: 'solid' | 'glass') => {
      const authorized = await checkAdminSession();
      if (!authorized) {
        console.warn('Perubahan tema hanya dapat dilakukan oleh Administrator setelah login.');
        return;
      }

      setThemeStyleState(style);
      applyThemeStyle(style);

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
        localStorage.setItem(
          'takizawa_site_content',
          JSON.stringify({
            ...currentContent,
            themeStyle: style,
          })
        );

        await syncThemeToSupabase({
          primaryColor,
          tertiaryColor,
          colorPresetId: presetId,
          themeStyle: style,
        });
      } catch {
        // Ignored
      }
    },
    [primaryColor, tertiaryColor, presetId]
  );

  const resetColor = useCallback(async () => {
    const authorized = await checkAdminSession();
    if (!authorized) return;
    await setColor('#38BDF8', 'crystal-glass');
    await setThemeStyle('glass');
  }, [setColor, setThemeStyle]);

  return (
    <ThemeColorContext.Provider
      value={{
        primaryColor,
        tertiaryColor,
        presetId,
        presets: THEME_COLOR_PRESETS,
        themeStyle,
        isAdmin,
        setColor,
        setThemeStyle,
        resetColor,
      }}
    >
      {themeStyle === 'glass' && (
        <div className="glass-aurora-bg" aria-hidden="true">
          <div className="glass-aurora-orb-1" />
          <div className="glass-aurora-orb-2" />
          <div className="glass-aurora-orb-3" />
        </div>
      )}
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
