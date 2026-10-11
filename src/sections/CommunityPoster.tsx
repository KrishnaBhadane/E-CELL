import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/community-poster.css';

/**
 * STAY HUNGRY. STAY FOOLISH.
 * High-Performance Butter-Smooth 60/120FPS Scroll Gate Animation.
 * - Zero CSS-transition lag: direct RAF lerp loop drives GPU transform & opacity.
 * - Gate remains firmly closed while user sees half/most of the gate (~0.00 to 0.36).
 * - Gate smoothly parts open across a generous runway (~0.36 to 0.68).
 * - Words illuminate sequentially from faint silhouette into vibrant magazine poster design.
 * - Slower, cinematic fade-in (0.00 -> 0.35) and fade-out (0.82 -> 1.00).
 */
export default function CommunityPoster() {
  const containerRef = useRef<HTMLElement>(null);
  const gateWrapRef = useRef<HTMLDivElement>(null);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const laserLeftRef = useRef<HTMLDivElement>(null);
  const laserRightRef = useRef<HTMLDivElement>(null);

  const wordStay1Ref = useRef<HTMLSpanElement>(null);
  const wordHungryRef = useRef<HTMLSpanElement>(null);
  const wordStay2Ref = useRef<HTMLSpanElement>(null);
  const wordFoolishRef = useRef<HTMLSpanElement>(null);

  const authorRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();

  useEffect(() => {
    function unlockAll() {
      if (gateWrapRef.current) gateWrapRef.current.style.display = 'none';
      if (containerRef.current) containerRef.current.style.opacity = '1';
      [wordStay1Ref, wordHungryRef, wordStay2Ref, wordFoolishRef].forEach((ref) => {
        if (ref.current) {
          ref.current.classList.add('is-active');
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'none';
        }
      });
      if (authorRef.current) {
        authorRef.current.classList.add('is-active');
        authorRef.current.style.opacity = '1';
        authorRef.current.style.transform = 'none';
      }
      if (ctaRef.current) {
        ctaRef.current.classList.add('is-active');
        ctaRef.current.style.opacity = '1';
        ctaRef.current.style.transform = 'none';
      }
    }

    if (reduced) {
      unlockAll();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth <= 768;
    const completeThreshold = isMobile ? 0.42 : 0.34;

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;
    let isVisible = false;
    let hasFullyOpened = false;

    function applyProgress(progress: number) {
      if (hasFullyOpened) return;

      if (container) {
        container.style.opacity = '1';
      }

      // Gate opening curve
      const gateStart = isMobile ? 0.10 : 0.08;
      const gateDuration = isMobile ? 0.24 : 0.20;
      const gateOpen = Math.min(1, Math.max(0, (progress - gateStart) / gateDuration));

      // 100% lag-free hardware accelerated 2D translate3d
      const tx = gateOpen * 105;
      const doorOpacity = Math.max(0, 1 - Math.pow(gateOpen, 2.2) * 1.4);
      const laserOpacity = Math.max(0, 1 - gateOpen * 3.5);

      if (doorLeftRef.current) {
        doorLeftRef.current.style.transform = `translate3d(${-tx}%, 0, 0)`;
        doorLeftRef.current.style.opacity = doorOpacity.toFixed(3);
      }

      if (doorRightRef.current) {
        doorRightRef.current.style.transform = `translate3d(${tx}%, 0, 0)`;
        doorRightRef.current.style.opacity = doorOpacity.toFixed(3);
      }

      if (laserLeftRef.current) {
        laserLeftRef.current.style.opacity = laserOpacity.toFixed(3);
      }
      if (laserRightRef.current) {
        laserRightRef.current.style.opacity = laserOpacity.toFixed(3);
      }

      if (gateWrapRef.current) {
        gateWrapRef.current.style.display = gateOpen >= 0.99 ? 'none' : 'block';
      }

      // Sequential word illumination: appears smoothly before scrolling up
      const wordBase = isMobile ? 0.12 : 0.10;
      const step = isMobile ? 0.05 : 0.04;
      const hl1 = Math.min(1, Math.max(0, (progress - wordBase) / step));
      const hl2 = Math.min(1, Math.max(0, (progress - (wordBase + step)) / step));
      const hl3 = Math.min(1, Math.max(0, (progress - (wordBase + step * 2)) / step));
      const hl4 = Math.min(1, Math.max(0, (progress - (wordBase + step * 3)) / step));
      const hlCTA = Math.min(1, Math.max(0, (progress - (wordBase + step * 4)) / step));

      updateWord(wordStay1Ref.current, hl1);
      updateWord(wordHungryRef.current, hl2);
      updateWord(wordStay2Ref.current, hl3);
      updateWord(wordFoolishRef.current, hl4);

      if (authorRef.current) {
        authorRef.current.style.opacity = (0.3 + hlCTA * 0.7).toFixed(3);
        authorRef.current.style.transform = `translate3d(0, ${((1 - hlCTA) * 6).toFixed(2)}px, 0)`;
        if (hlCTA >= 0.50) authorRef.current.classList.add('is-active');
        else authorRef.current.classList.remove('is-active');
      }

      if (ctaRef.current) {
        ctaRef.current.style.opacity = (0.3 + hlCTA * 0.7).toFixed(3);
        ctaRef.current.style.transform = `translate3d(0, ${((1 - hlCTA) * 8).toFixed(2)}px, 0)`;
        if (hlCTA >= 0.50) ctaRef.current.classList.add('is-active');
        else ctaRef.current.classList.remove('is-active');
      }

      // Check if completely opened
      if (progress >= completeThreshold || gateOpen >= 0.99) {
        hasFullyOpened = true;
        unlockAll();
      }
    }

    function updateWord(el: HTMLElement | null, hl: number) {
      if (!el || hasFullyOpened) return;
      const opacity = 0.20 + hl * 0.80;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - hl) * 4).toFixed(2)}px, 0)`;
      if (hl >= 0.50) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    }

    function loop() {
      if (hasFullyOpened) return;
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0003) {
        currentProgress += diff * 0.22;
      } else {
        currentProgress = targetProgress;
      }

      applyProgress(currentProgress);

      if (!hasFullyOpened && Math.abs(targetProgress - currentProgress) > 0.0003 && isVisible) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = 0;
      }
    }

    function onScroll() {
      if (!container || hasFullyOpened) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDistance = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentPos / totalDistance));

      // Monotonic progression: only advance forward, never close backwards
      if (rawProgress > targetProgress) {
        targetProgress = rawProgress;
      }

      if (targetProgress >= completeThreshold) {
        hasFullyOpened = true;
        unlockAll();
        return;
      }

      if (!rafId && isVisible && !hasFullyOpened) {
        rafId = requestAnimationFrame(loop);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (hasFullyOpened) return;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          onScroll();
        } else {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
          if (targetProgress >= completeThreshold) {
            hasFullyOpened = true;
            unlockAll();
          }
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], rootMargin: '120px 0px' }
    );

    observer.observe(container);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <section
      ref={containerRef}
      id="ideas"
      className="community-poster"
      data-nav-tone="dark"
      aria-labelledby="poster-title"
    >
      {/* Background Atmosphere & Cybernetic Grid */}
      <div className="poster-backdrop" aria-hidden="true">
        <div className="poster-ambient-glow" />
        <div className="poster-grid-mesh" />
        <div className="poster-grid-points" />
        <div className="poster-vignette-overlay" />
      </div>

      {/* Cinematic Vault Gate Doors */}
      <div ref={gateWrapRef} className="poster-gate-wrap" aria-hidden="true">
        <div ref={doorLeftRef} className="poster-gate-door door-left">
          <div className="gate-door-sheen" />
          <div ref={laserLeftRef} className="gate-seam-laser beam-right" />
        </div>
        <div ref={doorRightRef} className="poster-gate-door door-right">
          <div className="gate-door-sheen" />
          <div ref={laserRightRef} className="gate-seam-laser beam-left" />
        </div>
      </div>

      <div className="poster-inner">
        {/* Main Typography — Word by Word Illumination */}
        <h2 id="poster-title" className="poster-headline">
          <span className="headline-row row-top">
            <span ref={wordStay1Ref} className="word-chrome word-stay">
              STAY
            </span>
            <span ref={wordHungryRef} className="word-electric word-hungry">
              HUNGRY.
            </span>
          </span>
          <span className="headline-row row-bottom">
            <span ref={wordStay2Ref} className="word-chrome word-stay-2">
              STAY
            </span>
            <span ref={wordFoolishRef} className="word-silver word-foolish">
              FOOLISH.
            </span>
          </span>
        </h2>

        {/* Quote Attribution */}
        <p ref={authorRef} className="poster-author">
          <span className="author-name">— Steve Jobs</span>
          <span className="author-event">Stanford commencement, 2005</span>
        </p>

        {/* CTA Button */}
        <div ref={ctaRef} className="poster-action-wrap">
          <a
            href="/members.html"
            className="poster-meet-btn"
            aria-label="Meet the team"
          >
            <span>MEET THE TEAM</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
