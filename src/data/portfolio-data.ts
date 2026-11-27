import { SkillItem, ProjectItem, GuestbookEntry, SiteContent } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';
import { applyThemeColors, applyThemeStyle, DEFAULT_THEME_COLOR, DEFAULT_TERTIARY_COLOR } from '@/lib/theme-colors';

export const skillsData: SkillItem[] = [
  { name: 'Next.js 15 (App Router)', category: 'frontend', level: '94%', tag: 'Core Stack' },
  { name: 'React 19 & TypeScript', category: 'frontend', level: '92%', tag: 'Frontend' },
  { name: 'Tailwind CSS v4', category: 'frontend', level: '96%', tag: 'Styling' },
  { name: 'Figma', category: 'uiux', level: '95%', tag: 'UI/UX Craft' },
  { name: 'Interactive Prototyping', category: 'uiux', level: '90%', tag: 'UI/UX Craft' },
  { name: 'Wireframing & User Flow', category: 'uiux', level: '92%', tag: 'Research' },
  { name: 'Node.js & REST APIs', category: 'backend', level: '84%', tag: 'Backend' },
  { name: 'MySQL, PHP & Supabase', category: 'backend', level: '88%', tag: 'Database' },
];

export const projectsData: ProjectItem[] = [
  {
    id: 'proj-1792072851536',
    index: '01',
    title: 'Portfolio Website',
    category: 'Fullstack',
    shortDesc:
      'A professional and interactive portfolio website for Jheryco Takizawa Natal Kristiawan — a Frontend Developer and UI/UX Architect from SMK Negeri 1 Depok, featuring modern editorial design, smooth cinematic motion, and high technical performance.',
    role: 'Lead Fullstack Developer',
    timeline: '1 Week (2026)',
    arch: 'Next.js 15 + Supabase + Tailwind',
    outcome: '99 Lighthouse Score',
    image: '/projects/portfolio-website.webp',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    problem: 'Crafting responsive user interfaces with seamless accessibility and high FPS animation curves.',
    design: 'Strict 8px design system with semantic dark mode tokens and fluid typography.',
    code: 'Modular architecture powered by Next.js 15 App Router and server actions.',
    liveUrl: 'https://jtakizawa.my.id',
    githubUrl: 'https://github.com/Jheryyy',
  },
  {
    id: 'proj-1792137164486',
    index: '02',
    title: 'Muara Dukuh Residence Website',
    category: 'Frontend Web',
    shortDesc:
      'Residential property website designed to showcase modern and elegant two-story homes in East Jakarta with comprehensive property information, house designs, and location benefits.',
    role: 'Lead Frontend Developer',
    timeline: '2 Days (2026)',
    arch: 'WordPress CMS, PHP Backend, HTML5 & CSS3 Frontend, JavaScript, Responsive Web Design',
    outcome: '99 Lighthouse Score',
    image: '/projects/muara-dukuh-residence.webp',
    tech: ['WordPress', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'Responsive Web Design', 'UI/UX Design', 'CMS'],
    problem: 'Showcasing luxury modern homes with comprehensive building specifications and promotional galleries for prospective buyers.',
    design: 'Clean, elegant editorial presentation with focus on property visuals, location benefits, and user trust.',
    code: 'Fast loading landing page with mobile-first responsive architecture and optimized digital walkthroughs.',
    liveUrl: 'https://muaradukuhresidence.com',
    githubUrl: 'https://github.com/Jheryyy',
  },
  {
    id: 'proj-1792140782848',
    index: '03',
    title: 'Nura Residence Website',
    category: 'Frontend Web',
    shortDesc:
      'Residential property website designed to showcase modern housing with an elegant presentation, user-friendly interface, and accessible specifications.',
    role: 'Lead Frontend Developer',
    timeline: '2 Days (2026)',
    arch: 'WordPress CMS, PHP Backend, HTML5 & CSS3 Frontend, JavaScript, Responsive Web Design',
    outcome: '99 Lighthouse Score',
    image: '/projects/nura-residence.webp',
    tech: ['WordPress', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'Responsive Web Design', 'UI/UX Design', 'Property Website', 'CMS'],
    problem: 'Delivering accessible property specs and location advantages for first-time and luxury homebuyers.',
    design: 'Modern housing showcase with high readability, clean spacing, and clear call-to-action touchpoints.',
    code: 'Accessible keyboard navigation, responsive grid layouts, and high performance cross-device compatibility.',
    liveUrl: 'https://nuraresidence.com',
    githubUrl: 'https://github.com/Jheryyy',
  },
  {
    id: 'proj-1792140862783',
    index: '04',
    title: 'Citayam Asri Residence Website',
    category: 'Frontend Web',
    shortDesc:
      'Property marketing website developed to present residential housing information in a clear, attractive, and accessible way with practical navigation.',
    role: 'Lead Frontend Developer',
    timeline: '2 Days (2026)',
    arch: 'WordPress CMS, PHP Backend, HTML5 & CSS3 Frontend, JavaScript, Responsive Web Design',
    outcome: '99 Lighthouse Score',
    image: '/projects/citayam-asri-residence.webp',
    tech: ['WordPress', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'Responsive Web Design', 'UI/UX Design', 'Real Estate Website', 'CMS'],
    problem: 'Presenting residential facilities and location highlights in an easily navigable format.',
    design: 'Structured bento-style highlights and clear navigation tailored for prospective buyers.',
    code: 'Lightweight styling, fast image rendering, and streamlined lead generation forms.',
    liveUrl: 'https://citayamasriresidence.com',
    githubUrl: 'https://github.com/Jheryyy',
  },
  {
    id: 'proj-1792141101939',
    index: '05',
    title: 'Madu Honiva Website',
    category: 'Frontend Web',
    shortDesc:
      'Product landing page designed to promote and market premium wild forest honey enriched with Royal Jelly and Bee Pollen with conversion-oriented layouts.',
    role: 'Lead Frontend Developer',
    timeline: '2 Days (2026)',
    arch: 'WordPress CMS, PHP Backend, HTML5 & CSS3 Frontend, JavaScript, Conversion-Focused Landing Page Architecture',
    outcome: '99 Lighthouse Score',
    image: '/projects/madu-honiva.webp',
    tech: ['WordPress', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'Responsive Web Design', 'UI/UX Design', 'Landing Page Development', 'Product Marketing'],
    problem: 'Converting web traffic into product orders for wild forest honey with persuasive copywriting.',
    design: 'Warm, natural color palette with rich typography, guarantee badges, and customer review cards.',
    code: 'High-converting CTA funnels, responsive product package cards, and instant contact routing.',
    liveUrl: 'https://maduhoniva.com',
    githubUrl: 'https://github.com/Jheryyy',
  },
];

