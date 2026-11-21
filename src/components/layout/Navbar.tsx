'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { Palette } from 'lucide-react';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import StaggeredMenu, { StaggeredMenuItem, StaggeredMenuSocialItem } from '@/components/ui/StaggeredMenu';
import { useLiquidTransition } from '@/components/ui/LiquidTransition';
import { isUserAdmin } from '@/lib/theme-colors';

const menuItems: StaggeredMenuItem[] = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/#home' },
  { label: 'Project', ariaLabel: 'View selected projects and case studies', link: '/#projects' },
  { label: 'Contact', ariaLabel: 'Send a message or get in touch', link: '/#contact' },
  { label: 'About', ariaLabel: 'Scroll to about section', link: '/#about' },
  { label: 'Credentials', ariaLabel: 'View full credentials and background', link: '/about' },
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const lastScrollYRef = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const { triggerTransition } = useLiquidTransition();

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    setMounted(true);
    setIsAdmin(isUserAdmin());
    const handleAuthChange = () => setIsAdmin(isUserAdmin());
    window.addEventListener('admin-auth-updated', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('focus', handleAuthChange);

    if (navRef.current && !isAdminRoute) {
      gsap.fromTo(
        navRef.current,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.05 }
      );
    }

    return () => {
      window.removeEventListener('admin-auth-updated', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
    };
  }, [isAdminRoute]);

  // Scroll listener: Sembunyikan logo saat scroll ke bawah, munculkan saat scroll ke atas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 60) {
        // Berada di posisi paling atas -> selalu tampilkan logo
        setShowLogo(true);
      } else if (currentScrollY > lastScrollYRef.current + 8) {
        // Sedang scroll ke bawah -> sembunyikan logo
        setShowLogo(false);
      } else if (currentScrollY < lastScrollYRef.current - 8) {
        // Sedang scroll ke atas -> munculkan logo
        setShowLogo(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          {/* Mobile Only: Theme Toggler & Palette on Left (Admin Only) */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && isAdmin && (
              <>
                <AnimatedThemeToggler
                  theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  onThemeChange={setTheme}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm ${
                    resolvedTheme === 'dark'
                      ? 'bg-[#1C1C1C]/70 border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                      : 'bg-white/80 border-neutral-300 text-black hover:border-black hover:bg-neutral-50 shadow-sm'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-theme-customizer'))}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${
                    resolvedTheme === 'dark'
                      ? 'bg-[#1C1C1C]/70 border-white/15 text-white hover:border-primary/60'
                      : 'bg-white/80 border-neutral-300 text-black hover:border-primary/60 shadow-sm'
                  }`}
                  title="Kustomisasi Warna & Tema Web (Admin)"
                  aria-label="Kustomisasi Warna & Tema Web"
                >
                  <Palette className="w-4 h-4 text-primary" />
                </button>
              </>
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

        {/* Center: Brand Logo - Dead Center & Larger, hides on scroll down, reveals on scroll up */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
            showLogo
              ? 'opacity-100 translate-y-[-50%] scale-100 pointer-events-auto'
              : 'opacity-0 -translate-y-[120%] scale-90 pointer-events-none'
          }`}
        >
          <Link
            href="/#home"
            onClick={handleNavClick('/#home', 'HOME')}
            className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded-xl group p-1"
            aria-label="Takizawa Logo"
          >
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {/* Default Logo */}
              <Image
                src="/logo.png"
                alt="Takizawa Logo"
                width={209}
                height={209}
                priority
                className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              {/* Hover Logo (swaps to logos.png on hover/touch) */}
              <Image
                src="/logos.png"
                alt="Takizawa Logo Hover"
                width={210}
                height={209}
                priority
                className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
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
              onClick={handleNavClick('/about', 'CREDENTIALS')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Credentials
            </Link>
            <Link
              href="/#guestbook"
              onClick={handleNavClick('/#guestbook', 'GUESTBOOK')}
              className="hover:text-primary transition-colors cursor-pointer py-2 px-1 min-h-[44px] inline-flex items-center"
            >
              Guestbook
            </Link>
            {mounted && isAdmin && (
              <>
                <AnimatedThemeToggler
                  theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  onThemeChange={setTheme}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm ${
                    resolvedTheme === 'dark'
                      ? 'bg-[#1C1C1C]/70 border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                      : 'bg-white/80 border-neutral-300 text-black hover:border-black hover:bg-neutral-50 shadow-sm'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-theme-customizer'))}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 ${
                    resolvedTheme === 'dark'
                      ? 'bg-[#1C1C1C]/70 border-white/15 text-white hover:border-primary/60 hover:shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                      : 'bg-white/80 border-neutral-300 text-black hover:border-primary/60 shadow-sm'
                  }`}
                  title="Kustomisasi Warna & Tema Web (Admin)"
                  aria-label="Kustomisasi Warna & Tema Web"
                >
                  <Palette className="w-4 h-4 text-primary" />
                </button>
              </>
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
