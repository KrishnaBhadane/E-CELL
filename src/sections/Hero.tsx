import { useState } from 'react';
import TigerTearReveal from '@/components/ui/tiger-tear-reveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import ClubLogo from '@/components/ClubLogo';

export default function Hero() {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="tear-hero" aria-labelledby="hero-title" data-nav-tone="dark">
      <a className="hero-club-logo" href="#top" aria-label="E-Cell RCPIT home"><ClubLogo /></a>
      <h1 id="hero-title" className="sr-only">Entrepreneurship Cell RCPIT</h1>
      <TigerTearReveal
        word="RCPIT"
        tagline="ENTREPRENEURSHIP CELL"
        paperArtwork={<DarkGradientBg />}
        ink="#6630b5"
        inkGradient={["#aa7bf0", "#d2b6ff"]}
        paper="#09090b"
        taglineColor="#f4f4f2"
        eyeColor="#9c75e0"
        furColor="#aaa5b0"
        fontFamily="Anton, Impact, sans-serif"
        height="100svh"
        scrollDistance="var(--tear-distance)"
        topOffset="0px"
        progress={reduced ? (revealed ? 1 : 0) : undefined}
        hint={false}
      >
        <div className="tear-caption">
          {reduced
            ? <LiquidButton size="lg" className="tear-reveal-button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed}>{revealed ? 'Close the poster' : 'Reveal the tiger'} <span aria-hidden="true">↗</span></LiquidButton>
            : <span className="tear-scroll">SCROLL TO BREAK THROUGH <span aria-hidden="true">↓</span></span>}
        </div>
      </TigerTearReveal>
    </section>
  );
}
