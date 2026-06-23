// Spatial (D-pad / remote) focus navigation for the 10-foot TV layout.
// Geometric arrow-key focus over [data-nav] elements with roving tabindex (#107).

import { onMounted, onUnmounted } from 'vue'

/** Attribute that marks an element as a spatial-navigation focus target. */
const NAV_ATTR = 'data-nav'
const SELECTOR = `[${NAV_ATTR}]`

type Dir = 'left' | 'right' | 'up' | 'down'

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

// Module-level registry: a single global keydown listener is shared across all
// components. Each mounting component bumps the refcount; the last to unmount
// tears the listener down. This keeps initialization inside owned files (no
// App.vue / main.ts changes required) — components self-register on mount.
let mountCount = 0
let listenersAttached = false

function focusables(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  )
}

/** Roving tabindex: the active target is 0, everything else -1. */
function setRoving(active: HTMLElement | null): void {
  const items = focusables()
  const fallback = active ?? preferredInitial()
  for (const el of items) el.tabIndex = el === fallback ? 0 : -1
}

// Initial focus target: the first card inside a content row, not the first nav
// link. Falls back to the first focusable if no row exists yet.
function preferredInitial(): HTMLElement | null {
  const items = focusables()
  return items.find((el) => el.closest('.row')) ?? items[0] ?? null
}

function center(rect: DOMRect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

// Pick the best candidate in `dir` from `origin` using a spatial score:
// candidate must lie in the half-plane of the direction; we reward overlap on
// the perpendicular axis and penalise distance along + across the travel axis.
function bestCandidate(origin: HTMLElement, dir: Dir): HTMLElement | null {
  const items = focusables().filter((el) => el !== origin)
  if (!items.length) return null

  const o = origin.getBoundingClientRect()
  const oc = center(o)

  let best: HTMLElement | null = null
  let bestScore = Infinity

  for (const el of items) {
    const r = el.getBoundingClientRect()
    const c = center(r)
    const dx = c.x - oc.x
    const dy = c.y - oc.y

    // Must be in the pressed direction (with a small tolerance so near-aligned
    // items on the same row/column still qualify).
    const inDir =
      (dir === 'left' && dx < -1) ||
      (dir === 'right' && dx > 1) ||
      (dir === 'up' && dy < -1) ||
      (dir === 'down' && dy > 1)
    if (!inDir) continue

    const horizontal = dir === 'left' || dir === 'right'
    // Primary axis = travel distance; cross axis = misalignment (weighted up so
    // we prefer items roughly in line with the origin).
    const primary = horizontal ? Math.abs(dx) : Math.abs(dy)
    const cross = horizontal ? Math.abs(dy) : Math.abs(dx)
    const score = primary + cross * 2

    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }
  return best
}

function moveFocus(el: HTMLElement): void {
  setRoving(el)
  el.focus()
  // Apple-TV behaviour: keep the focused item visible — horizontal rows scroll
  // to centre it, vertical scroll snaps the nearest edge into view.
  el.scrollIntoView({ block: 'nearest', inline: 'center' })
}

function onKeydown(e: KeyboardEvent): void {
  // Enter: let native activation fire (cards are <button>); no preventDefault.
  // Escape/Back is handled at the route level (Detail/Player → router.back).
  const dir = KEY_TO_DIR[e.key]
  if (!dir) return

  const active = document.activeElement as HTMLElement | null
  // Origin = the focused nav element, else the current roving target (first
  // card after seed), else the first focusable. This keeps the first arrow
  // press starting on a card rather than the first nav link.
  const roving = focusables().find((el) => el.tabIndex === 0)
  const origin =
    active && active.matches(SELECTOR) ? active : roving ?? focusables()[0] ?? null
  if (!origin) return

  const target = bestCandidate(origin, dir)
  if (target) {
    e.preventDefault()
    moveFocus(target)
  } else if (active !== origin) {
    // Nothing focused yet — adopt the first item so the next press navigates.
    e.preventDefault()
    moveFocus(origin)
  }
}

// Keep roving tabindex in sync with pointer interaction so mouse/hover focus
// and keyboard focus never fight each other.
function onPointerOrFocus(e: Event): void {
  const t = (e.target as HTMLElement | null)?.closest<HTMLElement>(SELECTOR)
  if (t) setRoving(t)
}

function attach(): void {
  if (listenersAttached) return
  listenersAttached = true
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerOrFocus, true)
  document.addEventListener('focusin', onPointerOrFocus, true)
  // Seed roving tabindex once the DOM has painted the first set of targets.
  requestAnimationFrame(() => setRoving(null))
}

function detach(): void {
  if (!listenersAttached) return
  listenersAttached = false
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerOrFocus, true)
  document.removeEventListener('focusin', onPointerOrFocus, true)
}

/**
 * Register a component into the shared spatial-navigation system.
 * Call once in any component that renders `[data-nav]` focus targets — the
 * global keydown listener is created on the first mount and removed after the
 * last unmount. No app-root wiring needed.
 */
export function useSpatialNav(): void {
  onMounted(() => {
    mountCount += 1
    attach()
  })
  onUnmounted(() => {
    mountCount -= 1
    if (mountCount <= 0) {
      mountCount = 0
      detach()
    }
  })
}

/** The attribute name to bind on focusable elements: `:[NAV_ATTR]="''"`. */
export { NAV_ATTR }
