'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  BookOpen,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Database,
  ShieldCheck,
  ArrowLeft,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Send,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  FolderOpen,
  Menu,
  X,
  Sun,
  Moon,
  Pencil,
  CornerDownRight,
  MessageCircle,
  Sliders,
  FileText,
  Sparkles,
  Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProjectCategory, SiteContent, SkillItem } from '@/types/portfolio';
import { defaultSiteContent, getStoredSiteContent, saveStoredSiteContent } from '@/data/portfolio-data';

type ActiveTab = 'overview' | 'projects' | 'content' | 'contacts' | 'guestbook';
type AdminThemeMode = 'dark' | 'light';

interface ContactItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

interface ProjectRecord {
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

interface GuestbookRecord {
  id: string;
  name: string;
  handle: string;
  role: string;
  message: string;
  likes: number;
  is_approved?: boolean;
  created_at: string;
}

interface ParsedGuestbookItem extends GuestbookRecord {
  cleanMessage: string;
  parentId?: string;
  isReply: boolean;
  isAdminReply: boolean;
  replies?: ParsedGuestbookItem[];
}

const parseReplyMessage = (rawMessage: string) => {
  const match = (rawMessage || '').match(/^\[reply:([^\]]+)\]\s*([\s\S]*)$/);
  if (match) {
    const rawTag = match[1];
    const cleanMessage = match[2];
    const isAdmin = rawTag.includes('|admin');
    const parentId = rawTag.replace('|admin', '').trim();
    return { isReply: true, parentId, isAdmin, cleanMessage };
  }
  return { isReply: false, parentId: null, isAdmin: false, cleanMessage: rawMessage || '' };
};

const EMPTY_PROJECT_FORM = {
  title: '',
  category: 'Frontend Web' as ProjectCategory,
  short_desc: '',
  role: 'Lead Frontend Developer',
  timeline: '3 Weeks (2026)',
  arch: 'Next.js 15 + Supabase + Tailwind',
  outcome: '99 Lighthouse Score',
  image: '/projects/my-project.jpg',
  tech: 'Next.js, TypeScript, Tailwind CSS, Supabase',
  problem: '',
  design: '',
  code: '',
};

