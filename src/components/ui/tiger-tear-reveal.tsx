"use client"

import * as React from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

/** Scroll-driven paper tear revealing the upcoming event. */
export interface TigerTearRevealProps {
  /** The big word that gets torn. */
  word?: string
  /** Small line above the word. Empty hides it. */
  tagline?: string
  /** Word colour. */
  ink?: string
  /** Optional purple/violet headline gradient. */
  inkGradient?: [string, string]
  /** Paper colour, the sheet that tears. */
  paper?: string
  /** Tagline colour. */
  taglineColor?: string
  /** Font stack for the word. It is stretched to a fixed width, so any bold face fits. */
  fontFamily?: string
  /** Height of the pinned stage. A definite length, never a percentage. */
  height?: string
  /** Extra scroll distance the tear plays over, on top of `height`. */
  scrollDistance?: string
  /** 0..1. Drive the tear yourself instead of from scroll (1 = fully torn). */
  progress?: number
  /** Show the "scroll" hint before the tear starts. */
  hint?: boolean
  /** Extra root class names. */
  className?: string
  /** Content overlaid on the pinned stage, e.g. a caption and navigation. */
  children?: React.ReactNode
  /** Space reserved for a persistent site header. */
  topOffset?: string
  revealArtwork: () => React.ReactNode
  revealLabel?: string
  paperArtwork?: React.ReactNode
}

// #region tear
export type Pt = [number, number]

/** Seeded PRNG (mulberry32), so the tear are the same every visit. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp01 = (x: number) => (x <= 0 ? 0 : x > 1 ? 1 : x)

export function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** How far through the pinned scroll we are: 0 at the top, 1 when the stage lets go. */
export function scrollProgress(top: number, height: number, viewport: number) {
  const range = height - viewport
  if (range <= 0) return top <= 0 ? 1 : 0
  return clamp01(-top / range)
}

/** One scroll value drives the tear. */
export function stages(p: number) {
  return {
    crack: smooth(0.03, 0.2, p), // a crack runs out from the middle of the word
    open: smooth(0.18, 0.62, p), // the sheet tears and the halves pull apart
    shake: smooth(0.16, 0.22, p) * (1 - smooth(0.26, 0.36, p)), // the jolt of the rip
  }
}

/**
 * The tear, left to right across the whole sheet: a slight rising diagonal,
 * a slow wander, fine fibres and the odd big tooth. `x` always increases.
 */
export function tearLine(seed = 11, from = -800, to = 1800, step = 9, cx = 500, cy = 318, angle = -7): Pt[] {
  const r = rng(seed)
  const slope = Math.tan((angle * Math.PI) / 180)
  const out: Pt[] = []
  for (let x = from; x <= to; x += step) {
    const fibre = (r() - 0.5) * 5
    const tooth = r() < 0.09 ? (r() - 0.5) * 26 : 0
    const wander = Math.sin(x * 0.019 + seed) * 10 + Math.sin(x * 0.053 + seed * 2) * 4
    out.push([x, cy + (x - cx) * slope + wander + fibre + tooth])
  }
  return out
}

/** Where each half goes as the tear opens. Both are still at open = 0. */
export function pieceMotion(open: number) {
  return {
    top: { dx: -10 * open, dy: -82 * open, rot: -2.6 * open },
    bottom: { dx: 12 * open, dy: 78 * open, rot: 2.1 * open },
  }
}

/** Width of the white paper core exposed along a torn edge. */
export function fibreWidths(n: number, open: number, seed = 5) {
  const r = rng(seed)
  const k = Math.min(1, open * 4)
  return Array.from({ length: n }, (_, i) => k * (2.5 + 6 * (0.5 + 0.5 * Math.sin(i * 0.37 + seed)) * (0.6 + r() * 0.8)))
}
// #endregion

// ---------------------------------------------------------------- geometry

const VIEW_W = 1000
const CX = 500
const CY = 318
const FAR = 4000 // the paper halves reach well past any screen
// the visible frame: cropped to the artwork, with room for the halves to part
const d = (pts: Pt[], close = true) =>
  "M" + pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + (close ? "Z" : "")

// ---------------------------------------------------------------- the paper

// Where the paper curls back over the gap: [x along the tear, half-width, depth].
const CURLS: Record<"top" | "bottom", [number, number, number][]> = {
  top: [
    [300, 44, 30],
    [575, 30, 20],
    [790, 52, 34],
  ],
  bottom: [
    [205, 50, 32],
    [470, 34, 22],
    [690, 40, 28],
  ],
}

