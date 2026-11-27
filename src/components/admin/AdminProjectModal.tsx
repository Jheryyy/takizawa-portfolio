'use client';

import React from 'react';
import { Pencil, FolderGit2, XCircle, FolderOpen, Upload, RefreshCw } from 'lucide-react';
import { ProjectCategory } from '@/types/portfolio';
import { ProjectFormState } from './types';

interface AdminProjectModalProps {
  isDark: boolean;
  isOpen: boolean;
  editingProjectId: string | null;
  projectForm: ProjectFormState;
  setProjectForm: React.Dispatch<React.SetStateAction<ProjectFormState>>;
  submittingProject: boolean;
  imageSourceMode: 'upload' | 'folder' | 'url';
  setImageSourceMode: (mode: 'upload' | 'folder' | 'url') => void;
  isUploadingImage: boolean;
  folderImages: { filename: string; url: string }[];
  loadingFolderImages: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFetchFolderImages: () => void;
  onSaveProject: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AdminProjectModal({
  isDark,
  isOpen,
  editingProjectId,
  projectForm,
  setProjectForm,
  submittingProject,
  imageSourceMode,
  setImageSourceMode,
  isUploadingImage,
  folderImages,
  loadingFolderImages,
  fileInputRef,
  onFileUpload,
  onFetchFolderImages,
  onSaveProject,
  onClose,
}: AdminProjectModalProps) {
  if (!isOpen) return null;

  const inputClass = `w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
    isDark
      ? 'bg-white/5 border-white/10 text-white focus:ring-1 focus:ring-white'
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-slate-900'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 transition-colors ${
          isDark ? 'bg-[#12121A] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
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
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSaveProject} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Judul Proyek *</label>
              <input
                type="text"
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Contoh: Takizawa SaaS Platform"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Kategori *</label>
              <select
                value={projectForm.category}
                onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as ProjectCategory })}
                className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#1A1A24] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
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
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold mb-1">Peran / Role</label>
              <input
                type="text"
                value={projectForm.role}
                onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Waktu / Timeline</label>
              <input
                type="text"
                value={projectForm.timeline}
                onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Hasil / Metric</label>
              <input
                type="text"
                value={projectForm.outcome}
                onChange={(e) => setProjectForm({ ...projectForm, outcome: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Image Source Selector */}
          <div className="space-y-2 pt-2 border-t border-inherit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold flex items-center gap-1.5 text-xs">
                <FolderOpen className="w-4 h-4" />
                <span>Gambar Cover Proyek *</span>
              </label>

              <div
                className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {(['upload', 'folder', 'url'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setImageSourceMode(mode);
                      if (mode === 'folder') onFetchFolderImages();
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                      imageSourceMode === mode
                        ? isDark
                          ? 'bg-white text-black font-bold shadow'
                          : 'bg-slate-900 text-white font-bold shadow'
                        : isDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'upload'
                      ? 'Upload Komputer'
                      : mode === 'folder'
                      ? 'Folder public/projects'
                      : 'Input URL'}
                  </button>
                ))}
              </div>
            </div>

            {imageSourceMode === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
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
                      <span className="font-mono text-xs">Mengunggah gambar...</span>
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
                      <p className="font-bold text-xs">Klik untuk memilih gambar (PNG, JPG, WEBP, AVIF, GIF • max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {imageSourceMode === 'folder' && (
              <div
                className={`space-y-2 p-3 rounded-2xl border ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>Daftar gambar di public/projects/</span>
                  <button
                    type="button"
                    onClick={onFetchFolderImages}
                    className="text-xs hover:underline cursor-pointer flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingFolderImages ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingFolderImages ? (
                  <div className="p-6 text-center text-neutral-400 font-mono text-xs">Memuat isi folder...</div>
                ) : folderImages.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400 text-xs">
                    Belum ada gambar di <code>public/projects/</code>.
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
                          className={`relative rounded-xl overflow-hidden aspect-video border transition-all cursor-pointer text-left ${
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

            {imageSourceMode === 'url' && (
              <div>
                <input
                  type="text"
                  required
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  placeholder="/projects/nama-gambar.webp atau https://..."
                  className={inputClass}
                />
              </div>
            )}

            {projectForm.image && (
              <div
                className={`mt-3 relative rounded-2xl overflow-hidden border h-32 flex items-center justify-center shadow-inner ${
                  isDark ? 'bg-black/50 border-white/15' : 'bg-slate-100 border-slate-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projectForm.image}
                  alt="Preview Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/600x400/121218/ffffff?text=Image+Not+Found';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Teknologi / Tags (pisahkan koma)</label>
              <input
                type="text"
                value={projectForm.tech}
                onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                placeholder="Next.js 15, TypeScript, Tailwind v4"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Architecture / Stack</label>
              <input
                type="text"
                value={projectForm.arch}
                onChange={(e) => setProjectForm({ ...projectForm, arch: e.target.value })}
                placeholder="Next.js + Supabase + Tailwind"
                className={inputClass}
              />
            </div>
          </div>

          {/* Case Study Deep Dive Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-inherit">
            <div>
              <label className="block font-bold mb-1">Problem / Challenge</label>
              <textarea
                rows={2}
                value={projectForm.problem}
                onChange={(e) => setProjectForm({ ...projectForm, problem: e.target.value })}
                placeholder="Tantangan utama proyek..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Design Process</label>
              <textarea
                rows={2}
                value={projectForm.design}
                onChange={(e) => setProjectForm({ ...projectForm, design: e.target.value })}
                placeholder="Pendekatan UI/UX..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Implementation</label>
              <textarea
                rows={2}
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                placeholder="Detail arsitektur kode..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
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
              className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
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
  );
}
