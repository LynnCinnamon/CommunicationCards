import { describe, expect, it } from 'vitest'
import { clampToField, initialNumber, parseWholeNumber } from './numberField.ts'
import type { NumberField } from './schema.ts'

const field = (range: Partial<NumberField>): NumberField => ({ id: 'n', type: 'number', ...range })

describe('clampToField', () => {
  it('keeps numbers inside the range', () => {
    expect(clampToField(3, field({ min: 1, max: 5 }))).toBe(3)
  })

  it('moves numbers outside the range to the nearest bound', () => {
    expect(clampToField(0, field({ min: 1, max: 5 }))).toBe(1)
    expect(clampToField(9, field({ min: 1, max: 5 }))).toBe(5)
  })

  it('treats a missing bound as unlimited', () => {
    expect(clampToField(-100, field({ max: 5 }))).toBe(-100)
    expect(clampToField(100, field({ min: 1 }))).toBe(100)
  })
})

describe('initialNumber', () => {
  it('uses the default', () => {
    expect(initialNumber(field({ min: 1, default: 3 }))).toBe(3)
  })

  it('falls back to the number closest to 0 in the range', () => {
    expect(initialNumber(field({}))).toBe(0)
    expect(initialNumber(field({ min: 1 }))).toBe(1)
    expect(initialNumber(field({ max: -2 }))).toBe(-2)
  })
})

describe('parseWholeNumber', () => {
  it('parses whole numbers', () => {
    expect(parseWholeNumber('12')).toBe(12)
    expect(parseWholeNumber('-3')).toBe(-3)
    expect(parseWholeNumber(' 7 ')).toBe(7)
  })

  it('rejects incomplete or non-whole input', () => {
    for (const text of ['', ' ', '-', '1.5', '1,5', '1e5', 'abc']) {
      expect(parseWholeNumber(text)).toBeUndefined()
    }
  })
})
