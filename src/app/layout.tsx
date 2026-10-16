import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import TargetCursor from "@/components/ui/TargetCursor";
import VideoSplashScreen from "@/components/ui/VideoSplashScreen";
import MusicPlayer from "@/components/ui/MusicPlayer";
import LiquidTransitionProvider from "@/components/ui/LiquidTransition";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jtakizawa.my.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jheryco Takizawa Natal Kristiawan — Frontend Developer & UI/UX Architect',
    template: '%s | Jheryco Takizawa Natal Kristiawan',
  },
  description:
    'Portofolio resmi Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa / Jheryco). Frontend Developer dan UI/UX Architect yang berspesialisasi dalam Next.js 15, React 19, TypeScript, Tailwind CSS, dan desain antarmuka modern.',
  keywords: [
    'Jheryco Takizawa Natal Kristiawan',
    'jheryco takizawa natal kristiawan',
    'Jheryco Takizawa',
    'jheryco takizawa',
    'Jheryco',
    'jheryco',
    'Natal Kristiawan',
    'natal kristiawan',
    'Jheryco Kristiawan',
    'jheryco kristiawan',
    'Takizawa',
    'takizawa',
    'Takizawablox',
    'jtakizawa',
    'jtakizawa.my.id',
    'Frontend Developer Indonesia',
    'Frontend Engineer',
    'UI/UX Designer Indonesia',
    'UI/UX Architect',
    'SMK Negeri 1 Depok',
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Tailwind CSS v4',
    'Portfolio Jheryco Takizawa',
    'Creative Developer',
    'Web Architecture',
    'Supabase',
  ],
  authors: [{ name: 'Jheryco Takizawa Natal Kristiawan', url: siteUrl }],
  creator: 'Jheryco Takizawa Natal Kristiawan',
  publisher: 'Jheryco Takizawa Natal Kristiawan',
  category: 'Technology & Web Development',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Jheryco Takizawa Natal Kristiawan — Frontend Developer & UI/UX Architect',
    description:
      'Portofolio resmi Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa / Jheryco). Eksplorasi selected works, prototipe interaktif, design system, dan case study teknis.',
    url: siteUrl,
    siteName: 'Jheryco Takizawa Natal Kristiawan Portfolio',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jheryco Takizawa Natal Kristiawan — Frontend Developer & UI/UX Architect',
    description:
      'Portofolio resmi Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa / Jheryco).',
    creator: '@abcdefghijherr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/card-front.jpg',
    apple: '/card-front.jpg',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Jheryco Takizawa Natal Kristiawan',
      givenName: 'Jheryco',
      additionalName: 'Takizawa Natal',
      familyName: 'Kristiawan',
      alternateName: [
        'Jheryco Takizawa',
        'Jheryco',
        'jheryco takizawa natal kristiawan',
        'jheryco takizawa',
        'jheryco',
        'Natal Kristiawan',
        'Jheryco Kristiawan',
        'Takizawa',
        'takizawa',
        'Takizawablox',
        'jtakizawa',
      ],
      jobTitle: 'Frontend Developer & UI/UX Architect',
      url: siteUrl,
      image: `${siteUrl}/card-front.jpg`,
      email: 'mailto:jherycotakizawa@gmail.com',
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'SMK Negeri 1 Depok',
      },
      sameAs: [
        'https://instagram.com/abcdefghijherr',
        'https://www.tiktok.com/@abcdefghijherr',
        'https://github.com/Jheryyy',
      ],
      knowsAbout: [
        'Next.js 15 App Router',
        'React 19',
        'TypeScript',
        'Tailwind CSS v4',
        'Figma Design Systems',
        'UI/UX Architecture',
        'Fullstack Web Development',
        'Supabase & PostgreSQL',
        'WebGL & 3D Web',
      ],
      description:
        'Jheryco Takizawa Natal Kristiawan (Jheryco Takizawa / Jheryco) adalah seorang Frontend Developer dan UI/UX Architect yang berfokus pada pengembangan aplikasi web modern, Next.js 15, React 19, dan desain antarmuka berkualitas tinggi.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Jheryco Takizawa Natal Kristiawan Portfolio',
      alternateName: [
        'Jheryco Takizawa Portfolio',
        'Jheryco Portfolio',
        'jtakizawa.my.id',
      ],
      description: 'Creative software engineering portfolio of Jheryco Takizawa Natal Kristiawan',
      publisher: {
        '@id': `${siteUrl}/#person`,
      },
      inLanguage: ['id', 'en'],
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#profile`,
      url: siteUrl,
      name: 'Jheryco Takizawa Natal Kristiawan Portfolio & Credentials',
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      about: {
        '@id': `${siteUrl}/#person`,
      },
      primaryImageOfPage: `${siteUrl}/card-front.jpg`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} bg-canvas text-neutral-900 dark:text-white antialiased selection:bg-primary selection:text-white transition-colors duration-300 min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LiquidTransitionProvider>
            <MusicPlayer />
            <VideoSplashScreen />
            <TargetCursor
              spinDuration={0}
              hideDefaultCursor
              parallaxOn
              hoverDuration={0.35}
              size={30}
              cornerSize={10}
              thickness={1.5}
              padding={8}
              targetSelector="a, button, input, textarea, select, [role='button'], .cursor-target"
            />
            <Navbar />
            <div className="flex-1 w-full">
              {children}
            </div>
            <SpeedInsights />
          </LiquidTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
