import React from 'react';
import { LogoItem } from '@/components/ui/LogoLoop';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiFigma,
  SiNodedotjs,
  SiSupabase,
  SiMysql,
  SiPostgresql,
  SiPhp,
  SiGit,
  SiGithub,
  SiVercel,
  SiHtml5,
  SiCss,
  SiVite,
} from 'react-icons/si';

export const techLogos: LogoItem[] = [
  {
    node: (
      <SiNextdotjs className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-primary dark:hover:text-white transition-all duration-300" />
    ),
    title: 'Next.js 15',
    href: 'https://nextjs.org',
  },
  {
    node: (
      <SiReact className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#61DAFB] dark:hover:text-[#61DAFB] transition-all duration-300" />
    ),
    title: 'React 19',
    href: 'https://react.dev',
  },
  {
    node: (
      <SiTypescript className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#3178C6] dark:hover:text-[#3178C6] transition-all duration-300" />
    ),
    title: 'TypeScript',
    href: 'https://www.typescriptlang.org',
  },
  {
    node: (
      <SiJavascript className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#F7DF1E] dark:hover:text-[#F7DF1E] transition-all duration-300" />
    ),
    title: 'JavaScript',
    href: 'https://developer.mozilla.org',
  },
  {
    node: (
      <SiTailwindcss className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#38BDF8] dark:hover:text-[#38BDF8] transition-all duration-300" />
    ),
    title: 'Tailwind CSS v4',
    href: 'https://tailwindcss.com',
  },
  {
    node: (
      <SiFigma className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#F24E1E] dark:hover:text-[#F24E1E] transition-all duration-300" />
    ),
    title: 'Figma UI/UX',
    href: 'https://figma.com',
  },
  {
    node: (
      <SiNodedotjs className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#5FA04E] dark:hover:text-[#5FA04E] transition-all duration-300" />
    ),
    title: 'Node.js',
    href: 'https://nodejs.org',
  },
  {
    node: (
      <SiSupabase className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#3ECF8E] dark:hover:text-[#3ECF8E] transition-all duration-300" />
    ),
    title: 'Supabase',
    href: 'https://supabase.com',
  },
  {
    node: (
      <SiMysql className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#4479A1] dark:hover:text-[#4479A1] transition-all duration-300" />
    ),
    title: 'MySQL',
    href: 'https://mysql.com',
  },
  {
    node: (
      <SiPostgresql className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#4169E1] dark:hover:text-[#4169E1] transition-all duration-300" />
    ),
    title: 'PostgreSQL',
    href: 'https://postgresql.org',
  },
  {
    node: (
      <SiPhp className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#777BB4] dark:hover:text-[#777BB4] transition-all duration-300" />
    ),
    title: 'PHP 8',
    href: 'https://php.net',
  },
  {
    node: (
      <SiGit className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#F05032] dark:hover:text-[#F05032] transition-all duration-300" />
    ),
    title: 'Git',
    href: 'https://git-scm.com',
  },
  {
    node: (
      <SiGithub className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300" />
    ),
    title: 'GitHub',
    href: 'https://github.com',
  },
  {
    node: (
      <SiVercel className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300" />
    ),
    title: 'Vercel',
    href: 'https://vercel.com',
  },
  {
    node: (
      <SiHtml5 className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#E34F26] dark:hover:text-[#E34F26] transition-all duration-300" />
    ),
    title: 'HTML5',
    href: 'https://developer.mozilla.org',
  },
  {
    node: (
      <SiCss className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#1572B6] dark:hover:text-[#1572B6] transition-all duration-300" />
    ),
    title: 'CSS3',
    href: 'https://developer.mozilla.org',
  },
  {
    node: (
      <SiVite className="w-11 h-11 sm:w-13 sm:h-13 text-black dark:text-white/70 hover:text-[#646CFF] dark:hover:text-[#646CFF] transition-all duration-300" />
    ),
    title: 'Vite',
    href: 'https://vitejs.dev',
  },
];
