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
  isUserAdmin,
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
  presetId: 'crystal-glass',
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
  const [presetId, setPresetId] = useState<string>('crystal-glass');
  const [themeStyle, setThemeStyleState] = useState<'solid' | 'glass'>('glass');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize and apply theme colors and glass style on mount
  useEffect(() => {
    // 0. Check admin authentication state
    setIsAdmin(isUserAdmin());

    // 1. Immediately read from localStorage
    const stored = getStoredThemeColor();
    const storedStyle = getStoredThemeStyle();

    setPrimaryColor(stored.primary);
    setTertiaryColor(stored.tertiary);
    setPresetId(stored.presetId);
    setThemeStyleState(storedStyle);

    applyThemeColors(stored.primary, stored.tertiary, stored.presetId);
    applyThemeStyle(storedStyle);

    // 2. Fetch from Supabase global config (persisted cross-device for all public visitors)
    let isCancelled = false;
    const fetchRemoteTheme = async () => {
      try {
        const remote = await fetchRemoteThemeFromSupabase();
        if (remote && !isCancelled) {
          if (remote.primaryColor && remote.primaryColor.startsWith('#')) {
            const remotePrimary = remote.primaryColor;
            const remoteTertiary = remote.tertiaryColor || deriveTertiaryColor(remotePrimary);
            const remotePreset = remote.colorPresetId || 'custom';

            setPrimaryColor(remotePrimary);
            setTertiaryColor(remoteTertiary);
            setPresetId(remotePreset);
            applyThemeColors(remotePrimary, remoteTertiary, remotePreset);
          }
          if (remote.themeStyle === 'solid' || remote.themeStyle === 'glass') {
            setThemeStyleState(remote.themeStyle);
            applyThemeStyle(remote.themeStyle);
          }
          if (remote.mode === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else if (remote.mode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      } catch (err) {
        console.warn('Could not read remote theme from Supabase:', err);
      }
    };

    fetchRemoteTheme();

    // 3. Supabase Realtime channel subscription for immediate live updates across all active visitors!
    const themeChannel = supabase
      .channel('takizawa-global-theme-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guestbook',
          filter: 'handle=eq.__takizawa_theme_config__',
        },
        (payload: any) => {
          if (payload.new && payload.new.message) {
            try {
              const msg = typeof payload.new.message === 'string'
                ? JSON.parse(payload.new.message)
                : payload.new.message;
              if (msg.primaryColor && msg.primaryColor.startsWith('#')) {
                const p = msg.primaryColor;
                const t = msg.tertiaryColor || deriveTertiaryColor(p);
                const pr = msg.colorPresetId || 'custom';
                setPrimaryColor(p);
                setTertiaryColor(t);
                setPresetId(pr);
                applyThemeColors(p, t, pr);
              }
              if (msg.themeStyle === 'solid' || msg.themeStyle === 'glass') {
                setThemeStyleState(msg.themeStyle);
                applyThemeStyle(msg.themeStyle);
              }
              if (msg.mode === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
              } else if (msg.mode === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
            } catch (err) {
              console.warn('Error applying realtime theme update:', err);
            }
          }
        }
      )
      .subscribe();

    // 4. Fallback interval & visibility listeners
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setIsAdmin(isUserAdmin());
        fetchRemoteTheme();
      }
    };
    const handleAuthChange = () => {
      setIsAdmin(isUserAdmin());
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('admin-auth-updated', handleAuthChange);

    // Heartbeat poll every 45s as network fallback
    const intervalId = setInterval(() => {
      fetchRemoteTheme();
    }, 45000);

    // 5. Listen to local broadcast events
    const handleThemeUpdate = (e: any) => {
      if (e.detail && e.detail.primary) {
        setPrimaryColor(e.detail.primary);
        if (e.detail.tertiary) setTertiaryColor(e.detail.tertiary);
        if (e.detail.presetId) setPresetId(e.detail.presetId);
      }
    };

    const handleThemeStyleUpdate = (e: any) => {
      if (e.detail && (e.detail.style === 'solid' || e.detail.style === 'glass')) {
        setThemeStyleState(e.detail.style);
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
      if (e.detail && (e.detail.themeStyle === 'solid' || e.detail.themeStyle === 'glass')) {
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
  }, []);

  const setColor = useCallback(async (hex: string, newPresetId?: string) => {
    // Permission check: Only administrators can modify & save theme colors
    if (!isUserAdmin()) {
      console.warn('Perubahan tema hanya dapat dilakukan oleh Administrator setelah login.');
      return;
    }

    const tertiary = deriveTertiaryColor(hex);
    const resolvedPreset = newPresetId || (
      THEME_COLOR_PRESETS.find((p) => p.primary.toLowerCase() === hex.toLowerCase())?.id || 'custom'
    );

    setPrimaryColor(hex);
    setTertiaryColor(tertiary);
    setPresetId(resolvedPreset);

    // Apply to DOM immediately
    applyThemeColors(hex, tertiary, resolvedPreset);

    // Update takizawa_site_content in localStorage
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
        themeStyle: themeStyle,
      };

      localStorage.setItem('takizawa_site_content', JSON.stringify(updatedContent));

      // Sync to Supabase so EVERY visitor sees it live!
      await syncThemeToSupabase({
        primaryColor: hex,
        tertiaryColor: tertiary,
        colorPresetId: resolvedPreset,
        themeStyle: themeStyle,
      });
    } catch {
      // Ignored
    }
  }, [themeStyle]);

  const setThemeStyle = useCallback(async (style: 'solid' | 'glass') => {
    // Permission check: Only administrators can modify & save theme style
    if (!isUserAdmin()) {
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
      const updatedContent = {
        ...currentContent,
        themeStyle: style,
      };

      localStorage.setItem('takizawa_site_content', JSON.stringify(updatedContent));

      // Sync to Supabase so EVERY visitor sees it live!
      await syncThemeToSupabase({
        primaryColor: primaryColor,
        tertiaryColor: tertiaryColor,
        colorPresetId: presetId,
        themeStyle: style,
      });
    } catch {
      // Ignored
    }
  }, [primaryColor, tertiaryColor, presetId]);

  const resetColor = useCallback(async () => {
    if (!isUserAdmin()) return;
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
      {/* Ambient background aura when liquid glass theme is active */}
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
