import { useVisibleAnimation } from '@/hooks/useVisibleAnimation';
import '@/styles/chrome.css';

/** Automatic CSS rotation pauses outside the viewport. */
export default function ChromeObject() {
  const ref = useVisibleAnimation<HTMLDivElement>();
  return <div className="chrome-object" ref={ref} aria-hidden="true"><div className="chrome-sculpture"><i /><i /><i /></div></div>;
}
