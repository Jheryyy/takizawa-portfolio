'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Layers,
  Code2,
  CheckCircle2,
  Sparkles,
  Copy,
  ExternalLink,
  Cpu,
  Terminal,
  ShieldCheck,
  Monitor,
  Heart,
  Compass,
} from 'lucide-react';
import { SkillCategory } from '@/types/portfolio';
import { skillsData } from '@/data/portfolio-data';
import { FooterSection } from '@/components/sections/FooterSection';
import { Toast } from '@/components/ui/Toast';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function AboutDetailPage() {
  const [activeSkillCategory, setActiveSkillCategory] = useState<
    'all' | SkillCategory
  >('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const filteredSkills =
    activeSkillCategory === 'all'
      ? skillsData
      : skillsData.filter((s) => s.category === activeSkillCategory);

  return (
    <div className="relative min-h-screen w-full bg-canvas text-black dark:text-white pt-24 sm:pt-28 flex flex-col justify-between transition-colors">
      {/* Container */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 py-10 space-y-14">
        {/* Top Back Navigation Bar & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <Link
            href="/#about"
            className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black dark:text-neutral-400 hover:text-primary transition-colors w-fit"
          >
            <span className="w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-black group-hover:text-white dark:text-white" />
            </span>
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono font-medium text-black/70 dark:text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">About Detail</span>
          </div>
        </div>

        {/* Hero Profile & Philosophy Banner with ScrollReveal */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-surface border border-hairline text-primary text-xs font-mono font-bold">
              Profile &amp; Credentials
            </span>
            <span className="px-3.5 py-1 rounded-full bg-surface border border-hairline text-black/70 dark:text-neutral-300 text-xs font-mono font-semibold">
              Software Engineering (RPL) Track
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <ScrollReveal
                highlightColor="#FF5A1F"
                mode="scrub"
                splitBy="words"
                effect="fade"
                stagger={0.06}
                duration={0.8}
                smoothing={0}
                baseOpacity={0.16}
                baseRotation={0}
                baseOffset={0}
                enableBlur={true}
                blurStrength={4}
                containerClassName="my-0"
                textClassName="font-display font-extrabold text-3xl sm:text-5xl leading-tight text-black dark:text-white tracking-tight"
              >
                Bridging Visual Polish &amp; Clean Scalable Architecture
              </ScrollReveal>
              <ScrollReveal
                as="p"
                highlightColor="#FF5A1F"
                mode="scrub"
                splitBy="words"
                effect="fade"
                stagger={0.02}
                duration={0.8}
                smoothing={0}
                baseOpacity={0.18}
                baseRotation={0}
                baseOffset={0}
                enableBlur={false}
                containerClassName="my-0"
                textClassName="text-base sm:text-lg text-black dark:text-white/85 leading-relaxed font-sans font-medium max-w-3xl"
              >
                Hello! I am Jheryco Takizawa Natal Kristiawan, a Software Engineering (PPLG) student at SMK Negeri 1 Depok with an immense passion for Web Development and UI/UX Design. I thrive on exploring modern web technologies, untangling complex logic through clean, purposeful code, and crafting interactive digital interfaces that elevate visual aesthetics to the highest standard.
              </ScrollReveal>
              <p className="text-sm sm:text-base text-black dark:text-muted leading-relaxed font-sans font-medium max-w-3xl">
                From conceptual wireframes and Figma design tokens to scalable Next.js and TypeScript engineering, I am dedicated to bridging creative intuition with rigorous software craftsmanship to build seamless, high-performance web applications that leave a lasting impact.
              </p>
            </div>

            <div className="lg:col-span-4 p-6 rounded-2.5xl bg-surface border border-hairline shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Quick Snapshot</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-black/80 dark:text-muted font-medium">
                <li className="flex items-center justify-between">
                  <span className="font-mono">Name:</span>
                  <span className="font-bold text-black dark:text-white">Jheryco Takizawa</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">Location:</span>
                  <span className="font-bold text-black dark:text-white">Depok, Indonesia (UTC+7)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">School:</span>
                  <span className="font-bold text-black dark:text-white">SMK Negeri 1 Depok</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">Program:</span>
                  <span className="font-bold text-black dark:text-white">PPLG (Software Eng)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">Focus:</span>
                  <span className="font-bold text-black dark:text-white">Next.js 15 &bull; UI/UX &bull; TS</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">Design Tool:</span>
                  <span className="font-bold text-black dark:text-white">Figma</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive ScrollReveal Engineering Manifesto */}
        <section className="p-8 sm:p-12 rounded-2.5xl bg-surface border border-hairline shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                ENGINEERING &amp; DESIGN MANIFESTO
              </span>
            </div>
            <ScrollReveal
              highlightColor="#FF5A1F"
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.05}
              duration={0.8}
              smoothing={0}
              baseOpacity={0.15}
              baseRotation={0}
              baseOffset={0}
              enableBlur={true}
              blurStrength={4}
              containerClassName="my-2"
              textClassName="font-display font-bold text-2xl sm:text-4xl leading-snug text-black dark:text-white"
            >
              Great software is felt before it is understood. I eliminate friction between intent and interaction, turning complex state into effortless user moments.
            </ScrollReveal>
            <p className="text-xs sm:text-sm text-black dark:text-muted font-sans font-medium">
              Scroll through to see each word illuminate with real-time scrub physics powered by GSAP.
            </p>
          </div>
        </section>

        {/* 2-Column Bento: Academic Track & Design/Dev Process */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Academic Track */}
          <div className="p-6 sm:p-8 rounded-2.5xl bg-surface border border-hairline space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block">
                    ACADEMIC TRACK
                  </span>
                  <h3 className="font-display font-bold text-xl text-black dark:text-white">
                    SMK Negeri 1 Depok &mdash; PPLG
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-elevated text-black dark:text-muted">
                2024 &mdash; Present
              </span>
            </div>

            <p className="text-sm text-black/80 dark:text-muted leading-relaxed font-sans font-medium">
              Immersed in a comprehensive software engineering curriculum covering modern web engineering,
              relational database normalization, RESTful API architecture, Object-Oriented Programming (OOP),
              and user-centered design paradigms.
            </p>

            <div className="space-y-3 pt-2 border-t border-hairline">
              <p className="text-xs font-mono font-bold uppercase text-black dark:text-white/80">
                Core Competencies &amp; Modules:
              </p>
              <div className="grid grid-cols-2 gap-2.5 text-xs text-black dark:text-white/90 font-semibold">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-canvas border border-hairline">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Web App Architecture</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-canvas border border-hairline">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Database Normalization</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-canvas border border-hairline">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>REST APIs &amp; Supabase</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-canvas border border-hairline">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>UI/UX &amp; Design Tokens</span>
                </div>
              </div>
            </div>

            {/* Complete Education & Specialization Timeline */}
            <div className="relative pl-6 border-l border-hairline space-y-5 pt-3 border-t border-hairline">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                <div className="flex items-center gap-2 font-mono text-xs text-primary font-bold">
                  <span>2024 &mdash; Present</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold">
                    Active Student
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-black dark:text-white mt-1">
                  SMK Negeri 1 Depok &mdash; Software Engineering (PPLG)
                </h4>
                <p className="text-xs text-black/80 dark:text-muted mt-1 leading-relaxed">
                  Focusing on Fullstack Web Engineering, Relational Databases (MySQL), OOP, and UI/UX System Architecture.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-elevated border-2 border-primary" />
                <span className="font-mono text-xs text-black/70 dark:text-muted font-bold">2025 &mdash; 2026</span>
                <h4 className="font-display font-bold text-sm text-black dark:text-white mt-1">
                  Frontend &amp; UI/UX Specialization
                </h4>
                <p className="text-xs text-black/80 dark:text-muted mt-1 leading-relaxed">
                  Intensive mastery in Next.js App Router, React 19, Tailwind CSS Design Tokens, and Interactive Prototyping.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-elevated border border-neutral-400 dark:border-white/30" />
                <span className="font-mono text-xs text-black/70 dark:text-muted font-bold">
                  Continuous Learning
                </span>
                <h4 className="font-display font-bold text-sm text-black dark:text-white mt-1">
                  Open Source &amp; Web Craft Community
                </h4>
                <p className="text-xs text-black/80 dark:text-muted mt-1 leading-relaxed">
                  Building community web platforms, custom component systems, and accessible dark-mode design systems.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 4-Step Design & Dev Workflow */}
          <div className="p-6 sm:p-8 rounded-2.5xl bg-surface border border-hairline space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block">
                    DESIGN &amp; DEV WORKFLOW
                  </span>
                  <h3 className="font-display font-bold text-xl text-black dark:text-white">
                    From Tokens to Next.js
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-elevated text-black dark:text-muted">
                4-Stage Pipeline
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-black/80 dark:text-muted font-medium">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-canvas border border-hairline">
                <span className="font-mono font-bold text-primary text-sm shrink-0">01.</span>
                <div>
                  <strong className="text-black dark:text-white block font-bold">
                    Audit &amp; Prototype in Figma
                  </strong>
                  <span>Strict 8px layout grid, content hierarchy, and interactive prototypes.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-canvas border border-hairline">
                <span className="font-mono font-bold text-primary text-sm shrink-0">02.</span>
                <div>
                  <strong className="text-black dark:text-white block font-bold">
                    Design Tokens &amp; WCAG Contrast
                  </strong>
                  <span>Semantic color tokens, legible typography scales, and accessible focus states.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-canvas border border-hairline">
                <span className="font-mono font-bold text-primary text-sm shrink-0">03.</span>
                <div>
                  <strong className="text-black dark:text-white block font-bold">
                    Modular Next.js 15 &amp; React 19
                  </strong>
                  <span>Zero-clutter component structure, Tailwind v4 styling, and Server Actions.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-canvas border border-hairline">
                <span className="font-mono font-bold text-primary text-sm shrink-0">04.</span>
                <div>
                  <strong className="text-black dark:text-white block font-bold">
                    Micro-interactions &amp; Performance
                  </strong>
                  <span>Fluid GSAP animations, optimized assets, and 99+ Lighthouse performance scores.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Skills & Tech Stack Section */}
        <section className="p-6 sm:p-10 rounded-2.5xl bg-surface border border-hairline space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block">
                  TECH MATRIX
                </span>
                <h2 className="font-display font-bold text-2xl text-black dark:text-white">
                  Skills &amp; Technology Stack
                </h2>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex p-1 rounded-full bg-elevated border border-hairline self-start">
              {(['all', 'frontend', 'uiux', 'backend'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveSkillCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize cursor-pointer ${
                    activeSkillCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-black dark:text-muted hover:text-primary'
                  }`}
                >
                  {cat === 'uiux' ? 'UI/UX' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="group p-4 rounded-2xl bg-canvas border border-hairline hover:border-primary/60 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                      {skill.name}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-primary">
                      {skill.level}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
                      style={{ width: skill.level }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-black/70 dark:text-muted font-semibold">
                  <span>{skill.tag}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-hairline">
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
                15<span className="text-primary">+</span>
              </p>
              <p className="text-xs text-black/70 dark:text-muted mt-1 font-bold">
                Web &amp; UI Projects Built
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
                99<span className="text-primary">%</span>
              </p>
              <p className="text-xs text-black/70 dark:text-muted mt-1 font-bold">
                Lighthouse A11y &amp; SEO Standard
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
                100<span className="text-primary">%</span>
              </p>
              <p className="text-xs text-black/70 dark:text-muted mt-1 font-bold">
                Responsive &amp; Mobile-First
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
                24<span className="text-primary">/7</span>
              </p>
              <p className="text-xs text-black/70 dark:text-muted mt-1 font-bold">
                Clean Code Obsession
              </p>
            </div>
          </div>
        </section>

        {/* Core Engineering Principles */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block">
                CORE PHILOSOPHY
              </span>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white">
                Engineering Values &amp; Standards
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2.5xl bg-surface border border-hairline space-y-3 shadow-sm hover:border-primary/50 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                01
              </span>
              <h3 className="font-display font-bold text-base text-black dark:text-white">
                Pixel Precision
              </h3>
              <p className="text-xs text-black/75 dark:text-muted leading-relaxed font-sans font-medium">
                Every margin, radius, and line-height adheres to an intentional 8px system grid with strict design tokens.
              </p>
            </div>

            <div className="p-6 rounded-2.5xl bg-surface border border-hairline space-y-3 shadow-sm hover:border-primary/50 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                02
              </span>
              <h3 className="font-display font-bold text-base text-black dark:text-white">
                Accessibility (a11y)
              </h3>
              <p className="text-xs text-black/75 dark:text-muted leading-relaxed font-sans font-medium">
                WCAG 2.1 AA compliant color contrasts, semantic HTML landmarks, and natural keyboard navigability.
              </p>
            </div>

            <div className="p-6 rounded-2.5xl bg-surface border border-hairline space-y-3 shadow-sm hover:border-primary/50 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h3 className="font-display font-bold text-base text-black dark:text-white">
                Zero-Bloat Speed
              </h3>
              <p className="text-xs text-black/75 dark:text-muted leading-relaxed font-sans font-medium">
                Leveraging Next.js 15 Server Components, tree-shaken dependencies, and optimized web vitals.
              </p>
            </div>

            <div className="p-6 rounded-2.5xl bg-surface border border-hairline space-y-3 shadow-sm hover:border-primary/50 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                04
              </span>
              <h3 className="font-display font-bold text-base text-black dark:text-white">
                Fluid Motion
              </h3>
              <p className="text-xs text-black/75 dark:text-muted leading-relaxed font-sans font-medium">
                Meaningful GSAP micro-animations that communicate spatial state and heighten perceived responsiveness.
              </p>
            </div>
          </div>
        </section>

        {/* Workstation & Setup */}
        <section className="p-6 sm:p-10 rounded-2.5xl bg-surface border border-hairline space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block">
                ENVIRONMENT
              </span>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white">
                Workstation &amp; Development Tools
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-2">
              <p className="text-xs font-mono font-bold text-primary uppercase">Core Editor &amp; Shell</p>
              <h4 className="font-bold text-sm text-black dark:text-white">VS Code &bull; Antigravity</h4>
              <p className="text-xs text-black/75 dark:text-muted font-medium">
                Custom dark themes, strict TypeScript ESLint config, and PowerShell automated developer tooling.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-2">
              <p className="text-xs font-mono font-bold text-primary uppercase">Design &amp; Prototyping</p>
              <h4 className="font-bold text-sm text-black dark:text-white">Figma</h4>
              <p className="text-xs text-black/75 dark:text-muted font-medium">
                Component systems, interactive UI prototypes, and design tokens mapping 1:1 to Tailwind CSS v4 variables.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-2">
              <p className="text-xs font-mono font-bold text-primary uppercase">Deployment &amp; Cloud</p>
              <h4 className="font-bold text-sm text-black dark:text-white">Vercel &bull; Supabase &bull; Git</h4>
              <p className="text-xs text-black/75 dark:text-muted font-medium">
                Automated CI/CD deployments, edge caching, serverless relational databases, and version control.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Back Button & Action Strip */}
        <section className="p-8 rounded-2.5xl bg-surface border border-hairline flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-xl text-black dark:text-white">
              Interested in collaborating on your next project?
            </h3>
            <p className="text-xs sm:text-sm text-black/80 dark:text-muted font-medium">
              Feel free to reach out directly via email or drop a note on the guestbook.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#home"
              className="px-5 py-2.5 rounded-full bg-surface border border-hairline hover:border-primary text-xs font-bold text-black dark:text-white transition-all shadow-sm"
            >
              Back to Home
            </Link>
            <Link
              href="/#guestbook"
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-tertiary text-xs font-bold text-white transition-all shadow-md"
            >
              Sign Guestbook
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <FooterSection onNotifyToast={showToast} />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
