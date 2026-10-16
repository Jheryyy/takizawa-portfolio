import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import TargetCursor from "@/components/ui/TargetCursor";
import VideoSplashScreen from "@/components/ui/VideoSplashScreen";
import MusicPlayer from "@/components/ui/MusicPlayer";
import LiquidTransitionProvider from "@/components/ui/LiquidTransition";

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
    default: 'Jheryco Takizawa — Frontend Developer & UI/UX Architect',
    template: '%s | Jheryco Takizawa',
  },
  description:
    'Creative portfolio of Jheryco Takizawa, a Frontend Developer and UI/UX Architect crafting high-performance Next.js 15 web applications, dark-mode design systems, and responsive web experiences.',
  keywords: [
    'Jheryco Takizawa',
    'Takizawa',
    'Takizawablox',
    'Frontend Developer',
    'Frontend Engineer',
    'UI/UX Designer',
    'UI/UX Architect',
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Tailwind CSS v4',
    'Portfolio Developer Indonesia',
    'Creative Developer',
    'Web Architecture',
    'Supabase',
  ],
  authors: [{ name: 'Jheryco Takizawa', url: siteUrl }],
  creator: 'Jheryco Takizawa',
  publisher: 'Jheryco Takizawa',
  category: 'Technology & Web Development',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Jheryco Takizawa — Frontend Developer & UI/UX Architect',
    description:
      'Explore selected works, interactive 3D prototypes, dark-mode design systems, and technical case studies built with Next.js 15 and React 19.',
    url: siteUrl,
    siteName: 'Jheryco Takizawa Portfolio',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jheryco Takizawa — Frontend Developer & UI/UX Architect',
    description:
      'Explore selected works, interactive design systems, and technical case studies built with Next.js 15.',
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
      name: 'Jheryco Takizawa',
      alternateName: 'Takizawablox',
      jobTitle: 'Frontend Developer & UI/UX Architect',
      url: siteUrl,
      image: `${siteUrl}/card-front.jpg`,
      email: 'mailto:jherycotakizawa@gmail.com',
      sameAs: [
        'https://instagram.com/abcdefghijherr',
        'https://www.tiktok.com/@abcdefghijherr',
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
        'Frontend Developer and UI/UX Architect crafting modern Next.js 15 web applications, dark-mode design systems, and responsive web experiences.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Jheryco Takizawa Portfolio',
      description: 'Creative software engineering portfolio of Jheryco Takizawa',
      publisher: {
        '@id': `${siteUrl}/#person`,
      },
      inLanguage: 'en',
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#profile`,
      url: siteUrl,
      name: 'Jheryco Takizawa Portfolio & Credentials',
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      about: {
        '@id': `${siteUrl}/#person`,
      },
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
          </LiquidTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
