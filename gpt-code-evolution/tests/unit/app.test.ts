import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('application foundation', () => {
  it('mounts the labeled game host', () => {
    const wrapper = mount(App)

    expect(wrapper.get('[data-testid="game-host"]').attributes('aria-label')).toBe('Game area')
    expect(wrapper.text()).toContain('Game foundation')
    wrapper.unmount()
  })
})
