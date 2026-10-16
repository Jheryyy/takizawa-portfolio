'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Calendar,
  User,
  Cpu,
} from 'lucide-react';
import { ProjectItem } from '@/types/portfolio';

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
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-white dark:bg-[#121218] border border-neutral-200 dark:border-white/15 text-neutral-900 dark:text-white shadow-2xl overflow-hidden transition-all duration-300 zoom-in-95">
        {/* Top Header Bar / Sticky Controls */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-neutral-900">
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
              <span className="px-3 py-1 rounded-full bg-primary text-white font-mono text-xs font-bold shadow-md">
                {project.index} &bull; {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs shadow-sm">
                {project.timeline}
              </span>
            </div>

            {project.outcome && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {project.outcome}
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-200px)] overflow-y-auto">
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

          {/* Key Engineering Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                <User className="w-3 h-3 text-primary" /> Role
              </span>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{project.role}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-primary" /> Architecture
              </span>
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={project.arch}>
                {project.arch}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Timeline
              </span>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{project.timeline}</p>
            </div>
          </div>

          {/* Problem & Solution (if available) */}
          {project.problem && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
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
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Design &amp; Solution
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                {project.design}
              </p>
            </div>
          )}

          {/* Technologies Used */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Tech Stack &amp; Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-mono text-xs font-medium border border-neutral-200 dark:border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-[#0E0E14] border-t border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-tertiary text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Buka Case Study Penuh</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailModal;
