import { useId } from 'react';
import PathDrawingPortfolioHero from './ui/path-drawing-portfolio-hero';
import { upcomingEvent } from '@/data/upcoming-event';

/**
 * Everything revealed behind the paper tear lives here.
 * Desktop: Exact pristine original layout from HEAD.
 * Mobile: Fully optimized vertical layout with animated illuminate SVG stroke drawing.
 */
export default function UpcomingEvent() {
  const mobileGradId = useId().replace(/:/g, '');

  return (
    <div className="upcoming-event" data-revealed-event>
      {/* Desktop Layout — Exactly as originally designed */}
      <img
        className="event-character"
        src={upcomingEvent.primaryArtwork}
        alt={upcomingEvent.primaryArtworkAlt}
        width="1200"
        height="675"
        decoding="async"
      />
      <div className="event-announcement">
        <PathDrawingPortfolioHero
          brand={upcomingEvent.name}
          colors={upcomingEvent.colors}
          label={upcomingEvent.label || upcomingEvent.status}
          status={`${upcomingEvent.teamLabel} · ${upcomingEvent.organization}`}
        />
        <span className="event-edition">{upcomingEvent.theme}</span>
      </div>
      <img
        className="event-ship"
        src={upcomingEvent.secondaryArtwork}
        alt={upcomingEvent.secondaryArtworkAlt}
        width="70"
        height="70"
        decoding="async"
      />

      {/* Mobile Layout — Only active on mobile screens */}
      <div className="event-layout-mobile">
        {/* Top Hero Art Poster */}
        <div className="mobile-event-media-top">
          <div className="mobile-art-wrapper">
            <img
              className="mobile-event-img"
              src={upcomingEvent.primaryArtwork}
              alt={upcomingEvent.primaryArtworkAlt}
              width="320"
              height="180"
              decoding="async"
            />
            <div className="mobile-art-sheen" />
            <span className="mobile-art-corner-tag">{upcomingEvent.editionYearTag}</span>
          </div>
        </div>

        {/* Middle Typography Block */}
        <div className="mobile-event-content">
          {/* Border-free status label with clean space beneath it */}
          <span className="mobile-status-label">{upcomingEvent.status}</span>

          {/* Animated SVG stroke drawing for illuminate on mobile */}
          <div className="mobile-title-wrap">
            <svg
              className="mobile-event-svg-title"
              viewBox="0 0 840 170"
              role="img"
              aria-label={upcomingEvent.name}
            >
              <defs>
                <linearGradient id={mobileGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#dbeafe" />
                  <stop offset="70%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <text
                x="420"
                y="125"
                textAnchor="middle"
                textLength="800"
                lengthAdjust="spacingAndGlyphs"
                fill={`url(#${mobileGradId})`}
                stroke={`url(#${mobileGradId})`}
                strokeWidth="2"
                className="mobile-event-draw-outline"
              >
                {upcomingEvent.name}
              </text>
            </svg>
          </div>

          {/* Sleek Edition Accent */}
          <div className="mobile-edition-accent">
            <span className="edition-line line-left" aria-hidden="true" />
            <span className="edition-text">{upcomingEvent.theme}</span>
            <span className="edition-line line-right" aria-hidden="true" />
          </div>

          {/* Vertical N-E-C Insignia Block */}
          <div className="mobile-nec-vertical-crest">
            <div className="nec-stacked-letters" aria-label={upcomingEvent.verticalAcronym.join('')}>
              {upcomingEvent.verticalAcronym.map((char, index) => (
                <span key={index} className="nec-char">{char}</span>
              ))}
            </div>
            <div className="nec-vertical-divider" aria-hidden="true" />
            <div className="nec-text-credentials">
              <span className="nec-team-line">{upcomingEvent.teamLabel} · {upcomingEvent.organization}</span>
              <span className="nec-challenge-line">{upcomingEvent.challengeSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Bottom Ship Emblem */}
        <div className="mobile-event-media-bottom">
          <div className="mobile-ship-wrapper">
            <img
              className="mobile-ship-img"
              src={upcomingEvent.secondaryArtwork}
              alt={upcomingEvent.secondaryArtworkAlt}
              width="110"
              height="110"
              decoding="async"
            />
            <div className="mobile-ship-glow" />
          </div>
        </div>
      </div>
    </div>
  );
}
