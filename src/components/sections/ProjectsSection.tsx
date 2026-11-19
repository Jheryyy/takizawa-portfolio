'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { ProjectCategory, ProjectItem } from '@/types/portfolio';
import { projectsData } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';
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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedModalProject, setSelectedModalProject] = useState<ProjectItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('project_index', { ascending: true });

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
    { label: 'UI/UX Design', value: 'UI/UX Case Study' },
    { label: 'Fullstack App', value: 'Fullstack' },
  ];

  const updateMeasurements = useCallback(() => {
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const endPadding = viewportWidth < 640 ? 48 : 160;
    const maxScrollDist = Math.max(0, trackWidth - viewportWidth + endPadding);

    setContainerHeight(window.innerHeight + maxScrollDist);
  }, []);

  useEffect(() => {
    updateMeasurements();

    if (typeof window === 'undefined') return;

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

      // GSAP Horizontal Scroll with buttery smooth scrub physics
      gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2, // GSAP smooth physics scrub
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCanScrollLeft(self.progress > 0.02);
            setCanScrollRight(self.progress < 0.98);
          },
        },
      });

      // GSAP Card entrance subtle lift
      gsap.fromTo(
        '.project-card-item',
        { opacity: 0.8, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
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

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [filteredProjects, updateMeasurements]);

  const scrollNext = () => {
    if (!containerRef.current || !trackRef.current) return;
    const cardStep = window.innerWidth < 640 ? window.innerWidth * 0.9 : 700;
    window.scrollBy({ top: cardStep, behavior: 'smooth' });
  };

  const scrollPrev = () => {
    if (!containerRef.current || !trackRef.current) return;
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

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full select-none"
      style={{ minHeight: containerHeight > 0 ? `${containerHeight}px` : '100vh' }}
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        {/* Header with Title, Category Filter & Left/Right Slide Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-3 sm:mb-5 shrink-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <p className="text-primary font-sans text-xs font-bold uppercase tracking-wider">
                Selected Works &bull; Pinned Showcase
              </p>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-black dark:text-white">
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
                  onClick={() => handleCategorySelect(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === opt.value
                      ? 'bg-primary text-neutral-950 font-black shadow-sm'
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
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollRight}
                aria-label="Slide to next projects"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-surface border border-hairline flex items-center justify-center text-black dark:text-white hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Track Container: Larger cards with reduced gap */}
        <div className="relative w-full overflow-hidden shrink-0">
          <div
            ref={trackRef}
            className="flex gap-3 sm:gap-4 md:gap-4 will-change-transform py-2"
          >
            {filteredProjects.map((project, idx) => {
              const isSelected = activeCardId === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    // Clicking card reveals ONLY title & Detail button, does not directly open modal
                    setActiveCardId(isSelected ? null : project.id);
                  }}
                  className={`project-card-item relative w-[90vw] sm:w-[620px] md:w-[740px] lg:w-[860px] xl:w-[920px] shrink-0 aspect-[16/10] sm:aspect-[16/9] max-h-[66vh] rounded-3xl overflow-hidden border border-hairline bg-[#161616] group shadow-lg transition-all duration-300 hover:shadow-2xl cursor-pointer ${
                    isSelected ? 'border-primary ring-2 ring-primary/40' : 'hover:border-primary/40'
                  }`}
                >
                  {/* Full Card Image (Bigger card size & Grayscale by default, color on hover / click) */}
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    unoptimized={project.image?.startsWith('data:')}
                    sizes="(max-width: 768px) 90vw, 920px"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    quality={85}
                    className={`object-cover transition-all duration-700 ease-out pointer-events-none will-change-transform ${
                      isSelected
                        ? 'grayscale-0 contrast-[105%] brightness-100 scale-105'
                        : 'grayscale contrast-[90%] brightness-[85%] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:scale-105'
                    }`}
                  />

                  {/* Dark Cinematic Gradient Overlay: revealed on click/active or hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 transition-opacity duration-300 pointer-events-none ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />

                  {/* Top Badge (Subtle index & category) */}
                  <div
                    className={`absolute top-5 inset-x-5 sm:top-6 sm:inset-x-6 flex items-center justify-between z-10 transition-all duration-300 pointer-events-none ${
                      isSelected
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    <span className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 font-sans text-xs text-primary font-bold shadow-md">
                      {project.index} &bull; {project.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-sans font-medium text-white/90 shadow-sm">
                      {project.timeline}
                    </span>
                  </div>

                  {/* On Click / Hover: Muncul Judulnya Aja & Tombol Detail */}
                  <div
                    className={`absolute bottom-6 inset-x-6 sm:bottom-8 sm:inset-x-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20 transition-all duration-300 ease-out pointer-events-none ${
                      isSelected
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    {/* Muncul Judulnya Saja */}
                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight drop-shadow-md">
                        {project.title}
                      </h3>
                    </div>

                    {/* Tombol Detail: Klik tombol ini untuk membuka modal */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalProject(project);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-tertiary text-white font-sans text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer pointer-events-auto self-start sm:self-auto shrink-0"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