export default function AdminDashboardPage() {
  // Theme state: STRICTLY Dark and Light Mode only
  const [themeMode, setThemeMode] = useState<AdminThemeMode>('dark');
  const isDark = themeMode === 'dark';

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Layout states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  // Data states
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [guestbookPending, setGuestbookPending] = useState<ParsedGuestbookItem[]>([]);
  const [guestbookApproved, setGuestbookApproved] = useState<ParsedGuestbookItem[]>([]);
  const [guestbookTab, setGuestbookTab] = useState<'pending' | 'approved'>('pending');
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [isSubmittingAdminReply, setIsSubmittingAdminReply] = useState<boolean>(false);

  // Project CRUD states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);

  // Content Management States
  const [siteContentForm, setSiteContentForm] = useState<SiteContent>(defaultSiteContent);
  const [savingContent, setSavingContent] = useState(false);
  const [newTypingText, setNewTypingText] = useState('');
  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: '',
    category: 'frontend',
    level: '90%',
    tag: 'Frontend',
  });

  // Folder image upload states
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'folder' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [folderImages, setFolderImages] = useState<{ filename: string; url: string }[]>([]);
  const [loadingFolderImages, setLoadingFolderImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action status message
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // 1. Load saved theme mode (Dark / Light)
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('admin_theme_mode') as AdminThemeMode;
      if (savedMode === 'dark' || savedMode === 'light') {
        setThemeMode(savedMode);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleToggleTheme = (mode: AdminThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('admin_theme_mode', mode);
    } catch {
      // Ignored
    }
    showNotice(mode === 'dark' ? '🌙 Berpindah ke Dark Mode' : '☀️ Berpindah ke Light Mode');
  };

  // 2. Fetch local folder images from public/projects
  const fetchFolderImages = useCallback(async () => {
    setLoadingFolderImages(true);
    try {
      const res = await fetch('/api/project-images');
      const data = await res.json();
      if (data.images) {
        setFolderImages(data.images);
      }
    } catch (err) {
      console.error('Failed to load local folder images:', err);
    } finally {
      setLoadingFolderImages(false);
    }
  }, []);

  // 3. Upload file from computer to public/projects
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const token =
        sessionStorage.getItem('takizawa_admin_auth') ||
        localStorage.getItem('takizawa_admin_auth') ||
        '';

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-project-image', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setProjectForm((prev) => ({ ...prev, image: data.url }));
        showNotice(`✅ Gambar berhasil diunggah (${data.filename})!`);
        fetchFolderImages();
      } else {
        alert(data.error || 'Gagal mengunggah gambar');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek sesi Supabase Auth aktif
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setIsAuthenticated(true);
          return;
        }

        const sessionToken = sessionStorage.getItem('takizawa_admin_auth');
        const localToken = localStorage.getItem('takizawa_admin_auth');
        if (
          sessionToken === 'authenticated_jheryco_2026' ||
          localToken === 'authenticated_jheryco_2026'
        ) {
          setIsAuthenticated(true);
        }
      } catch {
        // Ignored
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // 5. Login verification (Supabase Auth & Admin credentials)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const trimmedUser = loginUsername.trim();
    const trimmedPw = loginPassword;

    try {
      // 1. Dukungan Supabase Auth jika input berupa email
      if (trimmedUser.includes('@')) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: trimmedPw,
        });

        if (!authErr && authData?.session) {
          try {
            if (rememberMe) {
              localStorage.setItem('takizawa_admin_auth', 'authenticated_jheryco_2026');
            } else {
              sessionStorage.setItem('takizawa_admin_auth', 'authenticated_jheryco_2026');
            }
          } catch {}
          setIsAuthenticated(true);
          setIsLoggingIn(false);
          showNotice('✅ Login Supabase Auth berhasil! Akses Dashboard diberikan.');
          return;
        }
      }

      // 2. Kredensial Administrator Takizawa
      if (
        (trimmedUser.toLowerCase() === 'jherycotakizawa' || trimmedUser.toLowerCase() === 'takizawa') &&
        trimmedPw === 'Chikzz4You'
      ) {
        try {
          if (rememberMe) {
            localStorage.setItem('takizawa_admin_auth', 'authenticated_jheryco_2026');
          } else {
            sessionStorage.setItem('takizawa_admin_auth', 'authenticated_jheryco_2026');
          }
        } catch {
          // Ignored
        }
        setIsAuthenticated(true);
        setIsLoggingIn(false);
        showNotice('Selamat datang kembali, Jheryco! Akses Dashboard diberikan.');
        return;
      }

      setAuthError('Username/Email atau Password salah! Periksa kembali kredensial Anda.');
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan saat verifikasi login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('takizawa_admin_auth');
      localStorage.removeItem('takizawa_admin_auth');
    } catch {
      // Ignored
    }
    setIsAuthenticated(false);
    setLoginPassword('');
    setAuthError(null);
    showNotice('Anda telah berhasil keluar dari Dashboard.');
  };

  // 6. Fetch all Supabase data
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Projects
      const projRes = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projRes.data) {
        setProjects(projRes.data as ProjectRecord[]);
      }

      // 2. Contacts
      const contactRes = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (contactRes.data) {
        setContacts(contactRes.data as ContactItem[]);
      }

      // 3. Guestbook
      const gbAllRes = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
      if (gbAllRes.data) {
        const rawItems = gbAllRes.data as GuestbookRecord[];
        const parentMap = new Map<string, ParsedGuestbookItem>();
        const repliesList: ParsedGuestbookItem[] = [];

        rawItems.forEach((item) => {
          const parsed = parseReplyMessage(item.message);
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

        // Hubungkan balasan ke induknya (urutan kronologis terlama -> terbaru)
        repliesList.reverse().forEach((reply) => {
          if (reply.parentId && parentMap.has(reply.parentId)) {
            parentMap.get(reply.parentId)!.replies!.push(reply);
          }
        });

        const allParents = Array.from(parentMap.values());
        const pending = allParents.filter((item) => item.is_approved === false || item.is_approved === null || item.is_approved === undefined);
        const approved = allParents.filter((item) => item.is_approved === true);
        setGuestbookPending(pending);
        setGuestbookApproved(approved);
      }

      // 4. Site Content & Bio Data
      try {
        const { data: scData } = await supabase.from('site_content').select('*').eq('id', 'primary').maybeSingle();
        if (scData && scData.content) {
          const parsed = typeof scData.content === 'string' ? JSON.parse(scData.content) : scData.content;
          setSiteContentForm({ ...defaultSiteContent, ...parsed });
          if (typeof window !== 'undefined') {
            localStorage.setItem('takizawa_site_content', JSON.stringify(parsed));
          }
        } else {
          setSiteContentForm(getStoredSiteContent());
        }
      } catch {
        setSiteContentForm(getStoredSiteContent());
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Content Management Action Handlers
  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      await saveStoredSiteContent(siteContentForm);
      showNotice('✅ Konten portofolio, bio, dan keahlian berhasil diperbarui secara langsung!');
    } catch (err: any) {
      showNotice('❌ Gagal menyimpan konten: ' + (err.message || 'Error'));
    } finally {
      setSavingContent(false);
    }
  };

  const handleResetSiteContent = () => {
    if (confirm('Kembalikan seluruh isi bio, filosofi, dan keahlian ke bawaan awal?')) {
      setSiteContentForm(defaultSiteContent);
      saveStoredSiteContent(defaultSiteContent);
      showNotice('🔄 Konten berhasil di-reset ke nilai default.');
    }
  };

  const handleAddTypingText = () => {
    if (!newTypingText.trim()) return;
    setSiteContentForm((prev) => ({
      ...prev,
      heroTypingTexts: [...prev.heroTypingTexts, newTypingText.trim()],
    }));
    setNewTypingText('');
  };

  const handleRemoveTypingText = (index: number) => {
    setSiteContentForm((prev) => ({
      ...prev,
      heroTypingTexts: prev.heroTypingTexts.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    setSiteContentForm((prev) => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }],
    }));
    setNewSkill({
      name: '',
      category: 'frontend',
      level: '90%',
      tag: 'Frontend',
    });
    showNotice(`✅ Keahlian "${newSkill.name}" berhasil ditambahkan.`);
  };

  const handleRemoveSkill = (index: number) => {
    setSiteContentForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSkill = (index: number, field: keyof SkillItem, value: string) => {
    setSiteContentForm((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  // 7. PROJECT CRUD HANDLERS
  // Create Modal Open
  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setProjectForm({
      ...EMPTY_PROJECT_FORM,
      image: folderImages.length > 0 ? folderImages[0].url : '/projects/my-project.jpg',
    });
    setImageSourceMode('upload');
    setIsProjectModalOpen(true);
    fetchFolderImages();
  };

  // Edit Modal Open (pre-fill form with selected project)
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

  // Save (Create or Update) Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      alert('Judul proyek tidak boleh kosong!');
      return;
    }

    setSubmittingProject(true);
    try {
      const techArray = projectForm.tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingProjectId) {
        // UPDATE (EDIT)
        const updatedFields = {
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

        const { error } = await supabase
          .from('projects')
          .update(updatedFields)
          .eq('id', editingProjectId);

        if (error) {
          showNotice(`Gagal update project: ${error.message}`);
        } else {
          showNotice(`✅ Proyek "${projectForm.title}" berhasil diperbarui!`);
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProjectId ? { ...p, ...updatedFields } : p))
          );
          setIsProjectModalOpen(false);
          setEditingProjectId(null);
          refreshAllData();
        }
      } else {
        // CREATE
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

        const { error } = await supabase.from('projects').insert([record]);
        if (error) {
          showNotice(`Gagal menambah project: ${error.message}`);
        } else {
          showNotice('🚀 Proyek baru berhasil ditambahkan dan langsung aktif!');
          setProjects((prev) => [record, ...prev]);
          setIsProjectModalOpen(false);
          refreshAllData();
        }
      }
    } catch (err: any) {
      console.error('Error saving project:', err);
      showNotice(`Terjadi kesalahan: ${err?.message || err}`);
    } finally {
      setSubmittingProject(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, title?: string) => {
    if (!confirm(`Yakin ingin menghapus proyek ${title ? `"${title}"` : 'ini'}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        showNotice(`Gagal menghapus: ${error.message}`);
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showNotice('Proyek berhasil dihapus dari database.');
        refreshAllData();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // 8. GUESTBOOK & CONTACT HANDLERS
  const handleApproveGuestbook = async (id: string) => {
    try {
      const res = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
      if (res.error) {
        showNotice(`Gagal ACC: ${res.error.message}`);
      } else {
        showNotice('✅ Guestbook berhasil di-ACC! Sekarang tampil di website.');
        refreshAllData();
      }
    } catch (err) {
      console.error('Error approving guestbook:', err);
    }
  };

  const handleRevokeGuestbook = async (id: string) => {
    try {
      await supabase.from('guestbook').update({ is_approved: false }).eq('id', id);
      showNotice('Status guestbook dikembalikan ke Pending.');
      refreshAllData();
    } catch (err) {
      console.error('Error revoking guestbook:', err);
    }
  };

  const handleDeleteGuestbook = async (id: string) => {
    if (!confirm('Hapus pesan guestbook ini secara permanen?')) return;
    try {
      await supabase.from('guestbook').delete().eq('id', id);
      showNotice('Pesan guestbook berhasil dihapus.');
      refreshAllData();
    } catch (err) {
      console.error('Error deleting guestbook:', err);
    }
  };

  const handleAdminReply = async (parentId: string) => {
    if (!adminReplyText.trim()) {
      showNotice('Ketik pesan balasan terlebih dahulu!');
      return;
    }

    setIsSubmittingAdminReply(true);
    try {
      const replyPayload = {
        name: 'Jheryco Takizawa',
        handle: '@jtakizawa',
        role: 'Owner & Admin',
        message: `[reply:${parentId}|admin] ${adminReplyText.trim()}`,
        likes: 1,
        is_approved: true,
      };

      const res = await supabase.from('guestbook').insert([replyPayload]);
      if (res.error && res.error.message.includes('is_approved')) {
        await supabase.from('guestbook').insert([
          {
            name: replyPayload.name,
            handle: replyPayload.handle,
            role: replyPayload.role,
            message: replyPayload.message,
            likes: replyPayload.likes,
          },
        ]);
      }

      setAdminReplyText('');
      setActiveReplyBoxId(null);
      showNotice('✅ Balasan Admin berhasil dikirim & tampil dengan tag [ADMIN]!');
      refreshAllData();
    } catch (err: any) {
      console.error('Error submitting admin reply:', err);
      showNotice(`Gagal mengirim balasan: ${err?.message || err}`);
    } finally {
      setIsSubmittingAdminReply(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Hapus pesan kontak ini?')) return;
    try {
      await supabase.from('contacts').delete().eq('id', id);
      showNotice('Pesan kontak berhasil dihapus.');
      refreshAllData();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const copySqlSetup = () => {
    const sql = `-- 1. Kolom approval guestbook
ALTER TABLE public.guestbook ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Kebijakan CRUD Projects untuk Dashboard
CREATE POLICY "Allow public insert on projects" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON public.projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on projects" ON public.projects FOR DELETE TO anon, authenticated USING (true);

-- 3. Kebijakan Baca & Kelola Pesan Kontak untuk Dashboard
CREATE POLICY "Allow public read on contacts" ON public.contacts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public delete on contacts" ON public.contacts FOR DELETE TO anon, authenticated USING (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2400);
  };

  // 1. Loading Authentication State
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

  // 2. Unauthenticated Login Gate (Clean Monochromatic)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090C] text-neutral-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans">
        {/* Subtle monochrome ambient gradients */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />

        {/* Back Link */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Web</span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#101016] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  <span>Admin Studio Gate</span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  Takizawa<span className="text-neutral-400">blox</span>
                </h1>
                <p className="text-xs text-neutral-400 font-sans max-w-xs pt-1">
                  Masukkan akun otorisasi untuk mengakses pengelolaan proyek (CRUD), pesan masuk, dan moderasi.
                </p>
              </div>
            </div>

            {authError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Username atau Email Supabase</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="JherycoTakizawa atau email@admin.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-white focus:ring-1 focus:ring-white text-white placeholder-neutral-500 text-sm font-sans outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-neutral-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-white focus:ring-1 focus:ring-white text-white placeholder-neutral-500 text-sm font-sans outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-white focus:ring-0 cursor-pointer"
                  />
                  <span>Ingat sesi di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-neutral-200 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard Render
  return (
    <div
      className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-200 ${
        isDark ? 'bg-[#0B0B0F] text-neutral-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Mobile Top Header */}
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
          {/* Quick theme toggle */}
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

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Dashboard Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 flex flex-col justify-between z-50 transition-all duration-300 border-r ${
          isDark ? 'bg-[#101016] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Sidebar Brand Header */}
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
                  Admin Studio v2.6
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

          {/* Navigation Links */}
          <div className="space-y-1.5 pt-2">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider px-3 block mb-2 font-semibold ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              Menu Navigasi
            </span>

            {/* Overview */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-slate-900 text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Ringkasan (Overview)</span>
              </div>
            </button>

            {/* Projects */}
            <button
              onClick={() => {
                setActiveTab('projects');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-slate-900 text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4" />
                <span>Kelola Project (CRUD)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'projects'
                    ? isDark
                      ? 'bg-black/15 text-black font-bold'
                      : 'bg-white/20 text-white font-bold'
                    : isDark
                    ? 'bg-white/10 text-neutral-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {projects.length}
              </span>
            </button>

            {/* Content & Bio Manager */}
            <button
              onClick={() => {
                setActiveTab('content');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'content'
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-slate-900 text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Kelola Konten &amp; Bio</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'content'
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                Live
              </span>
            </button>

            {/* Contacts */}
            <button
              onClick={() => {
                setActiveTab('contacts');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'contacts'
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-slate-900 text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Pesan Masuk</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'contacts'
                    ? isDark
                      ? 'bg-black/15 text-black font-bold'
                      : 'bg-white/20 text-white font-bold'
                    : isDark
                    ? 'bg-white/10 text-neutral-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {contacts.length}
              </span>
            </button>

            {/* Guestbook */}
            <button
              onClick={() => {
                setActiveTab('guestbook');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'guestbook'
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-slate-900 text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
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
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === 'guestbook'
                      ? isDark
                        ? 'bg-black/15 text-black font-bold'
                        : 'bg-white/20 text-white font-bold'
                      : isDark
                      ? 'bg-white/10 text-neutral-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {guestbookApproved.length}
                </span>
              )}
            </button>
          </div>

          {/* Dark & Light Mode Switcher (STRICTLY NO OTHER COLORS) */}
          <div className="pt-4 border-t border-dashed border-white/10 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                Mode Tampilan
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            {/* Segmented Dark/Light Toggle */}
            <div
              className={`p-1 rounded-xl flex items-center border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-slate-900'
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
                <div className="text-xs font-bold truncate">JherycoTakizawa</div>
                <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Superadmin</span>
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

      {/* Main Content Area (Clean, sidebar-only navigation) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Status Notice Banner */}
        {statusNotice && (
          <div
            className={`px-6 py-2.5 text-xs font-medium text-center shadow-md transition-all font-mono ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            {statusNotice}
          </div>
        )}

        {/* Content Container */}
        <div className="p-6 sm:p-8 flex-1 space-y-8 max-w-7xl w-full">
          {/* Header Title & Status Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight">
                {activeTab === 'overview' && 'Ringkasan Studio'}
                {activeTab === 'projects' && 'Kelola Proyek (CRUD)'}
                {activeTab === 'content' && 'Kelola Konten & Bio'}
                {activeTab === 'contacts' && 'Pesan Kontak Masuk'}
                {activeTab === 'guestbook' && 'Moderasi Buku Tamu (Guestbook)'}
              </h1>
              <p className={`text-xs font-sans mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Kelola seluruh konten, proyek, dan respon pengunjung secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Connected</span>
              </div>

              <button
                onClick={refreshAllData}
                disabled={isLoading}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Refresh / Sinkronkan Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Proyek */}
                <div
                  onClick={() => setActiveTab('projects')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 hover:border-white/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase font-mono tracking-wider font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Total Proyek
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-extrabold">
                      {projects.length}
                    </span>
                    <span className="text-xs font-medium underline">
                      Kelola CRUD &rarr;
                    </span>
                  </div>
                </div>

                {/* Pesan Kontak */}
                <div
                  onClick={() => setActiveTab('contacts')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 hover:border-white/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase font-mono tracking-wider font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Pesan Kontak
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-extrabold">
                      {contacts.length}
                    </span>
                    <span className="text-xs font-medium underline">
                      Lihat Pesan &rarr;
                    </span>
                  </div>
                </div>

                {/* Menunggu ACC */}
                <div
                  onClick={() => {
                    setActiveTab('guestbook');
                    setGuestbookTab('pending');
                  }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 hover:border-white/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 text-amber-500">
                      <Clock className="w-3.5 h-3.5" />
                      Menunggu ACC
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-extrabold text-amber-500">
                      {guestbookPending.length}
                    </span>
                    <span className="text-xs text-amber-500 font-medium underline">
                      Perlu Di-ACC &rarr;
                    </span>
                  </div>
                </div>

                {/* Guestbook Aktif */}
                <div
                  onClick={() => {
                    setActiveTab('guestbook');
                    setGuestbookTab('approved');
                  }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 hover:border-white/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Guestbook Aktif
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-extrabold text-emerald-500">
                      {guestbookApproved.length}
                    </span>
                    <span className="text-xs text-emerald-500 font-medium underline">
                      Tampil di Web &rarr;
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Split Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Pending Guestbook */}
                <div
                  className={`lg:col-span-6 p-6 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-inherit">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <h3 className="font-display font-bold text-base">
                        Guestbook Menunggu ACC ({guestbookPending.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('guestbook');
                        setGuestbookTab('pending');
                      }}
                      className="text-xs font-mono underline"
                    >
                      Buka Semua
                    </button>
                  </div>

                  {guestbookPending.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-sm">
                      Semua guestbook sudah di-ACC atau belum ada entri baru.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guestbookPending.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border space-y-2 ${
                            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm">{item.name}</span>
                              <span className="text-xs font-mono text-neutral-400 ml-2">
                                {item.handle}
                              </span>
                            </div>
                            <button
                              onClick={() => handleApproveGuestbook(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ACC</span>
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            &quot;{item.message}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Latest Contacts */}
                <div
                  className={`lg:col-span-6 p-6 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-inherit">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <h3 className="font-display font-bold text-base">
                        Pesan Kontak Terbaru ({contacts.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="text-xs font-mono underline"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-sm">
                      Belum ada pesan kontak masuk.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className={`p-4 rounded-xl border space-y-2 ${
                            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{c.name}</span>
                            <span className="text-[11px] font-mono text-neutral-400">{c.email}</span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2">
                            &quot;{c.message}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Supabase SQL Helper Card */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-neutral-400" />
                    <h4 className="font-mono text-xs uppercase tracking-wider font-bold">
                      Kebijakan &amp; Skrip Database Supabase
                    </h4>
                  </div>
                  <button
                    onClick={copySqlSetup}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    }`}
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL Supabase'}</span>
                  </button>
                </div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Jalankan skrip ini sekali di <strong>SQL Editor Supabase</strong> jika ingin memastikan izin CRUD proyek dan moderasi buku tamu aktif tanpa kendala.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: KELOLA PROJECT (CRUD LENGKAP: CREATE, READ, UPDATE, DELETE) */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">Daftar Proyek Portofolio</h3>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Fitur CRUD lengkap: Tambah baru, Edit isi/gambar, Hapus proyek, dan langsung live di portofolio.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start ${
                    isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Project Baru</span>
                </button>
              </div>

              {/* Projects Grid */}
              {projects.length === 0 ? (
                <div
                  className={`p-12 text-center rounded-2xl border space-y-4 ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-12 h-12 text-neutral-400 mx-auto" />
                  <h4 className="font-bold text-base">Belum Ada Proyek di Database Supabase</h4>
                  <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Saat database kosong, website portofolio menggunakan data dummy bawaan. Tambahkan proyek nyata pertama Anda di sini.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md ${
                      isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    + Buat Proyek Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-sm group ${
                        isDark
                          ? 'bg-[#14141E] border-white/10 hover:border-white/30'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Cover Image Preview */}
                        <div className="relative w-full h-44 bg-neutral-900 overflow-hidden">
                          {proj.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-xs">
                              No Cover Image
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                            {proj.category}
                          </span>

                          {/* Source indicator */}
                          {proj.image?.startsWith('/projects/') && (
                            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                              📁 Folder Lokal
                            </span>
                          )}
                        </div>

                        {/* Project Details */}
                        <div className="p-5 space-y-2">
                          <h4 className="font-display font-bold text-base">{proj.title}</h4>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                            {proj.short_desc}
                          </p>

                          {/* Tech stack tags */}
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {proj.tech?.map((t, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-neutral-300'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* CRUD Actions Footer on Each Card */}
                      <div
                        className={`p-3.5 border-t flex items-center justify-between ${
                          isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <span className={`font-mono text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                          {proj.timeline || '2026'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleOpenEditModal(proj)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                            }`}
                            title="Edit Proyek"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* LIVE WEB LINK */}
                          <Link
                            href={`/projects/${proj.id}`}
                            target="_blank"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300 hover:text-white'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                            }`}
                            title="Lihat Detail di Web"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CONTENT & BIO MANAGER */}
          {activeTab === 'content' && (
            <form onSubmit={handleSaveSiteContent} className="space-y-8">
              {/* Header Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-primary/5 border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-display font-bold text-lg text-primary">
                      Kelola Isi Konten, Bio &amp; Keahlian
                    </h3>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Perubahan yang Anda simpan di sini akan langsung tampil pada Hero, About, dan Skills portofolio secara real-time.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetSiteContent}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-white/10 hover:bg-white/10 text-neutral-300'
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Reset Bawaan
                  </button>

                  <button
                    type="submit"
                    disabled={savingContent}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-tertiary text-white font-mono text-xs font-bold transition-all shadow-md hover:shadow-primary/30 cursor-pointer disabled:opacity-50"
                  >
                    {savingContent ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingContent ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>

              {/* Bento Grid: Section 1 & 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Hero & Identitas Pengembang */}
                <div
                  className={`p-6 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-inherit">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="font-display font-bold text-base">Profil &amp; Hero Section</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-neutral-400">Salam Pembuka</label>
                      <input
                        type="text"
                        value={siteContentForm.heroGreeting}
                        onChange={(e) =>
                          setSiteContentForm((prev) => ({ ...prev, heroGreeting: e.target.value }))
                        }
                        placeholder="Hey, I'm"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans outline-none transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-white text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-neutral-400">Nama Tampilan</label>
                      <input
                        type="text"
                        value={siteContentForm.heroName}
                        onChange={(e) =>
                          setSiteContentForm((prev) => ({ ...prev, heroName: e.target.value }))
                        }
                        placeholder="Jheryco Takizawa"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans outline-none transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-white text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Typing Text List */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-mono font-medium text-neutral-400">
                        Judul Profesi Animasi (Typing Machine)
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {siteContentForm.heroTypingTexts.map((txt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold"
                          >
                            <span>{txt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTypingText(idx)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTypingText}
                          onChange={(e) => setNewTypingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTypingText();
                            }
                          }}
                          placeholder="Tambah profesi baru (cth: Creative Developer)"
                          className={`flex-1 px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleAddTypingText}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-mono font-medium text-neutral-400">Judul Slogan Filosofi</label>
                      <textarea
                        rows={2}
                        value={siteContentForm.heroPhilosophyTitle}
                        onChange={(e) =>
                          setSiteContentForm((prev) => ({ ...prev, heroPhilosophyTitle: e.target.value }))
                        }
                        className={`w-full px-4 py-2 rounded-xl border text-sm font-sans outline-none transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-white text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-neutral-400">Deskripsi Filosofi</label>
                      <textarea
                        rows={3}
                        value={siteContentForm.heroPhilosophyDesc}
                        onChange={(e) =>
                          setSiteContentForm((prev) => ({ ...prev, heroPhilosophyDesc: e.target.value }))
                        }
                        className={`w-full px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-white text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. About & Kontak Sosial */}
                <div className="space-y-6">
                  {/* About Settings */}
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-inherit">
                      <FileText className="w-4 h-4 text-primary" />
                      <h4 className="font-display font-bold text-base">Halaman Tentang &amp; Kredensial</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">Label Eyebrow About</label>
                        <input
                          type="text"
                          value={siteContentForm.aboutEyebrow}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, aboutEyebrow: e.target.value }))
                          }
                          className={`w-full px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">Judul Utama H2 About</label>
                        <input
                          type="text"
                          value={siteContentForm.aboutTitle}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, aboutTitle: e.target.value }))
                          }
                          className={`w-full px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">Badge Sekolah &amp; Program</label>
                        <input
                          type="text"
                          value={siteContentForm.aboutSchoolBadge}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, aboutSchoolBadge: e.target.value }))
                          }
                          className={`w-full px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kontak & Media Sosial */}
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-inherit">
                      <Mail className="w-4 h-4 text-primary" />
                      <h4 className="font-display font-bold text-base">Kontak &amp; Tautan Sosial</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">Email Utama</label>
                        <input
                          type="email"
                          value={siteContentForm.contactEmail}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                          }
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">URL GitHub</label>
                        <input
                          type="url"
                          value={siteContentForm.githubUrl}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                          }
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">URL Instagram</label>
                        <input
                          type="url"
                          value={siteContentForm.instagramUrl}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, instagramUrl: e.target.value }))
                          }
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-medium text-neutral-400">URL TikTok</label>
                        <input
                          type="url"
                          value={siteContentForm.tiktokUrl}
                          onChange={(e) =>
                            setSiteContentForm((prev) => ({ ...prev, tiktokUrl: e.target.value }))
                          }
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 focus:border-white text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Kelola Keahlian & Skills Manager */}
              <div
                className={`p-6 rounded-2xl border space-y-5 ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <h4 className="font-display font-bold text-base">Kelola Keahlian &amp; Tech Stack</h4>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Total: {siteContentForm.skills.length} Keahlian
                  </span>
                </div>

                {/* Form Tambah Skill Baru */}
                <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] space-y-3">
                  <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Tambah Keahlian Baru
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nama Skill (cth: Next.js 15)"
                      className={`px-3 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                        isDark
                          ? 'bg-white/5 border-white/10 focus:border-white text-white'
                          : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                      }`}
                    />

                    <select
                      value={newSkill.category}
                      onChange={(e) =>
                        setNewSkill((prev) => ({ ...prev, category: e.target.value as any }))
                      }
                      className={`px-3 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                        isDark
                          ? 'bg-neutral-900 border-white/10 focus:border-white text-white'
                          : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                      }`}
                    >
                      <option value="frontend">Frontend</option>
                      <option value="uiux">UI/UX Craft</option>
                      <option value="backend">Backend &amp; DB</option>
                    </select>

                    <input
                      type="text"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, level: e.target.value }))}
                      placeholder="Level (cth: 95%)"
                      className={`px-3 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                        isDark
                          ? 'bg-white/5 border-white/10 focus:border-white text-white'
                          : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                      }`}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkill.tag}
                        onChange={(e) => setNewSkill((prev) => ({ ...prev, tag: e.target.value }))}
                        placeholder="Tag (cth: Core Stack)"
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-white text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-tertiary text-white font-mono text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid List Skills Aktif */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {siteContentForm.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleUpdateSkill(idx, 'name', e.target.value)}
                            className="font-bold text-xs bg-transparent border-b border-transparent hover:border-inherit focus:border-primary outline-none w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-primary font-bold">{skill.level}</span>
                          <span>&bull;</span>
                          <span className="uppercase text-neutral-400">{skill.category}</span>
                          <span>&bull;</span>
                          <span className="truncate text-neutral-400">{skill.tag}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Hapus Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Konfigurasi Branding & Logo Behavior Preview */}
              <div
                className={`p-6 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-inherit">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="font-display font-bold text-base">Konfigurasi Logo &amp; Efek Interaktif</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Sistem logo cerdas aktif di Navbar dan Footer:
                    </p>
                    <ul className="space-y-2 text-xs font-mono">
                      <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Scroll ke bawah: Logo otomatis menghilang halus.</span>
                      </li>
                      <li className="flex items-center gap-2 text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Scroll ke atas: Logo otomatis meluncur muncul di tengah.</span>
                      </li>
                      <li className="flex items-center gap-2 text-primary font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Hover kursor: Logo berganti seketika dari logo.png ke logos.png.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Visual Preview Box */}
                  <div
                    className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 ${
                      isDark ? 'bg-black/50 border-white/10' : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      Preview Interaksi (Arahkan Kursor):
                    </span>
                    <div className="relative h-14 w-36 flex items-center justify-center overflow-hidden group cursor-pointer border border-primary/20 rounded-xl p-2 bg-black/20">
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="absolute inset-0 w-full h-full scale-[2.2] translate-y-[5%] object-contain transition-all duration-300 group-hover:opacity-0"
                      />
                      <img
                        src="/logos.png"
                        alt="Logos"
                        className="absolute inset-0 w-full h-full scale-[2.2] translate-y-[5%] object-contain opacity-0 transition-all duration-300 group-hover:opacity-100"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-primary font-bold">
                      Arahkan kursor ke kotak di atas untuk melihat transisi logo &rarr; logos
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-neutral-900/90 dark:bg-black/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-2xl">
                <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                  Pastikan menekan tombol simpan agar perubahan tampil di website utama.
                </span>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={handleResetSiteContent}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Batal / Reset
                  </button>
                  <button
                    type="submit"
                    disabled={savingContent}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-tertiary text-white font-mono text-xs font-bold transition-all shadow-md hover:shadow-primary/30 cursor-pointer disabled:opacity-50"
                  >
                    {savingContent ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingContent ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl">Pesan Kontak Masuk</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Pesan yang dikirimkan oleh klien / visitor melalui formulir kontak di website portofolio.
                </p>
              </div>

              {contacts.length === 0 ? (
                <div
                  className={`p-12 text-center rounded-2xl border text-neutral-400 text-sm ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
                  }`}
                >
                  Belum ada pesan kontak yang tersimpan.
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className={`p-6 rounded-2xl border space-y-3 transition-all ${
                        isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{c.name}</span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {c.subject || 'Inquiry'}
                            </span>
                          </div>
                          <a
                            href={`mailto:${c.email}`}
                            className="text-xs font-mono text-neutral-400 hover:underline"
                          >
                            {c.email}
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400">
                            {new Date(c.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <a
                            href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Takizawa Portfolio')}&body=Halo ${encodeURIComponent(c.name)},%0D%0A%0D%0ATerima kasih telah menghubungi saya.`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
                              isDark
                                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Balas</span>
                          </a>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Hapus Pesan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed font-sans whitespace-pre-wrap ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                        {c.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACC GUESTBOOK (MODERATION) */}
          {activeTab === 'guestbook' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">Moderasi Buku Tamu (Guestbook)</h3>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Setiap pesan yang di-submit publik wajib di-ACC terlebih dahulu sebelum tampil di website portofolio.
                  </p>
                </div>

                {/* Sub-Tabs: Menunggu ACC vs Sudah Live */}
                <div
                  className={`flex items-center gap-2 p-1 rounded-xl border self-start ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setGuestbookTab('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      guestbookTab === 'pending'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⏳ Menunggu ACC ({guestbookPending.length})
                  </button>
                  <button
                    onClick={() => setGuestbookTab('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      guestbookTab === 'approved'
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ✅ Sudah Live ({guestbookApproved.length})
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: Menunggu ACC */}
              {guestbookTab === 'pending' && (
                <div className="space-y-4">
                  {guestbookPending.length === 0 ? (
                    <div
                      className={`p-12 text-center rounded-2xl border text-sm space-y-2 ${
                        isDark ? 'bg-white/[0.02] border-white/10 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="font-bold">Tidak ada pesan yang menunggu ACC</p>
                      <p className="text-xs">Semua pesan guestbook sudah disetujui atau belum ada entri baru.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guestbookPending.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-5 sm:p-6 rounded-2xl border space-y-3 transition-all ${
                            isDark
                              ? 'bg-amber-500/[0.04] border-amber-500/30'
                              : 'bg-amber-50/50 border-amber-300 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 font-bold flex items-center justify-center font-display">
                                {entry.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{entry.name}</span>
                                  <span className="text-xs font-mono text-neutral-400">{entry.handle}</span>
                                </div>
                                <span className="text-[11px] font-mono text-amber-500 font-bold">
                                  {entry.role} &bull; {new Date(entry.created_at).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            {/* ACC & Reject Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveGuestbook(entry.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-extrabold transition-all shadow-md cursor-pointer hover:scale-105"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>ACC / Setujui</span>
                              </button>
                              <button
                                onClick={() => handleDeleteGuestbook(entry.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-mono text-xs transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          </div>

                          <p className={`text-sm pl-12 font-sans leading-relaxed ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                            {entry.cleanMessage}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Sudah Live */}
              {guestbookTab === 'approved' && (
                <div className="space-y-4">
                  {guestbookApproved.length === 0 ? (
                    <div
                      className={`p-12 text-center rounded-2xl border text-sm ${
                        isDark ? 'bg-white/[0.02] border-white/10 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      Belum ada pesan yang disetujui untuk tampil di website.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guestbookApproved.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all ${
                            isDark
                              ? 'bg-white/[0.02] border-emerald-500/20 hover:border-emerald-500/40'
                              : 'bg-white border-emerald-200 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center justify-center font-display">
                                {entry.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{entry.name}</span>
                                  <span className="text-xs font-mono text-neutral-400">{entry.handle}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">
                                    Aktif di Web
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-neutral-400">
                                  {entry.role} &bull; {new Date(entry.created_at).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Balas sebagai Admin button */}
                              <button
                                onClick={() => {
                                  if (activeReplyBoxId === entry.id) {
                                    setActiveReplyBoxId(null);
                                    setAdminReplyText('');
                                  } else {
                                    setActiveReplyBoxId(entry.id);
                                    setAdminReplyText('');
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                <CornerDownRight className="w-3.5 h-3.5" />
                                <span>Balas [ADMIN]</span>
                              </button>

                              <button
                                onClick={() => handleRevokeGuestbook(entry.id)}
                                className={`text-xs font-mono px-2.5 py-1.5 rounded-xl cursor-pointer border transition-colors ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-neutral-300 hover:text-amber-400'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                                }`}
                              >
                                Batalkan ACC
                              </button>
                              <button
                                onClick={() => handleDeleteGuestbook(entry.id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Hapus Pesan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Clean Parent Message */}
                          <p className={`text-sm pl-12 font-sans leading-relaxed ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                            {entry.cleanMessage}
                          </p>

                          {/* Existing Replies List */}
                          {entry.replies && entry.replies.length > 0 && (
                            <div className="pl-12 pt-1 space-y-2.5">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{entry.replies.length} Balasan ({entry.replies.filter((r) => r.isAdminReply).length} Admin)</span>
                              </div>
                              <div className="space-y-2 border-l-2 border-emerald-500/25 pl-3.5">
                                {entry.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className={`p-3 rounded-xl border space-y-1.5 transition-colors ${
                                      reply.isAdminReply
                                        ? isDark
                                          ? 'bg-emerald-500/[0.07] border-emerald-500/30'
                                          : 'bg-emerald-50/70 border-emerald-200'
                                        : isDark
                                        ? 'bg-white/[0.02] border-white/10'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs">{reply.name}</span>
                                        <span className="text-[11px] font-mono text-neutral-400">{reply.handle}</span>
                                        {reply.isAdminReply ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                            <span>ADMIN</span>
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-mono text-neutral-500">
                                            {reply.role}
                                          </span>
                                        )}
                                        <span className="text-[10px] font-mono text-neutral-400">
                                          &bull; {new Date(reply.created_at).toLocaleString('id-ID')}
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => handleDeleteGuestbook(reply.id)}
                                        className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                                        title="Hapus Balasan"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                                      {reply.cleanMessage}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Inline Admin Reply Box */}
                          {activeReplyBoxId === entry.id && (
                            <div className="pl-12 pt-2">
                              <div
                                className={`p-4 rounded-2xl border space-y-3 ${
                                  isDark ? 'bg-[#0E0E14] border-emerald-500/40 shadow-lg' : 'bg-slate-50 border-emerald-300 shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center font-display">
                                      JT
                                    </div>
                                    <span className="text-xs font-bold">Jheryco Takizawa</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>ADMIN</span>
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-mono text-neutral-400">
                                    Membalas @{entry.handle.replace('@', '')}
                                  </span>
                                </div>

                                <textarea
                                  value={adminReplyText}
                                  onChange={(e) => setAdminReplyText(e.target.value)}
                                  placeholder={`Tulis balasan resmi admin untuk ${entry.name}...`}
                                  rows={2}
                                  className={`w-full px-3 py-2 rounded-xl text-xs font-sans border outline-none resize-none transition-all ${
                                    isDark
                                      ? 'bg-black/40 border-white/15 text-white placeholder-neutral-500 focus:border-emerald-500'
                                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500'
                                  }`}
                                />

                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveReplyBoxId(null);
                                      setAdminReplyText('');
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer ${
                                      isDark ? 'border-white/10 text-neutral-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmittingAdminReply || !adminReplyText.trim()}
                                    onClick={() => handleAdminReply(entry.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isSubmittingAdminReply ? 'Mengirim...' : 'Kirim Balasan [ADMIN]'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: TAMBAH / EDIT PROJECT (CRUD) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 transition-colors ${
              isDark ? 'bg-[#12121A] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-inherit">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {editingProjectId ? <Pencil className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">
                    {editingProjectId ? `Edit Proyek: ${projectForm.title || 'Tanpa Judul'}` : 'Tambah Project Baru'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {editingProjectId
                      ? 'Perbarui informasi dan gambar proyek ini langsung di Supabase.'
                      : 'Isi detail proyek untuk menambahkannya ke portofolio.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setEditingProjectId(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Judul Proyek *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="Contoh: Takizawa SaaS Platform"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white focus:ring-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Kategori *</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as ProjectCategory })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      isDark
                        ? 'bg-[#1A1A24] border-white/10 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Frontend Web">Frontend Web</option>
                    <option value="UI/UX Case Study">UI/UX Case Study</option>
                    <option value="Fullstack">Fullstack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Singkat *</label>
                <textarea
                  rows={2}
                  required
                  value={projectForm.short_desc}
                  onChange={(e) => setProjectForm({ ...projectForm, short_desc: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat tentang proyek ini..."
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:ring-1 focus:ring-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Peran / Role</label>
                  <input
                    type="text"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Waktu / Timeline</label>
                  <input
                    type="text"
                    value={projectForm.timeline}
                    onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Hasil / Metric</label>
                  <input
                    type="text"
                    value={projectForm.outcome}
                    onChange={(e) => setProjectForm({ ...projectForm, outcome: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* COVER IMAGE: DARI FOLDER KOMPUTER / FOLDER LOKAL / URL */}
              <div className="space-y-2 pt-2 border-t border-inherit">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold flex items-center gap-1.5 text-xs">
                    <FolderOpen className="w-4 h-4" />
                    <span>Gambar Cover Proyek (Pilih dari Folder) *</span>
                  </label>

                  {/* Mode Tabs */}
                  <div
                    className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        imageSourceMode === 'upload'
                          ? isDark
                            ? 'bg-white text-black font-bold shadow'
                            : 'bg-slate-900 text-white font-bold shadow'
                          : isDark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pilih dari Komputer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageSourceMode('folder');
                        fetchFolderImages();
                      }}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        imageSourceMode === 'folder'
                          ? isDark
                            ? 'bg-white text-black font-bold shadow'
                            : 'bg-slate-900 text-white font-bold shadow'
                          : isDark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Isi Folder public/projects
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        imageSourceMode === 'url'
                          ? isDark
                            ? 'bg-white text-black font-bold shadow'
                            : 'bg-slate-900 text-white font-bold shadow'
                          : isDark
                          ? 'text-neutral-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Input Path / URL
                    </button>
                  </div>
                </div>

                {/* Sub-Mode 1: Upload dari folder komputer */}
                {imageSourceMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-white/[0.02] hover:bg-white/[0.05] border-white/15'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin border-neutral-400" />
                          <span className="font-mono text-xs">
                            Menyimpan file ke folder public/projects...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                              isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs">
                              Klik untuk memilih file gambar dari folder komputer
                            </p>
                            <p className={`text-[11px] font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                              File otomatis tersimpan di folder <code className="font-bold">public/projects/</code> (PNG, JPG, WEBP, AVIF)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Mode 2: Pilih dari folder lokal public/projects */}
                {imageSourceMode === 'folder' && (
                  <div
                    className={`space-y-2 p-3 rounded-2xl border ${
                      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span>Daftar gambar di folder: public/projects/</span>
                      <button
                        type="button"
                        onClick={fetchFolderImages}
                        className="text-xs hover:underline cursor-pointer flex items-center gap-1 font-bold"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingFolderImages ? 'animate-spin' : ''}`} />
                        <span>Refresh Folder</span>
                      </button>
                    </div>

                    {loadingFolderImages ? (
                      <div className="p-6 text-center text-neutral-400 font-mono text-xs">
                        Memuat isi folder...
                      </div>
                    ) : folderImages.length === 0 ? (
                      <div className="p-6 text-center text-neutral-400 text-xs">
                        Folder <code className="font-mono">public/projects/</code> masih kosong.
                        Gunakan tombol <strong>Pilih dari Komputer</strong> untuk mengunggah gambar pertama ke folder.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {folderImages.map((img) => {
                          const isSelected = projectForm.image === img.url;
                          return (
                            <button
                              key={img.filename}
                              type="button"
                              onClick={() => setProjectForm({ ...projectForm, image: img.url })}
                              className={`relative rounded-xl overflow-hidden aspect-video border transition-all cursor-pointer group text-left ${
                                isSelected
                                  ? isDark
                                    ? 'ring-2 ring-white border-white'
                                    : 'ring-2 ring-slate-900 border-slate-900'
                                  : 'border-inherit hover:border-slate-400'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1.5 py-1 text-[9px] font-mono text-white truncate text-center">
                                {img.filename}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Mode 3: Manual Input URL atau path */}
                {imageSourceMode === 'url' && (
                  <div>
                    <input
                      type="text"
                      required
                      value={projectForm.image}
                      onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                      placeholder="/projects/nama-gambar.jpg atau https://..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <span className={`text-[11px] font-mono block mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Bisa path lokal seperti <code className="font-mono">/projects/my-work.jpg</code> atau URL gambar online.
                    </span>
                  </div>
                )}

                {/* Live Image Preview Card */}
                {projectForm.image && (
                  <div
                    className={`mt-3 relative rounded-2xl overflow-hidden border h-36 flex items-center justify-center group shadow-inner ${
                      isDark ? 'bg-black/50 border-white/15' : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={projectForm.image}
                      alt="Preview Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/121218/ffffff?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-white border border-white/20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{projectForm.image.startsWith('/projects/') ? '📁 File Folder Lokal' : '🌐 Gambar URL'}</span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/85 text-[10px] font-mono text-neutral-300 max-w-xs truncate">
                      {projectForm.image}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Teknologi / Tags (pisahkan koma)</label>
                <input
                  type="text"
                  value={projectForm.tech}
                  onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                  placeholder="Next.js 15, TypeScript, Tailwind v4"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Architecture / Stack</label>
                <input
                  type="text"
                  value={projectForm.arch}
                  onChange={(e) => setProjectForm({ ...projectForm, arch: e.target.value })}
                  placeholder="Next.js + Supabase + Tailwind"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setEditingProjectId(null);
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {submittingProject
                    ? 'Menyimpan...'
                    : editingProjectId
                    ? 'Perbarui Proyek'
                    : 'Simpan Project ke Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
