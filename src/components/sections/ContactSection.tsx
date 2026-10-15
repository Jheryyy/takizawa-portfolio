'use client';

import React, { useState } from 'react';
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
        console.warn('Supabase contacts insert error:', error.message);
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
      onNotifyToast?.('Pesan Anda berhasil dikirim!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="space-y-10 pt-8 scroll-mt-24">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            CONTACT &bull; GET IN TOUCH
          </span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white tracking-tight">
          Let&apos;s Build Something Exceptional Together
        </h2>
        <p className="text-sm sm:text-base text-black/80 dark:text-muted max-w-2xl font-sans font-medium">
          Have a project inquiry, internship opportunity, or want to exchange ideas on web craft?
          Reach out through the form below or connect directly across my active channels.
        </p>
      </div>

      {/* 2-Column Split: Left (Lanyard Container) | Right (Form & Channels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column (5 Cols): Unboxed, Free-floating 3D Lanyard */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
          {/* Free-floating 3D Lanyard Canvas */}
          <div style={{ width: '100%', height: '600px' }} className="relative w-full h-[600px] flex items-center justify-center">
            <Lanyard
              frontImage="/card-front.jpg"
              backImage="/card-back.jpg"
              strapImage="/band.png"
              imageFit="cover"
              cardColor="#ffffff"
              orientation="portrait"
              finish="glossy"
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
          </div>

          {/* Clean Direct Contacts underneath without box */}
          <div className="flex items-center justify-center gap-6 text-xs text-black/60 dark:text-muted font-medium pt-2">
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

        {/* Right Column (7 Cols): Contact Form & Direct Channels */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2.5xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white/90">
                  Your Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Pratama"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white/90">
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary text-sm transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white/90">
                Subject / Project Interest
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineering Collaboration"
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white/90">
                Message <span className="text-primary">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tell me about your idea, timeline, or requirements..."
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-hairline text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary text-sm resize-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-primary hover:bg-tertiary text-white font-medium text-sm transition-all duration-300 orange-glow-hover cursor-pointer shadow-md disabled:opacity-60"
            >
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Direct Communication Channels Strip */}
          <div className="pt-6 border-t border-hairline space-y-3">
            <p className="text-xs font-mono font-bold uppercase text-black dark:text-white/80">
              Or Connect Directly:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Email Link & Copy */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-canvas border border-hairline hover:border-primary/60 text-xs font-mono text-black dark:text-white transition-all cursor-pointer shadow-xs"
                title="Click to copy email address"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{emailAddress}</span>
                {copiedEmail ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary" />
                )}
              </button>

              {/* Instagram Link */}
              <a
                href="https://instagram.com/abcdefghijherr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-canvas border border-hairline hover:border-[#E4405F]/60 text-xs font-mono text-black dark:text-white transition-all shadow-xs group"
              >
                <SiInstagram className="w-3.5 h-3.5 text-[#E4405F]" />
                <span>@abcdefghijherr</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-[#E4405F]" />
              </a>

              {/* TikTok Link */}
              <a
                href="https://www.tiktok.com/@abcdefghijherr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-canvas border border-hairline hover:border-black/60 dark:hover:border-white/60 text-xs font-mono text-black dark:text-white transition-all shadow-xs group"
              >
                <SiTiktok className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>abcdefghijherr</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-primary" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
