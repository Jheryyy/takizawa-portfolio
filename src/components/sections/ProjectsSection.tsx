'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, ArrowUpRight, Eye, Columns3, LayoutGrid } from 'lucide-react';
import { ProjectCategory, ProjectItem } from '@/types/portfolio';
import { projectsData } from '@/data/portfolio-data';
import { fetchAllProjects } from '@/lib/projects';
import Magnetic from '@/components/ui/Magnetic';
import { updateSpotlightPos } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ProjectDetailModal = dynamic(
  () => import('@/components/ui/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

interface ProjectsSectionProps {
  selectedCategory: ProjectCategory | 'All';
  onSelectCategory: (category: ProjectCategory | 'All') => void;
  onSelectProject?: (project: ProjectItem) => void;
}

export function ProjectsSection({
  selectedCategory,
  onSelectCategory,
}: ProjectsSectionProps) {
  const [allProjects, setAllProjects] = useState<ProjectItem[]>(projectsData);
  const [viewMode, setViewMode] = useState<'rail' | 'grid'>('rail');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedModalProject, setSelectedModalProject] = useState<ProjectItem | null>(null);
  const [hoverPreviewProject, setHoverPreviewProject] = useState<ProjectItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const floatingPreviewRef = useRef<HTMLDivElement>(null);
  const hoverPreviewPosRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllProjects().then((data) => {
      if (!cancelled) setAllProjects(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects =
    selectedCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === selectedCategory);

  const filterOptions: { label: string; value: ProjectCategory | 'All' }[] = [
    { label: 'All Works', value: 'All' },
    { label: 'Frontend Web', value: 'Frontend Web' },
    { label: 'UI/UX Design', value: 'UI/UX Case Study' },
    { label: 'Fullstack', value: 'Fullstack' },
  ];

  const updateMeasurements = useCallback(() => {
    if (viewMode === 'grid') {
      setContainerHeight(0);
      return;
    }
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const endPadding = viewportWidth < 640 ? 48 : 160;
    const maxScrollDist = Math.max(0, trackWidth - viewportWidth + endPadding);

    setContainerHeight(window.innerHeight + maxScrollDist);
  }, [viewMode]);

  useEffect(() => {
    updateMeasurements();
    if (typeof window === 'undefined') return;

    if (viewMode === 'grid') {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => clearTimeout(timer);
    }

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;

      const getScrollDist = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        const endPadding = viewportWidth < 640 ? 48 : 160;
        return Math.max(0, trackWidth - viewportWidth + endPadding);
      };

      gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCanScrollLeft(self.progress > 0.02);
            setCanScrollRight(self.progress < 0.98);
          },
        },
      });

      gsap.fromTo(
        '.project-card-item',
        { opacity: 0.85, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    const handleResize = () => {
      updateMeasurements();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    const rafId = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [filteredProjects, viewMode, updateMeasurements]);

  const scrollNext = () => {
    const cardStep = window.innerWidth < 640 ? window.innerWidth * 0.9 : 700;
    window.scrollBy({ top: cardStep, behavior: 'smooth' });
  };

  const scrollPrev = () => {
    const cardStep = window.innerWidth < 640 ? window.innerWidth * 0.9 : 700;
    window.scrollBy({ top: -cardStep, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: ProjectCategory | 'All') => {
    onSelectCategory(category);
    setActiveCardId(null);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 0) {
        window.scrollTo({
          top: window.scrollY + rect.top,
          behavior: 'smooth',
        });
      }
    }
  };

  const selectedModalIndex = selectedModalProject
    ? filteredProjects.findIndex((p) => p.id === selectedModalProject.id)
    : -1;
  const hasNextModal = selectedModalIndex >= 0 && selectedModalIndex < filteredProjects.length - 1;
  const hasPrevModal = selectedModalIndex > 0;

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full select-none"
      style={
        viewMode === 'rail'
          ? { minHeight: containerHeight > 0 ? `${containerHeight}px` : '100vh' }
          : undefined
      }
    >
      <div
        className={
          viewMode === 'rail'
            ? 'sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-4 sm:px-8 lg:px-12 py-6'
            : 'w-full max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 py-14 sm:py-20 space-y-8'
        }
      >
        {/* Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 shrink-0 z-20 w-full ${
            viewMode === 'rail' ? 'mb-5 max-w-[1360px] mx-auto' : ''
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-primary font-mono text-xs font-semibold uppercase tracking-wider">
                Selected Works &bull; {filteredProjects.length} Projects
              </p>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-neutral-950 dark:text-white">
              Engineered for Impact
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Layout Switcher: Rail vs Bento Grid */}
            <div
              role="group"
              aria-label="Projects layout mode"
              className="inline-flex items-center p-1 rounded-full bg-surface border border-hairline"
            >
              <button
                type="button"
                onClick={() => setViewMode('rail')}
                aria-pressed={viewMode === 'rail'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'rail'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Rail</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHoverPreviewProject(null);
                  setViewMode('grid');
                }}
                aria-pressed={viewMode === 'grid'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-surface border border-hairline">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleCategorySelect(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === opt.value
                      ? 'bg-primary font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {viewMode === 'rail' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollLeft}
                  aria-label="Slide to previous projects"
                  className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-neutral-800 dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollRight}
                  aria-label="Slide to next projects"
                  className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-neutral-800 dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'rail' ? (
          <>
            {/* Horizontal Track */}
            <div className="relative w-full overflow-hidden shrink-0">
              <div ref={trackRef} className="flex gap-4 sm:gap-5 will-change-transform py-2">
                {filteredProjects.map((project, idx) => {
                  const isSelected = activeCardId === project.id;
                  return (
                    <article
                      key={project.id}
                      onClick={() => setActiveCardId(isSelected ? null : project.id)}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty('--card-x', `${e.clientX - rect.left}px`);
                        e.currentTarget.style.setProperty('--card-y', `${e.clientY - rect.top}px`);
                      }}
                      className={`project-card-item relative w-[88vw] sm:w-[580px] md:w-[700px] lg:w-[820px] shrink-0 aspect-[16/10] sm:aspect-[16/9] max-h-[64vh] rounded-3xl overflow-hidden border bg-[#121216] group transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 shadow-2xl'
                          : 'border-hairline hover:border-primary/40 shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      {/* Cursor-reactive subtle spotlight */}
                      <div
                        className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            'radial-gradient(420px circle at var(--card-x, 50%) var(--card-y, 50%), rgba(var(--color-primary-rgb, 255, 90, 31), 0.14), transparent 70%)',
                        }}
                      />
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        unoptimized={project.image?.startsWith('data:')}
                        sizes="(max-width: 768px) 88vw, 820px"
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        quality={85}
                        className={`object-cover transition-all duration-700 ease-out pointer-events-none will-change-transform ${
                          isSelected
                            ? 'scale-[1.03] brightness-100'
                            : 'brightness-[0.92] group-hover:scale-[1.03] group-hover:brightness-100'
                        }`}
                      />

                      {/* Subtle Editorial Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 transition-opacity duration-300 pointer-events-none" />

                      {/* Top Metadata Bar */}
                      <div className="absolute top-5 inset-x-5 sm:top-6 sm:inset-x-7 flex items-center justify-between z-10 pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 font-mono text-[11px] text-white font-semibold">
                          <span className="text-primary">{project.index}</span> &bull; {project.category}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/85">
                          {project.timeline}
                        </span>
                      </div>

                      {/* Bottom Always-Readable Info + Actions */}
                      <div className="absolute bottom-5 inset-x-5 sm:bottom-7 sm:inset-x-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20 pointer-events-none">
                        <div className="space-y-2 max-w-xl">
                          <h3 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight leading-tight">
                            {project.title}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tech.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto shrink-0 self-start sm:self-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModalProject(project);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-sans text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>

                          <Magnetic strength={0.2}>
                            <Link
                              href={`/projects/${project.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-tertiary font-sans text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              <span>Case Study</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </Magnetic>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Quick Index Strip with Floating Thumbnail Preview on Hover */}
            {filteredProjects.length > 1 && (
              <div
                className="hidden sm:flex items-center justify-center gap-2 mt-4 z-20 max-w-[1360px] mx-auto flex-wrap"
                onMouseMove={(e) => {
                  const nextX = Math.min(window.innerWidth - 240, e.clientX + 16);
                  const nextY = Math.max(16, e.clientY - 150);
                  hoverPreviewPosRef.current = { x: nextX, y: nextY };
                  if (floatingPreviewRef.current) {
                    floatingPreviewRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
                  }
                }}
                onMouseLeave={() => setHoverPreviewProject(null)}
              >
                {filteredProjects.map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    onMouseEnter={(e) => {
                      const nextX = Math.min(window.innerWidth - 240, e.clientX + 16);
                      const nextY = Math.max(16, e.clientY - 150);
                      hoverPreviewPosRef.current = { x: nextX, y: nextY };
                      setHoverPreviewProject(proj);
                    }}
                    onClick={() => {
                      if (!containerRef.current || filteredProjects.length <= 1) return;
                      const rect = containerRef.current.getBoundingClientRect();
                      const sectionTop = window.scrollY + rect.top;
                      const scrollableSpan = Math.max(0, containerRef.current.offsetHeight - window.innerHeight);
                      const ratio = idx / (filteredProjects.length - 1);
                      window.scrollTo({
                        top: sectionTop + scrollableSpan * ratio,
                        behavior: 'smooth',
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono transition-all cursor-pointer ${
                      activeCardId === proj.id || hoverPreviewProject?.id === proj.id
                        ? 'bg-primary/12 border-primary/40 text-primary font-bold'
                        : 'bg-surface/70 border-hairline text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-primary">{proj.index}</span>
                    <span className="max-w-[140px] truncate">{proj.title}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface border border-hairline text-center text-sm text-neutral-500 dark:text-neutral-400">
            Belum ada proyek pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {filteredProjects.map((project, idx) => {
              const isLastOdd =
                filteredProjects.length % 2 === 1 && idx === filteredProjects.length - 1;
              const colSpanClass = isLastOdd
                ? 'md:col-span-2 lg:col-span-12'
                : idx % 4 === 0 || idx % 4 === 3
                  ? 'lg:col-span-7'
                  : 'lg:col-span-5';

              return (
                <article
                  key={project.id}
                  onMouseMove={updateSpotlightPos}
                  className={`spotlight-border group rounded-3xl bg-surface border border-hairline overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-primary/40 shadow-sm hover:shadow-xl ${colSpanClass}`}
                >
                  <div>
                    <div
                      className={`relative w-full overflow-hidden bg-neutral-900 ${
                        isLastOdd ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[16/10]'
                      }`}
                    >
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        unoptimized={project.image?.startsWith('data:')}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 720px"
                        loading={idx < 4 ? 'eager' : 'lazy'}
                        quality={85}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

                      <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 font-mono text-[11px] text-white font-semibold">
                          <span className="text-primary">{project.index}</span> &bull; {project.category}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/85">
                          {project.timeline}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-950 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                        {project.shortDesc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tech.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-[10px] font-mono text-neutral-700 dark:text-neutral-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                      {project.outcome || project.role}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedModalProject(project)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-canvas hover:border-primary/40 border border-hairline text-neutral-800 dark:text-neutral-200 font-sans text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>

                      <Magnetic strength={0.2}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-tertiary font-sans text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                          <span>Case Study</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </Magnetic>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cursor-Following Thumbnail Preview */}
      {hoverPreviewProject && viewMode === 'rail' && (
        <div
          ref={floatingPreviewRef}
          style={{
            transform: `translate3d(${hoverPreviewPosRef.current.x}px, ${hoverPreviewPosRef.current.y}px, 0)`,
          }}
          className="hidden md:block fixed top-0 left-0 z-50 pointer-events-none w-56 rounded-2xl overflow-hidden border border-white/20 bg-[#101016]/95 shadow-2xl backdrop-blur-md transition-opacity duration-150"
        >
          <div className="relative aspect-[16/10] w-full bg-neutral-900">
            <Image
              src={hoverPreviewProject.image}
              alt={hoverPreviewProject.title}
              fill
              unoptimized={hoverPreviewProject.image?.startsWith('data:')}
              sizes="224px"
              className="object-cover"
            />
          </div>
          <div className="px-3 py-2 flex items-center justify-between gap-2 text-[10px] font-mono text-white">
            <span className="truncate font-bold">{hoverPreviewProject.title}</span>
            <span className="text-primary shrink-0">{hoverPreviewProject.index}</span>
          </div>
        </div>
      )}

      <ProjectDetailModal
        project={selectedModalProject}
        isOpen={Boolean(selectedModalProject)}
        onClose={() => setSelectedModalProject(null)}
        onNext={() => {
          if (hasNextModal) setSelectedModalProject(filteredProjects[selectedModalIndex + 1]);
        }}
        onPrev={() => {
          if (hasPrevModal) setSelectedModalProject(filteredProjects[selectedModalIndex - 1]);
        }}
        hasNext={hasNextModal}
        hasPrev={hasPrevModal}
      />
    </section>
  );
}

export default ProjectsSection;
