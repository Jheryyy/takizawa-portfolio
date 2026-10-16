'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ArrowUpRight } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import { ProjectItem } from '@/types/portfolio';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onActionToast: (msg: string) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onActionToast,
}: ProjectDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-surface border border-hairline rounded-[28px] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Sticky Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-canvas/90 border-b border-hairline sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <span className="text-primary font-bold">{project.index}</span>
            <span>/</span>
            <span className="text-white/90">{project.category}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Project Detail"
            className="w-9 h-9 rounded-full bg-elevated hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Hero Image & Title */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <h2
                id="modal-project-title"
                className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight"
              >
                {project.title}
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                {project.shortDesc}
              </p>

              {/* Tech Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-elevated border border-hairline font-mono text-xs text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-hairline bg-canvas relative">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  unoptimized={project.image?.startsWith('data:')}
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Project Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-canvas border border-hairline">
            <div>
              <p className="text-[11px] font-mono uppercase text-muted">Role</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {project.role}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-muted">Timeline</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {project.timeline}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-muted">Architecture</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {project.arch}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-muted">Outcome</p>
              <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
                {project.outcome}
              </p>
            </div>
          </div>

          {/* Deep Case Study Sections: The Challenge, UI/UX Craft, Frontend Engineering */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-elevated/60 border border-hairline space-y-2">
              <span className="font-mono text-xs text-primary font-semibold">
                01 / THE PROBLEM
              </span>
              <h4 className="font-display font-bold text-base text-white">
                User & Business Challenge
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {project.problem}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-elevated/60 border border-hairline space-y-2">
              <span className="font-mono text-xs text-primary font-semibold">
                02 / UI/UX PROCESS
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Design System & Flow
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {project.design}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-elevated/60 border border-hairline space-y-2">
              <span className="font-mono text-xs text-primary font-semibold">
                03 / FRONTEND CODE
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Engineering Highlights
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {project.code}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-canvas border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-muted font-mono">
            Press ESC or click outside to close
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onActionToast('Opening GitHub Repository preview...')}
              className="px-4 py-2 rounded-full bg-elevated hover:bg-white/10 border border-hairline text-xs font-medium text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </button>
            <button
              onClick={() => onActionToast('Launching Live Interactive Demo...')}
              className="group inline-flex items-center gap-2.5 bg-primary hover:bg-tertiary text-white text-xs font-semibold pl-4 pr-1.5 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <span>Live Demo</span>
              <span className="w-6 h-6 rounded-full bg-white text-canvas flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
