'use client';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const isVisible = Boolean(message);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-20 right-6 z-50 pointer-events-none transition-all duration-300 bg-white/95 dark:bg-[#16161D]/95 backdrop-blur-xl border border-neutral-200 dark:border-white/15 text-neutral-900 dark:text-white px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
      <span className="text-xs sm:text-sm font-medium">{message || ''}</span>
    </div>
  );
}
