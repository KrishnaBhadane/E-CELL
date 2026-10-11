import { forwardRef, useImperativeHandle, useRef } from 'react';
import '@/styles/community-poster.css';
import '@/styles/gate-experience.css';

export interface GateSceneRef {
  applyProgress: (progress: number) => void;
}

interface GateSceneProps {
  reducedMotion?: boolean;
}

function clamp(val: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, val));
}

export const GateScene = forwardRef<GateSceneRef, GateSceneProps>(function GateScene(
  { reducedMotion },
  ref
) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const gateWrapRef = useRef<HTMLDivElement>(null);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const laserLeftRef = useRef<HTMLDivElement>(null);
  const laserRightRef = useRef<HTMLDivElement>(null);

  const nameLayerRef = useRef<HTMLDivElement>(null);

  const quoteLayerRef = useRef<HTMLDivElement>(null);
  const wordStay1Ref = useRef<HTMLSpanElement>(null);
  const wordHungryRef = useRef<HTMLSpanElement>(null);
  const wordStay2Ref = useRef<HTMLSpanElement>(null);
  const wordFoolishRef = useRef<HTMLSpanElement>(null);
  const authorRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    applyProgress(progress: number) {
      if (reducedMotion) return;
      const p = clamp(progress);

      // ----------------------------------------------------------------------
      // 1. DOORS & LASER SEAM (0.00 - 0.75)
      // ----------------------------------------------------------------------
      if (p <= 0.10) {
        // 0.00 - 0.10: Completely closed, stationary
        if (gateWrapRef.current) gateWrapRef.current.style.display = 'block';
        if (doorLeftRef.current) {
          doorLeftRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)';
          doorLeftRef.current.style.opacity = '1';
        }
        if (doorRightRef.current) {
          doorRightRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)';
          doorRightRef.current.style.opacity = '1';
        }
        if (laserLeftRef.current) laserLeftRef.current.style.opacity = '1';
        if (laserRightRef.current) laserRightRef.current.style.opacity = '1';
      } else if (p <= 0.40) {
        // 0.10 - 0.40: Doors open smoothly with weighted mechanical easing
        const openProgress = (p - 0.10) / 0.30;
        const ease = openProgress * openProgress * (3 - 2 * openProgress);
        const tx = ease * 105;
        const laserOpacity = Math.max(0, 1 - ease * 3.5);
        if (gateWrapRef.current) gateWrapRef.current.style.display = 'block';
        if (doorLeftRef.current) {
          doorLeftRef.current.style.transform = `translate3d(${-tx}%, 0, 0) scale(1)`;
          doorLeftRef.current.style.opacity = '1';
        }
        if (doorRightRef.current) {
          doorRightRef.current.style.transform = `translate3d(${tx}%, 0, 0) scale(1)`;
          doorRightRef.current.style.opacity = '1';
        }
        if (laserLeftRef.current) laserLeftRef.current.style.opacity = laserOpacity.toFixed(3);
        if (laserRightRef.current) laserRightRef.current.style.opacity = laserOpacity.toFixed(3);
      } else if (p <= 0.50) {
        // 0.40 - 0.50: Doors held open while name is in view
        if (gateWrapRef.current) gateWrapRef.current.style.display = 'block';
        if (doorLeftRef.current) {
          doorLeftRef.current.style.transform = 'translate3d(-105%, 0, 0) scale(1)';
          doorLeftRef.current.style.opacity = '1';
        }
        if (doorRightRef.current) {
          doorRightRef.current.style.transform = 'translate3d(105%, 0, 0) scale(1)';
          doorRightRef.current.style.opacity = '1';
        }
        if (laserLeftRef.current) laserLeftRef.current.style.opacity = '0';
        if (laserRightRef.current) laserRightRef.current.style.opacity = '0';
      } else if (p <= 0.75) {
        // 0.50 - 0.75: Forward entry illusion — doors push wide and scale up past viewport edges
        const entryProgress = (p - 0.50) / 0.25;
        const easeEntry = entryProgress * entryProgress;
        const tx = 105 + easeEntry * 95;
        const doorScale = 1 + easeEntry * 1.5;
        const doorOpacity = Math.max(0, 1 - entryProgress * 1.4);
        if (gateWrapRef.current) gateWrapRef.current.style.display = doorOpacity <= 0.01 ? 'none' : 'block';
        if (doorLeftRef.current) {
          doorLeftRef.current.style.transform = `translate3d(${-tx}%, 0, 0) scale(${doorScale.toFixed(3)})`;
          doorLeftRef.current.style.opacity = doorOpacity.toFixed(3);
        }
        if (doorRightRef.current) {
          doorRightRef.current.style.transform = `translate3d(${tx}%, 0, 0) scale(${doorScale.toFixed(3)})`;
          doorRightRef.current.style.opacity = doorOpacity.toFixed(3);
        }
        if (laserLeftRef.current) laserLeftRef.current.style.opacity = '0';
        if (laserRightRef.current) laserRightRef.current.style.opacity = '0';
      } else {
        // p > 0.75: Outside viewport
        if (gateWrapRef.current) gateWrapRef.current.style.display = 'none';
      }

      // ----------------------------------------------------------------------
      // 2. EXISTING NAME LAYER (0.25 - 0.75)
      // ----------------------------------------------------------------------
      if (nameLayerRef.current) {
        if (p < 0.25) {
          nameLayerRef.current.style.opacity = '0';
          nameLayerRef.current.style.visibility = 'hidden';
          nameLayerRef.current.style.transform = 'translate3d(0, 20px, 0) scale(0.95)';
        } else if (p <= 0.50) {
          const appear = (p - 0.25) / 0.25;
          nameLayerRef.current.style.visibility = 'visible';
          nameLayerRef.current.style.opacity = appear.toFixed(3);
          nameLayerRef.current.style.transform = `translate3d(0, ${((1 - appear) * 15).toFixed(2)}px, 0) scale(1)`;
        } else if (p <= 0.75) {
          const dissolve = (p - 0.50) / 0.25;
          const nameOpacity = Math.max(0, 1 - dissolve * 1.35);
          const nameScale = 1 + dissolve * 0.22;
          nameLayerRef.current.style.visibility = nameOpacity <= 0.01 ? 'hidden' : 'visible';
          nameLayerRef.current.style.opacity = nameOpacity.toFixed(3);
          nameLayerRef.current.style.transform = `translate3d(0, ${(-dissolve * 16).toFixed(2)}px, 0) scale(${nameScale.toFixed(3)})`;
        } else {
          nameLayerRef.current.style.opacity = '0';
          nameLayerRef.current.style.visibility = 'hidden';
        }
      }

      // ----------------------------------------------------------------------
      // 3. BACKDROP & ATMOSPHERE (Zoom forward on entry)
      // ----------------------------------------------------------------------
      if (backdropRef.current) {
        if (p <= 0.50) {
          backdropRef.current.style.transform = 'scale(1)';
        } else if (p <= 0.75) {
          const entry = (p - 0.50) / 0.25;
          backdropRef.current.style.transform = `scale(${(1 + entry * 0.20).toFixed(3)})`;
        } else {
          backdropRef.current.style.transform = 'scale(1.20)';
        }
      }

      // ----------------------------------------------------------------------
      // 4. SECOND QUOTE LAYER (0.75 - 1.00)
      // ----------------------------------------------------------------------
      if (quoteLayerRef.current) {
        if (p < 0.75) {
          quoteLayerRef.current.style.opacity = '0';
          quoteLayerRef.current.style.visibility = 'hidden';
          quoteLayerRef.current.style.transform = 'translate3d(0, 24px, 0)';
          if (wordStay1Ref.current) wordStay1Ref.current.classList.remove('is-active');
          if (wordHungryRef.current) wordHungryRef.current.classList.remove('is-active');
          if (wordStay2Ref.current) wordStay2Ref.current.classList.remove('is-active');
          if (wordFoolishRef.current) wordFoolishRef.current.classList.remove('is-active');
          if (authorRef.current) authorRef.current.classList.remove('is-active');
          if (ctaRef.current) ctaRef.current.classList.remove('is-active');
        } else if (p <= 0.86) {
          // 0.75 - 0.86: Reveal sequence
          const quoteProgress = (p - 0.75) / 0.11;
          quoteLayerRef.current.style.visibility = 'visible';
          quoteLayerRef.current.style.opacity = quoteProgress.toFixed(3);
          quoteLayerRef.current.style.transform = `translate3d(0, ${((1 - quoteProgress) * 16).toFixed(2)}px, 0)`;

          // Words illuminate in quick sequence
          const w1 = p >= 0.76;
          const w2 = p >= 0.78;
          const w3 = p >= 0.80;
          const w4 = p >= 0.82;
          const wMeta = p >= 0.84;

          if (wordStay1Ref.current) wordStay1Ref.current.classList.toggle('is-active', w1);
          if (wordHungryRef.current) wordHungryRef.current.classList.toggle('is-active', w2);
          if (wordStay2Ref.current) wordStay2Ref.current.classList.toggle('is-active', w3);
          if (wordFoolishRef.current) wordFoolishRef.current.classList.toggle('is-active', w4);
          if (authorRef.current) authorRef.current.classList.toggle('is-active', wMeta);
          if (ctaRef.current) ctaRef.current.classList.toggle('is-active', wMeta);
        } else {
          // 0.86 - 1.00: Quote remains 100% active, stationary, readable!
          quoteLayerRef.current.style.visibility = 'visible';
          quoteLayerRef.current.style.opacity = '1';
          quoteLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
          if (wordStay1Ref.current) wordStay1Ref.current.classList.add('is-active');
          if (wordHungryRef.current) wordHungryRef.current.classList.add('is-active');
          if (wordStay2Ref.current) wordStay2Ref.current.classList.add('is-active');
          if (wordFoolishRef.current) wordFoolishRef.current.classList.add('is-active');
          if (authorRef.current) authorRef.current.classList.add('is-active');
          if (ctaRef.current) ctaRef.current.classList.add('is-active');
        }
      }
    },
  }));

  return (
    <div className="gate-sticky-scene">
      {/* Background Atmosphere & Cybernetic Grid */}
      <div ref={backdropRef} className="poster-backdrop" aria-hidden="true">
        <div className="poster-ambient-glow" />
        <div className="poster-grid-mesh" />
        <div className="poster-grid-points" />
        <div className="poster-vignette-overlay" />
      </div>

      {/* Cinematic Vault Gate Doors */}
      <div ref={gateWrapRef} className="poster-gate-wrap" aria-hidden="true">
        <div ref={doorLeftRef} className="poster-gate-door door-left">
          <div className="gate-door-sheen" />
          <div ref={laserLeftRef} className="gate-seam-laser beam-right" />
        </div>
        <div ref={doorRightRef} className="poster-gate-door door-right">
          <div className="gate-door-sheen" />
          <div ref={laserRightRef} className="gate-seam-laser beam-left" />
        </div>
      </div>

      {/* Existing Name Layer: Appears behind the separating gates */}
      <div ref={nameLayerRef} className="gate-name-layer" aria-hidden="true">
        <span className="gate-name-eyebrow">THE ENTREPRENEURSHIP CELL</span>
        <h3 className="gate-name-title">E-CELL RCPIT</h3>
        <span className="gate-name-sub">EST. 2021 · SHIRPUR</span>
      </div>

      {/* Second Quote Layer: Revealed after entering the room */}
      <div ref={quoteLayerRef} className="poster-inner gate-quote-layer">
        <h2 id="poster-title" className="poster-headline">
          <span className="headline-row row-top">
            <span ref={wordStay1Ref} className="word-chrome word-stay">
              STAY
            </span>
            <span ref={wordHungryRef} className="word-electric word-hungry">
              HUNGRY.
            </span>
          </span>
          <span className="headline-row row-bottom">
            <span ref={wordStay2Ref} className="word-chrome word-stay-2">
              STAY
            </span>
            <span ref={wordFoolishRef} className="word-silver word-foolish">
              FOOLISH.
            </span>
          </span>
        </h2>

        {/* Quote Attribution */}
        <p ref={authorRef} className="poster-author">
          <span className="author-name">— Steve Jobs</span>
          <span className="author-event">Stanford commencement, 2005</span>
        </p>

        {/* CTA Button */}
        <div ref={ctaRef} className="poster-action-wrap">
          <a
            href="/members.html"
            className="poster-meet-btn"
            aria-label="Meet the team"
          >
            <span>MEET THE TEAM</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
});
