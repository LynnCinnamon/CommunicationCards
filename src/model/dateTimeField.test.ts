import { describe, expect, it } from 'vitest'
import { formatDateTime } from './dateTimeField.ts'

// Fixed, so "current year" doesn't depend on when the tests run
const now = new Date(2026, 10, 1)

describe('formatDateTime: time', () => {
  it('keeps a normal time', () => {
    expect(formatDateTime('13:12', 'time', now)).toBe('13:12')
  })

  it('drops the leading zero of the hour, but not of the minute', () => {
    expect(formatDateTime('09:01', 'time', now)).toBe('9:01')
    expect(formatDateTime('00:00', 'time', now)).toBe('0:00')
  })

  it('drops seconds', () => {
    expect(formatDateTime('01:11:00', 'time', now)).toBe('1:11')
    expect(formatDateTime('17:30:45', 'time', now)).toBe('17:30')
  })

  it('rejects empty and unparseable input', () => {
    expect(formatDateTime('', 'time', now)).toBeUndefined()
    expect(formatDateTime('abcasdkjh', 'time', now)).toBeUndefined()
  })

  it('rejects times out of range', () => {
    expect(formatDateTime('25:00', 'time', now)).toBeUndefined()
    expect(formatDateTime('12:60', 'time', now)).toBeUndefined()
  })
})

describe('formatDateTime: date', () => {
  it('leaves out the year within the current year', () => {
    expect(formatDateTime('2026-10-30', 'date', now)).toBe('Freitag, 30. Oktober')
    expect(formatDateTime('2026-12-31', 'date', now)).toBe('Donnerstag, 31. Dezember')
  })

  it('shows the year outside the current year', () => {
    expect(formatDateTime('2027-01-05', 'date', now)).toBe('Dienstag, 5. Januar 2027')
    expect(formatDateTime('2025-12-24', 'date', now)).toBe('Mittwoch, 24. Dezember 2025')
  })

  it('rejects days that would roll over into the next month', () => {
    expect(formatDateTime('2026-02-31', 'date', now)).toBeUndefined()
  })

  it('rejects empty and unparseable input', () => {
    expect(formatDateTime('', 'date', now)).toBeUndefined()
    expect(formatDateTime('abcasdkjh', 'date', now)).toBeUndefined()
  })
})

describe('formatDateTime: both', () => {
  it('joins date and time with "um"', () => {
    expect(formatDateTime('2026-10-30T17:30', 'both', now)).toBe('Freitag, 30. Oktober um 17:30')
  })

  it('applies the date and time rules together', () => {
    expect(formatDateTime('2027-01-05T09:05', 'both', now)).toBe('Dienstag, 5. Januar 2027 um 9:05')
    expect(formatDateTime('2026-10-30T17:30:00', 'both', now)).toBe('Freitag, 30. Oktober um 17:30')
  })

  it('rejects a missing time or date part', () => {
    expect(formatDateTime('2026-10-30', 'both', now)).toBeUndefined()
    expect(formatDateTime('17:30', 'both', now)).toBeUndefined()
    expect(formatDateTime('', 'both', now)).toBeUndefined()
  })
})

describe('formatDateTime: wrong format for the mode', () => {
  it('rejects a time in date mode and a date in time mode', () => {
    expect(formatDateTime('17:30', 'date', now)).toBeUndefined()
    expect(formatDateTime('2026-10-30', 'time', now)).toBeUndefined()
  })
})
