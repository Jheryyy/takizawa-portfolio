'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface LiquidTransitionContextType {
  triggerTransition: (href: string, label?: string) => void;
  isTransitioning: boolean;
}

const LiquidTransitionContext = createContext<LiquidTransitionContextType>({
  triggerTransition: () => {},
  isTransitioning: false,
});

export const useLiquidTransition = () => useContext(LiquidTransitionContext);

export function LiquidTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const executeNavigation = useCallback(
    (href: string) => {
      try {
        const isHash = href.includes('#');
        const targetHash = isHash ? href.split('#')[1] : null;
        const targetPath = href.split('#')[0] || '/';
        const normalizedCurrentPath = pathname || '/';
        const normalizedTargetPath = targetPath === '' ? '/' : targetPath;

        if (href === '/' && normalizedCurrentPath === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (window.location.hash) {
            window.history.pushState(null, '', '/');
          }
          return;
        }

        if (
          targetHash &&
          (normalizedCurrentPath === normalizedTargetPath || (normalizedCurrentPath === '/' && targetPath === '/'))
        ) {
          if (targetHash === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState(null, '', '/#home');
          } else {
            const el = document.getElementById(targetHash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.pushState(null, '', `#${targetHash}`);
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
          return;
        }

        router.push(href);
      } catch (err) {
        console.error('Navigation error:', err);
        router.push(href);
      }
    },
    [pathname, router]
  );

  const triggerTransition = useCallback(
    (href: string, _label?: string) => {
      executeNavigation(href);
    },
    [executeNavigation]
  );

  return (
    <LiquidTransitionContext.Provider value={{ triggerTransition, isTransitioning: false }}>
      {children}
    </LiquidTransitionContext.Provider>
  );
}

export default LiquidTransitionProvider;
