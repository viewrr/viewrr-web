import type { Directive } from 'vue'

// Subtle tvOS-style tilt: the card rotates toward the pointer in 3D.
// Transform includes the same scale+lift as the CSS hover so the two don't
// fight (inline wins while the pointer is over; cleared on leave so the CSS
// :hover / :focus-visible rules resume — keyboard focus keeps the flat lift).
const MAX_DEG = 7
const reduceMotion =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

type Handlers = { move: (e: PointerEvent) => void; leave: () => void }
const registry = new WeakMap<HTMLElement, Handlers>()

const tilt: Directive<HTMLElement> = {
  mounted(el) {
    if (reduceMotion) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width // 0..1 across
      const py = (e.clientY - r.top) / r.height // 0..1 down
      const ry = (px - 0.5) * 2 * MAX_DEG // pointer right → rotateY+
      const rx = -(py - 0.5) * 2 * MAX_DEG // pointer down → rotateX-
      el.style.transition = 'transform 0.12s ease-out' // snappy follow
      el.style.transform =
        `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) ` +
        'scale(1.07) translateY(-6px)'
    }
    const leave = () => {
      el.style.transition = '' // restore CSS easing for a smooth reset
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    registry.set(el, { move, leave })
  },
  unmounted(el) {
    const h = registry.get(el)
    if (h) {
      el.removeEventListener('pointermove', h.move)
      el.removeEventListener('pointerleave', h.leave)
      registry.delete(el)
    }
  },
}

export default tilt
