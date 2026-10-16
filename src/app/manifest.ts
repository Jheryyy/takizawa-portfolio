import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jheryco Takizawa — Frontend Architect & UI/UX Specialist',
    short_name: 'Takizawa',
    description:
      'Creative portfolio showcasing high-performance Next.js 15 web applications, dark-mode design systems, and responsive web experiences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090C',
    theme_color: '#09090C',
    icons: [
      {
        src: '/card-front.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/card-front.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
