import { describe, expect, it } from 'vitest'
import { parseHash, routeHref, type Route } from './router.ts'

describe('routeHref', () => {
  it('builds the list URL', () => {
    expect(routeHref({ name: 'list' })).toBe('#/')
  })

  it('appends /show only for the display overlay', () => {
    expect(routeHref({ name: 'card', cardId: 'abc', show: false })).toBe('#/card/abc')
    expect(routeHref({ name: 'card', cardId: 'abc', show: true })).toBe('#/card/abc/show')
  })

  it('leaves out the set ID for a new set', () => {
    expect(routeHref({ name: 'set-editor', setId: 'abc' })).toBe('#/editor/set/abc')
    expect(routeHref({ name: 'set-editor', setId: null })).toBe('#/editor/set')
  })
})

describe('parseHash', () => {
  it('reads card routes with and without /show', () => {
    expect(parseHash('#/card/abc')).toEqual({ name: 'card', cardId: 'abc', show: false })
    expect(parseHash('#/card/abc/show')).toEqual({ name: 'card', cardId: 'abc', show: true })
  })

  it('accepts every character allowed in IDs', () => {
    expect(parseHash('#/card/Ab_9-z')).toEqual({ name: 'card', cardId: 'Ab_9-z', show: false })
  })

  it('falls back to the list for empty and unknown hashes', () => {
    expect(parseHash('')).toEqual({ name: 'list' })
    expect(parseHash('#/')).toEqual({ name: 'list' })
    expect(parseHash('#/unknown')).toEqual({ name: 'list' })
  })

  it('falls back to the list for malformed card hashes', () => {
    expect(parseHash('#/card/')).toEqual({ name: 'list' })
    expect(parseHash('#/card/a b')).toEqual({ name: 'list' })
    expect(parseHash('#/card/abc/shows')).toEqual({ name: 'list' })
    expect(parseHash('#/card/abc/show/extra')).toEqual({ name: 'list' })
  })

  it('reads set editor routes with and without a set ID', () => {
    expect(parseHash('#/editor/set/abc')).toEqual({ name: 'set-editor', setId: 'abc' })
    expect(parseHash('#/editor/set')).toEqual({ name: 'set-editor', setId: null })
  })

  it('treats "new" as an ordinary set ID', () => {
    expect(parseHash('#/editor/set/new')).toEqual({ name: 'set-editor', setId: 'new' })
  })

  it('falls back to the list for malformed and unknown editor hashes', () => {
    expect(parseHash('#/editor')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/set/')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/set/a b')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/set/abc/extra')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/unknown')).toEqual({ name: 'list' })
    expect(parseHash('#/editor/unknown/abc')).toEqual({ name: 'list' })
  })
})

describe('routeHref and parseHash', () => {
  it('turn every route into a URL and back without changes', () => {
    const routes: Route[] = [
      { name: 'list' },
      { name: 'card', cardId: 'abc', show: false },
      { name: 'card', cardId: 'abc', show: true },
      { name: 'settings' },
      { name: 'set-editor', setId: 'abc' },
      { name: 'set-editor', setId: null },
    ]
    for (const route of routes) {
      expect(parseHash(routeHref(route))).toEqual(route)
    }
  })
})
