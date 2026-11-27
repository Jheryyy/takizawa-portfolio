'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { Palette } from 'lucide-react';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import StaggeredMenu, { StaggeredMenuItem, StaggeredMenuSocialItem } from '@/components/ui/StaggeredMenu';
import { useLiquidTransition } from '@/components/ui/LiquidTransition';
import { useThemeColor } from '@/components/theme/ThemeColorProvider';

const menuItems: StaggeredMenuItem[] = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
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
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAdmin, primaryColor, tertiaryColor } = useThemeColor();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const lastScrollYRef = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const { triggerTransition } = useLiquidTransition();

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    setMounted(true);
    if (!isAdminRoute) {
      router.prefetch('/');
      router.prefetch('/about');
    }

    if (navRef.current && !isAdminRoute) {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isAdminRoute, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 24);

      if (currentScrollY <= 60) {
        setShowLogo(true);
      } else if (currentScrollY > lastScrollYRef.current + 10) {
        setShowLogo(false);
      } else if (currentScrollY < lastScrollYRef.current - 10) {
        setShowLogo(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string, label: string) => (e: React.MouseEvent) => {
    const isSamePageNav =
      pathname === '/' && (href === '/' || href.startsWith('/#'));
    if (!isSamePageNav) return;
    e.preventDefault();
    triggerTransition(href, label);
  };

  if (isAdminRoute) {
    return null;
  }

  const navLinkClass =
    'relative text-[13px] font-medium tracking-tight text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer py-2 px-1 min-h-[40px] inline-flex items-center after:content-[""] after:absolute after:left-1 after:right-1 after:bottom-1.5 after:h-[1.5px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-center';

  return (
    <nav
      ref={navRef}
      aria-label="Main Navigation"
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-10 pt-2.5 sm:pt-3.5 pointer-events-none"
    >
      <div
        className={`relative mx-auto flex items-center justify-between transition-all duration-300 pointer-events-auto ${
          isScrolled
            ? 'max-w-[1160px] h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-white/80 dark:bg-[#101016]/80 backdrop-blur-xl border border-neutral-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
            : 'max-w-[1440px] h-16 sm:h-18 px-2 sm:px-4 rounded-full bg-transparent border border-transparent'
        }`}
      >
        {/* Left Side: Desktop Links or Mobile Theme Controls */}
        <div className="flex items-center">
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <AnimatedThemeToggler
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={setTheme}
                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border transition-all duration-300 ${
                  resolvedTheme === 'dark'
                    ? 'bg-white/5 border-white/15 text-amber-400 hover:border-amber-400/50'
                    : 'bg-white/90 border-neutral-200 text-neutral-900 hover:border-neutral-400 shadow-xs'
                }`}
              />
            )}
            {mounted && isAdmin && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-theme-customizer'))}
                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 ${
                  resolvedTheme === 'dark'
                    ? 'bg-white/5 border-white/15 text-white hover:border-primary/60'
                    : 'bg-white/90 border-neutral-200 text-black hover:border-primary/60 shadow-xs'
                }`}
                title="Kustomisasi Warna & Tema Web (Admin)"
                aria-label="Kustomisasi Warna & Tema Web"
              >
                <Palette className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-7">
            <Link href="/" prefetch={true} onClick={handleNavClick('/', 'HOME')} className={navLinkClass}>
              Home
            </Link>
            <Link href="/#projects" onClick={handleNavClick('/#projects', 'PROJECTS')} className={navLinkClass}>
              Project
            </Link>
            <Link href="/#contact" onClick={handleNavClick('/#contact', 'CONTACT')} className={navLinkClass}>
              Contact
            </Link>
          </div>
        </div>

        {/* Center Brand Logo */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
            showLogo || isScrolled
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <Link
            href="/"
            prefetch={true}
            onClick={handleNavClick('/', 'HOME')}
            className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded-xl group p-1"
            aria-label="Takizawa Logo"
          >
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Takizawa Logo"
                width={209}
                height={209}
                priority
                className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
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

        {/* Right Side: Desktop Links + Theme Controls, or Mobile Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 lg:gap-7">
            <Link href="/#about" onClick={handleNavClick('/#about', 'ABOUT')} className={navLinkClass}>
              About
            </Link>
            <Link href="/about" onClick={handleNavClick('/about', 'CREDENTIALS')} className={navLinkClass}>
              Credentials
            </Link>
            <Link href="/#guestbook" onClick={handleNavClick('/#guestbook', 'GUESTBOOK')} className={navLinkClass}>
              Guestbook
            </Link>
            <div className="h-4 w-px bg-neutral-300 dark:bg-white/15" aria-hidden="true" />
            {mounted && (
              <AnimatedThemeToggler
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={setTheme}
                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border transition-all duration-300 ${
                  resolvedTheme === 'dark'
                    ? 'bg-white/5 border-white/15 text-amber-400 hover:border-amber-400/50 hover:bg-white/10'
                    : 'bg-white/90 border-neutral-200 text-neutral-900 hover:border-neutral-400 shadow-xs'
                }`}
              />
            )}
            {mounted && isAdmin && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-theme-customizer'))}
                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 ${
                  resolvedTheme === 'dark'
                    ? 'bg-white/5 border-white/15 text-white hover:border-primary/60'
                    : 'bg-white/90 border-neutral-200 text-black hover:border-primary/60 shadow-xs'
                }`}
                title="Kustomisasi Warna & Tema Web (Admin)"
                aria-label="Kustomisasi Warna & Tema Web"
              >
                <Palette className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <StaggeredMenu
              position="right"
              colors={[tertiaryColor, primaryColor]}
              accentColor={primaryColor}
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor={mounted && resolvedTheme === 'dark' ? '#FFFFFF' : '#111827'}
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
