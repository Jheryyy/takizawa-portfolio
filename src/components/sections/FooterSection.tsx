'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Copy, Mail } from 'lucide-react';
import { SiInstagram, SiTiktok } from 'react-icons/si';

interface FooterSectionProps {
  onNotifyToast: (msg: string) => void;
}

export function FooterSection({ onNotifyToast }: FooterSectionProps) {
  const email = 'jherycotakizawa@gmail.com';

  const handleCopyEmail = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      onNotifyToast(`Email copied: ${email}`);
    } catch {
      onNotifyToast(`Email: ${email}`);
    }
  };

  return (
    <footer className="w-full bg-surface border-t border-hairline pt-16 pb-12 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-hairline items-end">
          <div className="lg:col-span-8 space-y-4">
            <p className="font-sans text-xs uppercase tracking-wider text-primary font-bold">
              READY TO COLLABORATE
            </p>
            <h2 className="font-display font-extrabold text-4xl sm:text-6xl tracking-[-0.03em] leading-[1.05] text-black dark:text-white">
              Let&apos;s Build Something
              <br />
              Meaningful Together.
            </h2>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-end gap-4">
            <button
              onClick={handleCopyEmail}
              className="group inline-flex items-center gap-3 bg-black text-white dark:bg-white dark:text-neutral-900 font-semibold text-sm pl-5 pr-2 py-2 min-h-[44px] rounded-full hover:scale-[1.02] transition-all cursor-pointer shadow-md"
            >
              <span className="text-white dark:text-neutral-900">{email}</span>
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition-transform group-hover:rotate-12">
                <Copy className="w-4 h-4 text-white" />
              </span>
            </button>
            <p className="text-xs text-black/70 dark:text-muted font-sans font-medium">
              Click pill to copy email address
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/70 dark:text-muted">
          <div className="flex items-center gap-3">
            <Link
              href="/#home"
              className="flex items-center group focus:outline-none"
              aria-label="Takizawa Logo"
            >
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <Image
                  src="/logo.png"
                  alt="Takizawa Logo"
                  width={209}
                  height={209}
                  className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                />
                <Image
                  src="/logos.png"
                  alt="Takizawa Logo Hover"
                  width={210}
                  height={209}
                  className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </div>
            </Link>
            <span>&bull;</span>
            <span className="font-medium text-black dark:text-muted">Crafted with Next.js 15 &bull; Tailwind v4</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-semibold text-black dark:text-white/80">
            <Link href="/#home" className="hover:text-primary transition-colors py-2 px-1 min-h-[44px] inline-flex items-center">
              Home
            </Link>
            <Link href="/#about" className="hover:text-primary transition-colors py-2 px-1 min-h-[44px] inline-flex items-center">
              About
            </Link>
            <Link href="/#projects" className="hover:text-primary transition-colors py-2 px-1 min-h-[44px] inline-flex items-center">
              Projects
            </Link>
            <a
              href="mailto:jherycotakizawa@gmail.com"
              className="text-black dark:text-white/80 hover:text-primary transition-colors py-2 px-1 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-black dark:text-white/80" />
              <span>Email</span>
            </a>
            <a
              href="https://instagram.com/abcdefghijherr"
              target="_blank"
              rel="noreferrer"
              className="text-black dark:text-white/80 hover:text-[#E4405F] transition-colors py-2 px-1 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <SiInstagram aria-hidden="true" title="Instagram" className="w-3.5 h-3.5 text-black dark:text-white/80" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@abcdefghijherr"
              target="_blank"
              rel="noreferrer"
              className="text-black dark:text-white/80 hover:text-primary transition-colors py-2 px-1 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <SiTiktok aria-hidden="true" title="TikTok" className="w-3.5 h-3.5 text-black dark:text-white/80" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
