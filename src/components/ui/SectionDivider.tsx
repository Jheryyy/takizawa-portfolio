'use client';

import React from 'react';

interface SectionDividerProps {
  index: string;
  label: string;
}

export function SectionDivider({ index, label }: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 py-2 select-none"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-bold text-primary tracking-widest">
          [ {index} ]
        </span>
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
      </div>
    </div>
  );
}

export default SectionDivider;