const Half = React.memo(function Half({
  id,
  side,
  line,
  open,
  children,
}: {
  id: string
  side: "top" | "bottom"
  line: Pt[]
  open: number
  children: React.ReactNode
}) {
  const up = side === "top"
  const m = pieceMotion(open)[side]
  const shape = up
    ? [[line[0][0], -FAR] as Pt, [line[line.length - 1][0], -FAR] as Pt, ...[...line].reverse()]
    : [...line, [line[line.length - 1][0], FAR] as Pt, [line[0][0], FAR] as Pt]
  const widths = fibreWidths(line.length, open, up ? 5 : 8)
  // the white paper core along the edge, on this half's side of it
  const core = line.concat(line.map(([x, y], i) => [x, y + (up ? -widths[i] : widths[i])] as Pt).reverse())
  const curls = CURLS[side].map(([cx, hw, depth]) => {
    const pts = line.filter(([x]) => Math.abs(x - cx) <= hw)
    const back = pts.map(([x, y]) => {
      const s = Math.cos(((x - cx) / hw) * (Math.PI / 2))
      return [x + (up ? 6 : -6) * s * open, y + (up ? 1 : -1) * depth * s * s * Math.min(1, open * 2.5)] as Pt
    })
    return d(pts.concat(back.reverse()))
  })
  const transform =
    "translate(" + m.dx.toFixed(2) + " " + m.dy.toFixed(2) + ") rotate(" + m.rot.toFixed(3) + " " + CX + " " + CY + ")"
  const clip = id + "-" + side
  return (
    <g transform={transform}>
      {/* the half's shadow on the revealed artwork */}
      {open > 0 ? (
        <path
          d={d(line, false)}
          fill="none"
          stroke="var(--theme-black)"
          strokeOpacity={0.55 * Math.min(1, open * 3)}
          strokeWidth={22}
          transform={"translate(0 " + (up ? 10 : -10) + ")"}
          filter={"url(#" + id + "-soft)"}
        />
      ) : null}
      <clipPath id={clip}>
        <path d={d(shape)} />
      </clipPath>
      <g clipPath={"url(#" + clip + ")"}>{children}</g>
      {open > 0 ? (
        <>
          <path d={d(core)} fill="var(--theme-white)" />
          {curls.map((c, i) => (
            <path key={i} d={c} fill={"url(#" + id + "-curl-" + side + ")"} stroke="var(--theme-white)" strokeWidth={1} />
          ))}
        </>
      ) : null}
    </g>
  )
})

// ---------------------------------------------------------------- component