export const initialGuestbookEntries: GuestbookEntry[] = [
  {
    id: 'gb-1',
    name: 'Rizky Pratama',
    handle: '@rizkydev',
    role: 'Frontend Dev',
    time: '2 hours ago',
    message: 'Super clean dark mode aesthetic! The orange accent against the dark canvas feels straight out of a Framer showcase.',
    likes: 12,
  },
  {
    id: 'gb-2',
    name: 'Nadia Putri',
    handle: '@nadiadesign',
    role: 'UI/UX Designer',
    time: 'Yesterday',
    message: 'Love the typography hierarchy and how the Detail About section organizes Education and Skills into a sleek bento grid.',
    likes: 9,
  },
  {
    id: 'gb-3',
    name: 'Dimas Aditya',
    handle: '@dimas_fullstack',
    role: 'Fullstack Eng',
    time: '3 days ago',
    message: 'Checked the Portfolio Website case study—great breakdown of the problem, UI/UX process, and Next.js architecture!',
    likes: 7,
  },
];

export const defaultSiteContent: SiteContent = {
  heroGreeting: "Hey, I'm",
  heroName: "Jheryco Takizawa",
  heroTypingTexts: [
    'Frontend Developer',
    'UI/UX Designer',
    'Creative Thinker',
    'Web Craftsman',
  ],
  heroPhilosophyTitle: 'Great interfaces should\nfeel invisible.',
  heroPhilosophyDesc:
    'From Figma design tokens to scalable Next.js architecture, I craft web experiences that connect, perform, and convert with effortless fluidity.',
  aboutEyebrow: 'About • Behind the Code & Canvas',
  aboutTitle: 'Shaping Digital Experiences That Make Web Simpler',
  aboutSchoolBadge: 'SMK Negeri 1 Depok • PPLG',
  aboutBioP1:
    'Hello! I am Jheryco Takizawa Natal Kristiawan, a Software Engineering (PPLG) student at SMK Negeri 1 Depok with an immense passion for Web Development and UI/UX Design.',
  aboutBioP2:
    'From conceptual wireframes and Figma design tokens to scalable Next.js and TypeScript engineering, I am dedicated to bridging creative intuition with rigorous software craftsmanship.',
  contactEmail: 'jherycotakizawa@gmail.com',
  instagramUrl: 'https://instagram.com/abcdefghijherr',
  tiktokUrl: 'https://www.tiktok.com/@abcdefghijherr',
  githubUrl: 'https://github.com/Jheryyy',
  skills: skillsData,
  primaryColor: DEFAULT_THEME_COLOR,
  tertiaryColor: DEFAULT_TERTIARY_COLOR,
  colorPresetId: 'orange',
  themeStyle: 'glass',
};

