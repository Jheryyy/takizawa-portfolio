import { ProjectCategory } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';

export type ActiveTab = 'overview' | 'projects' | 'content' | 'theme' | 'contacts' | 'guestbook';
export type AdminThemeMode = 'dark' | 'light';

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

export interface ProjectRecord {
  id: string;
  project_index: string;
  title: string;
  category: ProjectCategory;
  short_desc: string;
  role: string;
  timeline: string;
  arch: string;
  outcome: string;
  image: string;
  tech: string[];
  problem?: string;
  design?: string;
  code?: string;
  created_at?: string;
}

export interface ProjectFormState {
  title: string;
  category: ProjectCategory;
  short_desc: string;
  role: string;
  timeline: string;
  arch: string;
  outcome: string;
  image: string;
  tech: string;
  problem: string;
  design: string;
  code: string;
}

export interface GuestbookRecord {
  id: string;
  name: string;
  handle: string;
  role: string;
  message: string;
  likes: number;
  is_approved?: boolean;
  created_at: string;
}

export interface ParsedGuestbookItem extends GuestbookRecord {
  cleanMessage: string;
  parentId?: string;
  isReply: boolean;
  isAdminReply: boolean;
  replies?: ParsedGuestbookItem[];
}

export const EMPTY_PROJECT_FORM: ProjectFormState = {
  title: '',
  category: 'Frontend Web',
  short_desc: '',
  role: 'Lead Frontend Developer',
  timeline: '3 Weeks (2026)',
  arch: 'Next.js 15 + Supabase + Tailwind',
  outcome: '99 Lighthouse Score',
  image: '/projects/portfolio-website.webp',
  tech: 'Next.js, TypeScript, Tailwind CSS, Supabase',
  problem: '',
  design: '',
  code: '',
};

export const parseReplyMessage = (rawMessage: string, role?: string) => {
  const match = (rawMessage || '').match(/^\[reply:([^\]]+)\]\s*([\s\S]*)$/);
  if (match) {
    const rawTag = match[1];
    const cleanMessage = match[2];
    const isAdmin = rawTag.includes('|admin') && role === 'Owner & Admin';
    const parentId = rawTag.replace('|admin', '').trim();
    return { isReply: true, parentId, isAdmin, cleanMessage };
  }
  return { isReply: false, parentId: null, isAdmin: false, cleanMessage: rawMessage || '' };
};

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore
  }
  return {};
}

export async function adminApiAction(action: string, payload?: unknown) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch('/api/admin/data', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({ action, payload }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Permintaan admin gagal diproses.');
  }
  return data;
}
