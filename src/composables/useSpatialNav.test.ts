import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createApp, type App } from 'vue'
import { useSpatialNav } from './useSpatialNav'

// Mounts a tiny component that registers spatial-nav, rendering a row of
// [data-nav] cards plus an <input>. Returns the host so tests can query it.
function mountHarness(): { app: App; host: HTMLElement } {
  const host = document.createElement('div')
  document.body.appendChild(host)

  const Harness = defineComponent({
    setup() {
      useSpatialNav()
      return () =>
        h('div', { class: 'row' }, [
          h('button', { 'data-nav': '', id: 'card-a' }, 'A'),
          h('button', { 'data-nav': '', id: 'card-b' }, 'B'),
          h('input', { id: 'field', type: 'text' }),
        ])
    },
  })

  const app = createApp(Harness)
  app.mount(host)

  // happy-dom gives every element a zero-size rect, so the geometric scoring in
  // bestCandidate() can't tell direction. Stub layout: card-a left, card-b
  // right, field far right — and make them "visible" for the focusables filter.
  const rects: Record<string, DOMRect> = {
    'card-a': { x: 0, y: 0, left: 0, right: 100, top: 0, bottom: 50, width: 100, height: 50 } as DOMRect,
    'card-b': { x: 200, y: 0, left: 200, right: 300, top: 0, bottom: 50, width: 100, height: 50 } as DOMRect,
    field: { x: 400, y: 0, left: 400, right: 500, top: 0, bottom: 50, width: 100, height: 50 } as DOMRect,
  }
  for (const id of Object.keys(rects)) {
    const el = host.querySelector<HTMLElement>(`#${id}`)!
    el.getBoundingClientRect = () => rects[id]
    el.getClientRects = (() => [rects[id]]) as unknown as () => DOMRectList
  }
  return { app, host }
}

function pressArrow(key: string): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  window.dispatchEvent(ev)
  return ev
}

describe('useSpatialNav', () => {
  let app: App
  let host: HTMLElement

  beforeEach(async () => {
    ;({ app, host } = mountHarness())
    await nextTick()
    // Let the requestAnimationFrame seed run.
    await new Promise((r) => requestAnimationFrame(() => r(null)))
  })

  afterEach(() => {
    app.unmount()
    host.remove()
  })

  it('moves spatial focus between cards on ArrowRight when not in a field', () => {
    const a = host.querySelector<HTMLElement>('#card-a')!
    a.focus()
    expect(document.activeElement?.id).toBe('card-a')

    const ev = pressArrow('ArrowRight')

    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('card-b')
  })

  it('does NOT hijack arrow keys while typing in a text input', () => {
    const field = host.querySelector<HTMLElement>('#field')!
    field.focus()
    expect(document.activeElement?.id).toBe('field')

    const ev = pressArrow('ArrowRight')

    // Browser keeps the key: not prevented, focus stays in the field so the
    // text cursor can move natively.
    expect(ev.defaultPrevented).toBe(false)
    expect(document.activeElement?.id).toBe('field')
  })

  it('ignores Up/Down too while focus is in an editable field', () => {
    const field = host.querySelector<HTMLElement>('#field')!
    field.focus()

    const down = pressArrow('ArrowDown')
    const up = pressArrow('ArrowUp')

    expect(down.defaultPrevented).toBe(false)
    expect(up.defaultPrevented).toBe(false)
    expect(document.activeElement?.id).toBe('field')
  })
})
