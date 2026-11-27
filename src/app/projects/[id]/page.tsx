import { fetchProjectContext } from '@/lib/projects';
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient';

export const revalidate = 60;

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const { project, prevProject, nextProject } = await fetchProjectContext(id);

  return (
    <ProjectDetailClient
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
