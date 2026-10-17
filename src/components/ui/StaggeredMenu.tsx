'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  hideLogo?: boolean;
  inlineTrigger?: boolean;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onItemClick?: (link: string, label: string) => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#FDBA74', '#F97316'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl,
  hideLogo = false,
  inlineTrigger = false,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#111',
  changeMenuColorOnOpen = true,
  accentColor = '#F97316',
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  onItemClick,
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const textWrapRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close']);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });

      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    ) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: 'power2.out', ['--sm-num-opacity' as any]: 1, stagger: { each: 0.08, from: 'start' } },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });

        const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;

    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out',
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const toggleButtonElement = (
    <button
      ref={toggleBtnRef}
      className={`sm-toggle relative inline-flex items-center gap-[0.4rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto px-3.5 py-2 rounded-full transition-colors z-[70] ${
        open ? 'text-black' : 'text-current'
      }`}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="staggered-menu-panel"
      onClick={toggleMenu}
      type="button"
    >
      <span
        ref={textWrapRef}
        className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap w-[var(--sm-toggle-width,auto)] min-w-[var(--sm-toggle-width,auto)] text-xs sm:text-sm font-bold tracking-wider uppercase font-mono"
        aria-hidden="true"
      >
        <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
          {textLines.map((l, i) => (
            <span className="sm-toggle-line block h-[1em] leading-none" key={i}>
              {l}
            </span>
          ))}
        </span>
      </span>

      <span
        ref={iconRef}
        className="sm-icon relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
        aria-hidden="true"
      >
        <span
          ref={plusHRef}
          className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
        />
        <span
          ref={plusVRef}
          className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
        />
      </span>
    </button>
  );

  return (
    <>
      {inlineTrigger && toggleButtonElement}

      <div
        className={`sm-scope ${
          isFixed
            ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-[60]'
            : 'relative w-full h-full pointer-events-none'
        }`}
      >
        <div
          className={
            (className ? className + ' ' : '') +
            'staggered-menu-wrapper pointer-events-none relative w-full h-full z-40'
          }
          style={accentColor ? ({ ['--sm-accent' as any]: accentColor } as React.CSSProperties) : undefined}
          data-position={position}
          data-open={open || undefined}
        >
          <div
            ref={preLayersRef}
            className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
            aria-hidden="true"
          >
            {(() => {
              const raw = colors && colors.length ? colors.slice(0, 4) : ['#FDBA74', '#F97316'];
              let arr = [...raw];
              if (arr.length >= 3) {
                const mid = Math.floor(arr.length / 2);
                arr.splice(mid, 1);
              }
              return arr.map((c, i) => (
                <div
                  key={i}
                  className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                  style={{ background: c }}
                />
              ));
            })()}
          </div>

          {!inlineTrigger && (
            <header
              className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between px-6 sm:px-12 py-5 bg-transparent pointer-events-none z-20"
              aria-label="Main navigation header"
            >
              {!hideLogo ? (
                <div className="sm-logo flex items-center select-none pointer-events-auto">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="sm-logo-img block h-8 w-auto object-contain"
                      draggable={false}
                      width={110}
                      height={24}
                    />
                  ) : (
                    <Link
                      href="/"
                      className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2"
                      onClick={(e) => {
                        if (onItemClick) {
                          e.preventDefault();
                          closeMenu();
                          onItemClick('/#home', 'HOME');
                        } else {
                          closeMenu();
                        }
                      }}
                    >
                      <span>
                        Takizawa<span className="text-primary font-normal">blox</span>
                      </span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="sm-logo-spacer" />
              )}

              {toggleButtonElement}
            </header>
          )}

          <aside
            id="staggered-menu-panel"
            ref={panelRef}
            className="staggered-menu-panel absolute top-0 right-0 h-full bg-white flex flex-col p-[6em_2em_2.5em_2.5em] overflow-y-auto z-10 backdrop-blur-[16px] pointer-events-auto shadow-2xl"
            style={{ WebkitBackdropFilter: 'blur(16px)' }}
            aria-hidden={!open}
            inert={!open ? true : undefined}
          >
            <div className="sm-panel-inner flex-1 flex flex-col justify-between gap-6">
              <ul
                className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2 pt-2"
                role="list"
                data-numbering={displayItemNumbering || undefined}
              >
                {items && items.length ? (
                  items.map((it, idx) => (
                    <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                      <Link
                        className="sm-panel-item relative text-black font-extrabold text-[2.75rem] sm:text-[3.5rem] cursor-pointer leading-tight tracking-[-1.5px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em] hover:text-[var(--sm-accent,#F97316)]"
                        href={it.link}
                        aria-label={it.ariaLabel}
                        tabIndex={open ? 0 : -1}
                        data-index={idx + 1}
                        onClick={(e) => {
                          if (onItemClick) {
                            e.preventDefault();
                            closeMenu();
                            onItemClick(it.link, it.label);
                          } else {
                            closeMenu();
                          }
                        }}
                      >
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          {it.label}
                        </span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none">
                    <span className="sm-panel-item relative text-black font-semibold text-[3.5rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]">
                      <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                        No items
                      </span>
                    </span>
                  </li>
                )}
              </ul>

              {displaySocials && socialItems && socialItems.length > 0 && (
                <nav
                  className="sm-socials mt-auto pt-8 border-t border-neutral-200 flex flex-col gap-3"
                  aria-label="Social links"
                >
                  <h3 className="sm-socials-title m-0 text-xs uppercase tracking-widest font-mono font-bold text-[var(--sm-accent,#F97316)]">
                    Socials &amp; Connect
                  </h3>
                  <ul
                    className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap"
                    role="list"
                  >
                    {socialItems.map((s, i) => (
                      <li key={s.label + i} className="sm-socials-item">
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={open ? 0 : -1}
                          className="sm-socials-link text-[1.1rem] font-medium text-black dark:text-neutral-800 hover:text-[var(--sm-accent,#F97316)] no-underline relative inline-block py-[2px] transition-[color,opacity] duration-300 ease-linear"
                          onClick={closeMenu}
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </aside>
        </div>

        <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1.5em 2em; background: transparent; pointer-events: none; z-index: 20; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
.sm-scope .sm-logo-img { display: block; height: 32px; width: auto; object-fit: contain; }
.sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.35rem; background: transparent; border: none; cursor: pointer; color: inherit; font-weight: 600; line-height: 1; overflow: visible; }
.sm-scope .sm-toggle:focus-visible { outline: 2px solid var(--sm-accent, #F97316); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.4em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; width: var(--sm-toggle-width, auto); min-width: var(--sm-toggle-width, auto); }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(280px, 40vw, 440px); height: 100%; background: #FFFFFF; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); display: flex; flex-direction: column; padding: 6em 2em 2.5em 2.5em; overflow-y: auto; z-index: 10; border-left: 1px solid rgba(0,0,0,0.08); }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; border-left: none; border-right: 1px solid rgba(0,0,0,0.08); }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(280px, 40vw, 440px); pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; }
.sm-scope .sm-socials { margin-top: auto; padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-socials-title { margin: 0; font-size: 0.75rem; font-weight: 700; color: var(--sm-accent, #F97316); }
.sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
.sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease, color 0.2s ease; }
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.4; }
.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.4; }
.sm-scope .sm-socials-list .sm-socials-link:hover,
.sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; color: var(--sm-accent, #F97316); }
.sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, #F97316); outline-offset: 3px; }
.sm-scope .sm-socials-link { font-size: 1.05rem; font-weight: 600; color: #171717; text-decoration: none; position: relative; padding: 2px 0; display: inline-block; transition: color 0.3s ease, opacity 0.3s ease; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-panel-item { position: relative; color: #0F172A; font-weight: 800; font-size: clamp(2.2rem, 3.8vw, 3.2rem); cursor: pointer; line-height: 1.05; letter-spacing: -1.5px; text-transform: uppercase; transition: color 0.2s; display: inline-block; text-decoration: none; padding-right: 1.4em; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, #F97316); }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.12em; right: 2.8em; font-size: 16px; font-weight: 600; color: var(--sm-accent, #F97316); font-family: monospace; letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } }
@media (max-width: 640px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; padding: 5.5em 1.5em 2em 1.5em; } .sm-scope .sm-panel-item { font-size: 2.4rem; } }
        `}</style>
      </div>
    </>
  );
};

export default StaggeredMenu;
