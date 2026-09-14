// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { calculateUniformFit } from '../../src/render'

describe('calculateUniformFit', () => {
  it.each([
    {
      host: [800, 600],
      expected: { scale: 1, offsetX: 0, offsetY: 0, width: 800, height: 600 },
    },
    {
      host: [1200, 900],
      expected: { scale: 1.5, offsetX: 0, offsetY: 0, width: 1200, height: 900 },
    },
    {
      host: [1200, 600],
      expected: { scale: 1, offsetX: 200, offsetY: 0, width: 800, height: 600 },
    },
  ])('$host fits the logical area uniformly', ({ host, expected }) => {
    expect(calculateUniformFit(host[0], host[1], 800, 600)).toEqual(expected)
  })

  it.each([
    [0, 600],
    [800, 0],
    [0, 0],
  ])('returns a finite inactive fit for a %sx%s host', (width, height) => {
    const fit = calculateUniformFit(width, height, 800, 600)

    expect(fit).toEqual({
      scale: 0,
      offsetX: width / 2,
      offsetY: height / 2,
      width: 0,
      height: 0,
    })
    expect(Object.values(fit).every(Number.isFinite)).toBe(true)
  })
})
