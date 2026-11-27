'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  BookOpen,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sliders,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SiteContent, SkillItem } from '@/types/portfolio';
import {
  defaultSiteContent,
  getStoredSiteContent,
  saveStoredSiteContent,
} from '@/data/portfolio-data';
import {
  THEME_COLOR_PRESETS,
  DEFAULT_THEME_COLOR,
  ThemeColorPreset,
  applyThemeColors,
  deriveTertiaryColor,
  getStoredThemeColor,
  normalizeHex,
  applyThemeStyle,
  getStoredThemeStyle,
  syncThemeToSupabase,
  checkAdminSession,
} from '@/lib/theme-colors';
import {
  ActiveTab,
  AdminThemeMode,
  ContactItem,
  EMPTY_PROJECT_FORM,
  GuestbookRecord,
  ParsedGuestbookItem,
  ProjectFormState,
  ProjectRecord,
  adminApiAction,
  getAuthHeaders,
  parseReplyMessage,
} from '@/components/admin/types';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { AdminProjectsTab } from '@/components/admin/AdminProjectsTab';
import { AdminProjectModal } from '@/components/admin/AdminProjectModal';
import { AdminContentTab } from '@/components/admin/AdminContentTab';
import { AdminThemeTab } from '@/components/admin/AdminThemeTab';
import { AdminContactsTab } from '@/components/admin/AdminContactsTab';
import { AdminGuestbookTab } from '@/components/admin/AdminGuestbookTab';

