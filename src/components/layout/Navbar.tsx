'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import StaggeredMenu, { StaggeredMenuItem, StaggeredMenuSocialItem } from '@/components/ui/StaggeredMenu';
import { useLiquidTransition } from '@/components/ui/LiquidTransition';

const menuItems: StaggeredMenuItem[] = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/#home' },
  { label: 'Project', ariaLabel: 'View selected projects and case studies', link: '/#projects' },
  { label: 'Contact', ariaLabel: 'Send a message or get in touch', link: '/#contact' },
  { label: 'About', ariaLabel: 'Scroll to about section', link: '/#about' },
  { label: 'Detail', ariaLabel: 'View full credentials and background', link: '/about' },
  { label: 'Guestbook', ariaLabel: 'Leave a note or sign guestbook', link: '/#guestbook' },
];

const socialItems: StaggeredMenuSocialItem[] = [
  { label: 'Instagram', link: 'https://instagram.com/abcdefghijherr' },
  { label: 'TikTok', link: 'https://www.tiktok.com/@abcdefghijherr' },
  { label: 'Email', link: 'mailto:jherycotakizawa@gmail.com' },
];

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { triggerTransition } = useLiquidTransition();

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    setMounted(true);
    if (navRef.current && !isAdminRoute) {
      gsap.fromTo(
        navRef.current,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.05 }
      );
    }
  }, [isAdminRoute]);

  const handleNavClick = (href: string, label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    triggerTransition(href, label);
  };

  // Completely omit Navbar on Admin and Dashboard pages
  if (isAdminRoute) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      aria-label="Main Navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
    >
      <div className="relative w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 h-18 sm:h-20">
        {/* Left Side: Desktop Links (Home, Project, Contact) or Mobile Theme Toggler */}
        <div className="flex items-center">
          {/* Mobile Only: Theme Toggler on Left for balance */}
          <div className="md:hidden flex items-center">
            {mounted && (
              <AnimatedThemeToggler
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={setTheme}
                className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#1C1C1C]/70 border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                    : 'bg-white/80 border-neutral-300 text-black hover:border-black hover:bg-neutral-50 shadow-sm'
                }`}
              />
            )}
          </div>

          {/* Desktop Only: Left Navigation Links (Home, Project, Contact) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-black dark:text-white/85">
            <Link
              href="/#home"
              onClick={handleNavClick('/#home', 'HOME')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              href="/#projects"
              onClick={handleNavClick('/#projects', 'PROJECTS')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Project
            </Link>
            <Link
              href="/#contact"
              onClick={handleNavClick('/#contact', 'CONTACT')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Center: Brand Logo - Dead Center & Larger */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <Link
            href="/#home"
            onClick={handleNavClick('/#home', 'HOME')}
            className="font-display font-extrabold text-2xl sm:text-3xl md:text-3xl lg:text-4xl tracking-tight text-black dark:text-white flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg group transition-transform duration-200 hover:scale-105"
          >
            <span>
              Takizawa<span className="text-primary font-normal">blox</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Desktop Links (About, Detail, Guestbook) + Theme Toggler, or Mobile StaggeredMenu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Only: Right Navigation Links (About, Detail, Guestbook) + Desktop Theme Toggler */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-black dark:text-white/85">
            <Link
              href="/#about"
              onClick={handleNavClick('/#about', 'ABOUT')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              About
            </Link>
            <Link
              href="/about"
              onClick={handleNavClick('/about', 'DETAIL')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Detail
            </Link>
            <Link
              href="/#guestbook"
              onClick={handleNavClick('/#guestbook', 'GUESTBOOK')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Guestbook
            </Link>
            {mounted && (
              <AnimatedThemeToggler
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={setTheme}
                className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#1C1C1C]/70 border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                    : 'bg-white/80 border-neutral-300 text-black hover:border-black hover:bg-neutral-50 shadow-sm'
                }`}
              />
            )}
          </div>

          {/* Mobile Only: StaggeredMenu Trigger */}
          <div className="md:hidden flex items-center">
            <StaggeredMenu
              position="right"
              colors={['#FDBA74', '#F97316']}
              accentColor="#F97316"
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor={mounted && resolvedTheme === 'dark' ? '#FFFFFF' : '#000000'}
              openMenuButtonColor="#111111"
              changeMenuColorOnOpen={true}
              isFixed={true}
              inlineTrigger={true}
              onItemClick={(link, label) => triggerTransition(link, label)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
