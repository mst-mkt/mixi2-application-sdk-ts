import { describe, expect, it } from 'vite-plus/test'

import { calculateBackoff } from './backoff'

describe('calculateBackoff', () => {
  it('base_delay', () => {
    const result = calculateBackoff(0)

    expect(result).toBe(1000)
  })

  it('exponential_increase', () => {
    expect(calculateBackoff(0)).toBe(1000)
    expect(calculateBackoff(1)).toBe(2000)
    expect(calculateBackoff(2)).toBe(4000)
    expect(calculateBackoff(3)).toBe(8000)
  })

  it('max_cap', () => {
    expect(calculateBackoff(10)).toBe(30_000)
    expect(calculateBackoff(20)).toBe(30_000)
  })

  it('custom_params', () => {
    expect(calculateBackoff(0, 500, 5000)).toBe(500)
    expect(calculateBackoff(1, 500, 5000)).toBe(1000)
    expect(calculateBackoff(2, 500, 5000)).toBe(2000)
    expect(calculateBackoff(3, 500, 5000)).toBe(4000)
    expect(calculateBackoff(4, 500, 5000)).toBe(5000)
  })
})
