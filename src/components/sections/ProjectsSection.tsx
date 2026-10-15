'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProjectCategory, ProjectItem } from '@/types/portfolio';
import { projectsData } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';

interface ProjectsSectionProps {
  selectedCategory: ProjectCategory | 'All';
  onSelectCategory: (category: ProjectCategory | 'All') => void;
  onSelectProject?: (project: ProjectItem) => void;
}

export function ProjectsSection({
  selectedCategory,
  onSelectCategory,
  onSelectProject,
}: ProjectsSectionProps) {
  const [allProjects, setAllProjects] = useState<ProjectItem[]>(projectsData);

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
    { label: 'UI/UX Case Study', value: 'UI/UX Case Study' },
    { label: 'Fullstack App', value: 'Fullstack' },
  ];

  return (
    <section id="projects" className="space-y-10 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-primary font-display font-semibold text-sm sm:text-base">
            Selected Works &amp; Case Studies
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-black dark:text-white">
            Engineered for Impact
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectCategory(opt.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-hairline text-black dark:text-muted hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Portrait Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            onClick={() => onSelectProject?.(project)}
            className="group cursor-pointer bg-surface border border-hairline rounded-2.5xl overflow-hidden flex flex-col justify-between card-glow-hover shadow-sm"
          >
            {/* Portrait 3:3.6 Monochrome Image Card */}
            <div className="relative aspect-[3/3.6] w-full bg-[#1C1C1C] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover mono-editorial-img"
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Top Row Badges inside Card */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 font-mono text-xs text-primary font-bold">
                  {project.index} &bull; {project.category}
                </span>
                <span className="w-9 h-9 rounded-full bg-white text-canvas flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:bg-primary group-hover:text-white group-hover:-rotate-45">
                  <ArrowRight className="w-4 h-4 text-neutral-900 group-hover:text-white" />
                </span>
              </div>

              {/* Bottom Title & Tech inside Portrait Card */}
              <div className="absolute bottom-4 inset-x-4 space-y-2 z-10">
                <h3 className="font-display font-bold text-xl !text-white leading-tight group-hover:!text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs !text-white/80 line-clamp-2 leading-relaxed font-sans">
                  {project.shortDesc}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-mono !text-white font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
