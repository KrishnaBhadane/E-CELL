"use client"

import * as React from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

/*
 * Polaroid Line Carousel — instant photos pegged to a sagging string. Drag the
 * line (or use the arrows) and the prints slide along it, swinging on their
 * pegs with the speed you give them and settling back with a little
 * overshoot; even at rest they sway in a light breeze. The one in the middle
 * is the one you're looking at.
 */

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist"

export type Slide = {
  image?: string
  title?: string
  caption?: string
  alt?: string
  palette?: LandPalette
  seed?: number
}

export type PolaroidLineCarouselProps = {
  slides?: Slide[]
  /** Any CSS length. Default 100svh. */
  height?: number | string
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number
  /** How far the string sags in the middle, px. */
  sag?: number
  /** How much the prints swing; 0 holds them still. */
  swing?: number
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number
  /** Colour of the string and pegs. */
  string?: string
  background?: string
  ink?: string
  onChange?: (index: number) => void
  onCardClick?: (slide: Slide, index: number) => void
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  if (w <= 0) return y0
  const t = clamp(x / w, 0, 1)
  return y0 + 4 * sag * t * (1 - t)
}

/** One step of a critically damped spring toward target. */
export function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k)
  const nv = v + (k * (target - x) - c * v) * dt
  return [x + nv * dt, nv]
}

/** One step of a print's swing. lineVel is the prints' on-screen speed (px/s, + = moving right). */
export function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt
  return [clamp(a + nw * dt, -0.6, 0.6), nw]
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  if (n <= 1) return 0
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1))
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n)
}
// #endregion logic

const PL_CSS = `
.pl-root{position:relative;width:100%;overflow:hidden;background:var(--pl-bg);color:var(--pl-ink);user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none;cursor:grab}
.pl-root[data-drag='1']{cursor:grabbing}
.pl-root:focus-visible{box-shadow:inset 0 0 0 2px var(--pl-ink)}
.pl-string{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.pl-card{position:absolute;left:0;top:0;width:var(--pl-cw);transform-origin:50% 0;will-change:transform;cursor:pointer}
.pl-card{animation:pl-breeze 4.084s ease-in-out infinite alternate;animation-play-state:paused}
.pl-root[data-running='1'] .pl-card{animation-play-state:running}
@keyframes pl-breeze{from{rotate:calc(-1 * var(--pl-breeze))}to{rotate:var(--pl-breeze)}}
@media(prefers-reduced-motion:reduce){.pl-card{animation:none}}
.pl-print{margin-top:10px;background:#fbfaf7;padding:10px 10px 0;box-shadow:0 1px 2px rgba(0,0,0,.12),0 18px 30px -16px rgba(0,0,0,.4);transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s ease;border-radius:2px}
.pl-card[data-on='0'] .pl-print{transform:scale(.9);filter:saturate(.7) brightness(.96)}
.pl-card[data-on='1'] .pl-print{transform:scale(1.02);box-shadow:0 4px 8px rgba(0,0,0,.25),0 24px 44px -12px rgba(0,0,0,.65)}
.pl-shot{position:relative;aspect-ratio:1;overflow:hidden;background:#1e293b}
.pl-shot img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none}
.pl-note{height:46px;display:flex;align-items:center;justify-content:center;padding:0 6px;font:italic 400 15px/1.1 ui-serif,Georgia,'Times New Roman',serif;color:#3b3833;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-peg{position:absolute;left:50%;top:0;width:10px;height:26px;margin-left:-5px;border-radius:2px;background:linear-gradient(90deg,#c9a67a,#e3c9a1 45%,#b8915f);box-shadow:0 2px 3px rgba(0,0,0,.25)}
.pl-peg::after{content:'';position:absolute;left:4px;top:8px;width:2px;height:7px;background:rgba(80,60,30,.45);border-radius:1px}
.pl-bar{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);bottom:clamp(20px,4vh,40px);display:flex;align-items:center;gap:clamp(12px,2vw,24px);cursor:default}
.pl-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.15em}
.pl-cap>*{display:block;animation:pl-in .55s cubic-bezier(.2,.8,.2,1) both}
.pl-title{font:500 clamp(18px,2.2vw,26px)/1.15 ui-serif,Georgia,'Times New Roman',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-sub{margin-top:4px;font:400 13px/1.4 ui-sans-serif,system-ui,sans-serif;color:var(--pl-muted)}
.pl-count{font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;color:var(--pl-muted)}
.pl-count b{color:var(--pl-ink);font-weight:500}
.pl-btn{appearance:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--pl-line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:background .2s ease,color .2s ease}
.pl-btn:hover{background:var(--pl-ink);color:var(--pl-bg)}
.pl-btn:focus-visible{outline:2px solid var(--pl-ink);outline-offset:2px}
.pl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes pl-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.pl-cap>*{animation:none}.pl-print{transition:none}}
`

