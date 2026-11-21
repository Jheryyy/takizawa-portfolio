import { supabase } from '@/lib/supabase';

export interface ThemeColorPreset {
  id: string;
  name: string;
  label: string;
  primary: string;
  tertiary: string;
  rgb: string;
  description: string;
  badge: string;
}

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: 'orange',
    name: 'Signature Orange',
    label: 'Oranye Ikonis (Bawaan)',
    primary: '#FF5A1F',
    tertiary: '#FF8552',
    rgb: '255, 90, 31',
    description: 'Palet oranye hangat dan dinamis bawaan portofolio Takizawablox.',
    badge: 'Bawaan / Signature',
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    label: 'Hijau Emerald',
    primary: '#10B981',
    tertiary: '#34D399',
    rgb: '16, 185, 129',
    description: 'Nuansa hijau emerald modern khas tech terminal, rapi dan kontras tinggi.',
    badge: 'Tech & Modern',
  },
  {
    id: 'blue',
    name: 'Electric Blue',
    label: 'Biru Elektrik',
    primary: '#3B82F6',
    tertiary: '#60A5FA',
    rgb: '59, 130, 246',
    description: 'Biru elektrik futuristik berjiwa software engineering dan kredibilitas tinggi.',
    badge: 'Engineer & Clean',
  },
  {
    id: 'violet',
    name: 'Neon Violet',
    label: 'Ungu Violet',
    primary: '#8B5CF6',
    tertiary: '#A78BFA',
    rgb: '139, 92, 246',
    description: 'Ungu neon futuristik bernuansa creative studio, Web3, dan seni digital.',
    badge: 'Creative Studio',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    label: 'Merah Crimson',
    primary: '#F43F5E',
    tertiary: '#FB7185',
    rgb: '244, 63, 94',
    description: 'Merah crimson menyala dengan sentuhan berani, elegan, dan high-contrast.',
    badge: 'Bold & High Impact',
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    label: 'Kuning Keemasan',
    primary: '#F59E0B',
    tertiary: '#FBBF24',
    rgb: '245, 158, 11',
    description: 'Kuning amber keemasan hangat bergaya sunset editorial yang prestisius.',
    badge: 'Warm & Editorial',
  },
  {
    id: 'crystal-glass',
    name: 'Crystal Glass',
    label: 'Kaca Kristal (Glassmorphism)',
    primary: '#38BDF8',
    tertiary: '#BAE6FD',
    rgb: '56, 189, 248',
    description: 'Palet kaca kristal es dengan efek blur transparan, specular gloss, dan refleksi cyan bercahaya.',
    badge: 'Glassmorphism FX',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    label: 'Cyan Cyberpunk',
    primary: '#06B6D4',
    tertiary: '#22D3EE',
    rgb: '6, 182, 212',
    description: 'Cyan toska bertenaga sci-fi yang bersinar tajam di atas kanvas gelap.',
    badge: 'Cyberpunk Neon',
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    label: 'Indigo Sleek',
    primary: '#6366F1',
    tertiary: '#818CF8',
    rgb: '99, 102, 241',
    description: 'Indigo elegan bernuansa produk SaaS modern, minimalis dan arsitektural.',
    badge: 'SaaS Aesthetic',
  },
];

export const DEFAULT_THEME_COLOR = '#FF5A1F';
export const DEFAULT_TERTIARY_COLOR = '#FF8552';
export const THEME_COLOR_STORAGE_KEY = 'takizawa_theme_color';
export const THEME_TERTIARY_STORAGE_KEY = 'takizawa_theme_tertiary';
export const THEME_PRESET_STORAGE_KEY = 'takizawa_theme_preset_id';

/**
 * Normalizes hex code (e.g. "ff5a1f" -> "#FF5A1F" or "#abc" -> "#AABBCC")
 */
export function normalizeHex(hex: string): string {
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return DEFAULT_THEME_COLOR;
  }
  return '#' + cleaned.toUpperCase();
}

/**
 * Converts hex to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number; rgbString: string } {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return {
    r,
    g,
    b,
    rgbString: `${r}, ${g}, ${b}`,
  };
}

/**
 * Adjusts color brightness (positive percent = lighter, negative = darker)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;

  const newR = Math.min(255, Math.max(0, Math.round(factor > 0 ? r + (255 - r) * factor : r * (1 + factor))));
  const newG = Math.min(255, Math.max(0, Math.round(factor > 0 ? g + (255 - g) * factor : g * (1 + factor))));
  const newB = Math.min(255, Math.max(0, Math.round(factor > 0 ? b + (255 - b) * factor : b * (1 + factor))));

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`.toUpperCase();
}

/**
 * Derives a harmonic tertiary color from a primary color (approx +25% lighter)
 */
