'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquarePlus,
  Send,
  Flame,
  Clock,
  CornerDownRight,
  ShieldCheck,
  MessageCircle,
  X,
  Check,
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
      // 1. Fetch entries
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
          // Hanya tampilkan jika disetujui, atau jika kolom is_approved belum diatur / bernilai true
          if (item.is_approved === false && !item.message?.includes('[reply:')) {
            // Unapproved parent messages skipped in public view
            return;
          }

          const { isReply, parentId, isAdmin, cleanMessage } = parseReplyMessage(item.message);
          const timeFormatted = new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
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

        // Hubungkan balasan ke komentar induk
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

    const channel = supabase
      .channel('guestbook-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guestbook' },
        () => {
          fetchApprovedGuestbook();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        is_approved: false, // Default perlu di-ACC admin di dashboard
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
        is_approved: true, // Balasan antar pengunjung langsung aktif
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
    <section id="guestbook" className="space-y-10 pt-4 scroll-mt-24 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Sign the Guestbook Card */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2.5xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-wider text-primary font-bold">
              Community Guestbook
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
              Leave Your Mark
            </h2>
            <p className="text-xs sm:text-sm text-black dark:text-muted leading-relaxed font-sans font-medium">
              Drop feedback on the UI/UX, say hello, or start a discussion.
              Semua orang bisa saling berbalas pesan di bawah!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="gbName"
                className="block text-xs font-bold text-black dark:text-white/90 mb-1.5"
              >
                Your Name *
              </label>
              <input
                id="gbName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="gbHandle"
                  className="block text-xs font-bold text-black dark:text-white/90 mb-1.5"
                >
                  GitHub / Handle
                </label>
                <input
                  id="gbHandle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="gbRole"
                  className="block text-xs font-bold text-black dark:text-white/90 mb-1.5"
                >
                  Role Badge
                </label>
                <select
                  id="gbRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-3.5 py-3 text-sm text-black dark:text-white focus:outline-none transition-colors"
                >
                  <option value="Frontend Dev">Frontend Dev</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Fullstack Eng">Fullstack Eng</option>
                  <option value="Client / Recruiter">Client / Recruiter</option>
                  <option value="Visitor">Visitor</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="gbMessage"
                className="block text-xs font-bold text-black dark:text-white/90 mb-1.5"
              >
                Message *
              </label>
              <textarea
                id="gbMessage"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan, apresiasi, atau tanyakan sesuatu..."
                className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full group flex items-center justify-between bg-primary hover:bg-tertiary text-neutral-950 font-bold text-sm pl-6 pr-2 py-2 rounded-full orange-glow-hover transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <span className="text-neutral-950 font-black">
                {submitting ? 'Mengirim...' : 'Sign Guestbook'}
              </span>
              <span className="w-9 h-9 rounded-full bg-neutral-950 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <Send className="w-4 h-4 text-white" />
              </span>
            </button>
          </form>
        </div>

        {/* Right Column (7 Cols): Live Threaded Guestbook Stream */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2.5xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
                Recent Signatures &bull; Threads
              </h3>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-elevated border border-hairline text-primary font-bold">
                {entries.length} threads
              </span>
            </div>
            <span className="text-xs font-mono text-black dark:text-muted font-bold">
              Live Feed
            </span>
          </div>

          {/* Messages Feed Container */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-sm text-black/60 dark:text-muted">
                Belum ada pesan yang disetujui. Jadilah yang pertama mengisi guestbook!
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline space-y-3 transition-colors hover:border-primary/40 shadow-xs"
                >
                  {/* Top Row: Avatar, Name, Handle, Role Badge & Like Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-display font-bold text-xs flex items-center justify-center">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-black dark:text-white">
                            {entry.name}
                          </span>
                          {/* USN Guestbook: Pure Black in Light Mode */}
                          <span className="text-xs font-mono font-bold text-black dark:text-white/70">
                            {entry.handle}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-primary font-bold">
                          {entry.role} &bull; {entry.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleLike(entry.id)}
                        aria-label={`Like entry from ${entry.name}`}
                        className="px-2.5 py-1 rounded-full bg-elevated border border-hairline hover:border-primary text-xs font-mono text-black dark:text-muted hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold">{entry.likes}</span>
                      </button>

                      {/* Button Balas */}
                      <button
                        onClick={() => {
                          setReplyingToId(replyingToId === entry.id ? null : entry.id);
                          setReplyForm({ name: '', handle: '', message: '' });
                        }}
                        className={`px-2.5 py-1 rounded-full border text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                          replyingToId === entry.id
                            ? 'bg-primary text-neutral-950 border-primary font-black'
                            : 'bg-elevated border-hairline text-black dark:text-muted hover:text-primary hover:border-primary/50'
                        }`}
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Balas</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Message Text */}
                  <p className="text-xs sm:text-sm text-black dark:text-white/90 leading-relaxed pl-10 font-sans font-medium">
                    {entry.message}
                  </p>

                  {/* Inline Reply Form when "Balas" is active */}
                  {replyingToId === entry.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(entry.id, e)}
                      className="mt-3 ml-6 sm:ml-10 p-3.5 rounded-xl bg-surface border border-primary/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-primary font-bold flex items-center gap-1">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Balas kepada {entry.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
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
                          className="px-3 py-1.5 rounded-lg bg-canvas border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Handle / @usn"
                          value={replyForm.handle}
                          onChange={(e) =>
                            setReplyForm({ ...replyForm, handle: e.target.value })
                          }
                          className="px-3 py-1.5 rounded-lg bg-canvas border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      <textarea
                        required
                        rows={2}
                        placeholder={`Tulis balasan Anda untuk ${entry.name}...`}
                        value={replyForm.message}
                        onChange={(e) =>
                          setReplyForm({ ...replyForm, message: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-canvas border border-hairline text-xs text-black dark:text-white focus:outline-none focus:border-primary resize-none"
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-mono text-black dark:text-muted hover:text-black dark:hover:text-white"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReply}
                          className="px-4 py-1.5 rounded-lg bg-primary hover:bg-tertiary text-neutral-950 font-mono text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies Stream */}
                  {entry.replies && entry.replies.length > 0 && (
                    <div className="mt-3.5 pl-4 sm:pl-6 border-l-2 border-primary/25 space-y-3">
                      {entry.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-xl border transition-colors ${
                            reply.isAdmin
                              ? 'bg-primary/[0.05] border-primary/40'
                              : 'bg-elevated/60 border-hairline'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Avatar */}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  reply.isAdmin
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-primary/20 text-primary border border-primary/30'
                                }`}
                              >
                                {reply.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-xs text-black dark:text-white">
                                  {reply.name}
                                </span>

                                {/* USN Guestbook Reply: Solid Black in Light Mode */}
                                <span className="text-[11px] font-mono font-bold text-black dark:text-white/70">
                                  {reply.handle}
                                </span>

                                {/* Exclusive ADMIN Badge */}
                                {reply.isAdmin && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary text-neutral-950 font-mono text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                                    <ShieldCheck className="w-2.5 h-2.5 text-neutral-950" />
                                    ADMIN
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-black/60 dark:text-muted">
                              <span>{reply.time}</span>
                              <button
                                onClick={() => handleLike(reply.id)}
                                className="inline-flex items-center gap-1 p-1 rounded hover:text-primary transition-colors cursor-pointer"
                                title="Like balasan ini"
                              >
                                <Flame className="w-3 h-3 text-primary" />
                                <span className="font-bold">{reply.likes}</span>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-black dark:text-white/90 leading-relaxed pl-8 pt-1 font-sans">
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
