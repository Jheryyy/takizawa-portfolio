'use client';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const isVisible = Boolean(message);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-20 right-6 z-50 pointer-events-none transition-all duration-300 bg-elevated border border-primary/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
      <span className="text-xs sm:text-sm font-medium">{message || ''}</span>
    </div>
  );
}
