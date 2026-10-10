import { useEffect, useRef } from 'react';

/** CSS animations run only while their element and browser tab are visible. */
export function useVisibleAnimation<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const update = () => element.setAttribute('data-visible', String(visible && !document.hidden));
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  return ref;
}
