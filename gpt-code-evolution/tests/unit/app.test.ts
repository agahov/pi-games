import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const compositionMock = vi.hoisted(() => {
  let mountResult: Promise<void> = Promise.resolve()
  let mountCalls = 0
  let disposeCalls = 0

  return {
    mount: () => {
      mountCalls += 1
      return mountResult
    },
    dispose: () => {
      disposeCalls += 1
    },
    reset: () => {
      mountResult = Promise.resolve()
      mountCalls = 0
      disposeCalls = 0
    },
    setMountResult: (result: Promise<void>) => {
      mountResult = result
    },
    get mountCalls() {
      return mountCalls
    },
    get disposeCalls() {
      return disposeCalls
    },
  }
})

vi.mock('../../src/composition', () => ({
  Composition: class {
    mount() {
      return compositionMock.mount()
    }

    dispose() {
      compositionMock.dispose()
    }
  },
}))

import App from '../../src/App.vue'

describe('application', () => {
  beforeEach(() => {
    compositionMock.reset()
  })

  it('mounts the labeled game host without starting Pixi in the Vue unit test', () => {
    const wrapper = mount(App)

    expect(wrapper.get('[data-testid="game-host"]').attributes('aria-label')).toBe('Game area')
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(compositionMock.mountCalls).toBe(1)

    wrapper.unmount()
    expect(compositionMock.disposeCalls).toBe(1)
  })

  it('shows a visible failure when Composition cannot initialize', async () => {
    compositionMock.setMountResult(Promise.reject(new Error('renderer unavailable')))
    const wrapper = mount(App)

    await flushPromises()

    expect(wrapper.get('[data-testid="mount-error"]').text())
      .toBe('Game failed to initialize: renderer unavailable')

    wrapper.unmount()
  })
})
