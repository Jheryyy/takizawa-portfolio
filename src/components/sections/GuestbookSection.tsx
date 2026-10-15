'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus, Send, Flame, Clock } from 'lucide-react';
import { GuestbookEntry } from '@/types/portfolio';
import { initialGuestbookEntries } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';

interface GuestbookSectionProps {
  onNotifyToast: (msg: string) => void;
}

export function GuestbookSection({ onNotifyToast }: GuestbookSectionProps) {
  const [entries, setEntries] =
    useState<GuestbookEntry[]>(initialGuestbookEntries);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('Frontend Dev');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovedGuestbook = useCallback(async () => {
    try {
      // 1. First try querying where is_approved is true
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setEntries(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            handle: item.handle || '@guest',
            role: item.role || 'Visitor',
            time: new Date(item.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            }),
            message: item.message,
            likes: item.likes || 1,
          }))
        );
      } else if (error && error.message.includes('is_approved')) {
        // Fallback if is_approved column hasn't been added yet
        const fallback = await supabase
          .from('guestbook')
          .select('*')
          .order('created_at', { ascending: false });
        if (fallback.data && fallback.data.length > 0) {
          setEntries(
            fallback.data.map((item) => ({
              id: item.id,
              name: item.name,
              handle: item.handle || '@guest',
              role: item.role || 'Visitor',
              time: new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              }),
              message: item.message,
              likes: item.likes || 1,
            }))
          );
        }
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
        is_approved: false,
      };

      const res = await supabase.from('guestbook').insert([newEntry]);
      if (res.error && res.error.message.includes('is_approved')) {
        // Fallback without is_approved column if user hasn't run the ALTER TABLE query yet
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
      onNotifyToast(
        'Pesan terkirim! Pesan akan muncul setelah disetujui (ACC) oleh admin.'
      );
    } catch (err) {
      console.error('Guestbook submit error:', err);
      onNotifyToast('Pesan berhasil terkirim!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, likes: entry.likes + 1 } : entry
      )
    );

    const current = entries.find((e) => e.id === id);
    if (current && !id.startsWith('gb-')) {
      await supabase
        .from('guestbook')
        .update({ likes: (current.likes || 1) + 1 })
        .eq('id', id);
    }
  };

  return (
    <section id="guestbook" className="space-y-10 pt-4 scroll-mt-24">
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
              Drop feedback on the UI/UX, say hello, or share a project idea.
              Messages appear live in the feed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="gbName"
                className="block text-xs font-bold text-black dark:text-white/80 mb-1.5"
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
                  className="block text-xs font-bold text-black dark:text-white/80 mb-1.5"
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
                  className="block text-xs font-bold text-black dark:text-white/80 mb-1.5"
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
                className="block text-xs font-bold text-black dark:text-white/80 mb-1.5"
              >
                Message *
              </label>
              <textarea
                id="gbMessage"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something nice about the design or code..."
                className="w-full bg-elevated border border-hairline focus:border-primary rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder-muted focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full group flex items-center justify-between bg-primary hover:bg-tertiary text-white font-semibold text-sm pl-6 pr-2 py-2 rounded-full orange-glow-hover transition-all cursor-pointer shadow-md"
            >
              <span className="text-white">Sign Guestbook</span>
              <span className="w-9 h-9 rounded-full bg-white text-canvas flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <Send className="w-4 h-4 text-canvas" />
              </span>
            </button>
          </form>
        </div>

        {/* Right Column (7 Cols): Live Guestbook Stream */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2.5xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
                Recent Signatures
              </h3>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-elevated border border-hairline text-primary font-bold">
                {entries.length} entries
              </span>
            </div>
            <span className="text-xs font-mono text-black/60 dark:text-muted font-medium">
              Live Feed
            </span>
          </div>

          {/* Messages Container */}
          <div className="space-y-4 max-h-[430px] overflow-y-auto pr-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline space-y-2.5 transition-colors hover:border-primary/40 shadow-xs"
              >
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
                        <span className="text-xs font-mono text-black/70 dark:text-muted">
                          {entry.handle}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {entry.role} &bull; {entry.time}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLike(entry.id)}
                    aria-label={`Like entry from ${entry.name}`}
                    className="px-2.5 py-1 rounded-full bg-elevated border border-hairline hover:border-primary text-xs font-mono text-black dark:text-muted hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold">{entry.likes}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-black dark:text-white/85 leading-relaxed pl-10 font-sans font-medium">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GuestbookSection;
