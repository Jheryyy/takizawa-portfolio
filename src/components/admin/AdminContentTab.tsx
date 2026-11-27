'use client';

import React from 'react';
import {
  Sparkles,
  FileText,
  Mail,
  Sliders,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SiteContent, SkillCategory, SkillItem } from '@/types/portfolio';

interface AdminContentTabProps {
  isDark: boolean;
  siteContentForm: SiteContent;
  setSiteContentForm: React.Dispatch<React.SetStateAction<SiteContent>>;
  savingContent: boolean;
  newTypingText: string;
  setNewTypingText: (val: string) => void;
  newSkill: SkillItem;
  setNewSkill: React.Dispatch<React.SetStateAction<SkillItem>>;
  onSave: (e: React.FormEvent) => void;
  onReset: () => void;
  onAddTypingText: () => void;
  onRemoveTypingText: (index: number) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  onUpdateSkill: (index: number, field: keyof SkillItem, value: string) => void;
}

export function AdminContentTab({
  isDark,
  siteContentForm,
  setSiteContentForm,
  savingContent,
  newTypingText,
  setNewTypingText,
  newSkill,
  setNewSkill,
  onSave,
  onReset,
  onAddTypingText,
  onRemoveTypingText,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkill,
}: AdminContentTabProps) {
  const inputClass = `w-full px-4 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
    isDark
      ? 'bg-white/5 border-white/10 focus:border-white text-white'
      : 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900'
  }`;

  return (
    <form onSubmit={onSave} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-primary/5 border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h3 className="font-display font-bold text-lg text-primary">
              Kelola Isi Konten, Bio &amp; Keahlian
            </h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Perubahan disimpan ke Supabase (`site_content`) dan langsung tampil pada Hero, About, serta halaman Credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-tertiary font-mono text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {savingContent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingContent ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero & Identitas */}
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
                onChange={(e) => setSiteContentForm((prev) => ({ ...prev, heroGreeting: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-neutral-400">Nama Tampilan</label>
              <input
                type="text"
                value={siteContentForm.heroName}
                onChange={(e) => setSiteContentForm((prev) => ({ ...prev, heroName: e.target.value }))}
                className={inputClass}
              />
            </div>

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
                      onClick={() => onRemoveTypingText(idx)}
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
                      onAddTypingText();
                    }
                  }}
                  placeholder="Tambah profesi baru..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={onAddTypingText}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold cursor-pointer shrink-0"
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
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* About & Socials */}
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-inherit">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="font-display font-bold text-base">Bagian About &amp; Bio</h4>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">Label Eyebrow About</label>
                <input
                  type="text"
                  value={siteContentForm.aboutEyebrow}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, aboutEyebrow: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">Judul Utama H2 About</label>
                <input
                  type="text"
                  value={siteContentForm.aboutTitle}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, aboutTitle: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">Badge Sekolah &amp; Program</label>
                <input
                  type="text"
                  value={siteContentForm.aboutSchoolBadge}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, aboutSchoolBadge: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">Bio Paragraf 1</label>
                <textarea
                  rows={3}
                  value={siteContentForm.aboutBioP1}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, aboutBioP1: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">Bio Paragraf 2</label>
                <textarea
                  rows={3}
                  value={siteContentForm.aboutBioP2}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, aboutBioP2: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

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
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">URL GitHub</label>
                <input
                  type="url"
                  value={siteContentForm.githubUrl}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">URL Instagram</label>
                <input
                  type="url"
                  value={siteContentForm.instagramUrl}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-neutral-400">URL TikTok</label>
                <input
                  type="url"
                  value={siteContentForm.tiktokUrl}
                  onChange={(e) => setSiteContentForm((prev) => ({ ...prev, tiktokUrl: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Manager */}
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
          <span className="text-xs font-mono text-neutral-400">Total: {siteContentForm.skills.length} Keahlian</span>
        </div>

        <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] space-y-3">
          <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Tambah Keahlian Baru
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nama Skill"
              className={inputClass}
            />

            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill((prev) => ({ ...prev, category: e.target.value as SkillCategory }))}
              className={`px-3 py-2 rounded-xl border text-xs font-sans outline-none transition-all ${
                isDark ? 'bg-neutral-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
              className={inputClass}
            />

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill.tag}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, tag: e.target.value }))}
                placeholder="Tag"
                className={inputClass}
              />
              <button
                type="button"
                onClick={onAddSkill}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-tertiary font-mono text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {siteContentForm.skills.map((skill, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdateSkill(idx, 'name', e.target.value)}
                  className="font-bold text-xs bg-transparent border-b border-transparent hover:border-inherit focus:border-primary outline-none w-full"
                />
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
                onClick={() => onRemoveSkill(idx)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Hapus Skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Logo Preview */}
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

          <div
            className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 ${
              isDark ? 'bg-black/50 border-white/10' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <div className="relative h-14 w-36 flex items-center justify-center overflow-hidden group cursor-pointer border border-primary/20 rounded-xl p-2 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo"
                className="absolute inset-0 w-full h-full scale-[2.2] translate-y-[5%] object-contain transition-all duration-300 group-hover:opacity-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos.png"
                alt="Logos"
                className="absolute inset-0 w-full h-full scale-[2.2] translate-y-[5%] object-contain opacity-0 transition-all duration-300 group-hover:opacity-100"
              />
            </div>
            <span className="text-[11px] font-mono text-primary font-bold">
              Arahkan kursor untuk preview transisi logo
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-neutral-900/90 dark:bg-black/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-2xl">
        <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
          Tekan simpan agar perubahan tersinkron ke seluruh pengunjung.
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white cursor-pointer"
          >
            Batal / Reset
          </button>
          <button
            type="submit"
            disabled={savingContent}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-tertiary font-mono text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {savingContent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingContent ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
