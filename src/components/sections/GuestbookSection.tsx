'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { GuestbookEntry, GuestbookReply } from '@/types/portfolio';
import { initialGuestbookEntries } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  // Mobile tab state
  const [activeMobileTab, setActiveMobileTab] = useState<'threads' | 'form'>('threads');

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState({
    name: '',
    handle: '',
    message: '',
  });
  const [submittingReply, setSubmittingReply] = useState(false);

  // Pinned scroll refs & states
  const containerRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const threadsTrackRef = useRef<HTMLDivElement>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

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
          if (item.is_approved === false && !item.message?.includes('[reply:')) {
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

  const updateMeasurements = useCallback(() => {
    if (!threadsTrackRef.current || !feedContainerRef.current) return;
    const trackHeight = threadsTrackRef.current.scrollHeight;
    const viewportHeight = feedContainerRef.current.clientHeight;
    const maxScrollDist = Math.max(0, trackHeight - viewportHeight + 48);

    // Give ample scroll runway so the threads scroll smoothly before transitioning to contacts
    const scrollRunway = Math.max(window.innerHeight * 0.9, maxScrollDist * 1.6);
    setContainerHeight(window.innerHeight + scrollRunway);
  }, []);

  useEffect(() => {
    updateMeasurements();

    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const track = threadsTrackRef.current;
      const feed = feedContainerRef.current;
      const container = containerRef.current;
      if (!track || !feed || !container) return;

      const getMaxScroll = () => {
        const trackHeight = track.scrollHeight;
        const viewportHeight = feed.clientHeight;
        return Math.max(0, trackHeight - viewportHeight + 48);
      };

      // GSAP vertical scroll scrub for community signatures & threads
      gsap.to(track, {
        y: () => -getMaxScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2, // GSAP buttery smooth scrub physics
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCanScrollUp(self.progress > 0.02);
            setCanScrollDown(self.progress < 0.98);
          },
        },
      });
    }, containerRef);

    const handleResize = () => {
      updateMeasurements();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [entries, updateMeasurements]);

  const scrollNextThread = () => {
    if (!containerRef.current) return;
    window.scrollBy({ top: 360, behavior: 'smooth' });
  };

  const scrollPrevThread = () => {
    if (!containerRef.current) return;
    window.scrollBy({ top: -360, behavior: 'smooth' });
  };

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
      ref={containerRef}
      className="relative w-full select-none"
      style={{ minHeight: containerHeight > 0 ? `${containerHeight}px` : '100vh' }}
    >
      {/* Sticky Viewport Container - Exactly like Projects Section */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        {/* Section Header: Title, Live Status & Slide Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-3 sm:mb-5 shrink-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <p className="text-primary font-mono text-xs font-bold uppercase tracking-widest">
                Community Guestbook &bull; Threads Showcase
              </p>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-black dark:text-white">
              Recent Signatures &bull; Live Feed
            </h2>
          </div>

          {/* Controls: Mobile View Toggle + Up/Down Thread Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Tab Toggle (<lg screens) */}
            <div className="flex lg:hidden bg-surface border border-hairline p-1 rounded-full text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMobileTab('threads')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeMobileTab === 'threads'
                    ? 'bg-primary text-neutral-950 font-black'
                    : 'text-black dark:text-muted'
                }`}
              >
                Threads ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('form')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeMobileTab === 'form'
                    ? 'bg-primary text-neutral-950 font-black'
                    : 'text-black dark:text-muted'
                }`}
              >
                Sign Form
              </button>
            </div>

            {/* Up / Down Thread Navigation Buttons */}
            <div className="flex items-center gap-2 pl-1">
              <button
                type="button"
                onClick={scrollPrevThread}
                disabled={!canScrollUp}
                aria-label="Scroll to previous threads"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNextThread}
                disabled={!canScrollDown}
                aria-label="Scroll to next threads"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Form on Left (5 Cols) + Pinned Thread Stream on Right (7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch overflow-hidden">
          {/* Left Column (5 Cols): Sign the Guestbook Card */}
          <div
            className={`lg:col-span-5 bg-surface border border-hairline rounded-3xl p-5 sm:p-6 lg:p-7 space-y-4 shadow-sm flex flex-col justify-between ${
              activeMobileTab === 'form' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-1.5">
              <p className="font-mono text-xs uppercase tracking-wider text-primary font-bold">
                Leave Your Mark
              </p>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">
                Share Thoughts &amp; Feedback
              </h3>
              <p className="text-xs text-black/75 dark:text-muted leading-relaxed font-sans font-medium">
                Drop your feedback, greetings, or discussion. Semua orang bisa saling berbalas di samping!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label
                  htmlFor="gbName"
                  className="block text-xs font-bold text-black dark:text-white/90 mb-1"
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
                  className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="gbHandle"
                    className="block text-xs font-bold text-black dark:text-white/90 mb-1"
                  >
                    GitHub / Handle
                  </label>
                  <input
                    id="gbHandle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gbRole"
                    className="block text-xs font-bold text-black dark:text-white/90 mb-1"
                  >
                    Role Badge
                  </label>
                  <select
                    id="gbRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-3 py-2.5 text-xs sm:text-sm text-black dark:text-white focus:outline-none transition-colors"
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
                  className="block text-xs font-bold text-black dark:text-white/90 mb-1"
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
                  className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full group flex items-center justify-between bg-primary hover:bg-tertiary text-neutral-950 font-bold text-xs sm:text-sm pl-5 pr-1.5 py-1.5 rounded-full orange-glow-hover transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <span className="text-neutral-950 font-black">
                  {submitting ? 'Mengirim...' : 'Sign Guestbook'}
                </span>
                <span className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                  <Send className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
            </form>
          </div>

          {/* Right Column (7 Cols): Pinned Thread Stream that scrolls via window scroll */}
          <div
            className={`lg:col-span-7 bg-surface border border-hairline rounded-3xl p-5 sm:p-6 lg:p-7 space-y-4 shadow-sm flex flex-col justify-between overflow-hidden ${
              activeMobileTab === 'threads' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Stream Header */}
            <div className="flex items-center justify-between border-b border-hairline pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="font-display font-bold text-base sm:text-lg text-black dark:text-white">
                  Signature Stream
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-elevated border border-hairline text-primary font-bold">
                  {entries.length} threads
                </span>
              </div>
              <span className="text-xs font-mono text-black/75 dark:text-muted font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Scroll Driven
              </span>
            </div>

            {/* Viewport container with inner scrolling track driven by window scroll */}
            <div
              ref={feedContainerRef}
              className="relative h-[440px] sm:h-[480px] lg:h-[520px] max-h-[58vh] overflow-hidden rounded-2xl"
            >
              {/* Subtle top & bottom shadow gradient masks for seamless entering/exiting cards */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-surface via-surface/60 to-transparent z-10" />
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10" />

              {/* Inner Track that translates smoothly via lerp loop */}
              <div
                ref={threadsTrackRef}
                className="space-y-3.5 will-change-transform py-3 pr-1"
              >
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
                      {/* Top Row: Avatar, Name, Handle, Role Badge & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-display font-bold text-xs flex items-center justify-center shrink-0">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-black dark:text-white">
                                {entry.name}
                              </span>
                              <span className="text-xs font-mono font-bold text-black dark:text-white/70">
                                {entry.handle}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-primary font-bold">
                              {entry.role} &bull; {entry.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLike(entry.id)}
                            aria-label={`Like entry from ${entry.name}`}
                            className="px-2.5 py-1 rounded-full bg-elevated border border-hairline hover:border-primary text-xs font-mono text-black dark:text-muted hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            <span className="font-bold">{entry.likes}</span>
                          </button>

                          <button
                            type="button"
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

                      {/* Message Body */}
                      <p className="text-xs sm:text-sm text-black dark:text-white/90 leading-relaxed pl-10 font-sans font-medium">
                        {entry.message}
                      </p>

                      {/* Inline Reply Form */}
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
                              className="px-3 py-1 rounded-lg text-xs font-mono text-black dark:text-muted hover:text-black dark:hover:text-white cursor-pointer"
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
                                    <span className="text-[11px] font-mono font-bold text-black dark:text-white/70">
                                      {reply.handle}
                                    </span>
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
                                    type="button"
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
        </div>
      </div>
    </section>
  );
}

export default GuestbookSection;
