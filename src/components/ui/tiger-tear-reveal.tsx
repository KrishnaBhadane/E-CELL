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
    crack: smooth(0.03, 0.2, p), // a crack runs out from the middle
    open: smooth(0.18, 0.62, p), // the sheet tears and the halves pull apart
    shake: smooth(0.16, 0.22, p) * (1 - smooth(0.26, 0.36, p)), // the jolt of the rip
  }
}

/** Horizontal tear: left to right */
export function tearLineH(seed = 11, from = -800, to = 1800, step = 9, cx = 500, cy = 318, angle = -7): Pt[] {
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

/** Vertical tear: top to bottom */
export function tearLineV(seed = 11, from = -1000, to = 2400, step = 10, cx = 270, cy = 550, angle = 2): Pt[] {
  const r = rng(seed)
  const slope = Math.tan((angle * Math.PI) / 180)
  const out: Pt[] = []
  for (let y = from; y <= to; y += step) {
    const fibre = (r() - 0.5) * 5
    const tooth = r() < 0.08 ? (r() - 0.5) * 24 : 0
    const wander = Math.sin(y * 0.016 + seed) * 10 + Math.sin(y * 0.048 + seed * 2) * 4
    out.push([cx + (y - cy) * slope + wander + fibre + tooth, y])
  }
  return out
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
const FAR = 4000
const d = (pts: Pt[], close = true) =>
  "M" + pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + (close ? "Z" : "")

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

type HalfUpdater = React.MutableRefObject<((open: number) => void) | null>

const Half = React.memo(function Half({ id, side, line, updateRef, children, isVertical = false, cx = CX, cy = CY }: {
  id: string
  side: "top" | "bottom" | "left" | "right"
  line: Pt[]
  updateRef: HalfUpdater
  children: React.ReactNode
  isVertical?: boolean
  cx?: number
  cy?: number
}) {
  const group = React.useRef<SVGGElement>(null)
  const edge = React.useRef<SVGPathElement>(null)
  const core = React.useRef<SVGPathElement>(null)
  const curlsRef = React.useRef<(SVGPathElement | null)[]>([])
  const up = side === "top" || side === "left"
  const geometry = React.useMemo(() => {
    const shape: Pt[] = isVertical
      ? [[up ? -FAR : FAR, line[0][1]], ...line, [up ? -FAR : FAR, line[line.length - 1][1]]]
      : up ? [[line[0][0], -FAR], [line[line.length - 1][0], -FAR], ...[...line].reverse()]
        : [...line, [line[line.length - 1][0], FAR], [line[0][0], FAR]]
    const curls = isVertical ? [] : CURLS[side as "top" | "bottom"].map(([center, width, depth]) => {
      const pts = line.filter(([x]) => Math.abs(x - center) <= width)
      return { pts, depth, factors: pts.map(([x]) => Math.cos(((x - center) / width) * Math.PI / 2)) }
    })
    return { shape: d(shape), line: d(line, false), widths: fibreWidths(line.length, 1, up ? 5 : 8), curls }
  }, [line, isVertical, side, up])

  React.useLayoutEffect(() => {
    let lastOpen = -1
    let lastWidth = -1
    updateRef.current = open => {
      if (open === lastOpen || !group.current) return
      lastOpen = open
      const dx = isVertical ? (up ? -108 : 108) : (up ? -10 : 12)
      const dy = isVertical ? (up ? -6 : 6) : (up ? -82 : 78)
      const rotation = isVertical ? (up ? -2.8 : 2.8) : (up ? -2.6 : 2.1)
      group.current.setAttribute('transform', `translate(${(dx * open).toFixed(2)} ${(dy * open).toFixed(2)}) rotate(${(rotation * open).toFixed(3)} ${cx} ${cy})`)
      edge.current?.setAttribute('stroke-opacity', String((isVertical ? 0.6 : 0.55) * Math.min(1, open * 3)))
      const width = Math.min(1, open * 4)
      if (width !== lastWidth) {
        lastWidth = width
        const back = line.map(([x, y], i): Pt => isVertical
          ? [x + (up ? -1 : 1) * geometry.widths[i] * width, y]
          : [x, y + (up ? -1 : 1) * geometry.widths[i] * width])
        core.current?.setAttribute('d', d(line.concat(back.reverse())))
      }
      geometry.curls.forEach(({ pts, depth, factors }, i) => {
        const back = pts.map(([x, y], j): Pt => [x + (up ? 6 : -6) * factors[j] * open, y + (up ? 1 : -1) * depth * factors[j] ** 2 * Math.min(1, open * 2.5)])
        curlsRef.current[i]?.setAttribute('d', d(pts.concat(back.reverse())))
      })
    }
    return () => { updateRef.current = null }
  }, [geometry, line, isVertical, up, cx, cy, updateRef])

  const clip = id + '-' + side
  return <g ref={group}>
    <path ref={edge} d={geometry.line} fill="none" stroke="var(--theme-black, #000)" strokeOpacity={0} strokeWidth={22}
      transform={isVertical ? `translate(${up ? -10 : 10} 0)` : `translate(0 ${up ? 10 : -10})`} filter={`url(#${id}-soft)`} />
    <clipPath id={clip}><path d={geometry.shape} /></clipPath>
    <g clipPath={`url(#${clip})`}>{children}</g>
    <path ref={core} fill="var(--theme-white, #fff)" />
    {geometry.curls.map((_, i) => <path key={i} ref={element => { curlsRef.current[i] = element }} fill={`url(#${id}-curl-${side})`} stroke="var(--theme-white, #fff)" strokeWidth={1} />)}
  </g>
})

export default function TigerTearReveal({
  word = "RCPIT",
  tagline = "ENTREPRENEURSHIP CELL",
  ink = "#ffffff",
  inkGradient,
  paper = "var(--neutral-dark-55, #07090e)",
  taglineColor = "var(--theme-white, #ffffff)",
  fontFamily = '"Anton", Impact, "Bebas Neue", "Oswald", "Arial Narrow", "Arial Black", sans-serif',
  height = "100svh",
  scrollDistance = "120svh",
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
  const [isVertical, setIsVertical] = React.useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth <= 768 || window.matchMedia("(max-width: 768px)").matches
  })
  const [frameBox, setFrameBox] = React.useState({ x: 36, y: 44, width: 928, height: 468 })

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const resize = () => {
      if (!stage.clientWidth || !stage.clientHeight) return
      const aspect = stage.clientWidth / stage.clientHeight
      const vertical = stage.clientWidth <= 768 || aspect < 0.75
      setIsVertical(vertical)

      if (vertical) {
        const width = 540
        const h = width / aspect
        setFrameBox({ x: 0, y: 0, width, height: h })
      } else {
        const width = Math.max(928, 468 * aspect)
        const h = width / aspect
        setFrameBox({ x: CX - width / 2, y: 278 - h / 2, width, height: h })
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()
    return () => observer.disconnect()
  }, [])

  const reduced = useReducedMotion()
  const id = "ttr" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const curCX = isVertical ? frameBox.width / 2 : CX
  const curCY = isVertical ? frameBox.height / 2 : 278

  const line = React.useMemo(() => {
    if (isVertical) {
      return tearLineV(11, -1000, 2400, 10, curCX, curCY)
    }
    return tearLineH(11, -800, 1800, 9, CX, CY)
  }, [isVertical, curCX, curCY])

  const latestProgress = React.useRef(progress ?? 0)
  const renderProgress = React.useRef<(value: number) => void>(() => {})
  const halfA = React.useRef<((open: number) => void) | null>(null)
  const halfB = React.useRef<((open: number) => void) | null>(null)
  const shakeRef = React.useRef<SVGGElement>(null)
  const sheetRef = React.useRef<SVGGElement>(null)
  const halvesRef = React.useRef<SVGGElement>(null)
  const artworkRef = React.useRef<SVGForeignObjectElement>(null)
  const crackRef = React.useRef<SVGPathElement>(null)
  const hintRef = React.useRef<HTMLDivElement>(null)
  const [artworkReady, setArtworkReady] = React.useState(false)
  const artwork = React.useMemo(() => artworkReady ? revealArtwork() : null, [artworkReady, revealArtwork])
  const controlled = progress !== undefined
  const cfg = React.useRef({ progress, controlled })
  cfg.current = { progress, controlled }

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    if (reduced) {
      renderProgress.current(progress ?? 0)
      return
    }
    let raf = 0
    let visible = false
    let currentP = latestProgress.current
    let last = currentP
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
      currentP += (target - currentP) * 0.14
      if (Math.abs(target - currentP) < 0.0005) currentP = target
      if (Math.abs(currentP - last) > 1e-4 || (currentP === target && last !== currentP)) {
        last = currentP
        renderProgress.current(currentP)
      }
      if (currentP !== target) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener("visibilitychange", resume)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [reduced, progress, frameBox])

  React.useLayoutEffect(() => {
    let previousCrack = ''
    renderProgress.current = value => {
      latestProgress.current = value
      rootRef.current?.setAttribute('data-tear-progress', value.toFixed(3))
      const stage = stages(value)
      const shake = reduced ? 0 : Math.sin(value * 900) * 6 * stage.shake
      shakeRef.current?.setAttribute('transform', isVertical
        ? `translate(${(shake * 0.4).toFixed(2)} ${shake.toFixed(2)})`
        : `translate(${shake.toFixed(2)} ${(shake * 0.4).toFixed(2)})`)
      if (sheetRef.current) sheetRef.current.style.display = stage.open > 0 ? 'none' : ''
      if (halvesRef.current) halvesRef.current.style.display = stage.open > 0 ? '' : 'none'
      halfA.current?.(stage.open * 1.55)
      halfB.current?.(stage.open * 1.55)
      if ((stage.open > 0.15) !== artworkReady) setArtworkReady(stage.open > 0.15)
      if (artworkRef.current) {
        artworkRef.current.style.display = stage.open > 0.15 ? '' : 'none'
        artworkRef.current.setAttribute('opacity', String(clamp01((stage.open - 0.15) / 0.45)))
      }
      if (crackRef.current) {
        const showing = stage.crack > 0 && stage.open < 0.15
        crackRef.current.style.display = showing ? '' : 'none'
        if (showing) {
          const reach = stage.crack * 640
          const points = line.filter(([x, y]) => isVertical ? Math.abs(y - curCY) <= reach : Math.abs(x - CX) <= reach)
          const path = points.length > 1 ? d(points, false) : ''
          if (path !== previousCrack) { crackRef.current.setAttribute('d', path); previousCrack = path }
          crackRef.current.setAttribute('opacity', String(1 - stage.open / 0.15))
        }
      }
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 0.7 - stage.crack * 3))
    }
    renderProgress.current(latestProgress.current)
  }, [line, isVertical, curCY, reduced, artworkReady, frameBox])

  const sheet = React.useMemo(() => {
    if (isVertical) {
      const letters = word.split("")
      const numLetters = letters.length
      const letterStep = Math.min(128, (frameBox.height * 0.54) / numLetters)
      const startY = curCY - ((numLetters - 1) * letterStep) / 2

      return (
        <>
          <rect x={-FAR} y={-FAR} width={FAR * 2} height={FAR * 2} fill={paper} />

          {/* Glowing Ambient Radial Backdrop */}
          <radialGradient id={`${id}-mob-aura`} cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.32)" />
            <stop offset="50%" stopColor="rgba(15, 23, 42, 0.85)" />
            <stop offset="100%" stopColor="#07090e" />
          </radialGradient>
          <rect x={frameBox.x} y={frameBox.y} width={frameBox.width} height={frameBox.height} fill={`url(#${id}-mob-aura)`} />

          {/* Blueprint Grid Lines Pattern */}
          <defs>
            <pattern id={`${id}-mob-grid`} width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1" fill="rgba(59, 130, 246, 0.3)" />
            </pattern>
          </defs>
          <rect x={frameBox.x} y={frameBox.y} width={frameBox.width} height={frameBox.height} fill={`url(#${id}-mob-grid)`} />

          {/* Concentric Cyber Rings */}
          <circle cx={curCX} cy={curCY} r="220" stroke="rgba(59, 130, 246, 0.22)" strokeWidth="1" strokeDasharray="6 6" fill="none" />
          <circle cx={curCX} cy={curCY} r="340" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="12 12" fill="none" />
          <circle cx={curCX} cy={curCY} r="460" stroke="rgba(37, 99, 235, 0.12)" strokeWidth="1" fill="none" />

          {/* Corner Tech Brackets */}
          <g stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2">
            <path d={`M ${frameBox.x + 24} ${frameBox.y + 20} L ${frameBox.x + 24} ${frameBox.y + 36} M ${frameBox.x + 16} ${frameBox.y + 28} L ${frameBox.x + 32} ${frameBox.y + 28}`} />
            <path d={`M ${frameBox.x + frameBox.width - 24} ${frameBox.y + 20} L ${frameBox.x + frameBox.width - 24} ${frameBox.y + 36} M ${frameBox.x + frameBox.width - 32} ${frameBox.y + 28} L ${frameBox.x + frameBox.width - 16} ${frameBox.y + 28}`} />
            <path d={`M ${frameBox.x + 24} ${frameBox.y + frameBox.height - 24} L ${frameBox.x + 24} ${frameBox.y + frameBox.height - 8} M ${frameBox.x + 16} ${frameBox.y + frameBox.height - 16} L ${frameBox.x + 32} ${frameBox.y + frameBox.height - 16}`} />
            <path d={`M ${frameBox.x + frameBox.width - 24} ${frameBox.y + frameBox.height - 24} L ${frameBox.x + frameBox.width - 24} ${frameBox.y + frameBox.height - 8} M ${frameBox.x + frameBox.width - 32} ${frameBox.y + frameBox.height - 16} L ${frameBox.x + frameBox.width - 16} ${frameBox.y + frameBox.height - 16}`} />
          </g>

          {/* Side Metadata Rails (Vertical text) */}
          <text
            x={frameBox.x + 22}
            y={curCY}
            fill="rgba(148, 163, 184, 0.42)"
            transform={`rotate(-90 ${frameBox.x + 22} ${curCY})`}
            textAnchor="middle"
            style={{ font: '600 10px monospace', letterSpacing: '0.28em' }}
          >
            // E-CELL RCPIT • INNOVATION HUB • EST. 2026 //
          </text>
          <text
            x={frameBox.x + frameBox.width - 22}
            y={curCY}
            fill="rgba(148, 163, 184, 0.42)"
            transform={`rotate(90 ${frameBox.x + frameBox.width - 22} ${curCY})`}
            textAnchor="middle"
            style={{ font: '600 10px monospace', letterSpacing: '0.28em' }}
          >
            // LAT 21.31° N • LONG 74.88° E • SHIRPUR //
          </text>

          {/* Top Tagline Badge — Highlighted Size & Position */}
          {tagline && (
            <g>
              <rect
                x={curCX - 165}
                y={startY - 106}
                width="330"
                height="42"
                rx="21"
                fill="rgba(8, 12, 22, 0.92)"
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth="1.5"
              />
              <text
                x={curCX}
                y={startY - 80}
                textAnchor="middle"
                fill={taglineColor}
                style={{ font: '700 12.5px "Manrope Variable", sans-serif', letterSpacing: '0.22em' }}
              >
                {tagline.includes("ENTREPRENEURSHIP CELL") ? (
                  <>
                    {tagline.startsWith("THE ") && (
                      <tspan fill="rgba(255, 255, 255, 0.85)">THE </tspan>
                    )}
                    <tspan fill={taglineColor}>ENTRE</tspan>
                    <tspan fill="var(--blue-bright, #3b82f6)">PRENEUR</tspan>
                    <tspan fill={taglineColor}>SHIP CELL</tspan>
                  </>
                ) : (
                  tagline
                )}
              </text>
            </g>
          )}

          {/* Giant Vertical Letters (R C P I T) */}
          {letters.map((char, index) => {
            const charY = startY + index * letterStep
            return (
              <text
                key={index}
                x={curCX}
                y={charY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={inkGradient ? `url(#${id}-ink)` : ink}
                style={{
                  fontFamily,
                  fontSize: Math.min(148, letterStep * 1.18),
                  fontWeight: 400,
                  letterSpacing: 0,
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.65))',
                }}
              >
                {char}
              </text>
            )
          })}

          {/* Bottom Tech Subtitle */}
          <text
            x={curCX}
            y={startY + (numLetters - 1) * letterStep + 78}
            textAnchor="middle"
            fill="rgba(148, 163, 184, 0.65)"
            style={{ font: '600 10px monospace', letterSpacing: '0.26em' }}
          >
            STUDENT STARTUP INCUBATOR
          </text>
        </>
      )
    }

    // Horizontal Desktop Mode
    return (
      <>
        <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill={paper} />
        {paperArtwork && (
          <foreignObject x={frameBox.x} y={frameBox.y} width={frameBox.width} height={frameBox.height}>
            {paperArtwork}
          </foreignObject>
        )}
        {tagline ? (
          <text
            x={CX}
            y={162}
            textAnchor="middle"
            fill={taglineColor}
            style={{ font: '700 32px "Manrope Variable", Arial, sans-serif', letterSpacing: "0.34em" }}
          >
            {tagline.includes("ENTREPRENEURSHIP CELL") ? (
              <>
                {tagline.startsWith("THE ") && (
                  <tspan fill="rgba(255, 255, 255, 0.85)">THE </tspan>
                )}
                <tspan fill={taglineColor}>ENTRE</tspan>
                <tspan fill="var(--blue-bright)">PRENEUR</tspan>
                <tspan fill={taglineColor}>SHIP CELL</tspan>
              </>
            ) : (
              tagline
            )}
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
    )
  }, [isVertical, word, frameBox, curCX, curCY, paper, id, tagline, taglineColor, inkGradient, ink, fontFamily, paperArtwork])

  return (
    <section
      ref={rootRef}
      data-tear-progress={latestProgress.current.toFixed(3)}
      className={"relative w-full " + className}
      style={{ height: controlled || reduced ? height : "calc(" + height + " + " + scrollDistance + ")", background: paper, overflow: "clip" }}
    >
      <div
        ref={stageRef}
        className="tiger-stage sticky w-full overflow-hidden"
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
            {inkGradient && (
              <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={inkGradient[0]} />
                <stop offset="42%" stopColor={inkGradient[0]} />
                <stop offset="100%" stopColor={inkGradient[1]} />
              </linearGradient>
            )}
            <linearGradient id={id + "-curl-top"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--theme-white)" />
              <stop offset="1" stopColor="var(--brand-light-75)" />
            </linearGradient>
            <linearGradient id={id + "-curl-bottom"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--theme-white)" />
              <stop offset="1" stopColor="var(--brand-light-75)" />
            </linearGradient>
            <filter id={id + "-soft"} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <g ref={shakeRef}>
            {/* 100% Solid Pitch Black Inside Background behind Tear */}
            <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill="#000000" />

            {artworkReady && (
              <foreignObject ref={artworkRef}
                x={isVertical ? curCX - 170 : 270}
                y={isVertical ? curCY - Math.min(420, frameBox.height * 0.38) : 235}
                width={isVertical ? 340 : 610}
                height={isVertical ? Math.min(840, frameBox.height * 0.76) : 165}
                opacity={0}
              >
                {artwork}
              </foreignObject>
            )}

            <g ref={sheetRef}>{sheet}</g>
            <g ref={halvesRef} style={{ display: 'none' }}>
              <Half id={id} side={isVertical ? 'left' : 'top'} line={line} updateRef={halfA} isVertical={isVertical} cx={curCX} cy={isVertical ? curCY : CY}>{sheet}</Half>
              <Half id={id} side={isVertical ? 'right' : 'bottom'} line={line} updateRef={halfB} isVertical={isVertical} cx={curCX} cy={isVertical ? curCY : CY}>{sheet}</Half>
            </g>
            <path ref={crackRef} fill="none" stroke="var(--brand-dark-75, #1d4ed8)" strokeWidth={isVertical ? 3 : 2.4} strokeLinejoin="bevel" style={{ display: 'none' }} />

          </g>
        </svg>

        {hint && !controlled ? (
          <div
            ref={hintRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em]"
            style={{ color: taglineColor, opacity: 0.7 }}
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
