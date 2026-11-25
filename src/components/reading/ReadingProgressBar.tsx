"use client";

import { useEffect, useRef } from "react";

/**
 * Garis progres baca tipis (3px) di paling atas layar.
 * Menggunakan CSS Scroll-Driven Animations bila didukung browser, dan fallback JS scroll listener.
 */
export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const supportsScrollTimeline =
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline", "scroll()");
    if (supportsScrollTimeline) return;

    let rafId: number | null = null;

    const updateProgress = () => {
      rafId = null;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      el.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="reading-progress-bar pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-accent"
    />
  );
}
