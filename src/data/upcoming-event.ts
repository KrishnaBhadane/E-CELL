/**
 * ============================================================================
 * E-CELL RCPIT — REVEALED EVENT CONFIGURATION
 * ============================================================================
 * THIS FILE IS FULLY EDITABLE!
 * To change the event shown inside the torn paper section, simply edit the
 * fields below. Both desktop and mobile views will update automatically.
 */

export interface UpcomingEventConfig {
  /** Event status label (e.g. "RECENTLY CONCLUDED", "UPCOMING EVENT", "REGISTRATION OPEN") */
  status: string;

  /** Main event title (e.g. "illuminate", "eureka", "innovate") */
  name: string;

  /** Edition / Theme subtitle (e.g. "ONE PIECE EDITION", "GEN-AI SUMMIT") */
  theme: string;

  /** Edition badge tag on artwork card (e.g. "EDITION 2026") */
  editionYearTag: string;

  /** Primary character / artwork image path */
  primaryArtwork: string;
  primaryArtworkAlt: string;

  /** Bottom emblem / ship / motif image path */
  secondaryArtwork: string;
  secondaryArtworkAlt: string;

  /** Vertical Acronym letters (e.g. ['N', 'E', 'C']) */
  verticalAcronym: string[];

  /** Team label next to vertical letters (e.g. "TEAM NEC") */
  teamLabel: string;

  /** Organization name (e.g. "E-CELL RCPIT") */
  organization: string;

  /** Subtitle challenge label */
  challengeSubtitle: string;

  /** Theme accent colors for SVG outline gradient */
  colors: [string, string];

  /** Legacy / external link */
  characterSource?: string;
  label?: string;
}

export const upcomingEvent: UpcomingEventConfig = {
  // Status Header (Border-free, clean typography)
  status: 'RECENTLY CONCLUDED',
  label: 'RECENTLY CONCLUDED',

  // Event Name & Edition
  name: 'illuminate',
  theme: 'ONE PIECE EDITION',
  editionYearTag: 'EDITION 2026',

  // Media Assets
  primaryArtwork: '/assets/events/luffy.jpg',
  primaryArtworkAlt: 'Monkey D. Luffy — Illuminate Character',
  secondaryArtwork: '/assets/events/one-piece-ship.svg',
  secondaryArtworkAlt: 'One Piece Ship Emblem',

  // Vertical Crest & Team Credential
  verticalAcronym: ['N', 'E', 'C'],
  teamLabel: 'TEAM NEC',
  organization: 'E-CELL RCPIT',
  challengeSubtitle: 'NATIONAL ENTREPRENEURSHIP CHALLENGE',

  // Colors
  colors: ['var(--theme-white)', 'var(--event-blue)'],
  characterSource: 'https://one-piece.com/character/luffy/index.html',
};
