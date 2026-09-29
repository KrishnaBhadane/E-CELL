import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Desktop scroll distance maps to a sticky horizontal rail; touch stays native. */
export function useBlogScroll(category: string) {
  const area = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const region = area.current, viewport = stage.current, track = rail.current;
    if (!region || !viewport || !track) return;
    let frame = 0, distance = 0, pinned = false;
    const media = matchMedia('(min-width: 900px) and (min-height: 700px) and (pointer: fine)');
    const offset = 90;
    function update() {
      frame = 0;
      if (!pinned) return;
      const progress = Math.max(0, Math.min(distance, offset - region!.getBoundingClientRect().top));
      track!.scrollLeft = progress;
      viewport!.style.setProperty('--reading-progress', String(distance ? progress / distance : 0));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function measure() {
      distance = track!.scrollWidth - track!.clientWidth;
      pinned = media.matches && !reduced && distance > 1;
      region!.dataset.pinned = String(pinned);
      region!.style.height = pinned ? `${viewport!.offsetHeight + distance}px` : '';
      schedule();
    }
    function focus(event: FocusEvent) {
      if (!pinned || !(event.target instanceof HTMLElement)) return;
      const card = event.target.closest<HTMLElement>('.blog-card');
      if (!card) return;
      const x = card.getBoundingClientRect().left - track!.getBoundingClientRect().left + track!.scrollLeft;
      window.scrollTo({ top: scrollY + region!.getBoundingClientRect().top - offset + Math.min(distance, x), behavior: 'instant' });
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.target instanceof Element && event.target.closest('[role="tablist"]')) return;
      if (pinned) {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) { event.preventDefault(); window.scrollBy({ top: event.deltaX, behavior: 'instant' }); }
        return;
      }
      const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track!.clientWidth : 1);
      if (delta > 0 && track!.scrollLeft < distance - 1 || delta < 0 && track!.scrollLeft > 1) {
        event.preventDefault(); track!.scrollLeft = Math.max(0, Math.min(distance, track!.scrollLeft + delta));
      }
    }
    track.scrollLeft = 0;
    const resize = new ResizeObserver(measure);
    resize.observe(viewport); resize.observe(track);
    window.addEventListener('scroll', schedule, { passive: true });
    media.addEventListener('change', measure);
    region.addEventListener('wheel', wheel, { passive: false });
    track.addEventListener('focusin', focus);
    measure();
    if (pinned && region.getBoundingClientRect().top < offset) {
      window.scrollTo({ top: scrollY + region.getBoundingClientRect().top - offset, behavior: 'instant' });
    }
    return () => {
      cancelAnimationFrame(frame); resize.disconnect();
      window.removeEventListener('scroll', schedule); media.removeEventListener('change', measure);
      region.removeEventListener('wheel', wheel); track.removeEventListener('focusin', focus);
      region.style.height = ''; delete region.dataset.pinned;
    };
  }, [category, reduced]);
  return { area, stage, rail };
}
