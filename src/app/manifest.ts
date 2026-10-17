import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jheryco Takizawa Natal Kristiawan — Frontend Developer & UI/UX Architect',
    short_name: 'Jheryco Takizawa',
    description:
      'Portofolio resmi Jheryco Takizawa Natal Kristiawan — Frontend Developer & UI/UX Architect.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090C',
    theme_color: '#09090C',
    icons: [
      {
        src: '/card-front.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/card-front.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
