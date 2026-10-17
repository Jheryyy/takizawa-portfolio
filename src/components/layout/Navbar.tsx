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
  { label: 'About', ariaLabel: 'Scroll to about section', link: '/#about' },
  { label: 'Detail', ariaLabel: 'View full credentials and background', link: '/about' },
  { label: 'Projects', ariaLabel: 'View selected projects and case studies', link: '/#projects' },
  { label: 'Guestbook', ariaLabel: 'Leave a note or sign guestbook', link: '/#guestbook' },
  { label: 'Contact', ariaLabel: 'Send a message or get in touch', link: '/#contact' },
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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/85 dark:bg-[#0A0A0A]/85 border-b border-neutral-200/80 dark:border-white/10 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 h-18 sm:h-20">
        {/* Brand Logo */}
        <Link
          href="/#home"
          onClick={handleNavClick('/#home', 'HOME')}
          className="font-display font-bold text-xl sm:text-2xl tracking-tight text-black dark:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg group"
        >
          <span>
            Takizawa<span className="text-primary font-normal">blox</span>
          </span>
        </Link>

        {/* Desktop Quick Navigation Links - Visible on Desktop, Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-black dark:text-white/85">
          <Link
            href="/#home"
            onClick={handleNavClick('/#home', 'HOME')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Home
          </Link>
          <Link
            href="/#about"
            onClick={handleNavClick('/#about', 'ABOUT')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            About
          </Link>
          <Link
            href="/about"
            onClick={handleNavClick('/about', 'DETAIL')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Detail
          </Link>
          <Link
            href="/#projects"
            onClick={handleNavClick('/#projects', 'PROJECTS')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Projects
          </Link>
          <Link
            href="/#guestbook"
            onClick={handleNavClick('/#guestbook', 'GUESTBOOK')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Guestbook
          </Link>
          <Link
            href="/#contact"
            onClick={handleNavClick('/#contact', 'CONTACT')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Contact
          </Link>
        </div>

        {/* Right Section: Theme Toggler, Pill CTA & StaggeredMenu (Mobile Only) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {mounted && (
            <AnimatedThemeToggler
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              onThemeChange={setTheme}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all duration-300 shadow-sm ${resolvedTheme === 'dark'
                  ? 'bg-[#1C1C1C] border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                  : 'bg-white border-neutral-300 text-black hover:border-black hover:bg-neutral-50 shadow-sm'
                }`}
            />
          )}

          {/* StaggeredMenu: ONLY visible on Mobile (< md), hidden on Desktop */}
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
