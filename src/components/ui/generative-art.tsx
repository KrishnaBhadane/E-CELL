import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** A single, bounded canvas adapting the supplied flowing-line artwork. */
export default function GenerativeArt() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = canvas.current!;
    const context = element.getContext('2d');
    if (!context) return;
    let width = 0, height = 0, frame = 0, last = 0, visible = false;
    function draw(time: number) {
      context!.clearRect(0, 0, width, height);
      context!.strokeStyle = '#6630b5';
      context!.lineWidth = .7;
      for (let line = 0; line < 32; line++) {
        context!.beginPath();
        for (let x = 0; x <= width + 8; x += 8) {
          const y = height * .55 + Math.sin(x / 180 + time * .00008 + line * .12) * height * .22
            + Math.sin(x / 73 - time * .00005) * 18 + (line - 16) * 7;
          if (x === 0) context!.moveTo(x, y); else context!.lineTo(x, y);
        }
        context!.stroke();
      }
    }
    function tick(time: number) {
      if (time - last >= 1000 / 24) { draw(time); last = time; }
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(() => {
      width = element.clientWidth; height = element.clientHeight;
      const scale = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * scale); element.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0); draw(0);
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    resize.observe(element); observer.observe(element);
    document.addEventListener('visibilitychange', resume);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', resume); };
  }, [reduced]);
  return <canvas className="blog-generative-art" ref={canvas} aria-hidden="true" />;
}
