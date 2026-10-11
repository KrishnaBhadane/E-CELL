import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/community-poster.css';

export default function CommunityPoster() {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      setScrollProgress(0.7);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let isVisible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) schedule();
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], rootMargin: '120px 0px' }
    );

    observer.observe(container);

    function onScroll() {
      rafId = 0;
      if (!isVisible || document.hidden || !container) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalDistance = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentPos / totalDistance));

      setScrollProgress(progress);
    }

    function schedule() {
      if (isVisible && !document.hidden && !rafId) {
        rafId = requestAnimationFrame(onScroll);
      }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    onScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced]);

  // Starts later when gate is fully in view (~0.28) and completes around 0.58
  const gateOpen = Math.min(1, Math.max(0, (scrollProgress - 0.28) / 0.30));

  // Sequential word illumination synchronized with the parting gate
  const hl1 = Math.min(1, Math.max(0, (scrollProgress - 0.35) / 0.08)); // STAY
  const hl2 = Math.min(1, Math.max(0, (scrollProgress - 0.41) / 0.08)); // HUNGRY.
  const hl3 = Math.min(1, Math.max(0, (scrollProgress - 0.47) / 0.08)); // STAY
  const hl4 = Math.min(1, Math.max(0, (scrollProgress - 0.53) / 0.08)); // FOOLISH.

  // Smooth Fade In & Fade Out for centerpiece
  const fadeIn = Math.min(1, Math.max(0, (scrollProgress - 0.22) / 0.18));
  const fadeOut = Math.min(1, Math.max(0, (scrollProgress - 0.76) / 0.20));
  const scrollFade = fadeIn * (1 - fadeOut * 0.90);

  // Door lighting / opacity
  const doorOpacity = Math.max(0, 1 - Math.pow(gateOpen, 1.8) * 1.25);
  const doorBrightness = 1 - gateOpen * 0.35;

  return (
    <section
      ref={containerRef}
      className="community-poster"
      id="ideas"
      data-nav-tone="dark"
      aria-labelledby="poster-title"
    >
      <div className="poster-scroll-track">
        {/* Obsidian Core Background & Grid */}
        <div className="poster-core-glow" aria-hidden="true" />
        <div className="poster-matrix-grid" aria-hidden="true" />

        {/* Cinematic 3D Vault Gate Doors — Parts slowly in 3D perspective */}
        {gateOpen < 0.99 && (
          <div className="poster-3d-gate" aria-hidden="true">
            {/* Left Blast Door */}
            <div
              className="gate-door gate-left"
              style={{
                transform: `perspective(1200px) rotateY(${-gateOpen * 86}deg) translateZ(${gateOpen * 35}px) translateX(${-gateOpen * 105}%)`,
                opacity: doorOpacity,
                filter: `brightness(${doorBrightness})`,
              }}
            >
              <div className="door-rivet rivet-tl" />
              <div className="door-rivet rivet-tr" />
              <div className="door-rivet rivet-bl" />
              <div className="door-rivet rivet-br" />
              <div className="gate-door-grid" />
              <div className="gate-surface-sheen" />
              <div className="gate-edge-beam beam-right" />
              <div className="gate-door-badge">
                <div className="gate-badge-header">
                  <span className="gate-beacon-dot" />
                  <span className="gate-label">DISRUPTIVE VISION</span>
                </div>
                <span className="gate-sublabel">AUTH // LVL-01</span>
              </div>
            </div>

            {/* Right Blast Door */}
            <div
              className="gate-door gate-right"
              style={{
                transform: `perspective(1200px) rotateY(${gateOpen * 86}deg) translateZ(${gateOpen * 35}px) translateX(${gateOpen * 105}%)`,
                opacity: doorOpacity,
                filter: `brightness(${doorBrightness})`,
              }}
            >
              <div className="door-rivet rivet-tl" />
              <div className="door-rivet rivet-tr" />
              <div className="door-rivet rivet-bl" />
              <div className="door-rivet rivet-br" />
              <div className="gate-door-grid" />
              <div className="gate-surface-sheen" />
              <div className="gate-edge-beam beam-left" />
              <div className="gate-door-badge">
                <div className="gate-badge-header">
                  <span className="gate-beacon-dot" />
                  <span className="gate-label">FOUNDERS’ ARENA</span>
                </div>
                <span className="gate-sublabel">VAULT // PROTOTYPE</span>
              </div>
            </div>
          </div>
        )}

        {/* Inside Vault: Centered Typography & Content */}
        <div className="poster-vault-content">
          <div
            className="poster-centerpiece"
            style={{ opacity: scrollFade }}
          >
            <h2 id="poster-title" className="poster-title-centered">
              <span className="title-line title-line-1">
                <span className={`scroll-word word-stay ${hl1 > 0.4 ? 'is-active' : ''}`}>
                  STAY
                </span>{' '}
                <span className={`scroll-word word-hungry ${hl2 > 0.4 ? 'is-active' : ''}`}>
                  HUNGRY.
                </span>
              </span>

              <span className="title-line title-line-2">
                <span className={`scroll-word word-stay-2 ${hl3 > 0.4 ? 'is-active' : ''}`}>
                  STAY
                </span>{' '}
                <span className={`scroll-word word-foolish ${hl4 > 0.4 ? 'is-active' : ''}`}>
                  FOOLISH.
                </span>
              </span>
            </h2>

            {/* Steve Jobs Citation — INSIDE THE VAULT */}
            <p className="poster-author">
              — Steve Jobs <span>Stanford commencement, 2005</span>
            </p>

            {/* CTA Button — INSIDE THE VAULT */}
            <a href="/members.html" className="glass-control glass-button poster-meet-btn">
              Meet the team <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
