import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGateProgress } from '@/hooks/useGateProgress';
import { GateScene, type GateSceneRef } from '@/components/ui/GateScene';

/**
 * E-CELL RCPIT — GATE EXPERIENCE
 * Scroll-controlled entry experience:
 * - Native sticky 100svh scene inside 350svh scroll track.
 * - Approach (0.00 - 0.10): Complete stationary closed gate.
 * - Opening (0.10 - 0.40): Doors separate smoothly.
 * - Name Reveal (0.25 - 0.50): Existing name appears behind gates.
 * - Entry Illusion (0.50 - 0.75): Forward movement into the room; name dissolves.
 * - Final Quote (0.75 - 0.93): Quote illuminates and remains readable.
 * - Release (0.93 - 1.00): Seamless unpin and transition into normal scroll.
 */
export default function GateExperience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GateSceneRef>(null);
  const reduced = useReducedMotion();

  useGateProgress({
    trackRef,
    reducedMotion: reduced,
    onUpdate: (progress: number) => {
      sceneRef.current?.applyProgress(progress);
    },
  });

  return (
    <section
      id="ideas"
      className="community-poster gate-experience-container"
      data-nav-tone="dark"
      aria-labelledby="poster-title"
    >
      <div ref={trackRef} className="gate-experience-track">
        <GateScene ref={sceneRef} reducedMotion={reduced} />
      </div>
    </section>
  );
}
