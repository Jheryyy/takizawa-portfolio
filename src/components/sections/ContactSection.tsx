'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mail,
  Copy,
  Check,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { SiInstagram, SiTiktok } from 'react-icons/si';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import Magnetic from '@/components/ui/Magnetic';
import { BlueprintCrosshairs } from '@/components/ui/BlueprintCrosshairs';
import { updateSpotlightPos } from '@/lib/utils';

type CardFinish = 'glossy' | 'holographic' | 'metallic' | 'matte';

const FINISH_OPTIONS: { id: CardFinish; label: string }[] = [
  { id: 'glossy', label: 'Glossy' },
  { id: 'holographic', label: 'Holographic' },
  { id: 'metallic', label: 'Metallic' },
  { id: 'matte', label: 'Matte' },
];

const Lanyard = dynamic(() => import('@/components/ui/Lanyard'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-black/60 dark:text-muted">Loading 3D Canvas...</span>
      </div>
    </div>
  ),
});

interface ContactSectionProps {
  onNotifyToast?: (msg: string) => void;
}

export function ContactSection({ onNotifyToast }: ContactSectionProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [shouldLoadLanyard, setShouldLoadLanyard] = useState(false);
  const [cardFinish, setCardFinish] = useState<CardFinish>('glossy');
  const lanyardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoadLanyard(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '350px', // Preload 350px before entering viewport so 3D renders immediately
      }
    );

    if (lanyardContainerRef.current) {
      observer.observe(lanyardContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'Frontend / Web Project',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const emailAddress = 'jherycotakizawa@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    onNotifyToast?.('Email address copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      onNotifyToast?.('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('contacts').insert([
        {
          name: formState.name.trim(),
          email: formState.email.trim(),
          subject: formState.subject || 'Frontend / Web Project',
          message: formState.message.trim(),
        },
      ]);

      if (error) {
        console.error('Supabase contacts insert error:', error.message);
        onNotifyToast?.('Gagal mengirim pesan. Silakan coba lagi atau hubungi lewat email langsung.');
        return;
      }

      setFormState({
        name: '',
        email: '',
        subject: 'Frontend / Web Project',
        message: '',
      });
      onNotifyToast?.('Pesan Anda berhasil dikirim ke Takizawa!');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      onNotifyToast?.('Terjadi gangguan jaringan saat mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 space-y-10 pt-8 scroll-mt-24">
      {/* Section Header */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
            Contact &bull; Get In Touch
          </span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-neutral-950 dark:text-white tracking-tight">
          Let&apos;s Build Something Exceptional Together
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl font-sans">
          Have a project inquiry, internship opportunity, or want to exchange ideas on web craft?
          Reach out through the form below or connect directly across my active channels.
        </p>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: 3D Lanyard */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
          <div
            ref={lanyardContainerRef}
            className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] flex items-center justify-center"
          >
            {shouldLoadLanyard ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <Lanyard
                  frontImage="/card-front.webp"
                  backImage="/card-back.webp"
                  strapImage="/band.webp"
                  imageFit="cover"
                  cardColor="#ffffff"
                  orientation="portrait"
                  finish={cardFinish}
                  cornerRadius={0.3}
                  size={0.6}
                  anchor="center"
                  strapLength={0.5}
                  strapColor="#111111"
                  strapWidth={0.65}
                  metal="silver"
                  gravity={1}
                  damping={0.8}
                  elasticity={0.4}
                  breeze={0}
                  interactive
                  intro={false}
                />
                <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center z-10">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/65 dark:bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90">
                    Drag / Tap 3D badge to swing
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-neutral-500">Loading 3D Canvas...</span>
                </div>
              </div>
            )}
          </div>

          {/* 3D Card Finish Switcher */}
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-full bg-surface border border-hairline">
            {FINISH_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCardFinish(opt.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                  cardFinish === opt.id
                    ? 'bg-primary font-bold shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-mono pt-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Depok, Indonesia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>UTC+7 (WIB)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div
          onMouseMove={updateSpotlightPos}
          className="spotlight-border lg:col-span-7 bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  Your Name <span className="text-primary">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Pratama"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-2.5 min-h-[44px] rounded-xl bg-canvas border border-hairline text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-2.5 min-h-[44px] rounded-xl bg-canvas border border-hairline text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-subject" className="block text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                Subject / Project Interest
              </label>
              <input
                id="contact-subject"
                type="text"
                placeholder="e.g. Frontend Engineering Collaboration"
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl bg-canvas border border-hairline text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                Message <span className="text-primary">*</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="Tell me about your idea, timeline, or requirements..."
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full px-4 py-3 min-h-[120px] rounded-xl bg-canvas border border-hairline text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm resize-none transition-all font-sans leading-relaxed"
              />
            </div>

            <Magnetic strength={0.22}>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 min-h-[46px] rounded-full bg-primary hover:bg-tertiary font-bold text-sm transition-all duration-300 orange-glow-hover cursor-pointer shadow-md disabled:opacity-60 active:scale-[0.97]"
              >
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </button>
            </Magnetic>
          </form>

          {/* Direct Channels */}
          <div className="pt-6 border-t border-hairline space-y-3">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Or Connect Directly
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full bg-canvas border border-hairline hover:border-primary/50 text-xs font-sans text-neutral-900 dark:text-white transition-all cursor-pointer"
                title="Click to copy email address"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{emailAddress}</span>
                {copiedEmail ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>

              <a
                href="https://instagram.com/abcdefghijherr"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full bg-canvas border border-hairline hover:border-[#E4405F]/50 text-xs font-sans text-neutral-900 dark:text-white transition-all group"
              >
                <SiInstagram aria-hidden="true" className="w-3.5 h-3.5 text-[#E4405F]" />
                <span className="font-medium">@abcdefghijherr</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-[#E4405F]" />
              </a>

              <a
                href="https://www.tiktok.com/@abcdefghijherr"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full bg-canvas border border-hairline hover:border-primary/50 text-xs font-sans text-neutral-900 dark:text-white transition-all group"
              >
                <SiTiktok aria-hidden="true" className="w-3.5 h-3.5 text-neutral-800 dark:text-white" />
                <span className="font-medium">abcdefghijherr</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-primary" />
              </a>
            </div>
          </div>
          <BlueprintCrosshairs />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
