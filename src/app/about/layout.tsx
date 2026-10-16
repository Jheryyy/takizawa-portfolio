import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About & Credentials — Jheryco Takizawa',
  description:
    'Discover the engineering journey, technical competencies, formal education, and design philosophy of Jheryco Takizawa — Frontend Architect and UI/UX Specialist.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About & Credentials — Jheryco Takizawa',
    description:
      'Discover the engineering journey, technical competencies, formal education, and design philosophy of Jheryco Takizawa.',
    url: '/about',
  },
  twitter: {
    title: 'About & Credentials — Jheryco Takizawa',
    description:
      'Discover the engineering journey, technical competencies, and design philosophy of Jheryco Takizawa.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
