'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { ProjectCategory, ProjectItem } from '@/types/portfolio';
import { projectsData } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';
import { ProjectDetailModal } from '@/components/ui/ProjectDetailModal';

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
  const [activeTouchId, setActiveTouchId] = useState<string | null>(null);
  const [selectedModalProject, setSelectedModalProject] = useState<ProjectItem | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag-to-scroll state for desktop mouse
  const isDragging = useRef(false);
  const isDragMoved = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('project_index', { ascending: true }); // Proyek paling baru berada di sebelah kanan

        if (!error && data && data.length > 0) {
          const mapped: ProjectItem[] = data.map((d) => ({
            id: d.id,
            index: d.project_index || '01',
            title: d.title,
            category: d.category as ProjectCategory,
            shortDesc: d.short_desc || '',
            role: d.role || 'Frontend Developer',
            timeline: d.timeline || '2026',
            arch: d.arch || 'Next.js 15',
            outcome: d.outcome || 'High Performance',
            image: d.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
            tech: Array.isArray(d.tech) ? d.tech : (d.tech ? [d.tech] : ['Next.js']),
            problem: d.problem || '',
            design: d.design || '',
            code: d.code || '',
          }));
          setAllProjects(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch Supabase projects, using fallback:', err);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects =
    selectedCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === selectedCategory);

  const filterOptions: { label: string; value: ProjectCategory | 'All' }[] = [
    { label: 'All Works', value: 'All' },
    { label: 'Frontend Web', value: 'Frontend Web' },
    { label: 'UI/UX Case Study', value: 'UI/UX Case Study' },
    { label: 'Fullstack App', value: 'Fullstack' },
  ];

  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    updateScrollButtons();
    slider.addEventListener('scroll', updateScrollButtons, { passive: true });
    return () => slider.removeEventListener('scroll', updateScrollButtons);
  }, [filteredProjects]);

  const scrollPrev = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Modal navigation handlers
  const selectedModalIndex = selectedModalProject
    ? filteredProjects.findIndex((p) => p.id === selectedModalProject.id)
    : -1;
  const hasNextModal = selectedModalIndex >= 0 && selectedModalIndex < filteredProjects.length - 1;
  const hasPrevModal = selectedModalIndex > 0;

  const handleNextModal = () => {
    if (hasNextModal) {
      setSelectedModalProject(filteredProjects[selectedModalIndex + 1]);
    }
  };

  const handlePrevModal = () => {
    if (hasPrevModal) {
      setSelectedModalProject(filteredProjects[selectedModalIndex - 1]);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    isDragMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 6) {
      isDragMoved.current = true;
    }
    e.preventDefault();
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <section id="projects" className="space-y-8 scroll-mt-24 select-none">
      {/* Header with Title, Category Filter & Left/Right Slide Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <p className="text-primary font-mono text-xs font-bold uppercase tracking-widest">
              Selected Works &bull; Horizontal Showcase
            </p>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-black dark:text-white">
            Engineered for Impact
          </h2>
        </div>

        {/* Controls: Category Filter + Next/Prev Arrow Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelectCategory(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface border border-hairline text-black dark:text-muted hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-2 pl-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Slide to previous projects"
              className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Slide to next projects"
              className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Sliding Carousel Strip: Wide Cards, Latest on Right */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12">
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-4 cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {filteredProjects.map((project, idx) => {
            const isTouchActive = activeTouchId === project.id;
            return (
              <div
                key={project.id}
                onClick={() => {
                  if (isDragMoved.current) return;
                  setSelectedModalProject(project);
                }}
                className="relative w-[85vw] sm:w-[580px] md:w-[700px] lg:w-[820px] shrink-0 snap-center sm:snap-start aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-hairline bg-[#161616] group shadow-md transition-all duration-300 hover:shadow-2xl hover:border-primary/50 cursor-pointer"
              >
                {/* Full Card Image (Wide Landscape): Optimized without heavy blur filter */}
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  unoptimized={project.image?.startsWith('data:')}
                  sizes="(max-width: 768px) 85vw, 820px"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  quality={75}
                  className={`object-cover transition-all duration-500 ease-out pointer-events-none will-change-transform ${
                    isTouchActive
                      ? 'grayscale-0 brightness-100 scale-105'
                      : 'grayscale contrast-[105%] brightness-[0.88] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105'
                  }`}
                />

                {/* Dark Cinematic Gradient Overlay: Hidden by default, reveals on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25 transition-opacity duration-300 pointer-events-none ${
                    isTouchActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Top Row Badges: Hidden by default, slides down on hover */}
                <div
                  className={`absolute top-5 inset-x-5 sm:top-6 sm:inset-x-6 flex items-center justify-between z-10 transition-all duration-300 pointer-events-none ${
                    isTouchActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
                >
                  <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 font-mono text-xs text-primary font-bold shadow-md">
                    {project.index} &bull; {project.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-mono text-white/90 shadow-sm">
                    {project.timeline}
                  </span>
                </div>

                {/* Bottom Information (Title, Description, Tech Stack & Detail Button) */}
                <div
                  className={`absolute bottom-5 inset-x-5 sm:bottom-7 sm:inset-x-7 space-y-2.5 z-10 transition-all duration-300 ease-out pointer-events-none ${
                    isTouchActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
                >
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight drop-shadow-md">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 sm:line-clamp-3 leading-relaxed font-sans max-w-2xl">
                    {project.shortDesc}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 sm:px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-mono text-white font-medium border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalProject(project);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-tertiary text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer pointer-events-auto"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtle Hover Hint Icon on bottom-right when not hovering */}
                <div
                  className={`absolute bottom-4 right-4 z-10 transition-opacity duration-300 ${
                    isTouchActive ? 'opacity-0' : 'opacity-70 group-hover:opacity-0'
                  }`}
                >
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/80">
                    Hover / Klik untuk Detail
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Detail Popup Modal */}
      <ProjectDetailModal
        project={selectedModalProject}
        isOpen={Boolean(selectedModalProject)}
        onClose={() => setSelectedModalProject(null)}
        onNext={handleNextModal}
        onPrev={handlePrevModal}
        hasNext={hasNextModal}
        hasPrev={hasPrevModal}
      />
    </section>
  );
}

export default ProjectsSection;
