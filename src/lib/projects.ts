import { ProjectCategory, ProjectItem } from '@/types/portfolio';
import { projectsData } from '@/data/portfolio-data';
import { supabase } from '@/lib/supabase';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85';

export function mapSupabaseProject(d: any): ProjectItem {
  return {
    id: String(d.id),
    index: d.project_index || '01',
    title: d.title || 'Untitled Project',
    category: (d.category as ProjectCategory) || 'Frontend Web',
    shortDesc: d.short_desc || '',
    role: d.role || 'Frontend Developer',
    timeline: d.timeline || '2026',
    arch: d.arch || 'Next.js 15',
    outcome: d.outcome || 'High Performance',
    image: d.image || FALLBACK_IMAGE,
    tech: Array.isArray(d.tech) ? d.tech : d.tech ? [String(d.tech)] : ['Next.js'],
    problem: d.problem || '',
    design: d.design || '',
    code: d.code || '',
    liveUrl: d.live_url || d.liveUrl || undefined,
    githubUrl: d.github_url || d.githubUrl || undefined,
  };
}

const PROJECTS_CACHE_TTL = 60_000;
let cachedProjects: ProjectItem[] | null = null;
let cachedProjectsAt = 0;
let inFlightProjectsPromise: Promise<ProjectItem[]> | null = null;

export function invalidateProjectsCache() {
  cachedProjects = null;
  cachedProjectsAt = 0;
  inFlightProjectsPromise = null;
}

export async function fetchAllProjects(): Promise<ProjectItem[]> {
  if (typeof window !== 'undefined') {
    if (cachedProjects && Date.now() - cachedProjectsAt < PROJECTS_CACHE_TTL) {
      return cachedProjects;
    }
    if (inFlightProjectsPromise) {
      return inFlightProjectsPromise;
    }
  }

  const request = (async (): Promise<ProjectItem[]> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('project_index', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapSupabaseProject);
        if (typeof window !== 'undefined') {
          cachedProjects = mapped;
          cachedProjectsAt = Date.now();
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Could not fetch Supabase projects, using static fallback:', err);
    }
    return projectsData;
  })();

  if (typeof window !== 'undefined') {
    inFlightProjectsPromise = request;
    try {
      return await request;
    } finally {
      inFlightProjectsPromise = null;
    }
  }

  return request;
}

export async function fetchProjectContext(id: string): Promise<{
  project: ProjectItem | null;
  prevProject: ProjectItem | null;
  nextProject: ProjectItem | null;
}> {
  const all = await fetchAllProjects();
  const idx = all.findIndex((p) => p.id === id);

  if (idx !== -1) {
    return {
      project: all[idx],
      prevProject: idx > 0 ? all[idx - 1] : null,
      nextProject: idx < all.length - 1 ? all[idx + 1] : null,
    };
  }

  // Fallback check against static data if not in Supabase results
  const staticIdx = projectsData.findIndex((p) => p.id === id);
  if (staticIdx !== -1) {
    return {
      project: projectsData[staticIdx],
      prevProject: staticIdx > 0 ? projectsData[staticIdx - 1] : null,
      nextProject: staticIdx < projectsData.length - 1 ? projectsData[staticIdx + 1] : null,
    };
  }

  return { project: null, prevProject: null, nextProject: null };
}
