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
import { updateSpotlightPos } from '@/lib/utils';

interface GuestbookSectionProps {
  onNotifyToast: (msg: string) => void;
}

// Helper to parse replies and admin tags from message text
const parseReplyMessage = (rawMsg: string, role?: string) => {
  const match = rawMsg?.match(/^\[reply:([^\|\]]+)(?:\|(admin))?\]\s*([\s\S]*)$/i);
  if (match) {
    const isGenuineAdmin = Boolean(match[2]?.toLowerCase() === 'admin' && role === 'Owner & Admin');
    return {
      isReply: true,
      parentId: match[1],
      isAdmin: isGenuineAdmin,
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

const sanitizePublicText = (text: string) =>
  text.replace(/\[reply:[^\]]*\]/gi, '').trim();

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

          if (item.is_approved === false) {
            return;
          }

          const { isReply, parentId, isAdmin, cleanMessage } = parseReplyMessage(item.message, item.role);
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
    const cleanMsg = sanitizePublicText(message);
    if (!name.trim() || !cleanMsg) return;

    setSubmitting(true);
    try {
      const newEntry = {
        name: name.trim(),
        handle: handle.trim()
          ? handle.trim().startsWith('@')
            ? handle.trim()
            : `@${handle.trim()}`
          : '@guest',
        role,
        message: cleanMsg,
        likes: 1,
        is_approved: false,
      };

      let res = await supabase.from('guestbook').insert([newEntry]);
      if (res.error && res.error.message.includes('is_approved')) {
        res = await supabase.from('guestbook').insert([
          {
            name: newEntry.name,
            handle: newEntry.handle,
            role: newEntry.role,
            message: newEntry.message,
            likes: newEntry.likes,
          },
        ]);
      }

      if (res.error) {
        console.error('Guestbook submit error:', res.error.message);
        onNotifyToast('Gagal mengirim pesan. Silakan coba beberapa saat lagi.');
        return;
      }

      setName('');
      setHandle('');
      setMessage('');
      onNotifyToast('Pesan terkirim! Pesan akan tampil setelah disetujui (ACC) oleh admin.');
    } catch (err) {
      console.error('Guestbook submit error:', err);
      onNotifyToast('Terjadi kesalahan jaringan saat mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const cleanReply = sanitizePublicText(replyForm.message);
    if (!replyForm.name.trim() || !cleanReply) return;

    setSubmittingReply(true);
    try {
      const trimmedHandle = replyForm.handle.trim();
      const formattedHandle = trimmedHandle
        ? trimmedHandle.startsWith('@')
          ? trimmedHandle
          : `@${trimmedHandle}`
        : '@guest';

      const replyData = {
        name: replyForm.name.trim(),
        handle: formattedHandle,
        role: 'Visitor',
        message: `[reply:${parentId}] ${cleanReply}`,
        likes: 1,
        is_approved: false,
      };

      let res = await supabase.from('guestbook').insert([replyData]);
      if (res.error && res.error.message.includes('is_approved')) {
        res = await supabase.from('guestbook').insert([
          {
            name: replyData.name,
            handle: replyData.handle,
            role: replyData.role,
            message: replyData.message,
            likes: replyData.likes,
          },
        ]);
      }

      if (res.error) {
        console.error('Reply submit error:', res.error.message);
        onNotifyToast('Gagal mengirim balasan. Silakan coba lagi.');
        return;
      }

      setReplyingToId(null);
      setReplyForm({ name: '', handle: '', message: '' });
      onNotifyToast('Balasan terkirim! Akan tampil setelah disetujui (ACC) admin.');
      fetchApprovedGuestbook();
    } catch (err) {
      console.error('Error submitting reply:', err);
      onNotifyToast('Gagal mengirim balasan.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const rawLiked = localStorage.getItem('takizawa_liked_gb_ids');
      const likedIds: string[] = rawLiked ? JSON.parse(rawLiked) : [];
      if (likedIds.includes(id)) {
        onNotifyToast('Kamu sudah memberi apresiasi pada pesan ini.');
        return;
      }
      likedIds.push(id);
      localStorage.setItem('takizawa_liked_gb_ids', JSON.stringify(likedIds));
    } catch {
      // Ignore storage errors
    }

    let nextLikes = 1;
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          nextLikes = entry.likes + 1;
          return { ...entry, likes: nextLikes };
        }
        if (entry.replies) {
          return {
            ...entry,
            replies: entry.replies.map((r) => {
              if (r.id === id) {
                nextLikes = r.likes + 1;
                return { ...r, likes: nextLikes };
              }
              return r;
            }),
          };
        }
        return entry;
      })
    );

    if (!id.startsWith('gb-')) {
      const { error } = await supabase.from('guestbook').update({ likes: nextLikes }).eq('id', id);
      if (error) {
        console.warn('Like update failed:', error.message);
      }
    }
  };

  return (
    <section
      id="guestbook"
      className="relative w-full max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 py-16 sm:py-24 space-y-10 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-primary font-mono text-xs font-semibold uppercase tracking-wider">
            Community Guestbook &bull; Public Signatures
          </p>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-950 dark:text-white">
          Words, Thoughts &amp; Signatures
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl font-sans">
          Tinggalkan pesan, feedback, atau sapaan hangat. Seluruh pesan tampil secara terbuka setelah disetujui oleh admin.
        </p>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div
          onMouseMove={updateSpotlightPos}
          className="spotlight-border lg:col-span-5 bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-5 lg:sticky lg:top-24"
        >
          <div className="space-y-1 pb-3 border-b border-hairline">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-lg text-neutral-950 dark:text-white">
                Tinggalkan Pesan
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
              Masukan seputar website, proyek, atau tawaran kolaborasi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="gbName"
                className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                Nama Lengkap <span className="text-primary">*</span>
              </label>
              <input
                id="gbName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="gbHandle"
                className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                Username / Sosial (Opsional)
              </label>
              <input
                id="gbHandle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Peran / Identitas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                      role === r
                        ? 'bg-primary font-bold shadow-xs'
                        : 'bg-canvas border border-hairline text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-primary/40'
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
                className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                Pesan / Kesan <span className="text-primary">*</span>
              </label>
              <textarea
                id="gbMessage"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketikkan pesan, kritik, atau saran..."
                className="w-full px-4 py-3 rounded-xl bg-canvas border border-hairline text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-tertiary font-sans text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-primary/25 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Mengirim...' : 'Kirim Tanda Tangan'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Signatures Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-surface border border-hairline">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm sm:text-base text-neutral-950 dark:text-white">
                Public Signatures
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                {entries.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Moderated Feed</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {entries.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-surface border border-hairline space-y-2">
                <p className="text-sm font-sans text-neutral-500 font-medium">
                  Belum ada pesan yang disetujui.
                </p>
                <p className="text-xs text-neutral-400 font-sans">
                  Jadilah yang pertama mengisi buku tamu ini melalui formulir di samping.
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  onMouseMove={updateSpotlightPos}
                  className="spotlight-border p-5 sm:p-6 rounded-2xl bg-surface border border-hairline transition-colors space-y-3.5"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/12 border border-primary/25 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-neutral-950 dark:text-white">
                            {entry.name}
                          </span>
                          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                            {entry.handle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-0.5">
                          <span className="text-primary font-semibold">{entry.role}</span>
                          <span>&bull;</span>
                          <span>{entry.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleLike(entry.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-hairline hover:border-primary/40 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors cursor-pointer"
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
                            ? 'bg-primary border-primary'
                            : 'bg-canvas border-hairline text-neutral-700 dark:text-neutral-300 hover:text-primary hover:border-primary/40'
                        }`}
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Balas</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed font-sans pl-0 sm:pl-12">
                    {entry.message}
                  </p>

                  {replyingToId === entry.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(entry.id, e)}
                      className="mt-3 sm:ml-12 p-4 rounded-2xl bg-canvas border border-primary/35 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans text-primary font-bold flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Balas kepada {entry.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs cursor-pointer"
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
                          onChange={(e) => setReplyForm({ ...replyForm, name: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-surface border border-hairline text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-primary font-sans"
                        />
                        <input
                          type="text"
                          placeholder="@username"
                          value={replyForm.handle}
                          onChange={(e) => setReplyForm({ ...replyForm, handle: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-surface border border-hairline text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-primary font-sans"
                        />
                      </div>

                      <textarea
                        required
                        rows={2}
                        placeholder={`Tuliskan balasan untuk ${entry.name}...`}
                        value={replyForm.message}
                        onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-hairline text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1.5 rounded-full text-xs font-sans text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReply}
                          className="px-4 py-1.5 rounded-full bg-primary hover:bg-tertiary font-sans text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                        </button>
                      </div>
                    </form>
                  )}

                  {entry.replies && entry.replies.length > 0 && (
                    <div className="space-y-2.5 pt-2 pl-3 sm:pl-12 border-l-2 border-primary/20 ml-2 sm:ml-4">
                      {entry.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3.5 rounded-xl border space-y-1.5 ${
                            reply.isAdmin
                              ? 'bg-primary/5 border-primary/25'
                              : 'bg-canvas border-hairline'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-display font-bold text-xs text-neutral-950 dark:text-white">
                                {reply.name}
                              </span>
                              {reply.isAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold">
                                  <ShieldCheck className="w-3 h-3 text-primary" />
                                  <span>Admin</span>
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-neutral-400">
                                {reply.handle}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {reply.time}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
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
