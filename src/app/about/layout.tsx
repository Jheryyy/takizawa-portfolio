import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Jheryco Takizawa Natal Kristiawan — Credentials & Experience',
  description:
    'Profil lengkap, perjalanan rekayasa perangkat lunak, dan filosofi desain Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa), Frontend Developer & UI/UX Architect.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Jheryco Takizawa Natal Kristiawan — Credentials & Experience',
    description:
      'Profil lengkap, perjalanan rekayasa perangkat lunak, dan filosofi desain Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa).',
    url: '/about',
  },
  twitter: {
    title: 'About Jheryco Takizawa Natal Kristiawan — Credentials & Experience',
    description:
      'Profil lengkap dan perjalanan rekayasa perangkat lunak Jheryco Takizawa Natal Kristiawan.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
