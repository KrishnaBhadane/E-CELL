import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (reduced) { setDisplay(value); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1600);
        setDisplay(Math.round(value * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, reduced]);
  return <strong ref={ref} aria-label={`${value} plus`}><span aria-hidden="true" className="count-value">{display.toLocaleString('en-IN')}+</span></strong>;
}
