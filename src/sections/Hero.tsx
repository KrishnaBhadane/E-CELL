import { useState } from 'react';
import TigerTearReveal from '@/components/ui/tiger-tear-reveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import ClubLogo from '@/components/ClubLogo';
import UpcomingEvent from '@/components/UpcomingEvent';
import { upcomingEvent } from '@/data/upcoming-event';

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
        fontFamily="Anton, Impact, sans-serif"
        height="100svh"
        scrollDistance="var(--tear-distance)"
        topOffset="0px"
        progress={reduced ? (revealed ? 1 : 0) : undefined}
        hint={false}
        revealLabel={`${upcomingEvent.name}, our upcoming event`}
        revealArtwork={() => <UpcomingEvent />}
      >
        <div className="tear-caption">
          {reduced
            ? <button type="button" className="glass-control glass-button tear-reveal-button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed}>{revealed ? 'Close the poster' : 'Reveal upcoming event'} <span aria-hidden="true">↗</span></button>
            : <span className="tear-scroll">SCROLL TO BREAK THROUGH <span aria-hidden="true">↓</span></span>}
        </div>
      </TigerTearReveal>
    </section>
  );
}
