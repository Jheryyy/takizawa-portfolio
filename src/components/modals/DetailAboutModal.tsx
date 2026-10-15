'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DetailAboutModal({ isOpen, onClose }: DetailAboutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-about-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-surface border border-hairline rounded-[28px] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-canvas/90 border-b border-hairline sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              DETAIL ABOUT — FULL PROFILE & CREDENTIALS
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Detail About"
            className="w-9 h-9 rounded-full bg-elevated hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
            <div>
              <p className="text-primary font-mono text-xs font-semibold">
                FRONTEND DEVELOPER &amp; UI/UX ENTHUSIAST
              </p>
              <h2
                id="modal-detail-about-title"
                className="font-display font-bold text-2xl sm:text-3xl text-white mt-1"
              >
                Bridging Visual Polish & Clean Architecture
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
                Passionate about crafting pixel-accurate dark-mode interfaces, accessible component libraries, and modern fullstack web applications.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary font-mono text-xs shrink-0">
              GPA / Competency: Top Tier
            </span>
          </div>

          {/* Detailed Education & Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary font-semibold">
                  ACADEMIC TRACK
                </span>
                <span className="font-mono text-xs text-muted">2024 – Present</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Software Engineering (RPL)
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Comprehensive engineering curriculum covering modern web development, relational database normalization, RESTful APIs, and user-centered design.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-elevated text-[11px] font-mono text-white/85">
                  Web Engineering
                </span>
                <span className="px-2.5 py-1 rounded-md bg-elevated text-[11px] font-mono text-white/85">
                  Database Systems
                </span>
                <span className="px-2.5 py-1 rounded-md bg-elevated text-[11px] font-mono text-white/85">
                  OOP
                </span>
                <span className="px-2.5 py-1 rounded-md bg-elevated text-[11px] font-mono text-white/85">
                  UI/UX Research
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary font-semibold">
                  DESIGN & DEV WORKFLOW
                </span>
                <span className="font-mono text-xs text-muted">4-Step Process</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                From Figma to Next.js
              </h3>
              <ul className="space-y-2 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono font-semibold">01.</span>
                  Audit &amp; Prototype in Figma with strict 8px grid
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono font-semibold">02.</span>
                  Define DESIGN.md tokens & WCAG contrast ratios
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono font-semibold">03.</span>
                  Build modular React/Next.js components with Tailwind v4
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono font-semibold">04.</span>
                  Micro-interactions, keyboard a11y & performance tuning
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 bg-canvas border-t border-hairline flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-tertiary transition-colors cursor-pointer"
          >
            Back to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
