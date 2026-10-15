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
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Takizawa.dev — Frontend Developer & UI/UX Enthusiast",
  description:
    "Creative portfolio of Takizawa, a Frontend Developer and UI/UX Architect crafting modern Next.js 15 web applications, dark-mode design systems, and responsive web experiences.",
  keywords: [
    "Frontend Developer",
    "UI/UX Designer",
    "Next.js 15",
    "React 19",
    "Tailwind CSS v4",
    "Portfolio",
    "TypeScript",
  ],
  authors: [{ name: "Takizawa" }],
  openGraph: {
    title: "Takizawa.dev — Frontend Developer & UI/UX Enthusiast",
    description:
      "Crafting pixel-accurate dark-mode interfaces, accessible component libraries, and modern fullstack web applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
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
