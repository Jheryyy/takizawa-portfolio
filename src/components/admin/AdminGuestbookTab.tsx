'use client';

import React from 'react';
import {
  CheckCircle2,
  Trash2,
  CornerDownRight,
  MessageCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { ParsedGuestbookItem } from './types';

interface AdminGuestbookTabProps {
  isDark: boolean;
  guestbookTab: 'pending' | 'approved';
  setGuestbookTab: (tab: 'pending' | 'approved') => void;
  guestbookPending: ParsedGuestbookItem[];
  guestbookApproved: ParsedGuestbookItem[];
  activeReplyBoxId: string | null;
  setActiveReplyBoxId: (id: string | null) => void;
  adminReplyText: string;
  setAdminReplyText: (text: string) => void;
  isSubmittingAdminReply: boolean;
  onApprove: (id: string) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  onAdminReply: (parentId: string) => void;
}

export function AdminGuestbookTab({
  isDark,
  guestbookTab,
  setGuestbookTab,
  guestbookPending,
  guestbookApproved,
  activeReplyBoxId,
  setActiveReplyBoxId,
  adminReplyText,
  setAdminReplyText,
  isSubmittingAdminReply,
  onApprove,
  onRevoke,
  onDelete,
  onAdminReply,
}: AdminGuestbookTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-xl">Moderasi Buku Tamu (Guestbook)</h3>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Setiap pesan atau balasan publik wajib di-ACC terlebih dahulu sebelum tampil di website.
          </p>
        </div>

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
            Menunggu ACC ({guestbookPending.length})
          </button>
          <button
            onClick={() => setGuestbookTab('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              guestbookTab === 'approved'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sudah Live ({guestbookApproved.length})
          </button>
        </div>
      </div>

      {guestbookTab === 'pending' && (
        <div className="space-y-4">
          {guestbookPending.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border text-sm space-y-2 ${
                isDark ? 'bg-white/[0.02] border-white/10 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold">Semua pesan sudah dimoderasi!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestbookPending.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-white/[0.03] border-amber-500/30' : 'bg-white border-amber-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold flex items-center justify-center font-display">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{entry.name}</span>
                          <span className="text-xs font-mono text-neutral-400">{entry.handle}</span>
                          {entry.isReply && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono font-bold">
                              Balasan
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {entry.role} &bull; {new Date(entry.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove(entry.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACC &amp; Tayangkan</span>
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
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
                        onClick={() => onRevoke(entry.id)}
                        className={`text-xs font-mono px-2.5 py-1.5 rounded-xl cursor-pointer border transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-neutral-300 hover:text-amber-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                        }`}
                      >
                        Batalkan ACC
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Hapus Pesan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm pl-12 font-sans leading-relaxed ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                    {entry.cleanMessage}
                  </p>

                  {entry.replies && entry.replies.length > 0 && (
                    <div className="pl-12 pt-1 space-y-2.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {entry.replies.length} Balasan ({entry.replies.filter((r) => r.isAdminReply).length} Admin)
                        </span>
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
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>ADMIN</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-neutral-500">{reply.role}</span>
                                )}
                                <span className="text-[10px] font-mono text-neutral-400">
                                  &bull; {new Date(reply.created_at).toLocaleString('id-ID')}
                                </span>
                              </div>

                              <button
                                onClick={() => onDelete(reply.id)}
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
                            onClick={() => onAdminReply(entry.id)}
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
  );
}
