'use client';

import React from 'react';
import {
  FolderGit2,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Database,
  Copy,
  Check,
} from 'lucide-react';
import { ActiveTab, ContactItem, ParsedGuestbookItem, ProjectRecord } from './types';

interface AdminOverviewTabProps {
  isDark: boolean;
  projects: ProjectRecord[];
  contacts: ContactItem[];
  guestbookPending: ParsedGuestbookItem[];
  guestbookApproved: ParsedGuestbookItem[];
  copiedSql: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectGuestbookTab: (tab: 'pending' | 'approved') => void;
  onApproveGuestbook: (id: string) => void;
  onCopySqlSetup: () => void;
}

export function AdminOverviewTab({
  isDark,
  projects,
  contacts,
  guestbookPending,
  guestbookApproved,
  copiedSql,
  onSelectTab,
  onSelectGuestbookTab,
  onApproveGuestbook,
  onCopySqlSetup,
}: AdminOverviewTabProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onSelectTab('projects')}
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
            <span className="font-display text-3xl font-extrabold">{projects.length}</span>
            <span className="text-xs font-medium underline">Kelola CRUD &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSelectTab('contacts')}
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
            <span className="font-display text-3xl font-extrabold">{contacts.length}</span>
            <span className="text-xs font-medium underline">Lihat Pesan &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => {
            onSelectTab('guestbook');
            onSelectGuestbookTab('pending');
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
            <span className="text-xs text-amber-500 font-medium underline">Perlu Di-ACC &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => {
            onSelectTab('guestbook');
            onSelectGuestbookTab('approved');
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
            <span className="text-xs text-emerald-500 font-medium underline">Tampil di Web &rarr;</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                onSelectTab('guestbook');
                onSelectGuestbookTab('pending');
              }}
              className="text-xs font-mono underline cursor-pointer"
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
                      <span className="text-xs font-mono text-neutral-400 ml-2">{item.handle}</span>
                    </div>
                    <button
                      onClick={() => onApproveGuestbook(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACC</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    &quot;{item.cleanMessage}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

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
            <button onClick={() => onSelectTab('contacts')} className="text-xs font-mono underline cursor-pointer">
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
                  <p className="text-xs text-neutral-400 line-clamp-2">&quot;{c.message}&quot;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secure Supabase RLS Helper Card */}
      <div
        className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-400" />
            <h4 className="font-mono text-xs uppercase tracking-wider font-bold">
              Kebijakan Keamanan &amp; RLS Supabase (Recommended)
            </h4>
          </div>
          <button
            onClick={onCopySqlSetup}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL RLS Aman'}</span>
          </button>
        </div>
        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          Skrip SQL ini membatasi akses tulis <code>projects</code>, baca/hapus <code>contacts</code>, moderasi <code>guestbook</code>, dan update <code>site_content</code> hanya untuk user <code>authenticated</code> (atau via server <code>SUPABASE_SERVICE_ROLE_KEY</code>).
        </p>
      </div>
    </div>
  );
}
