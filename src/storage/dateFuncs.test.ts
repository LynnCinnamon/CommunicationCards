import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDateString } from './dateFuncs.ts'

/*
 * The result depends on the machine's time zone. Each block fixes one, so the tests
 * mean the same on every machine. Node applies a changed TZ immediately.
 * `new Date(y, m, d, h, min)` reads its arguments as local time in that zone; months count from 0.
 */
afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getDateString east of UTC (Berlin)', () => {
  it('uses the local date just after midnight, when UTC is still on the previous day', () => {
    vi.stubEnv('TZ', 'Europe/Berlin')
    expect(getDateString(new Date(2026, 10, 2, 0, 30))).toBe('2026-11-02')
  })

  it('uses the local date in summer time (UTC+2)', () => {
    vi.stubEnv('TZ', 'Europe/Berlin')
    expect(getDateString(new Date(2026, 6, 15, 1, 30))).toBe('2026-07-15')
  })

  it('uses the local date at the turn of the year', () => {
    vi.stubEnv('TZ', 'Europe/Berlin')
    expect(getDateString(new Date(2027, 0, 1, 0, 15))).toBe('2027-01-01')
    expect(getDateString(new Date(2026, 11, 31, 23, 45))).toBe('2026-12-31')
  })

  it('pads month and day with a leading zero', () => {
    vi.stubEnv('TZ', 'Europe/Berlin')
    expect(getDateString(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05')
  })
})

describe('getDateString west of UTC (Los Angeles)', () => {
  it('uses the local date late in the evening, when UTC is already on the next day', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles')
    expect(getDateString(new Date(2026, 10, 2, 23, 30))).toBe('2026-11-02')
  })
})

describe('getDateString without an argument', () => {
  it('uses the current date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 9, 10, 0))
    expect(getDateString()).toBe('2026-03-09')
    vi.useRealTimers()
  })
})
