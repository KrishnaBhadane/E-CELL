# E-Cell RCPIT

A minimal editorial website with a pale neutral background, black text, and purple/violet highlights.
The latest design uses the supplied Tiger Tear Reveal hero and sliding-pill navigation.

## Run

```sh
npm ci
npm run dev
npm run build
```

Use the local URL printed by Vite. The current review server is at
http://127.0.0.1:5180. `npm run preview` serves a production build.

## What is implemented

- Centered poster headline that tears open on scroll, revealing an interactive tiger.
- Liquid-glass buttons and pill navigation with an animated cursor on hover and keyboard focus.
- Anton headings, Manrope UI/body text, and Georgia Italic notes.
- A thin light trail below the header; no star graphics.
- Combined About and Impact section, a 40-member feature, and original botanical art.
- A lazy-loaded campus map with a separately accessible address and directions link.
- Mobile layouts, scroll reversal, and an explicit reveal button for reduced motion.

The original crystal hero has been replaced by the supplied tiger component.
No stock images or icon library are needed: both supplied components draw their own UI.

## Structure and shadcn setup

The project already uses React, Vite, and TypeScript. Tailwind CSS v4 and its Vite plugin,
Framer Motion, `clsx`, and `tailwind-merge` have been installed and configured.
No separate shadcn initialization is required for these supplied components.

- Reusable UI: `src/components/ui/` (import with `@/components/ui/...`).
- Page sections: `src/sections/`.
- Shared styles and Tailwind entry: `src/styles/global.css`.
- Component aliases: `components.json`, `tsconfig.json`, and `vite.config.ts`.
- Class-name helper: `src/lib/utils.ts`.

`src/components/ui` is the project's `/components/ui` directory because `@/` resolves
to `src/`. Keeping this path consistent lets shadcn components and their imports work
without rewriting each registry snippet. The pasted demo's `/components/blocks` import
has been corrected to the actual `/components/ui` location.

Future registry components can be added with, for example:

```sh
npx shadcn@latest add button
```

## Main files

- `src/components/ui/tiger-tear-reveal.tsx` — supplied SVG hero and scroll animation.
- `src/components/ui/nav-header.tsx` — supplied navigation adapted to real site anchors.
- `src/sections/Hero.tsx` — E-Cell copy, theme props, and reduced-motion controls.
- `src/components/Header.tsx` — wordmark, navigation, and light rail.
- `src/sections/About.tsx` — the combined About/Impact spread.
- `src/components/CampusMap.tsx` — location and map.
- `THIRD_PARTY_NOTICES.md` — component credits and license notices.

## Verification

```sh
npx playwright install chromium
npm test
```

Alternatively, set `CHROME_PATH` to an installed Chrome executable.
Tests cover the tear and reverse scroll, keyboard navigation, mobile overflow,
reduced-motion controls, and the map link. Build output is approximately 120 KB gzip
of JavaScript and 6 KB gzip of CSS; this is not a measured Core Web Vitals result.


## Current theme

The pale background (`#f4f4f2`) is a screen approximation of the earlier P 179-1 U
reference, not an official Pantone conversion. Shared accent, type, and glass styles
live in `src/styles/global.css` and `src/styles/glass.css`. The hero’s “Inside the cell”
link has been removed.
