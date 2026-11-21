'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Flame,
  CornerDownRight,
  ShieldCheck,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { GuestbookEntry, GuestbookReply } from '@/types/portfolio';
import { initialGuestbookEntries } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';

interface GuestbookSectionProps {
  onNotifyToast: (msg: string) => void;
}

// Helper to parse replies and admin tags from message text
const parseReplyMessage = (rawMsg: string) => {
  const match = rawMsg?.match(/^\[reply:([^\|\]]+)(?:\|(admin))?\]\s*([\s\S]*)$/i);
  if (match) {
    return {
      isReply: true,
      parentId: match[1],
      isAdmin: Boolean(match[2]?.toLowerCase() === 'admin'),
      cleanMessage: match[3],
    };
  }
  return {
    isReply: false,
    parentId: null,
    isAdmin: false,
    cleanMessage: rawMsg || '',
  };
};

const ROLE_OPTIONS = [
  'Frontend Dev',
  'UI/UX Designer',
  'Fullstack Eng',
  'Recruiter / HR',
  'Student',
  'Visitor',
];

export function GuestbookSection({ onNotifyToast }: GuestbookSectionProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialGuestbookEntries);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('Frontend Dev');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState({
    name: '',
    handle: '',
    message: '',
  });
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchApprovedGuestbook = useCallback(async () => {
    try {
      let rawData: any[] = [];
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        rawData = data;
      }

      if (rawData.length > 0) {
        const mainEntriesMap = new Map<string, GuestbookEntry>();
        const repliesList: GuestbookReply[] = [];

        rawData.forEach((item: any) => {
          if (item.handle === '__takizawa_theme_config__') {
            return;
          }

          if (item.is_approved === false && !item.message?.includes('[reply:')) {
            return;
          }

          const { isReply, parentId, isAdmin, cleanMessage } = parseReplyMessage(item.message);
          const timeFormatted = new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          if (isReply && parentId) {
            repliesList.push({
              id: item.id,
              parentId,
              name: item.name,
              handle: item.handle || '@guest',
              role: item.role || (isAdmin ? 'Owner & Admin' : 'Visitor'),
              time: timeFormatted,
              message: cleanMessage,
              likes: item.likes || 1,
              isAdmin,
            });
          } else {
            mainEntriesMap.set(item.id, {
              id: item.id,
              name: item.name,
              handle: item.handle || '@guest',
              role: item.role || 'Visitor',
              time: timeFormatted,
              message: cleanMessage,
              likes: item.likes || 1,
              isAdmin,
              replies: [],
            });
          }
        });

        repliesList.forEach((reply) => {
          const parent = mainEntriesMap.get(reply.parentId);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(reply);
          }
        });

        setEntries(Array.from(mainEntriesMap.values()));
      }
    } catch (err) {
      console.warn('Could not load Supabase guestbook:', err);
    }
  }, []);

  useEffect(() => {
    fetchApprovedGuestbook();
  }, [fetchApprovedGuestbook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const newEntry = {
        name: name.trim(),
        handle: handle.trim()
          ? handle.startsWith('@')
            ? handle
            : `@${handle}`
          : '@guest',
        role,
        message: message.trim(),
        likes: 1,
        is_approved: false,
      };

      const res = await supabase.from('guestbook').insert([newEntry]);
      if (res.error && res.error.message.includes('is_approved')) {
        await supabase.from('guestbook').insert([
          {
            name: newEntry.name,
            handle: newEntry.handle,
            role: newEntry.role,
            message: newEntry.message,
            likes: newEntry.likes,
          },
        ]);
      }

      setName('');
      setHandle('');
      setMessage('');
      onNotifyToast('Pesan terkirim! Pesan akan muncul setelah disetujui (ACC) oleh admin.');
    } catch (err) {
      console.error('Guestbook submit error:', err);
      onNotifyToast('Pesan berhasil terkirim!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.name.trim() || !replyForm.message.trim()) return;

    setSubmittingReply(true);
    try {
      const formattedHandle = replyForm.handle.trim()
        ? replyForm.handle.startsWith('@')
          ? replyForm.handle
          : `@${replyForm.handle}`
        : '@guest';

      const replyData = {
        name: replyForm.name.trim(),
        handle: formattedHandle,
        role: 'Visitor',
        message: `[reply:${parentId}] ${replyForm.message.trim()}`,
        likes: 1,
        is_approved: true,
      };

      const res = await supabase.from('guestbook').insert([replyData]);
      if (res.error && res.error.message.includes('is_approved')) {
        await supabase.from('guestbook').insert([
          {
            name: replyData.name,
            handle: replyData.handle,
            role: replyData.role,
            message: replyData.message,
            likes: replyData.likes,
          },
        ]);
      }

      setReplyingToId(null);
      setReplyForm({ name: '', handle: '', message: '' });
      onNotifyToast('Balasan Anda berhasil dikirim!');
      fetchApprovedGuestbook();
    } catch (err) {
      console.error('Error submitting reply:', err);
      onNotifyToast('Gagal mengirim balasan.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (id: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return { ...entry, likes: entry.likes + 1 };
        }
        if (entry.replies) {
          return {
            ...entry,
            replies: entry.replies.map((r) =>
              r.id === id ? { ...r, likes: r.likes + 1 } : r
            ),
          };
        }
        return entry;
      })
    );

    if (!id.startsWith('gb-')) {
      const current = entries.find((e) => e.id === id);
      const likesCount = (current?.likes || 1) + 1;
      await supabase.from('guestbook').update({ likes: likesCount }).eq('id', id);
    }
  };

  return (
    <section
      id="guestbook"
      className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 space-y-10 scroll-mt-24"
    >
      {/* Section Header: Clean Modern Eyebrow & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <p className="text-primary font-sans text-xs font-bold uppercase tracking-wider">
            Community Guestbook &bull; Public Signatures
          </p>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-black dark:text-white">
          Words, Thoughts &amp; Signatures
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-muted max-w-2xl font-sans font-medium">
          Tinggalkan pesan, feedback, atau sapaan hangat. Seluruh pesan akan tampil secara terbuka untuk pengunjung lainnya setelah disetujui.
        </p>
      </div>

      {/* Main 2-Column Split: Form (Left 5 Cols) + Clean Stream (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Form Card with Clean Inputs */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm lg:sticky lg:top-28">
          <div className="space-y-1.5 pb-2 border-b border-hairline">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-xl text-black dark:text-white">
                Tinggalkan Pesan
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-muted leading-relaxed font-sans font-medium">
              Beri kami masukan seputar website, karya proyek, atau tawaran kolaborasi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="gbName"
                className="block text-xs font-bold text-black dark:text-white/90"
              >
                Nama Lengkap *
              </label>
              <input
                id="gbName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-primary transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="gbHandle"
                className="block text-xs font-bold text-black dark:text-white/90"
              >
                Username / Media Sosial (Opsional)
              </label>
              <input
                id="gbHandle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username atau linkedin"
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-primary transition-all font-sans"
              />
            </div>

            {/* Quick Role Selector Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-black dark:text-white/90">
                Peran / Identitas Anda
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                      role === r
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'bg-canvas border border-hairline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="gbMessage"
                className="block text-xs font-bold text-black dark:text-white/90"
              >
                Pesan / Kesan Anda *
              </label>
              <textarea
                id="gbMessage"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketikkan pesan, kritik, atau saran untuk portofolio ini..."
                className="w-full px-4 py-3 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-primary transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-tertiary text-white font-sans text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-primary/30 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Mengirim...' : 'Kirim Tanda Tangan'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column (7 Cols): Clean Natural Thread Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Stream Header Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-hairline">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-base text-black dark:text-white">
                Public Signatures
              </span>
              <span className="font-sans text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                {entries.length} pesan
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Feed</span>
            </div>
          </div>

          {/* Feed List of Signatures */}
          <div className="space-y-4 max-h-[780px] overflow-y-auto pr-1 sm:pr-2">
            {entries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-surface border border-hairline space-y-2">
                <p className="text-sm font-sans text-neutral-500 font-medium">
                  Belum ada pesan yang disetujui.
                </p>
                <p className="text-xs text-neutral-400 font-sans">
                  Jadilah yang pertama mengisi buku tamu ini melalui formulir di samping!
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-surface border border-hairline hover:border-primary/40 transition-colors shadow-xs space-y-3.5"
                >
                  {/* Top Row: User Avatar, Name, Role Badge, Likes & Reply Button */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-black dark:text-white">
                            {entry.name}
                          </span>
                          <span className="text-xs font-sans text-neutral-500 font-medium">
                            {entry.handle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-sans text-neutral-500 font-medium pt-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-canvas border border-hairline text-primary font-semibold">
                            {entry.role}
                          </span>
                          <span>&bull;</span>
                          <span>{entry.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Like & Reply */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleLike(entry.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-hairline hover:border-primary/50 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors cursor-pointer"
                        title="Beri Apresiasi"
                      >
                        <Flame className="w-3.5 h-3.5 text-primary" />
                        <span>{entry.likes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(replyingToId === entry.id ? null : entry.id);
                          setReplyForm({ name: '', handle: '', message: '' });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-sans font-semibold transition-colors cursor-pointer ${
                          replyingToId === entry.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-canvas border-hairline text-neutral-700 dark:text-neutral-300 hover:text-primary hover:border-primary/50'
                        }`}
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Balas</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans font-normal pl-0 sm:pl-12">
                    {entry.message}
                  </p>

                  {/* Inline Reply Form (when replyingToId === entry.id) */}
                  {replyingToId === entry.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(entry.id, e)}
                      className="mt-3 sm:ml-12 p-4 rounded-xl bg-canvas border border-primary/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans text-primary font-bold flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Balas kepada {entry.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Nama Anda *"
                          value={replyForm.name}
                          onChange={(e) =>
                            setReplyForm({ ...replyForm, name: e.target.value })
                          }
                          className="px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary font-sans"
                        />
                        <input
                          type="text"
                          placeholder="Handle / @usn"
                          value={replyForm.handle}
                          onChange={(e) =>
                            setReplyForm({ ...replyForm, handle: e.target.value })
                          }
                          className="px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary font-sans"
                        />
                      </div>

                      <textarea
                        required
                        rows={2}
                        placeholder={`Tuliskan tanggapan Anda untuk ${entry.name}...`}
                        value={replyForm.message}
                        onChange={(e) =>
                          setReplyForm({ ...replyForm, message: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-sans text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReply}
                          className="px-4 py-1.5 rounded-lg bg-primary hover:bg-tertiary text-white font-sans text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies Stream */}
                  {entry.replies && entry.replies.length > 0 && (
                    <div className="space-y-2.5 pt-2 pl-3 sm:pl-12 border-l-2 border-primary/20 ml-2 sm:ml-4">
                      {entry.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-xl border space-y-1.5 ${
                            reply.isAdmin
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-canvas border-hairline'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-xs text-black dark:text-white">
                                {reply.name}
                              </span>
                              {reply.isAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-sans font-bold">
                                  <ShieldCheck className="w-3 h-3 text-primary" />
                                  <span>Admin</span>
                                </span>
                              )}
                              <span className="text-[10px] font-sans text-neutral-500 font-medium">
                                {reply.handle}
                              </span>
                            </div>
                            <span className="text-[10px] font-sans text-neutral-500">
                              {reply.time}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans font-normal">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GuestbookSection;
