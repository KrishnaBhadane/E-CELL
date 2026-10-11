import { useEffect, useRef } from 'react';

interface UseGateProgressOptions {
  trackRef: React.RefObject<HTMLElement | null>;
  onUpdate: (progress: number) => void;
  reducedMotion?: boolean;
}

/**
 * High-performance scroll-driven progress calculator.
 * - Synchronizes with native vertical scrolling via single passive listener and RAF.
 * - Reads layout measurements only during resize / orientation change (cached).
 * - Only schedules RAF frames when the section is visible in the viewport.
 * - Never calls React setState inside the animation frame loop.
 */
export function useGateProgress({ trackRef, onUpdate, reducedMotion }: UseGateProgressOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (reducedMotion) {
      onUpdateRef.current(1);
      return;
    }

    const track = trackRef.current;
    if (!track) return;

    let frameId = 0;
    let isVisible = false;
    let cachedScrollDistance = 0;

    function measure() {
      if (!track) return;
      const vh = window.innerHeight;
      cachedScrollDistance = Math.max(1, track.offsetHeight - vh);
    }

    function calculateProgress(): number {
      if (!track || cachedScrollDistance <= 0) return 0;
      const rect = track.getBoundingClientRect();
      // rect.top <= 0 indicates the track has pinned at the top of the viewport
      const distanceScrolled = -rect.top;
      const rawProgress = distanceScrolled / cachedScrollDistance;
      return Math.min(1, Math.max(0, rawProgress));
    }

    function render() {
      frameId = 0;
      if (!isVisible || document.hidden) return;
      const progress = calculateProgress();
      onUpdateRef.current(progress);
    }

    function schedule() {
      if (!frameId && isVisible && !document.hidden) {
        frameId = requestAnimationFrame(render);
      }
    }

    measure();
    // Immediate initial computation so elements mount in their exact correct scroll state
    onUpdateRef.current(calculateProgress());

    const resizeObserver = new ResizeObserver(() => {
      measure();
      schedule();
    });
    resizeObserver.observe(track);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          schedule();
        } else if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { rootMargin: '200px 0px' }
    );
    intersectionObserver.observe(track);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [trackRef, reducedMotion]);
}
