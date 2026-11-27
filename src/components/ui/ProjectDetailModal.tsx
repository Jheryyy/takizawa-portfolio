'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Calendar,
  User,
  Cpu,
  Code2,
} from 'lucide-react';
import { ProjectItem } from '@/types/portfolio';
import { SiGithub } from 'react-icons/si';
import { updateSpotlightPos } from '@/lib/utils';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture'>('overview');

  useEffect(() => {
    setActiveTab('overview');
  }, [project?.id, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!isOpen || !project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        onMouseMove={updateSpotlightPos}
        className="spotlight-border relative w-full max-w-3xl my-auto rounded-3xl bg-white dark:bg-[#121218] border border-neutral-200 dark:border-white/15 text-neutral-900 dark:text-white shadow-2xl overflow-hidden transition-all duration-300 zoom-in-95"
      >
        {/* Top Header Bar / Sticky Controls */}
        <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-neutral-900">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            quality={85}
            priority
            className="object-cover brightness-90 transition-transform duration-700 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Floating Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Detail Proyek"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Floating Next / Prev Navigation */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
            {hasPrev && (
              <button
                type="button"
                onClick={onPrev}
                aria-label="Proyek sebelumnya"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Proyek selanjutnya"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Banner Meta Info */}
          <div className="absolute bottom-4 left-5 right-5 sm:left-7 sm:right-7 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary font-sans text-xs font-bold shadow-md">
                {project.index} &bull; {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-sans text-xs shadow-sm">
                {project.timeline}
              </span>
            </div>

            {project.outcome && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-sans text-xs font-bold backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {project.outcome}
              </span>
            )}
          </div>
        </div>

        {/* Mode Tabs Switcher Bar */}
        <div className="px-6 sm:px-8 pt-4 pb-3 border-b border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-white/[0.02]">
          <div className="inline-flex items-center p-1 rounded-full bg-neutral-200/70 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-primary font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Architecture &amp; Code</span>
            </button>
          </div>

          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {project.role}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-245px)] overflow-y-auto">
          {/* Title & Short Description */}
          <div className="space-y-2 border-b border-neutral-200 dark:border-white/10 pb-5">
            <h2
              id="modal-project-title"
              className="font-display font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight"
            >
              {project.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
              {project.shortDesc}
            </p>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Key Engineering Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" /> Role
                  </span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{project.role}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-primary" /> Architecture
                  </span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={project.arch}>
                    {project.arch}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> Timeline
                  </span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{project.timeline}</p>
                </div>
              </div>

              {/* Problem & Solution (if available) */}
              {project.problem && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Problem &amp; Challenge
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                    {project.problem}
                  </p>
                </div>
              )}

              {/* Design & Implementation (if available) */}
              {project.design && (
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10 space-y-1.5">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Design &amp; Solution
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                    {project.design}
                  </p>
                </div>
              )}

              {/* Technologies Used */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Tech Stack &amp; Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-sans text-xs font-medium border border-neutral-200 dark:border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              {/* System Architecture Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> System Architecture
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white leading-relaxed">
                    {project.arch}
                  </p>
                </div>

                {project.outcome && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Measured Outcome
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white leading-relaxed">
                      {project.outcome}
                    </p>
                  </div>
                )}
              </div>

              {/* Implementation Snippet */}
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/15 bg-[#0E0E14] text-neutral-100">
                <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-neutral-400">
                      implementation-excerpt.ts
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Code Highlight
                  </span>
                </div>
                <pre className="p-4 text-[11px] sm:text-xs font-mono leading-relaxed overflow-x-auto text-neutral-200">
                  <code>
                    {project.code?.trim()
                      ? project.code
                      : `// ${project.title}\n// Architecture: ${project.arch}\n// Stack: ${project.tech.join(', ')}`}
                  </code>
                </pre>
              </div>

              {/* Core Stack Pills */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-mono text-[11px] font-medium border border-neutral-200 dark:border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-[#0E0E14] border-t border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${project.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-xs font-sans font-bold text-white dark:text-neutral-900 transition-colors cursor-pointer"
            >
              <span>Full Case Study</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-sans font-bold text-neutral-800 dark:text-white transition-colors cursor-pointer"
              >
                <SiGithub className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-tertiary text-xs font-sans font-bold transition-all shadow-sm cursor-pointer group"
              >
                <span>Live Demo</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div
              aria-hidden="true"
              className="hidden sm:flex items-center gap-2.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 select-none"
            >
              {(hasPrev || hasNext) && (
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-white/10 border border-neutral-300 dark:border-white/15 text-[10px] text-neutral-700 dark:text-neutral-200">
                    &larr;
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-white/10 border border-neutral-300 dark:border-white/15 text-[10px] text-neutral-700 dark:text-neutral-200">
                    &rarr;
                  </kbd>
                  <span>Navigate</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-white/10 border border-neutral-300 dark:border-white/15 font-mono text-[10px] text-neutral-700 dark:text-neutral-200">
                  ESC
                </kbd>
                <span>Close</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-sans font-bold text-neutral-800 dark:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailModal;
