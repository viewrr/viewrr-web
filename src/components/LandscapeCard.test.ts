import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandscapeCard from './LandscapeCard.vue'

const title = { id: '1', title: 'Cocktail 2', poster: 'p.jpg', backdrop: 'b.jpg' }

describe('LandscapeCard', () => {
  it('shows no progress bar when progress is undefined', () => {
    const w = mount(LandscapeCard, { props: { title } })
    expect(w.find('.bg-accent').exists()).toBe(false)
  })

  it('renders progress bar width as a clamped percentage', () => {
    const w = mount(LandscapeCard, { props: { title, progress: 0.42 } })
    expect(w.find('.bg-accent').attributes('style')).toContain('width: 42%')
  })

  it('clamps progress above 1 to 100%', () => {
    const w = mount(LandscapeCard, { props: { title, progress: 5 } })
    expect(w.find('.bg-accent').attributes('style')).toContain('width: 100%')
  })
})