export default function TigerTearReveal({
  word = "COURAGE",
  tagline = "HAVE NO FEAR",
  ink = "var(--event-red)",
  inkGradient,
  paper = "var(--brand-light-90)",
  taglineColor = "var(--neutral-light-10)",
  fontFamily = '"Anton", Impact, "Bebas Neue", "Oswald", "Arial Narrow", "Arial Black", sans-serif',
  height = "100svh",
  scrollDistance = "160svh",
  progress,
  hint = true,
  className = "",
  children,
  topOffset = "0px",
  revealArtwork,
  revealLabel = 'featured artwork',
  paperArtwork,
}: TigerTearRevealProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const [lite, setLite] = React.useState(() => window.matchMedia('(max-width: 760px), (pointer: coarse)').matches)
  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 760px), (pointer: coarse)')
    const update = () => setLite(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const [frameBox, setFrameBox] = React.useState({ x: 36, y: 44, width: 928, height: 468 })
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const resize = () => {
      if (!stage.clientWidth || !stage.clientHeight) return
      const aspect = stage.clientWidth / stage.clientHeight
      const width = Math.max(928, 468 * aspect)
      const height = width / aspect
      setFrameBox({ x: CX - width / 2, y: 278 - height / 2, width, height })
    }
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()
    return () => observer.disconnect()
  }, [])
  const reduced = useReducedMotion()
  const id = "ttr" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const line = React.useMemo(() => tearLine(), [])
  const [p, setProgress] = React.useState(progress ?? 0)
  const controlled = progress !== undefined
  const cfg = React.useRef({ progress, controlled })
  cfg.current = { progress, controlled }

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    if (reduced) {
      setProgress(progress ?? 0)
      return
    }
    let raf = 0
    let visible = false
    let p = cfg.current.progress ?? 0
    let last = p
    let dirty = true
    let scrollTarget = 0
    function invalidate() { dirty = true; resume() }
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      resume()
    })
    io.observe(stage)

    function resume() {
      if (document.hidden || !visible) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) raf = requestAnimationFrame(tick)
    }
    document.addEventListener("visibilitychange", resume)

    function tick() {
      raf = 0
      if (!visible || document.hidden) return
      const c = cfg.current
      if (dirty) {
        scrollTarget = scrollProgress(root!.getBoundingClientRect().top - parseFloat(getComputedStyle(stage!).top || '0'), root!.offsetHeight, stage!.offsetHeight)
        dirty = false
      }
      const target = c.controlled
        ? clamp01(c.progress ?? 0)
        : scrollTarget
      p += (target - p) * 0.14
      if (Math.abs(target - p) < 0.0005) p = target
      if (Math.abs(p - last) > 1e-4 || p === target && last !== p) {
        last = p
        setProgress(p)
      }
      if (p !== target) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener("visibilitychange", resume)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [reduced, lite, reduced ? progress : undefined])

  const s = stages(p)
  const shake = reduced || lite ? 0 : Math.sin(p * 900) * 6 * s.shake
  const crackReach = s.crack * 620
  const crack = line.filter(([x]) => Math.abs(x - CX) <= crackReach)

  const sheet = React.useMemo(() => (
    <>
      <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill={paper} />
      {lite ? <rect x={frameBox.x} y={frameBox.y} width={frameBox.width} height={frameBox.height} fill={`url(#${id}-mobile-paper)`} /> : paperArtwork && <foreignObject x={frameBox.x} y={frameBox.y} width={frameBox.width} height={frameBox.height}>{paperArtwork}</foreignObject>}
      {tagline ? (
        <text
          x={CX}
          y={150}
          textAnchor="middle"
          fill={taglineColor}
          style={{ font: '600 27px "Manrope Variable", Arial, sans-serif', letterSpacing: "0.32em" }}
        >
          {tagline}
        </text>
      ) : null}
      <text
        x={CX}
        y={404}
        textAnchor="middle"
        textLength={880}
        lengthAdjust="spacingAndGlyphs"
        fill={inkGradient ? `url(#${id}-ink)` : ink}
        style={{ fontFamily, fontSize: 250, fontWeight: 400, letterSpacing: 0 }}
      >
        {word}
      </text>
    </>
  ), [paper, paperArtwork, frameBox, tagline, taglineColor, inkGradient, id, ink, fontFamily, word, lite])

  return (
    <section
      ref={rootRef}
      data-tear-progress={p.toFixed(3)}
      className={"relative w-full " + className}
      style={{ height: controlled || reduced ? height : "calc(" + height + " + " + scrollDistance + ")", background: paper, overflow: "clip" }}
    >
      <div
        ref={stageRef}
        className={`tiger-stage sticky w-full overflow-hidden${lite ? ' hero-lite' : ''}`}
        style={{ height, top: topOffset }}
      >
        <svg
          viewBox={`${frameBox.x} ${frameBox.y} ${frameBox.width} ${frameBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={(tagline ? tagline + ". " : "") + word + `, opening to reveal ${revealLabel}.`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", display: "block" }}
        >
          <defs>
            <linearGradient id={`${id}-mobile-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--neutral-light-10)" /><stop offset=".6" stopColor={paper} /><stop offset="1" stopColor="var(--brand-dark-80)" /></linearGradient>
            {inkGradient && <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={inkGradient[0]} /><stop offset="1" stopColor={inkGradient[1]} /></linearGradient>}
            <linearGradient id={id + "-curl-top"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--theme-white)" />
              <stop offset="1" stopColor="var(--brand-light-75)" />
            </linearGradient>
            <linearGradient id={id + "-curl-bottom"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--theme-white)" />
              <stop offset="1" stopColor="var(--brand-light-75)" />
            </linearGradient>
            <filter id={id + "-soft"} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <g transform={"translate(" + shake.toFixed(2) + " " + (shake * 0.4).toFixed(2) + ")"}>
            {s.open > .8 && (
              <foreignObject x="270" y="245" width="610" height="155" opacity={Math.min(1, (s.open - .8) / .2)}>
                {revealArtwork()}
              </foreignObject>
            )}

            {/* the sheet: whole until it tears (two clipped halves leave a hairline seam),
                then in two halves that part along the tear */}
            {s.open > 0 ? (
              <>
                <Half id={id} side="top" line={line} open={s.open * 1.55}>
                  {sheet}
                </Half>
                <Half id={id} side="bottom" line={line} open={s.open * 1.55}>
                  {sheet}
                </Half>
              </>
            ) : (
              sheet
            )}

            {/* the crack, running out from the middle before it gives way */}
            {s.crack > 0 && s.open < 0.15 && crack.length > 1 ? (
              <path d={d(crack, false)} fill="none" stroke="var(--brand-dark-75)" strokeWidth={2.4} strokeLinejoin="bevel" opacity={1 - s.open / 0.15} />
            ) : null}
          </g>
        </svg>

        {hint && !controlled ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em]"
            style={{ color: taglineColor, opacity: Math.max(0, 0.7 - s.crack * 3) }}
          >
            scroll
            <span className="block h-6 w-px animate-pulse motion-reduce:animate-none" style={{ background: taglineColor }} />
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}
