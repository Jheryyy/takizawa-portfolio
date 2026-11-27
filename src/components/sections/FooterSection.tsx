'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Copy, Mail } from 'lucide-react';
import { SiInstagram, SiTiktok } from 'react-icons/si';
import Magnetic from '@/components/ui/Magnetic';

interface FooterSectionProps {
  onNotifyToast: (msg: string) => void;
}

export function FooterSection({ onNotifyToast }: FooterSectionProps) {
  const email = 'jherycotakizawa@gmail.com';
  const currentYear = new Date().getFullYear();

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
    <footer className="w-full bg-surface border-t border-hairline pt-14 pb-10 transition-colors">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-hairline items-end">
          <div className="lg:col-span-8 space-y-3">
            <p className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
              Ready to Collaborate
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-[-0.03em] leading-[1.08] text-neutral-950 dark:text-white">
              Let&apos;s Build Something
              <br />
              Meaningful Together.
            </h2>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-end gap-3">
            <Magnetic strength={0.2}>
              <button
                onClick={handleCopyEmail}
                className="group inline-flex items-center gap-3 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold text-sm pl-5 pr-2 py-2 min-h-[44px] rounded-full transition-all cursor-pointer shadow-md active:scale-[0.97]"
              >
                <span>{email}</span>
                <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                  <Copy className="w-3.5 h-3.5" />
                </span>
              </button>
            </Magnetic>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
              Click pill to copy email address
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <Link
              href="/#home"
              className="flex items-center group focus:outline-none"
              aria-label="Takizawa Logo"
            >
              <div className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
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
            <span className="font-sans">
              &copy; {currentYear} Jheryco Takizawa. Crafted with Next.js &amp; Tailwind CSS.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium text-neutral-700 dark:text-neutral-300">
            <Link href="/#home" className="hover:text-primary transition-colors py-1.5">
              Home
            </Link>
            <Link href="/#about" className="hover:text-primary transition-colors py-1.5">
              About
            </Link>
            <Link href="/#projects" className="hover:text-primary transition-colors py-1.5">
              Projects
            </Link>
            <a
              href="mailto:jherycotakizawa@gmail.com"
              className="hover:text-primary transition-colors py-1.5 inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
            <a
              href="https://instagram.com/abcdefghijherr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E4405F] transition-colors py-1.5 inline-flex items-center gap-1.5"
            >
              <SiInstagram aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@abcdefghijherr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors py-1.5 inline-flex items-center gap-1.5"
            >
              <SiTiktok aria-hidden="true" className="w-3.5 h-3.5" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
