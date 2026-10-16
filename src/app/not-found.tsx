import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-canvas text-neutral-900 dark:text-white">
      <div className="space-y-4 max-w-md">
        <span className="font-mono text-sm uppercase tracking-widest text-primary font-bold">
          404 Error
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-neutral-600 dark:text-muted">
          The page you are looking for doesn&apos;t exist or has been moved to another URL.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-tertiary text-white font-medium text-sm transition-all shadow-lg hover:shadow-primary/30"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
