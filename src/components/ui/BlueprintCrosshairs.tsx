'use client';

import React from 'react';

export function BlueprintCrosshairs({ className = '' }: { className?: string }) {
  const markClass =
    'pointer-events-none absolute font-mono text-[10px] leading-none text-neutral-400/60 dark:text-white/25 select-none z-10';
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 !m-0 ${className}`}>
      <span className={`${markClass} top-3 left-3`}>+</span>
      <span className={`${markClass} top-3 right-3`}>+</span>
      <span className={`${markClass} bottom-3 left-3`}>+</span>
      <span className={`${markClass} bottom-3 right-3`}>+</span>
    </div>
  );
}

export default BlueprintCrosshairs;
