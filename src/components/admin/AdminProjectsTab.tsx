'use client';

import React from 'react';
import Link from 'next/link';
import { FolderGit2, Plus, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import { ProjectRecord } from './types';

interface AdminProjectsTabProps {
  isDark: boolean;
  projects: ProjectRecord[];
  onOpenCreate: () => void;
  onOpenEdit: (proj: ProjectRecord) => void;
  onDelete: (id: string, title?: string) => void;
}

export function AdminProjectsTab({
  isDark,
  projects,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: AdminProjectsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-xl">Daftar Proyek Portofolio</h3>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Fitur CRUD lengkap: Tambah baru, Edit isi/gambar, Hapus proyek, dan langsung live di portofolio.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start ${
            isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Project Baru</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border space-y-4 ${
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <FolderGit2 className="w-12 h-12 text-neutral-400 mx-auto" />
          <h4 className="font-bold text-base">Belum Ada Proyek di Database Supabase</h4>
          <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Saat database kosong, website portofolio menggunakan data fallback bawaan. Tambahkan proyek nyata pertama Anda di sini.
          </p>
          <button
            onClick={onOpenCreate}
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

                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                    {proj.category}
                  </span>

                  {proj.image?.startsWith('/projects/') && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                      Folder Lokal
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-display font-bold text-base">{proj.title}</h4>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {proj.short_desc}
                  </p>

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

              <div
                className={`p-3.5 border-t flex items-center justify-between ${
                  isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className={`font-mono text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {proj.timeline || '2026'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEdit(proj)}
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

                  <button
                    onClick={() => onDelete(proj.id, proj.title)}
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
  );
}
