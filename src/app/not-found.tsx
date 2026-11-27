import Link from 'next/link';
import { ArrowLeft, FolderGit2, User } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-canvas text-neutral-900 dark:text-white overflow-hidden flex flex-col items-center justify-center px-6 py-24">
      {/* Editorial Grid & Ambient Glow */}
      <div className="hero-grid-pattern pointer-events-none absolute inset-0 z-0" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      <div className="relative z-10 max-w-xl w-full rounded-3xl bg-surface border border-hairline p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary font-mono text-[11px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>404 &bull; Route Not Found</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-7xl sm:text-8xl tracking-[-0.05em] leading-none text-neutral-950 dark:text-white">
            4<span className="text-primary">0</span>4
          </h1>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            URL yang kamu tuju mungkin sudah dipindahkan, dihapus, atau tidak tersedia. Kamu bisa langsung menjelajahi halaman utama di bawah ini.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-tertiary font-sans font-bold text-xs sm:text-sm transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-canvas border border-hairline hover:border-primary/50 font-sans font-semibold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 transition-all"
          >
            <FolderGit2 className="w-4 h-4 text-primary" />
            <span>Selected Works</span>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-canvas border border-hairline hover:border-primary/50 font-sans font-semibold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 transition-all"
          >
            <User className="w-4 h-4 text-primary" />
            <span>About &amp; CV</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
