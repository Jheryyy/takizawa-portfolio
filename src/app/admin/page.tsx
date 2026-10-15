'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Search,
  Database,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Clock,
  Heart,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProjectCategory } from '@/types/portfolio';

type ActiveTab = 'overview' | 'projects' | 'contacts' | 'guestbook';

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

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [guestbookPending, setGuestbookPending] = useState<GuestbookRecord[]>([]);
  const [guestbookApproved, setGuestbookApproved] = useState<GuestbookRecord[]>([]);
  const [guestbookTab, setGuestbookTab] = useState<'pending' | 'approved'>('pending');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Frontend Web' as ProjectCategory,
    short_desc: '',
    role: 'Lead Frontend Developer',
    timeline: '3 Weeks (2026)',
    arch: 'Next.js 15 + Supabase + Tailwind',
    outcome: '99 Lighthouse Score',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
    tech: 'Next.js, TypeScript, Tailwind CSS, Supabase',
    problem: 'Crafting responsive user interfaces with seamless accessibility and high FPS animation curves.',
    design: 'Strict 8px design system with semantic dark mode tokens and fluid typography.',
    code: 'Modular architecture powered by Next.js 15 App Router and server actions.',
  });

  // Action status message
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Fetch all Supabase data
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Projects
      const projRes = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projRes.data) {
        setProjects(projRes.data as ProjectRecord[]);
      }

      // 2. Fetch Contacts
      const contactRes = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (contactRes.data) {
        setContacts(contactRes.data as ContactItem[]);
      }

      // 3. Fetch Guestbook
      // Check if is_approved exists
      const gbAllRes = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
      if (gbAllRes.data) {
        const all = gbAllRes.data as GuestbookRecord[];
        // Filter pending vs approved
        // Note: if is_approved is undefined (column not yet added), treat as pending so admin can see and approve
        const pending = all.filter((item) => item.is_approved === false || item.is_approved === null || item.is_approved === undefined);
        const approved = all.filter((item) => item.is_approved === true);

        setGuestbookPending(pending);
        setGuestbookApproved(approved);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle Guestbook Approval (ACC)
  const handleApproveGuestbook = async (id: string) => {
    try {
      const res = await supabase.from('guestbook').update({ is_approved: true }).eq('id', id);
      if (res.error) {
        showNotice(`Gagal ACC: ${res.error.message}. Pastikan kolom is_approved sudah dibuat.`);
      } else {
        showNotice('✅ Guestbook berhasil di-ACC! Sekarang sudah tampil di website.');
        refreshAllData();
      }
    } catch (err) {
      console.error('Error approving guestbook:', err);
    }
  };

  // Handle Guestbook Revoke Approval
  const handleRevokeGuestbook = async (id: string) => {
    try {
      await supabase.from('guestbook').update({ is_approved: false }).eq('id', id);
      showNotice('Status guestbook dikembalikan ke Pending.');
      refreshAllData();
    } catch (err) {
      console.error('Error revoking guestbook:', err);
    }
  };

  // Handle Guestbook Delete
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

  // Handle Delete Contact Message
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

  // Handle Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Yakin ingin menghapus proyek ini?')) return;
    try {
      await supabase.from('projects').delete().eq('id', id);
      showNotice('Proyek berhasil dihapus dari database.');
      refreshAllData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // Handle Add New Project Submit
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      alert('Judul proyek tidak boleh kosong!');
      return;
    }

    setSubmittingProject(true);
    try {
      const nextIndex = String(projects.length + 1).padStart(2, '0');
      const techArray = newProject.tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const record: ProjectRecord = {
        id: `proj-${Date.now()}`,
        project_index: nextIndex,
        title: newProject.title.trim(),
        category: newProject.category,
        short_desc: newProject.short_desc.trim(),
        role: newProject.role.trim(),
        timeline: newProject.timeline.trim(),
        arch: newProject.arch.trim(),
        outcome: newProject.outcome.trim(),
        image: newProject.image.trim(),
        tech: techArray,
        problem: newProject.problem.trim(),
        design: newProject.design.trim(),
        code: newProject.code.trim(),
      };

      const { error } = await supabase.from('projects').insert([record]);
      if (error) {
        showNotice(`Gagal menambah project: ${error.message}`);
      } else {
        showNotice('🚀 Proyek baru berhasil ditambahkan dan langsung aktif!');
        setIsProjectModalOpen(false);
        setNewProject({
          title: '',
          category: 'Frontend Web',
          short_desc: '',
          role: 'Lead Frontend Developer',
          timeline: '3 Weeks (2026)',
          arch: 'Next.js 15 + Supabase + Tailwind',
          outcome: '99 Lighthouse Score',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
          tech: 'Next.js, TypeScript, Tailwind CSS, Supabase',
          problem: '',
          design: '',
          code: '',
        });
        refreshAllData();
      }
    } catch (err) {
      console.error('Error inserting project:', err);
    } finally {
      setSubmittingProject(false);
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

  return (
    <div className="min-h-screen bg-[#09090C] text-neutral-100 flex flex-col font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* Top Admin Navbar */}
      <header className="border-b border-white/10 bg-[#0E0E14]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Web</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white">
                Takizawa<span className="text-[#FF5A1F]">blox</span>
              </span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-md bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F] font-bold">
                Admin Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Connection Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Connected</span>
            </div>

            <button
              onClick={refreshAllData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF5A1F]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {statusNotice && (
        <div className="bg-[#FF5A1F] text-white px-6 py-2.5 text-sm font-medium text-center shadow-lg transition-all">
          {statusNotice}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/20 font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/20 font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Kelola Project</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/30 font-mono">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/20 font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Pesan Masuk</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/30 font-mono">
              {contacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guestbook')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer relative ${
              activeTab === 'guestbook'
                ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/20 font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ACC Guestbook</span>
            {guestbookPending.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold animate-pulse">
                {guestbookPending.length} Baru
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab('projects')}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#FF5A1F]/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">
                    Total Proyek
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F]">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-white">
                    {projects.length}
                  </span>
                  <span className="text-xs text-[#FF5A1F] font-medium">+ Tambah Project &rarr;</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('contacts')}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">
                    Pesan Kontak
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-white">
                    {contacts.length}
                  </span>
                  <span className="text-xs text-blue-400 font-medium">Lihat Pesan &rarr;</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTab('guestbook');
                  setGuestbookTab('pending');
                }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Menunggu ACC
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-amber-300">
                    {guestbookPending.length}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">Perlu Di-ACC &rarr;</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTab('guestbook');
                  setGuestbookTab('approved');
                }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Guestbook Aktif
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-white">
                    {guestbookApproved.length}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">Tampil di Web &rarr;</span>
                </div>
              </div>
            </div>

            {/* Quick Action Split: Pending Guestbook preview & Latest Contacts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (6 Cols): Pending Guestbook Need ACC */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="font-display font-bold text-base text-white">
                      Guestbook yang Menunggu ACC ({guestbookPending.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('guestbook');
                      setGuestbookTab('pending');
                    }}
                    className="text-xs font-mono text-[#FF5A1F] hover:underline"
                  >
                    Buka Semua
                  </button>
                </div>

                {guestbookPending.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    Semua guestbook sudah di-ACC atau belum ada pesan baru.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guestbookPending.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-white">{item.name}</span>
                            <span className="text-xs font-mono text-neutral-400 ml-2">
                              {item.handle}
                            </span>
                          </div>
                          <button
                            onClick={() => handleApproveGuestbook(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ACC Sekarang</span>
                          </button>
                        </div>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed line-clamp-2">
                          &quot;{item.message}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (6 Cols): Latest Inquiries */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <h3 className="font-display font-bold text-base text-white">
                      Pesan Kontak Terbaru ({contacts.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="text-xs font-mono text-blue-400 hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    Belum ada pesan kontak masuk.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{c.name}</span>
                          <span className="text-[11px] font-mono text-neutral-400">{c.email}</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-sans line-clamp-2">
                          &quot;{c.message}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Supabase SQL Helper Card (in case RLS or is_approved needs to be executed) */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#FF5A1F]" />
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                    Konfigurasi Database Supabase (ACC &amp; Dashboard Policies)
                  </h4>
                </div>
                <button
                  onClick={copySqlSetup}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all cursor-pointer self-start"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL ACC'}</span>
                </button>
              </div>
              <p className="text-xs text-neutral-400">
                Jika tombol ACC atau Tambah Project menampilkan pesan izin/kolom, jalankan skrip SQL di atas sekali saja pada menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA & TAMBAH PROJECT */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Daftar Proyek Portofolio</h3>
                <p className="text-xs text-neutral-400">
                  Proyek yang ditambahkan di sini langsung muncul di section Selected Works &amp; Case Studies.
                </p>
              </div>

              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#E04911] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-[#FF5A1F]/25 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Project Baru</span>
              </button>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <FolderGit2 className="w-12 h-12 text-neutral-600 mx-auto" />
                <h4 className="font-bold text-white text-base">Belum Ada Proyek di Supabase</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Saat database proyek kosong, website utama otomatis menggunakan data bawaan (fallback). Klik tombol di bawah untuk menambahkan proyek nyata pertama Anda.
                </p>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#FF5A1F] text-white text-xs font-bold cursor-pointer"
                >
                  + Buat Proyek Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#FF5A1F]/50 transition-all shadow-md group"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative w-full h-44 bg-neutral-900 overflow-hidden">
                        {proj.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs">
                            No Image
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-[#FF5A1F] border border-white/10">
                          {proj.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <h4 className="font-display font-bold text-base text-white">{proj.title}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {proj.short_desc}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {proj.tech?.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                      <span className="font-mono text-xs text-neutral-400">{proj.timeline}</span>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Pesan Kontak Masuk</h3>
              <p className="text-xs text-neutral-400">
                Pesan yang dikirimkan oleh klien / visitor melalui form Contact di website utama.
              </p>
            </div>

            {contacts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-neutral-500 text-sm">
                Belum ada pesan kontak yang tersimpan.
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{c.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {c.subject || 'Inquiry'}
                          </span>
                        </div>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs font-mono text-neutral-400 hover:text-[#FF5A1F] transition-colors"
                        >
                          {c.email}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-500">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-mono text-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Balas</span>
                        </a>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Hapus Pesan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
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
                <h3 className="font-display font-bold text-xl text-white">Moderasi Buku Tamu (Guestbook)</h3>
                <p className="text-xs text-neutral-400">
                  Setiap pesan yang di-submit publik wajib di-ACC terlebih dahulu sebelum tampil di website portofolio.
                </p>
              </div>

              {/* Sub-Tabs: Menunggu ACC vs Sudah Live */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 self-start">
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
                  <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-neutral-400 text-sm space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white">Tidak ada pesan yang menunggu ACC</p>
                    <p className="text-xs text-neutral-500">Semua pesan guestbook sudah disetujui atau belum ada entri baru.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guestbookPending.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 space-y-3 hover:border-amber-500/60 transition-all shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center font-display">
                              {entry.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{entry.name}</span>
                                <span className="text-xs font-mono text-neutral-400">{entry.handle}</span>
                              </div>
                              <span className="text-[11px] font-mono text-amber-400 font-bold">
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
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-neutral-200 pl-12 font-sans leading-relaxed">
                          {entry.message}
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
                  <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-neutral-500 text-sm">
                    Belum ada pesan yang disetujui untuk tampil di website.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guestbookApproved.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-2 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{entry.name}</span>
                            <span className="text-xs font-mono text-neutral-400">{entry.handle}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                              Aktif di Web
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRevokeGuestbook(entry.id)}
                              className="text-xs font-mono text-neutral-400 hover:text-amber-400 px-2 py-1 rounded bg-white/5 cursor-pointer"
                            >
                              Batalkan ACC
                            </button>
                            <button
                              onClick={() => handleDeleteGuestbook(entry.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-400 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                          {entry.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH PROJECT BARU */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#FF5A1F]" />
                <h3 className="font-display font-bold text-xl text-white">Tambah Project Baru</h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Judul Proyek *</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Contoh: Takizawa SaaS Platform"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Kategori *</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                  >
                    <option value="Frontend Web">Frontend Web</option>
                    <option value="UI/UX Case Study">UI/UX Case Study</option>
                    <option value="Fullstack">Fullstack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Deskripsi Singkat *</label>
                <textarea
                  rows={2}
                  required
                  value={newProject.short_desc}
                  onChange={(e) => setNewProject({ ...newProject, short_desc: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat tentang proyek ini..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Peran / Role</label>
                  <input
                    type="text"
                    value={newProject.role}
                    onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Waktu / Timeline</label>
                  <input
                    type="text"
                    value={newProject.timeline}
                    onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Hasil / Metric</label>
                  <input
                    type="text"
                    value={newProject.outcome}
                    onChange={(e) => setNewProject({ ...newProject, outcome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Cover Image URL *</label>
                <input
                  type="url"
                  required
                  value={newProject.image}
                  onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Teknologi / Tags (pisahkan koma)</label>
                <input
                  type="text"
                  value={newProject.tech}
                  onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Architecture / Stack</label>
                <input
                  type="text"
                  value={newProject.arch}
                  onChange={(e) => setNewProject({ ...newProject, arch: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E04911] text-white font-bold cursor-pointer transition-all shadow-lg shadow-[#FF5A1F]/30"
                >
                  {submittingProject ? 'Menyimpan...' : 'Simpan Project ke Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
