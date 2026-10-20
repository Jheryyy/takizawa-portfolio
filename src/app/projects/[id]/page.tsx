'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
  Terminal,
  User,
} from 'lucide-react';
import { projectsData } from '@/data/portfolio-data';
import { FooterSection } from '@/components/sections/FooterSection';
import { Toast } from '@/components/ui/Toast';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const projectIndex = projectsData.findIndex((p) => p.id === id);
  const project = projectsData[projectIndex];

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-canvas text-black dark:text-white pt-32 pb-20 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-sm text-primary font-bold">404 &bull; NOT FOUND</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl mt-2 mb-4">
          Project Not Found
        </h1>
        <p className="text-black/80 dark:text-muted max-w-md mb-8 font-medium">
          The requested case study could not be located. It might have been updated or moved.
        </p>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-tertiary text-white font-semibold text-sm transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to All Projects</span>
        </Link>
      </div>
    );
  }

  const prevProject = projectIndex > 0 ? projectsData[projectIndex - 1] : null;
  const nextProject =
    projectIndex < projectsData.length - 1 ? projectsData[projectIndex + 1] : null;

  return (
    <div className="relative min-h-screen w-full bg-canvas text-black dark:text-white pt-24 sm:pt-28 flex flex-col justify-between transition-colors">
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 py-10 space-y-12 sm:space-y-16">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black dark:text-neutral-400 hover:text-primary transition-colors w-fit"
          >
            <span className="w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-black group-hover:text-white dark:text-white" />
            </span>
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono font-medium text-black/70 dark:text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/#projects" className="hover:text-primary transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-primary font-bold truncate max-w-[180px] sm:max-w-none">
              {project.title}
            </span>
          </div>
        </div>

        {/* Project Hero Header: Title, Tags & Action CTAs */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-bold">
              {project.index} &bull; {project.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface border border-hairline text-black dark:text-neutral-300 text-xs font-mono font-semibold">
              {project.timeline}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
              Outcome: {project.outcome}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-black dark:text-white tracking-tight leading-[1.05]">
                {project.title}
              </h1>
              <p className="text-base sm:text-lg text-black dark:text-white/80 leading-relaxed font-sans font-medium max-w-2xl">
                {project.shortDesc}
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-surface border border-hairline font-mono text-xs text-primary font-bold shadow-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Live Demo & GitHub */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end justify-start pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-surface hover:bg-elevated border border-hairline text-black dark:text-white font-bold text-xs sm:text-sm transition-all shadow-sm w-full sm:w-auto"
                onClick={() => showToast('Opening GitHub Repository preview...')}
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>

              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-primary hover:bg-tertiary text-white font-bold text-xs sm:text-sm transition-all shadow-md w-full sm:w-auto"
                onClick={() => showToast('Opening Live Interactive Demo...')}
              >
                <span className="text-white">Live Interactive Demo</span>
                <span className="w-6 h-6 rounded-full bg-white text-canvas flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-canvas" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Hero Image Presentation */}
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-hairline bg-surface shadow-lg">
          <Image
            src={project.image}
            alt={project.title}
            fill
            unoptimized={project.image?.startsWith('data:')}
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white text-xs font-mono">
            <span>Production Deployment &bull; 99% Lighthouse</span>
            <span>Case Study &bull; {project.arch}</span>
          </div>
        </section>

        {/* 4-Column Metadata Architecture Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2.5xl bg-surface border border-hairline shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-black/70 dark:text-muted tracking-wider flex items-center gap-1.5 font-bold">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Role</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-black dark:text-white">
              {project.role}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-black/70 dark:text-muted tracking-wider flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Timeline</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-black dark:text-white">
              {project.timeline}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-black/70 dark:text-muted tracking-wider flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>Architecture</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-black dark:text-white">
              {project.arch}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-black/70 dark:text-muted tracking-wider flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Key Metric</span>
            </span>
            <p className="text-sm sm:text-base font-extrabold text-primary">
              {project.outcome}
            </p>
          </div>
        </section>

        {/* Deep Case Study 3-Pillar Breakdown */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              CASE STUDY DEEP DIVE
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
              Architecture, Design &amp; Code Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: The Problem */}
            <div className="p-6 sm:p-7 rounded-2.5xl bg-surface border border-hairline space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-mono text-xs text-primary font-bold">
                  01 / THE CHALLENGE
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
                  User &amp; Business Problem
                </h3>
                <p className="text-xs sm:text-sm text-black/80 dark:text-muted leading-relaxed font-sans font-medium">
                  {project.problem}
                </p>
              </div>
              <div className="pt-4 border-t border-hairline flex items-center gap-2 text-xs text-black/70 dark:text-neutral-500 font-mono font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Needs Analysis Verified</span>
              </div>
            </div>

            {/* Column 2: UI/UX Process */}
            <div className="p-6 sm:p-7 rounded-2.5xl bg-surface border border-hairline space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-mono text-xs text-primary font-bold">
                  02 / DESIGN PROCESS
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
                  Tokens &amp; User Experience
                </h3>
                <p className="text-xs sm:text-sm text-black/80 dark:text-muted leading-relaxed font-sans font-medium">
                  {project.design}
                </p>
              </div>
              <div className="pt-4 border-t border-hairline flex items-center gap-2 text-xs text-black/70 dark:text-neutral-500 font-mono font-medium">
                <Layers className="w-4 h-4 text-primary shrink-0" />
                <span>Figma Tokens &bull; 8px Grid</span>
              </div>
            </div>

            {/* Column 3: Frontend Code */}
            <div className="p-6 sm:p-7 rounded-2.5xl bg-surface border border-hairline space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-mono text-xs text-primary font-bold">
                  03 / IMPLEMENTATION
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
                  Engineering &amp; Performance
                </h3>
                <p className="text-xs sm:text-sm text-black/80 dark:text-muted leading-relaxed font-sans font-medium">
                  {project.code}
                </p>
              </div>
              <div className="pt-4 border-t border-hairline flex items-center gap-2 text-xs text-black/70 dark:text-neutral-500 font-mono font-medium">
                <Code2 className="w-4 h-4 text-primary shrink-0" />
                <span>Clean Architecture Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Project Navigation Footer (Prev / Next Case Studies) */}
        <section className="pt-8 border-t border-hairline grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.id}`}
              className="p-5 rounded-2xl bg-surface border border-hairline hover:border-primary/60 transition-all flex items-center gap-4 group shadow-xs"
            >
              <span className="w-10 h-10 rounded-full bg-elevated border border-hairline flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-black group-hover:text-white dark:text-white" />
              </span>
              <div>
                <span className="text-[11px] font-mono text-black/70 dark:text-muted uppercase font-bold">Previous Project</span>
                <p className="text-sm font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                  {prevProject.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="p-5 rounded-2xl bg-canvas border border-dashed border-hairline flex items-center justify-center text-xs text-black/70 dark:text-muted font-mono font-medium">
              Start of Selected Works
            </div>
          )}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.id}`}
              className="p-5 rounded-2xl bg-surface border border-hairline hover:border-primary/60 transition-all flex items-center justify-between text-right gap-4 group shadow-xs"
            >
              <div className="w-full">
                <span className="text-[11px] font-mono text-black/70 dark:text-muted uppercase font-bold">Next Project</span>
                <p className="text-sm font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                  {nextProject.title}
                </p>
              </div>
              <span className="w-10 h-10 rounded-full bg-elevated border border-hairline flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-black group-hover:text-white dark:text-white" />
              </span>
            </Link>
          ) : (
            <div className="p-5 rounded-2xl bg-canvas border border-dashed border-hairline flex items-center justify-center text-xs text-black/70 dark:text-muted font-mono font-medium">
              End of Selected Works
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <FooterSection onNotifyToast={showToast} />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
