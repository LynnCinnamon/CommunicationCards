import { describe, expect, it } from 'vitest'
import { generateUniqueId } from './idHelper.ts'

// Same rule as the Id schema in schema.ts
const validId = /^[A-Za-z0-9_-]+$/

/**
 * A fake random source that fills the array with the given bytes, one list per call.
 * Generic like crypto.getRandomValues, so it fits the parameter's type.
 */
function fakeRandom(...calls: number[][]) {
  let call = 0
  return <T extends ArrayBufferView>(array: T): T => {
    const bytes = calls[call++]
    if (!bytes) throw new Error('fakeRandom called more often than expected')
    new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes)
    return array
  }
}

describe('generateUniqueId', () => {
  it('creates a valid ID of the default length', () => {
    const id = generateUniqueId(new Set())
    expect(id).toMatch(validId)
    expect(id).toHaveLength(8)
  })

  it('respects the requested length', () => {
    expect(generateUniqueId(new Set(), 3)).toHaveLength(3)
  })

  it('only uses characters the schema allows, for every possible byte', () => {
    const allBytes = Array.from({ length: 256 }, (_, i) => i)
    const id = generateUniqueId(new Set(), 256, fakeRandom(allBytes))
    expect(id).toMatch(validId)
  })

  it('maps bytes onto the alphabet, wrapping around after 64', () => {
    // 0 → A, 26 → a, 52 → 0, 64 → A again
    expect(generateUniqueId(new Set(), 4, fakeRandom([0, 26, 52, 64]))).toBe('Aa0A')
  })

  it('generates again while the ID is taken', () => {
    const random = fakeRandom([0, 0, 0], [0, 0, 0], [1, 1, 1])
    expect(generateUniqueId(new Set(['AAA']), 3, random)).toBe('BBB')
  })

  it('gives different IDs on consecutive calls', () => {
    expect(generateUniqueId(new Set())).not.toBe(generateUniqueId(new Set()))
  })
})
