import type { Metadata } from 'next';
import { projectsData } from '@/data/portfolio-data';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projectsData.find((p) => p.id === id);

  if (!project) {
    return {
      title: 'Project Not Found — Jheryco Takizawa',
      description: 'The requested project case study could not be found.',
    };
  }

  const title = `${project.title} (${project.category}) — Case Study | Jheryco Takizawa`;
  const description = project.shortDesc || `Detailed case study and technical architecture of ${project.title}.`;
  const canonicalUrl = `/projects/${project.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: project.image,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.image],
    },
  };
}

export default function ProjectDetailLayout({ children }: ProjectLayoutProps) {
  return <>{children}</>;
}
