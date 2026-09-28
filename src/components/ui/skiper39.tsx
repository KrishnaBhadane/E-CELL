import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Adapted from Skiper UI 39 / Open Peeps. One capped canvas loop replaces
// a separate GSAP timeline per person. Credits are linked in the page footer.
export default function Skiper39() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const image = new Image();
    let disposed = false, visible = false, frame = 0, previous = 0, elapsed = 0;
    let width = 0, height = 0, scale = 1;
    const draw = () => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const count = width < 760 ? 12 : 30;
      const size = width < 760 ? 85 : 130;
      const sw = image.naturalWidth / 15, sh = image.naturalHeight / 7;
      for (let i = 0; i < count; i++) {
        const direction = i % 2 ? 1 : -1;
        const travel = (i * 173 + elapsed * (18 + i % 7)) % (width + size * 2);
        const x = direction > 0 ? travel - size : width + size - travel;
        const y = height - size * sh / sw - (i % 3) * 45 + Math.sin(elapsed * 8 + i) * (reduced ? 0 : 3);
        const sprite = i * 17 % 105;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(direction, 1);
        ctx.drawImage(image, sprite % 15 * sw, Math.floor(sprite / 15) * sh, sw, sh, 0, 0, size, size * sh / sw);
        ctx.restore();
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || disposed || !image.naturalWidth) return;
      if (now - previous >= 1000 / 24) {
        if (previous) elapsed += Math.min((now - previous) / 1000, .1);
        previous = now;
        draw();
      }
      if (!reduced) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (visible && !document.hidden && image.naturalWidth && !disposed) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      scale = Math.min(devicePixelRatio, 1.5, Math.sqrt(650000 / Math.max(1, width * height)));
      canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    const sizes = new ResizeObserver(resize);
    observer.observe(canvas); sizes.observe(canvas);
    document.addEventListener('visibilitychange', schedule);
    image.onload = () => { if (!disposed) resize(); };
    image.src = '/assets/members/crowd.png';
    return () => { disposed = true; image.onload = null; cancelAnimationFrame(frame); observer.disconnect(); sizes.disconnect(); document.removeEventListener('visibilitychange', schedule); };
  }, [reduced]);
  return <section className="crowd-hero" aria-labelledby="members-title">
    <div className="team-page-heading"><h1 id="members-title">MEMBERS</h1><a href="#team-roster" className="glass-control glass-button">Meet the team ↓</a></div>
    <canvas ref={ref} className="crowd-canvas" aria-hidden="true" />
  </section>;
}
