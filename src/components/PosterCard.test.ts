import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PosterCard from './PosterCard.vue'

const title = { id: '1', title: 'Madness', poster: 'p.jpg', backdrop: 'b.jpg' }

describe('PosterCard', () => {
  it('renders poster, caption, badge and is keyboard-navigable', () => {
    const w = mount(PosterCard, { props: { title, caption: 'Drama', badge: 'viewrr' } })
    expect(w.find('img').attributes('src')).toBe('p.jpg')
    expect(w.text()).toContain('Drama')
    expect(w.text()).toContain('viewrr')
    expect(w.find('[data-nav]').exists()).toBe(true)
  })

  it('emits select on click', async () => {
    const w = mount(PosterCard, { props: { title } })
    await w.find('button').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })

  it('renders empty src when poster is null', () => {
    const w = mount(PosterCard, { props: { title: { ...title, poster: null } } })
    expect(w.find('img').attributes('src')).toBe('')
  })
})