export default function AdminDashboardPage() {
  const [themeMode, setThemeMode] = useState<AdminThemeMode>('dark');
  const isDark = themeMode === 'dark';

  // Authentication state (server-verified HttpOnly cookie / Supabase Auth)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminSubject, setAdminSubject] = useState<string>('Administrator');

  // Layout & Tab state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Data state
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [guestbookPending, setGuestbookPending] = useState<ParsedGuestbookItem[]>([]);
  const [guestbookApproved, setGuestbookApproved] = useState<ParsedGuestbookItem[]>([]);
  const [guestbookTab, setGuestbookTab] = useState<'pending' | 'approved'>('pending');
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSubmittingAdminReply, setIsSubmittingAdminReply] = useState(false);

  // Project CRUD modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);

  // Content management state
  const [siteContentForm, setSiteContentForm] = useState<SiteContent>(defaultSiteContent);
  const [savingContent, setSavingContent] = useState(false);
  const [newTypingText, setNewTypingText] = useState('');
  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: '',
    category: 'frontend',
    level: '90%',
    tag: 'Frontend',
  });

  // Theme customization state
  const [selectedThemeColor, setSelectedThemeColor] = useState(DEFAULT_THEME_COLOR);
  const [selectedPresetId, setSelectedPresetId] = useState('orange');
  const [customHexInput, setCustomHexInput] = useState(DEFAULT_THEME_COLOR);
  const [isSavingThemeColor, setIsSavingThemeColor] = useState(false);
  const [themeStyle, setThemeStyle] = useState<'solid' | 'glass'>('glass');

  // Image upload state
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'folder' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [folderImages, setFolderImages] = useState<{ filename: string; url: string }[]>([]);
  const [loadingFolderImages, setLoadingFolderImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = useCallback((msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  }, []);

  // Load local preferences on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('admin_theme_mode') as AdminThemeMode;
      if (savedMode === 'dark' || savedMode === 'light') {
        setThemeMode(savedMode);
      }
      // Remove legacy insecure static token if present from older sessions
      localStorage.removeItem('takizawa_admin_auth');
      sessionStorage.removeItem('takizawa_admin_auth');
    } catch {
      // Ignored
    }

    const savedTheme = getStoredThemeColor();
    setSelectedThemeColor(savedTheme.primary);
    setCustomHexInput(savedTheme.primary);
    setSelectedPresetId(savedTheme.presetId);
    applyThemeColors(savedTheme.primary, savedTheme.tertiary, savedTheme.presetId);

    const savedStyle = getStoredThemeStyle();
    setThemeStyle(savedStyle);
    applyThemeStyle(savedStyle);
  }, []);

  // Check server-verified admin session
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch('/api/admin/auth', {
          method: 'GET',
          credentials: 'same-origin',
          headers: authHeaders,
          cache: 'no-store',
        });
        const data = await res.json();
        if (!cancelled && data?.authenticated) {
          setIsAuthenticated(true);
          if (data.subject) setAdminSubject(data.subject);
        }
      } catch {
        // Ignored
      } finally {
        if (!cancelled) setIsAuthChecking(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const trimmedUser = loginUsername.trim();
    const trimmedPw = loginPassword;

    try {
      if (trimmedUser.includes('@')) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: trimmedPw,
        });

        if (authErr || !authData?.session?.access_token) {
          setAuthError(authErr?.message || 'Email atau Password Supabase salah.');
          return;
        }

        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseAccessToken: authData.session.access_token,
            rememberMe,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data?.error || 'Akun tidak memiliki otorisasi admin.');
          return;
        }

        setIsAuthenticated(true);
        setAdminSubject(data.subject || trimmedUser);
        window.dispatchEvent(new CustomEvent('admin-auth-updated'));
        showNotice('Login berhasil! Sesi server terverifikasi aktif.');
        return;
      }

      // Username/password verified strictly on server via env vars
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password: trimmedPw,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.authenticated) {
        setAuthError(data?.error || 'Username/Email atau Password salah.');
        return;
      }

      setIsAuthenticated(true);
      setAdminSubject(data.subject || trimmedUser);
      window.dispatchEvent(new CustomEvent('admin-auth-updated'));
      showNotice('Selamat datang kembali! Akses Dashboard diberikan.');
    } catch (err: any) {
      setAuthError(err?.message || 'Terjadi kesalahan saat verifikasi login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'same-origin' });
    } catch {
      // Ignored
    }
    setIsAuthenticated(false);
    setLoginPassword('');
    setAuthError(null);
    window.dispatchEvent(new CustomEvent('admin-auth-updated'));
    showNotice('Anda telah berhasil keluar dari Dashboard.');
  };

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/data', {
        method: 'GET',
        credentials: 'same-origin',
        headers: authHeaders,
        cache: 'no-store',
      });

      if (res.status === 401) {
        const stillValid = await checkAdminSession();
        if (!stillValid) {
          setIsAuthenticated(false);
          return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        setProjects((data.projects || []) as ProjectRecord[]);
        setContacts((data.contacts || []) as ContactItem[]);

        const rawItems = ((data.guestbook || []) as GuestbookRecord[]).filter(
          (item) => item.handle !== '__takizawa_theme_config__'
        );
        const parentMap = new Map<string, ParsedGuestbookItem>();
        const repliesList: ParsedGuestbookItem[] = [];

        rawItems.forEach((item) => {
          const parsed = parseReplyMessage(item.message, item.role);
          const parsedItem: ParsedGuestbookItem = {
            ...item,
            cleanMessage: parsed.cleanMessage,
            parentId: parsed.parentId || undefined,
            isReply: parsed.isReply,
            isAdminReply: parsed.isAdmin,
            replies: [],
          };

          if (parsed.isReply && parsed.parentId) {
            repliesList.push(parsedItem);
          } else {
            parentMap.set(item.id, parsedItem);
          }
        });

        repliesList.reverse().forEach((reply) => {
          if (reply.parentId && parentMap.has(reply.parentId)) {
            parentMap.get(reply.parentId)!.replies!.push(reply);
          } else if (reply.is_approved === false) {
            // Standalone unapproved reply can still be moderated directly in pending tab
            parentMap.set(reply.id, reply);
          }
        });

        const allParents = Array.from(parentMap.values());
        setGuestbookPending(allParents.filter((item) => !item.is_approved));
        setGuestbookApproved(allParents.filter((item) => item.is_approved === true));

        if (data.siteContent) {
          const parsed =
            typeof data.siteContent === 'string' ? JSON.parse(data.siteContent) : data.siteContent;
          const merged = { ...defaultSiteContent, ...parsed };
          setSiteContentForm(merged);
          if (parsed.primaryColor) {
            setSelectedThemeColor(parsed.primaryColor);
            setCustomHexInput(parsed.primaryColor);
            setSelectedPresetId(parsed.colorPresetId || 'custom');
            applyThemeColors(parsed.primaryColor, parsed.tertiaryColor, parsed.colorPresetId);
          }
          if (parsed.themeStyle === 'solid' || parsed.themeStyle === 'glass') {
            setThemeStyle(parsed.themeStyle);
            applyThemeStyle(parsed.themeStyle);
          }
          localStorage.setItem('takizawa_site_content', JSON.stringify(merged));
        } else {
          setSiteContentForm(getStoredSiteContent());
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  const handleToggleTheme = (mode: AdminThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('admin_theme_mode', mode);
    } catch {
      // Ignored
    }
    showNotice(mode === 'dark' ? 'Berpindah ke Dark Mode' : 'Berpindah ke Light Mode');
  };

  const handleToggleThemeStyle = async (style: 'solid' | 'glass') => {
    setThemeStyle(style);
    applyThemeStyle(style);
    const tertiary = deriveTertiaryColor(selectedThemeColor);
    const updated = {
      ...siteContentForm,
      primaryColor: selectedThemeColor,
      tertiaryColor: tertiary,
      colorPresetId: selectedPresetId,
      themeStyle: style,
    };
    setSiteContentForm(updated);
    await saveStoredSiteContent(updated);
    await syncThemeToSupabase({
      primaryColor: selectedThemeColor,
      tertiaryColor: tertiary,
      colorPresetId: selectedPresetId,
      themeStyle: style,
    });
    showNotice(style === 'glass' ? 'Mode Liquid Glass aktif & live!' : 'Mode Solid Editorial aktif & live!');
  };

  const handleSelectPresetColor = (preset: ThemeColorPreset) => {
    setSelectedThemeColor(preset.primary);
    setSelectedPresetId(preset.id);
    setCustomHexInput(preset.primary);
    applyThemeColors(preset.primary, preset.tertiary, preset.id);
    if (preset.id === 'crystal-glass') {
      setThemeStyle('glass');
      applyThemeStyle('glass');
    }
  };

  const handleCustomHexChange = (val: string) => {
    setCustomHexInput(val);
    const clean = val.trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(clean)) {
      const normalized = normalizeHex(clean);
      setSelectedThemeColor(normalized);
      setSelectedPresetId('custom');
      applyThemeColors(normalized);
    }
  };

  const handleSaveThemeColor = async () => {
    setIsSavingThemeColor(true);
    try {
      const tertiary = deriveTertiaryColor(selectedThemeColor);
      applyThemeColors(selectedThemeColor, tertiary, selectedPresetId);
      applyThemeStyle(themeStyle);

      const updated = {
        ...siteContentForm,
        primaryColor: selectedThemeColor,
        tertiaryColor: tertiary,
        colorPresetId: selectedPresetId,
        themeStyle,
      };
      setSiteContentForm(updated);
      await saveStoredSiteContent(updated);
      const synced = await syncThemeToSupabase({
        primaryColor: selectedThemeColor,
        tertiaryColor: tertiary,
        colorPresetId: selectedPresetId,
        themeStyle,
      });

      showNotice(
        synced
          ? `Tema & warna (${selectedThemeColor}) berhasil disimpan dan live ke semua pengunjung!`
          : 'Tema diterapkan secara lokal (cek koneksi/RLS Supabase untuk sync global).'
      );
    } finally {
      setIsSavingThemeColor(false);
    }
  };

  const handleResetThemeColor = async () => {
    const def = THEME_COLOR_PRESETS[0];
    setSelectedThemeColor(def.primary);
    setSelectedPresetId(def.id);
    setCustomHexInput(def.primary);
    applyThemeColors(def.primary, def.tertiary, def.id);

    const updated = {
      ...siteContentForm,
      primaryColor: def.primary,
      tertiaryColor: def.tertiary,
      colorPresetId: def.id,
      themeStyle,
    };
    setSiteContentForm(updated);
    await saveStoredSiteContent(updated);
    await syncThemeToSupabase({
      primaryColor: def.primary,
      tertiaryColor: def.tertiary,
      colorPresetId: def.id,
      themeStyle,
    });
    showNotice(`Berhasil reset warna ke Signature Orange (${def.primary}).`);
  };

  const fetchFolderImages = useCallback(async () => {
    setLoadingFolderImages(true);
    try {
      const res = await fetch('/api/project-images');
      const data = await res.json();
      if (data.images) setFolderImages(data.images);
    } catch (err) {
      console.error('Failed to load folder images:', err);
    } finally {
      setLoadingFolderImages(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const authHeaders = await getAuthHeaders();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-project-image', {
        method: 'POST',
        credentials: 'same-origin',
        headers: authHeaders,
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setProjectForm((prev) => ({ ...prev, image: data.url }));
        showNotice(`Gambar berhasil diunggah (${data.filename})!`);
        fetchFolderImages();
      } else {
        showNotice(data.error || 'Gagal mengunggah gambar');
      }
    } catch {
      showNotice('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setProjectForm({
      ...EMPTY_PROJECT_FORM,
      image: folderImages.length > 0 ? folderImages[0].url : '/projects/portfolio-website.webp',
    });
    setImageSourceMode('upload');
    setIsProjectModalOpen(true);
    fetchFolderImages();
  };

  const handleOpenEditModal = (proj: ProjectRecord) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      title: proj.title || '',
      category: proj.category || 'Frontend Web',
      short_desc: proj.short_desc || '',
      role: proj.role || 'Lead Frontend Developer',
      timeline: proj.timeline || '2026',
      arch: proj.arch || '',
      outcome: proj.outcome || '',
      image: proj.image || '',
      tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : '',
      problem: proj.problem || '',
      design: proj.design || '',
      code: proj.code || '',
    });
    setImageSourceMode(proj.image?.startsWith('/projects/') ? 'folder' : 'url');
    setIsProjectModalOpen(true);
    fetchFolderImages();
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    setSubmittingProject(true);
    try {
      const techArray = projectForm.tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingProjectId) {
        const fields = {
          title: projectForm.title.trim(),
          category: projectForm.category,
          short_desc: projectForm.short_desc.trim(),
          role: projectForm.role.trim(),
          timeline: projectForm.timeline.trim(),
          arch: projectForm.arch.trim(),
          outcome: projectForm.outcome.trim(),
          image: projectForm.image.trim(),
          tech: techArray,
          problem: projectForm.problem.trim(),
          design: projectForm.design.trim(),
          code: projectForm.code.trim(),
        };

        await adminApiAction('update_project', { id: editingProjectId, fields });
        showNotice(`Proyek "${projectForm.title}" berhasil diperbarui!`);
      } else {
        const nextIndex = String(projects.length + 1).padStart(2, '0');
        const record: ProjectRecord = {
          id: `proj-${Date.now()}`,
          project_index: nextIndex,
          title: projectForm.title.trim(),
          category: projectForm.category,
          short_desc: projectForm.short_desc.trim(),
          role: projectForm.role.trim(),
          timeline: projectForm.timeline.trim(),
          arch: projectForm.arch.trim(),
          outcome: projectForm.outcome.trim(),
          image: projectForm.image.trim(),
          tech: techArray,
          problem: projectForm.problem.trim(),
          design: projectForm.design.trim(),
          code: projectForm.code.trim(),
        };

        await adminApiAction('create_project', record);
        showNotice('Proyek baru berhasil ditambahkan dan langsung aktif!');
      }

      setIsProjectModalOpen(false);
      setEditingProjectId(null);
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal menyimpan proyek: ${err?.message || 'Error'}`);
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, title?: string) => {
    if (!confirm(`Yakin ingin menghapus proyek ${title ? `"${title}"` : 'ini'}?`)) return;
    try {
      await adminApiAction('delete_project', { id });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showNotice('Proyek berhasil dihapus dari database.');
    } catch (err: any) {
      showNotice(`Gagal menghapus: ${err?.message || 'Error'}`);
    }
  };

  const handleApproveGuestbook = async (id: string) => {
    try {
      await adminApiAction('approve_guestbook', { id, approved: true });
      showNotice('Guestbook berhasil di-ACC! Sekarang tampil di website.');
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal ACC: ${err?.message || 'Error'}`);
    }
  };

  const handleRevokeGuestbook = async (id: string) => {
    try {
      await adminApiAction('approve_guestbook', { id, approved: false });
      showNotice('Status guestbook dikembalikan ke Pending.');
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal mengubah status: ${err?.message || 'Error'}`);
    }
  };

  const handleDeleteGuestbook = async (id: string) => {
    if (!confirm('Hapus pesan guestbook ini secara permanen?')) return;
    try {
      await adminApiAction('delete_guestbook', { id });
      showNotice('Pesan guestbook berhasil dihapus.');
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal menghapus pesan: ${err?.message || 'Error'}`);
    }
  };

  const handleAdminReply = async (parentId: string) => {
    if (!adminReplyText.trim()) return;
    setIsSubmittingAdminReply(true);
    try {
      await adminApiAction('admin_reply_guestbook', { parentId, message: adminReplyText.trim() });
      setAdminReplyText('');
      setActiveReplyBoxId(null);
      showNotice('Balasan Admin berhasil dikirim dengan tag [ADMIN]!');
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal mengirim balasan: ${err?.message || 'Error'}`);
    } finally {
      setIsSubmittingAdminReply(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Hapus pesan kontak ini?')) return;
    try {
      await adminApiAction('delete_contact', { id });
      showNotice('Pesan kontak berhasil dihapus.');
      refreshAllData();
    } catch (err: any) {
      showNotice(`Gagal menghapus kontak: ${err?.message || 'Error'}`);
    }
  };

  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const res = await saveStoredSiteContent(siteContentForm);
      showNotice(
        res.ok
          ? 'Konten portofolio, bio, dan keahlian berhasil disimpan ke Supabase!'
          : `Tersimpan lokal (${res.error || 'cek konfigurasi RLS site_content'})`
      );
    } finally {
      setSavingContent(false);
    }
  };

  const handleResetSiteContent = async () => {
    if (!confirm('Kembalikan seluruh isi bio, filosofi, dan keahlian ke bawaan awal?')) return;
    setSiteContentForm(defaultSiteContent);
    await saveStoredSiteContent(defaultSiteContent);
    showNotice('Konten berhasil di-reset ke nilai default.');
  };

  const copySqlSetup = () => {
    const sql = `-- 1. Tabel site_content untuk konten & tema global
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated write site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Kolom approval guestbook & moderasi aman
ALTER TABLE public.guestbook ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
CREATE POLICY "Public read approved guestbook" ON public.guestbook FOR SELECT TO anon USING (is_approved = true);
CREATE POLICY "Public insert pending guestbook" ON public.guestbook FOR INSERT TO anon WITH CHECK (is_approved = false);
CREATE POLICY "Authenticated manage guestbook" ON public.guestbook FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Projects: publik hanya read, admin authenticated CRUD
CREATE POLICY "Public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated manage projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Contacts: publik hanya boleh insert, hanya authenticated admin yang boleh read/delete
CREATE POLICY "Public submit contacts" ON public.contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated manage contacts" ON public.contacts FOR SELECT, DELETE TO authenticated USING (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2400);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#09090C] text-white flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="font-mono text-xs text-neutral-400 tracking-widest uppercase">
          Memverifikasi sesi keamanan...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        loginUsername={loginUsername}
        setLoginUsername={setLoginUsername}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        authError={authError}
        isLoggingIn={isLoggingIn}
        onSubmit={handleLogin}
      />
    );
  }

  const navBtnClass = (tab: ActiveTab) =>
    `w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
      activeTab === tab
        ? isDark
          ? 'bg-white text-black font-bold shadow-sm'
          : 'bg-slate-900 text-white font-bold shadow-sm'
        : isDark
        ? 'text-neutral-400 hover:text-white hover:bg-white/5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div
      className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-200 ${
        isDark ? 'bg-[#0B0B0F] text-neutral-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Mobile Header */}
      <div
        className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40 backdrop-blur-md ${
          isDark ? 'bg-[#101016]/95 border-white/10' : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`p-2 rounded-xl border text-sm ${
              isDark ? 'bg-white/5 border-white/10 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            aria-label="Toggle Navigation Sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-display font-extrabold text-base">
            Takizawa<span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>blox</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
            title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 flex flex-col justify-between z-50 transition-all duration-300 border-r ${
          isDark ? 'bg-[#101016] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md shrink-0 ${
                  isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                }`}
              >
                T
              </div>
              <div>
                <div className="font-display font-extrabold text-lg tracking-tight">
                  Takizawa<span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>blox</span>
                </div>
                <div className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Admin Studio v2.7
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5 pt-2">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider px-3 block mb-2 font-semibold ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              Menu Navigasi
            </span>

            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('overview')}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Ringkasan (Overview)</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('projects');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('projects')}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4" />
                <span>Kelola Project (CRUD)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary font-bold">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('content');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('content')}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Kelola Konten &amp; Bio</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('theme');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('theme')}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-primary" />
                <span>Tema &amp; Warna Web</span>
              </div>
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: selectedThemeColor }}
              />
            </button>

            <button
              onClick={() => {
                setActiveTab('contacts');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('contacts')}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Pesan Masuk</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-400 font-bold">
                {contacts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('guestbook');
                setIsMobileSidebarOpen(false);
              }}
              className={navBtnClass('guestbook')}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Buku Tamu</span>
              </div>
              {guestbookPending.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-mono font-bold">
                  {guestbookPending.length} Baru
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 font-bold">
                  {guestbookApproved.length}
                </span>
              )}
            </button>
          </div>

          {/* Admin Dark/Light Switcher */}
          <div className="pt-4 border-t border-dashed border-white/10 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Mode Admin
              </span>
            </div>
            <div
              className={`p-1 rounded-xl flex items-center border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-white text-black shadow-sm' : 'text-neutral-500'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  !isDark ? 'bg-slate-900 text-white shadow-sm' : 'text-neutral-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-5 border-t space-y-3 ${
            isDark ? 'border-white/10 bg-[#0C0C12]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all group ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Web</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                }`}
              >
                JT
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{adminSubject}</div>
                <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
              title="Keluar dari Dashboard"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {statusNotice && (
          <div
            className={`px-6 py-2.5 text-xs font-medium text-center shadow-md transition-all font-mono ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            {statusNotice}
          </div>
        )}

        <div className="p-6 sm:p-8 flex-1 space-y-8 max-w-7xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight">
                {activeTab === 'overview' && 'Ringkasan Studio'}
                {activeTab === 'projects' && 'Kelola Proyek (CRUD)'}
                {activeTab === 'content' && 'Kelola Konten & Bio'}
                {activeTab === 'theme' && 'Kustomisasi Tema & Warna Web'}
                {activeTab === 'contacts' && 'Pesan Kontak Masuk'}
                {activeTab === 'guestbook' && 'Moderasi Buku Tamu (Guestbook)'}
              </h1>
              <p className={`text-xs font-sans mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Kelola seluruh konten, proyek, dan respon pengunjung secara aman.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs transition-all cursor-pointer ${
                  activeTab === 'theme'
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/10 text-primary font-bold'
                    : isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: selectedThemeColor }} />
                <span>Warna: {selectedThemeColor}</span>
              </button>

              <button
                onClick={refreshAllData}
                disabled={isLoading}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <AdminOverviewTab
              isDark={isDark}
              projects={projects}
              contacts={contacts}
              guestbookPending={guestbookPending}
              guestbookApproved={guestbookApproved}
              copiedSql={copiedSql}
              onSelectTab={setActiveTab}
              onSelectGuestbookTab={setGuestbookTab}
              onApproveGuestbook={handleApproveGuestbook}
              onCopySqlSetup={copySqlSetup}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              isDark={isDark}
              projects={projects}
              onOpenCreate={handleOpenCreateModal}
              onOpenEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
            />
          )}

          {activeTab === 'content' && (
            <AdminContentTab
              isDark={isDark}
              siteContentForm={siteContentForm}
              setSiteContentForm={setSiteContentForm}
              savingContent={savingContent}
              newTypingText={newTypingText}
              setNewTypingText={setNewTypingText}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              onSave={handleSaveSiteContent}
              onReset={handleResetSiteContent}
              onAddTypingText={() => {
                if (!newTypingText.trim()) return;
                setSiteContentForm((prev) => ({
                  ...prev,
                  heroTypingTexts: [...prev.heroTypingTexts, newTypingText.trim()],
                }));
                setNewTypingText('');
              }}
              onRemoveTypingText={(index) =>
                setSiteContentForm((prev) => ({
                  ...prev,
                  heroTypingTexts: prev.heroTypingTexts.filter((_, i) => i !== index),
                }))
              }
              onAddSkill={() => {
                if (!newSkill.name.trim()) return;
                setSiteContentForm((prev) => ({ ...prev, skills: [...prev.skills, { ...newSkill }] }));
                showNotice(`Keahian "${newSkill.name}" berhasil ditambahkan.`);
                setNewSkill({ name: '', category: 'frontend', level: '90%', tag: 'Frontend' });
              }}
              onRemoveSkill={(index) =>
                setSiteContentForm((prev) => ({
                  ...prev,
                  skills: prev.skills.filter((_, i) => i !== index),
                }))
              }
              onUpdateSkill={(index, field, value) =>
                setSiteContentForm((prev) => {
                  const updated = [...prev.skills];
                  updated[index] = { ...updated[index], [field]: value };
                  return { ...prev, skills: updated };
                })
              }
            />
          )}

          {activeTab === 'theme' && (
            <AdminThemeTab
              isDark={isDark}
              selectedThemeColor={selectedThemeColor}
              selectedPresetId={selectedPresetId}
              customHexInput={customHexInput}
              themeStyle={themeStyle}
              isSavingThemeColor={isSavingThemeColor}
              onResetThemeColor={handleResetThemeColor}
              onSaveThemeColor={handleSaveThemeColor}
              onToggleThemeStyle={handleToggleThemeStyle}
              onSelectPresetColor={handleSelectPresetColor}
              onCustomHexChange={handleCustomHexChange}
              onCopyHex={(hex) => {
                navigator.clipboard.writeText(hex);
                showNotice(`Kode warna ${hex} berhasil disalin!`);
              }}
            />
          )}

          {activeTab === 'contacts' && (
            <AdminContactsTab
              isDark={isDark}
              contacts={contacts}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {activeTab === 'guestbook' && (
            <AdminGuestbookTab
              isDark={isDark}
              guestbookTab={guestbookTab}
              setGuestbookTab={setGuestbookTab}
              guestbookPending={guestbookPending}
              guestbookApproved={guestbookApproved}
              activeReplyBoxId={activeReplyBoxId}
              setActiveReplyBoxId={setActiveReplyBoxId}
              adminReplyText={adminReplyText}
              setAdminReplyText={setAdminReplyText}
              isSubmittingAdminReply={isSubmittingAdminReply}
              onApprove={handleApproveGuestbook}
              onRevoke={handleRevokeGuestbook}
              onDelete={handleDeleteGuestbook}
              onAdminReply={handleAdminReply}
            />
          )}
        </div>
      </main>

      <AdminProjectModal
        isDark={isDark}
        isOpen={isProjectModalOpen}
        editingProjectId={editingProjectId}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        submittingProject={submittingProject}
        imageSourceMode={imageSourceMode}
        setImageSourceMode={setImageSourceMode}
        isUploadingImage={isUploadingImage}
        folderImages={folderImages}
        loadingFolderImages={loadingFolderImages}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        onFetchFolderImages={fetchFolderImages}
        onSaveProject={handleSaveProject}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProjectId(null);
        }}
      />
    </div>
  );
}
