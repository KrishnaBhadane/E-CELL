import NavHeader from '@/components/ui/nav-header';
import SocialLinks from './SocialLinks';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const header = useRef<HTMLElement>(null);
  const [tone, setTone] = useState('dark');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = header.current?.querySelector('nav')?.getBoundingClientRect();
      if (!nav) return;
      const y = nav.top + nav.height / 2;
      let next = 'light';
      // Explicit surface tones also work for gradients, SVG and transparent layers.
      document.querySelectorAll<HTMLElement>('[data-nav-tone]').forEach(surface => {
        const bounds = surface.getBoundingClientRect();
        if (bounds.top <= y && bounds.bottom > y) next = surface.dataset.navTone ?? 'light';
      });
      setTone(previous => previous === next ? previous : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return (
    <header ref={header} className="header" data-tone={tone}>
      <NavHeader />
      <SocialLinks />
    </header>
  );
}