export function deriveTertiaryColor(primaryHex: string): string {
  const matched = THEME_COLOR_PRESETS.find(
    (p) => p.primary.toLowerCase() === primaryHex.toLowerCase()
  );
  if (matched) return matched.tertiary;
  return adjustBrightness(primaryHex, 24);
}

/**
 * Applies the given theme colors to the document runtime:
 * 1. Sets CSS Custom Properties on :root and html
 * 2. Injects high-specificity dynamic CSS style for gradients, glow, and borders
 * 3. Persists to localStorage
 * 4. Dispatches CustomEvent 'theme-color-updated'
 */
export function applyThemeColors(primaryHex: string, tertiaryHex?: string, presetId?: string): void {
  if (typeof window === 'undefined') return;

  const validPrimary = normalizeHex(primaryHex);
  const validTertiary = tertiaryHex ? normalizeHex(tertiaryHex) : deriveTertiaryColor(validPrimary);
  const { rgbString } = hexToRgb(validPrimary);

  // Set CSS Custom Properties on documentElement
  const root = document.documentElement;
  root.style.setProperty('--color-primary', validPrimary);
  root.style.setProperty('--color-primary-rgb', rgbString);
  root.style.setProperty('--color-tertiary', validTertiary);

  // Injected style tag for complex gradients and glow classes that use RGB strings
  const STYLE_ID = 'takizawa-dynamic-theme-colors';
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --color-primary: ${validPrimary} !important;
      --color-primary-rgb: ${rgbString} !important;
      --color-tertiary: ${validTertiary} !important;
    }
    ::selection {
      background-color: ${validPrimary} !important;
      color: #FFFFFF !important;
    }
    .bg-primary {
      background-color: ${validPrimary} !important;
    }
    .text-primary {
      color: ${validPrimary} !important;
    }
    .border-primary {
      border-color: ${validPrimary} !important;
    }
    html.light .text-primary,
    html.light a.text-primary,
    html.light span.text-primary,
    html.light p.text-primary {
      color: ${validPrimary} !important;
    }
    .orange-glow-hover:hover {
      box-shadow: 0 0 28px rgba(${rgbString}, 0.35) !important;
    }
    html.dark .card-glow-hover:hover {
      border-color: rgba(${rgbString}, 0.5) !important;
      box-shadow: 0 20px 40px -15px rgba(${rgbString}, 0.15) !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${validPrimary} !important;
    }
    .studio-hero-gradient {
      background: radial-gradient(circle at 28% 22%,
          rgba(${rgbString}, 0.95) 0%,
          rgba(${rgbString}, 0.82) 25%,
          rgba(${rgbString}, 0.40) 52%,
          rgba(20, 12, 10, 0.96) 82%,
          #0D0A09 100%) !important;
    }
    html.light .studio-hero-gradient {
      background: linear-gradient(180deg,
          ${validPrimary} 0%,
          ${validTertiary} 25%,
          rgba(${rgbString}, 0.3) 54%,
          #FFFFFF 100%) !important;
    }
  `;

  // Persist to localStorage
  try {
    localStorage.setItem(THEME_COLOR_STORAGE_KEY, validPrimary);
    localStorage.setItem(THEME_TERTIARY_STORAGE_KEY, validTertiary);
    if (presetId) {
      localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
    } else {
      const match = THEME_COLOR_PRESETS.find(
        (p) => p.primary.toLowerCase() === validPrimary.toLowerCase()
      );
      if (match) {
        localStorage.setItem(THEME_PRESET_STORAGE_KEY, match.id);
      } else {
        localStorage.setItem(THEME_PRESET_STORAGE_KEY, 'custom');
      }
    }
  } catch {
    // Ignore localStorage errors (e.g. private browsing restrictions)
  }

  // Notify all components in the app
  window.dispatchEvent(
    new CustomEvent('theme-color-updated', {
      detail: {
        primary: validPrimary,
        tertiary: validTertiary,
        rgb: rgbString,
        presetId: presetId || 'custom',
      },
    })
  );
}

/**
 * Reads the active theme color from localStorage or falls back to default
 */
export function getStoredThemeColor(): {
  primary: string;
  tertiary: string;
  presetId: string;
} {
  if (typeof window === 'undefined') {
    return {
      primary: DEFAULT_THEME_COLOR,
      tertiary: DEFAULT_TERTIARY_COLOR,
      presetId: 'orange',
    };
  }

  try {
    // Check direct theme color storage
    const directColor = localStorage.getItem(THEME_COLOR_STORAGE_KEY);
    const directTertiary = localStorage.getItem(THEME_TERTIARY_STORAGE_KEY);
    const directPreset = localStorage.getItem(THEME_PRESET_STORAGE_KEY);

    if (directColor && directColor.startsWith('#')) {
      const normalized = normalizeHex(directColor);
      return {
        primary: normalized,
        tertiary: directTertiary ? normalizeHex(directTertiary) : deriveTertiaryColor(normalized),
        presetId: directPreset || 'custom',
      };
    }

    // Check fallback inside takizawa_site_content
    const rawContent = localStorage.getItem('takizawa_site_content');
    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      if (parsed.primaryColor && parsed.primaryColor.startsWith('#')) {
        const normalized = normalizeHex(parsed.primaryColor);
        return {
          primary: normalized,
          tertiary: parsed.tertiaryColor ? normalizeHex(parsed.tertiaryColor) : deriveTertiaryColor(normalized),
          presetId: parsed.colorPresetId || 'custom',
        };
      }
    }
  } catch {
    // Ignore errors
  }

  return {
    primary: DEFAULT_THEME_COLOR,
    tertiary: DEFAULT_TERTIARY_COLOR,
    presetId: 'orange',
  };
}

export const THEME_STYLE_STORAGE_KEY = 'takizawa_theme_style';

/**
 * Toggles Glassmorphism style (.theme-glass class on html root)
 */
export function applyThemeStyle(style: 'solid' | 'glass'): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (style === 'glass') {
    root.classList.add('theme-glass');
  } else {
    root.classList.remove('theme-glass');
  }
  try {
    localStorage.setItem(THEME_STYLE_STORAGE_KEY, style);
  } catch {
    // Ignored
  }
  window.dispatchEvent(new CustomEvent('theme-style-updated', { detail: { style } }));
}

/**
 * Retrieves the stored theme style ('solid' | 'glass')
 */
export function getStoredThemeStyle(): 'solid' | 'glass' {
  if (typeof window === 'undefined') return 'glass';
  try {
    const saved = localStorage.getItem(THEME_STYLE_STORAGE_KEY);
    if (saved === 'solid' || saved === 'glass') return saved;
    const rawContent = localStorage.getItem('takizawa_site_content');
    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      if (parsed.themeStyle === 'solid' || parsed.themeStyle === 'glass') {
        return parsed.themeStyle;
      }
    }
  } catch {
    // Ignored
  }
  return 'glass';
}

/**
 * Checks if the current browser user is authenticated as administrator
 */
export function isUserAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const s = sessionStorage.getItem('takizawa_admin_auth');
    const l = localStorage.getItem('takizawa_admin_auth');
    return s === 'authenticated_jheryco_2026' || l === 'authenticated_jheryco_2026';
  } catch {
    return false;
  }
}

/**
 * Persists theme configuration to Supabase so that all public visitors on all devices
 * see the active theme & color choice live!
 */
export async function syncThemeToSupabase(config: {
  primaryColor: string;
  tertiaryColor?: string;
  colorPresetId?: string;
  themeStyle?: 'solid' | 'glass';
}): Promise<boolean> {
  try {
    const primary = normalizeHex(config.primaryColor);
    const tertiary = config.tertiaryColor ? normalizeHex(config.tertiaryColor) : deriveTertiaryColor(primary);
    const presetId = config.colorPresetId || 'custom';
    const style = config.themeStyle || 'glass';

    const payload = JSON.stringify({
      primaryColor: primary,
      tertiaryColor: tertiary,
      colorPresetId: presetId,
      themeStyle: style,
      updated_at: new Date().toISOString(),
    });

    const { data: existing } = await supabase
      .from('guestbook')
      .select('id')
      .eq('handle', '__takizawa_theme_config__')
      .maybeSingle();

    if (existing && existing.id) {
      const { error } = await supabase
        .from('guestbook')
        .update({ message: payload })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase.from('guestbook').insert({
        name: 'Site Theme Config',
        handle: '__takizawa_theme_config__',
        role: 'System',
        message: payload,
        likes: 0,
        is_approved: false,
      });
      return !error;
    }
  } catch (err) {
    console.error('Failed to sync theme config to Supabase:', err);
    return false;
  }
}

/**
 * Fetches the global theme configuration from Supabase for all public visitors
 */
export async function fetchRemoteThemeFromSupabase(): Promise<{
  primaryColor?: string;
  tertiaryColor?: string;
  colorPresetId?: string;
  themeStyle?: 'solid' | 'glass';
} | null> {
  try {
    const { data, error } = await supabase
      .from('guestbook')
      .select('message')
      .eq('handle', '__takizawa_theme_config__')
      .maybeSingle();

    if (!error && data && data.message) {
      const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read remote theme from Supabase:', err);
  }
  return null;
}