export default function PolaroidLineCarousel({
  slides = [],
  height = "100svh",
  cardWidth = 300,
  sag = 46,
  swing = 1,
  autoplay = 4500,
  string = "#8a7f72",
  background = "var(--color-background, #efece6)",
  ink = "var(--color-foreground, #161513)",
  onChange,
  onCardClick,
  className,
  style,
  ariaLabel = "Image carousel",
}: PolaroidLineCarouselProps) {
  const reduced = useReducedMotion()
  const wake = React.useRef(() => {})
  const visibleRef = React.useRef(false)
  const n = slides.length

  const [active, setActive] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)

  // Initialize size with accurate viewport width to avoid layout snap on mobile
  const [size, setSize] = React.useState(() => {
    const initW = typeof window !== "undefined" ? Math.min(window.innerWidth, 1400) : 1200
    const initCw = Math.round(Math.max(160, Math.min(cardWidth, initW * (initW < 640 ? 0.62 : 0.42), 650 * 0.48)))
    return { w: initW, h: 650, cw: initCw }
  })

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const pathRef = React.useRef<SVGPathElement | null>(null)
  const cards = React.useRef<(HTMLDivElement | null)[]>([])
  const sim = React.useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] })
  const drag = React.useRef<null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean }>(null)
  const lastTouch = React.useRef(0)
  const activeRef = React.useRef(0)
  const opts = React.useRef({ sag, swing })
  opts.current = { sag, swing }

  const spacing = size.cw * 1.08

  const goTo = React.useCallback(
    (i: number) => {
      if (n <= 0) return
      sim.current.target = clamp(i, 0, n - 1) * spacing
      wake.current()
    },
    [n, spacing],
  )

  // ResizeObserver: maintain correct container dimensions and card width
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const cw = Math.round(Math.max(160, Math.min(cardWidth, r.width * (r.width < 640 ? 0.62 : 0.42), r.height * 0.48)))
      setSize(prev => (prev.w === r.width && prev.h === r.height && prev.cw === cw ? prev : { w: r.width, h: r.height, cw }))
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [cardWidth])

  // Synchronize target and offset when slide count or spacing updates
  React.useEffect(() => {
    const clampedActive = clamp(activeRef.current, 0, Math.max(0, n - 1))
    activeRef.current = clampedActive
    if (active !== clampedActive) setActive(clampedActive)
    sim.current.target = clampedActive * spacing
    sim.current.off = clampedActive * spacing
    sim.current.vel = 0
    sim.current.a = sim.current.a.slice(0, n)
    sim.current.w = sim.current.w.slice(0, n)
    cards.current = cards.current.slice(0, n)
    wake.current()
  }, [n, spacing])

  React.useEffect(() => {
    onChange?.(active)
  }, [active, onChange])

  // Simulation loop: written directly to DOM transforms
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || n === 0) return
    let visible = false
    let raf = 0
    let prev = performance.now()
    const S = sim.current
    const { w, h, cw } = size
    const y0 = Math.max(32, h * (w < 640 ? 0.16 : 0.2))
    pathRef.current?.setAttribute("d", "M0 " + y0 + " Q" + w / 2 + " " + (y0 + 2 * sag) + " " + w + " " + y0)

    const frame = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now
      const d = drag.current
      let lineVel: number
      if (d && d.moved) {
        lineVel = d.v * 1000
      } else {
        const before = S.off
        ;[S.off, S.vel] = springStep(S.off, S.vel, S.target, dt)
        lineVel = -(S.off - before) / Math.max(dt, 1e-3)
      }
      const o = opts.current
      const g = reduced ? 0 : o.swing
      let moving = Boolean(d?.moved) || Math.abs(S.off - S.target) > 0.05 || Math.abs(S.vel) > 0.1
      if (!moving) {
        S.off = S.target
        S.vel = 0
      }
      const near = nearestAt(S.off, spacing, n)
      let anySwing = false
      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const x = w / 2 + i * spacing - S.off
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          el.style.visibility = "hidden"
          S.a[i] = S.w[i] = 0
          continue
        }
        el.style.visibility = "visible"
        let a = S.a[i] || 0
        let av = S.w[i] || 0
        ;[a, av] = swingStep(a, av, lineVel, dt, g)
        if (!g || (Math.abs(a) < 0.0008 && Math.abs(av) < 0.0015 && !moving)) {
          a = av = 0
        } else {
          anySwing = true
        }
        S.a[i] = a
        S.w[i] = av
        const y = stringY(x, w, y0, o.sag) - 6
        el.style.transform = "translate(" + (x - cw / 2).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + a.toFixed(4) + "rad)"
        el.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near))
      }
      if (near !== activeRef.current) {
        activeRef.current = near
        setActive(near)
      }
      if (moving || anySwing) {
        raf = requestAnimationFrame(frame)
      }
    }

    function resume() {
      root!.dataset.running = visible && !document.hidden ? '1' : '0'
      if (!visible || document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        return
      }
      if (!raf) {
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    wake.current = resume
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = visible = e.isIntersecting
      resume()
    })
    io.observe(root)
    document.addEventListener('visibilitychange', resume)

    // Trigger initial positioning
    resume()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', resume)
      wake.current = () => {}
    }
  }, [size, spacing, n, reduced, sag, swing])

  // Autoplay: cycles prints while visible and not dragging
  React.useEffect(() => {
    if (!autoplay || n < 2) return
    const t = window.setInterval(() => {
      if (
        document.hidden ||
        !visibleRef.current ||
        drag.current ||
        performance.now() - lastTouch.current < autoplay
      ) {
        return
      }
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1)
    }, autoplay)
    return () => window.clearInterval(t)
  }, [autoplay, n, goTo])

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as HTMLElement).closest(".pl-bar")) return
    if (n <= 1) return
    lastTouch.current = performance.now()
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }
  }

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
      try {
        rootRef.current?.setPointerCapture(e.pointerId)
      } catch {}
    }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lt)
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v
    d.lx = e.clientX
    d.lt = e.timeStamp
    const max = Math.max(0, (n - 1) * spacing)
    let off = d.off - dx
    if (off < 0) off *= 0.35
    if (off > max) off = max + (off - max) * 0.35
    sim.current.off = off
    wake.current()
  }

  const onUp = (e: React.PointerEvent) => {
    try {
      if (rootRef.current?.hasPointerCapture(e.pointerId)) {
        rootRef.current.releasePointerCapture(e.pointerId)
      }
    } catch {}
    const d = drag.current
    drag.current = null
    lastTouch.current = performance.now()
    if (!d) return
    if (d.moved) {
      setDragging(false)
      sim.current.vel = -d.v * 1000
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n))
      return
    }
    const card = (e.target as HTMLElement).closest("[data-i]")
    if (card) {
      const idx = Number(card.getAttribute("data-i"))
      if (!Number.isNaN(idx) && idx >= 0 && idx < n) {
        goTo(idx)
        onCardClick?.(slides[idx], idx)
      }
    }
  }

  const step = (dir: number) => {
    lastTouch.current = performance.now()
    goTo(clamp(activeRef.current + dir, 0, n - 1))
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1)
    else if (e.key === "ArrowLeft") step(-1)
    else return
    e.preventDefault()
  }

  if (n === 0) {
    return null
  }

  const s = slides[active] || {}
  const y0 = Math.max(32, size.h * (size.w < 640 ? 0.16 : 0.2))

  return (
    <div
      ref={rootRef}
      className={["pl-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--pl-bg" as string]: background,
        ["--pl-ink" as string]: ink,
        ["--pl-muted" as string]: "color-mix(in srgb, var(--pl-ink) 55%, transparent)",
        ["--pl-line" as string]: "color-mix(in srgb, var(--pl-ink) 18%, transparent)",
        ["--pl-cw" as string]: size.cw + "px",
        ...style,
      }}
      data-drag={dragging ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <style>{PL_CSS}</style>
      <svg className="pl-string" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke={string} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {slides.map((sl, i) => {
        const initX = size.w / 2 + i * spacing - (active * spacing)
        const initY = stringY(initX, size.w, y0, sag) - 6
        return (
          <div
            key={i}
            className="pl-card"
            style={{
              "--pl-breeze": `${swing * 0.012}rad`,
              animationDelay: `${-i * 2.21}s`,
              transform: `translate(${(initX - size.cw / 2).toFixed(1)}px, ${initY.toFixed(1)}px) rotate(0rad)`,
              zIndex: i === active ? n + 1 : n - Math.abs(i - active),
            } as React.CSSProperties}
            data-i={i}
            data-on={i === active ? "1" : "0"}
            ref={(el) => {
              cards.current[i] = el
            }}
            aria-hidden={i === active ? undefined : true}
            title={sl.title ? `${sl.title} (Click to open)` : "Click to open image"}
          >
            <div className="pl-print">
              <div className="pl-shot">
                {sl.image ? (
                  <img
                    src={sl.image}
                    sizes={`${size.cw}px`}
                    alt={sl.alt || sl.title || ""}
                    draggable={false}
                    width="340"
                    height="340"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
              <div className="pl-note">{sl.title || ""}</div>
            </div>
            <div className="pl-peg" />
          </div>
        )
      })}
      <div className="pl-bar">
        <div
          className="pl-cap"
          key={active}
          aria-hidden="true"
          onClick={() => onCardClick?.(slides[active], active)}
          style={{ cursor: onCardClick ? "pointer" : "default" }}
          title={onCardClick ? "Click to view full photo" : undefined}
        >
          {s.title ? <span className="pl-title">{s.title}</span> : null}
          {s.caption ? <span className="pl-sub">{s.caption}</span> : null}
        </div>
        <button type="button" className="pl-btn" aria-label="Previous" onClick={() => step(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button type="button" className="pl-btn" aria-label="Next" onClick={() => step(1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="pl-sr" aria-live="polite">
        {"Print " + (active + 1) + " of " + n + (s.title ? ": " + s.title : "")}
      </div>
    </div>
  )
}