export const getStoredSiteContent = (): SiteContent => {
  if (typeof window === 'undefined') return defaultSiteContent;
  try {
    const raw = localStorage.getItem('takizawa_site_content');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSiteContent,
        ...parsed,
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : defaultSiteContent.skills,
      };
    }
  } catch (err) {
    console.warn('Could not read site content from localStorage:', err);
  }
  return defaultSiteContent;
};

const SITE_CONTENT_CACHE_TTL = 60_000;
let cachedRemoteSiteContent: SiteContent | null = null;
let cachedRemoteSiteContentAt = 0;
let inFlightSiteContentPromise: Promise<SiteContent> | null = null;

export const fetchRemoteSiteContent = async (force = false): Promise<SiteContent> => {
  if (typeof window !== 'undefined' && !force) {
    if (cachedRemoteSiteContent && Date.now() - cachedRemoteSiteContentAt < SITE_CONTENT_CACHE_TTL) {
      return cachedRemoteSiteContent;
    }
    if (inFlightSiteContentPromise) {
      return inFlightSiteContentPromise;
    }
  }

  const request = (async (): Promise<SiteContent> => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data?.content) {
        const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        const merged: SiteContent = {
          ...defaultSiteContent,
          ...parsed,
          skills:
            Array.isArray(parsed.skills) && parsed.skills.length > 0
              ? parsed.skills
              : defaultSiteContent.skills,
        };
        if (typeof window !== 'undefined') {
          cachedRemoteSiteContent = merged;
          cachedRemoteSiteContentAt = Date.now();
          try {
            localStorage.setItem('takizawa_site_content', JSON.stringify(merged));
          } catch {
            // Ignored
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Could not fetch remote site content:', err);
    }
    return getStoredSiteContent();
  })();

  if (typeof window !== 'undefined') {
    inFlightSiteContentPromise = request;
    try {
      return await request;
    } finally {
      inFlightSiteContentPromise = null;
    }
  }

  return request;
};

export const saveStoredSiteContent = async (content: SiteContent): Promise<{ ok: boolean; error?: string }> => {
  if (typeof window === 'undefined') return { ok: false };
  try {
    cachedRemoteSiteContent = content;
    cachedRemoteSiteContentAt = Date.now();
    localStorage.setItem('takizawa_site_content', JSON.stringify(content));

    if (content.primaryColor) {
      applyThemeColors(content.primaryColor, content.tertiaryColor, content.colorPresetId);
    }

    if (content.themeStyle) {
      applyThemeStyle(content.themeStyle);
    }

    window.dispatchEvent(new CustomEvent('site-content-updated', { detail: content }));

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const res = await fetch('/api/admin/data', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        action: 'save_site_content',
        payload: content,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { ok: false, error: errBody?.error || 'Gagal menyimpan ke database' };
    }

    return { ok: true };
  } catch (err: any) {
    console.error('Failed to save site content:', err);
    return { ok: false, error: err?.message || 'Gagal menyimpan konten' };
  }
};
