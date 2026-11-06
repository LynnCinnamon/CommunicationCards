import { describe, expect, it } from 'vitest'
import { checkCardSet, isProblemFree, rebuildDoc } from './editorHelper.ts'
import { exampleDoc } from './fixtures.ts'
import type { CardSet } from './schema.ts'

const treffen: CardSet = {
  id: 'treffen',
  name: 'Verabredungen',
  cardIds: ['treffen-date', 'vorstellung'],
}

describe('rebuildDoc', () => {
  it('replaces the set with the same ID', () => {
    const doc = rebuildDoc(exampleDoc, treffen)
    expect(doc.sets.find((set) => set.id === 'treffen')).toEqual(treffen)
  })

  it('keeps the set at its position', () => {
    const doc = rebuildDoc(exampleDoc, treffen)
    expect(doc.sets.map((set) => set.id)).toEqual(['oepnv', 'smalltalk', 'treffen'])
  })

  it('leaves the other sets, cards and lists as they are', () => {
    const doc = rebuildDoc(exampleDoc, treffen)
    expect(doc.sets.filter((set) => set.id !== 'treffen')).toEqual(
      exampleDoc.sets.filter((set) => set.id !== 'treffen'),
    )
    expect(doc.cards).toEqual(exampleDoc.cards)
    expect(doc.lists).toEqual(exampleDoc.lists)
  })

  it('does not change the doc or the set it was given', () => {
    const docBefore = structuredClone(exampleDoc)
    const setBefore = structuredClone(treffen)
    rebuildDoc(exampleDoc, treffen)
    expect(exampleDoc).toEqual(docBefore)
    expect(treffen).toEqual(setBefore)
  })

  it('trims spaces around the name', () => {
    const doc = rebuildDoc(exampleDoc, { ...treffen, name: '  Verabredungen ' })
    expect(doc.sets.find((set) => set.id === 'treffen')?.name).toBe('Verabredungen')
  })

  // E.g. deleted in another tab while the editor was open; saving must not look successful
  it('throws for a set ID that is not in the doc', () => {
    expect(() => rebuildDoc(exampleDoc, { ...treffen, id: 'gibt-es-nicht' })).toThrow()
  })
})

describe('checkCardSet', () => {
  // The messages are for people, so only their number is tested, not the wording
  const nameProblems = (name: string, cardIds = treffen.cardIds) =>
    checkCardSet(exampleDoc.sets, { ...treffen, name, cardIds }).name

  it('accepts a new, unique name', () => {
    expect(nameProblems('Verabredungen')).toEqual([])
  })

  it('accepts the set keeping its own name', () => {
    expect(nameProblems('Treffen')).toEqual([])
  })

  it('accepts the set changing only the case of its own name', () => {
    expect(nameProblems('TREFFEN')).toEqual([])
  })

  it('rejects an empty name', () => {
    expect(nameProblems('')).toHaveLength(1)
  })

  it('rejects a name of only spaces', () => {
    expect(nameProblems('   ')).toHaveLength(1)
  })

  it('rejects the name of another set', () => {
    expect(nameProblems('Smalltalk')).toHaveLength(1)
  })

  it('rejects the name of another set in different case or with spaces around it', () => {
    expect(nameProblems('smalltalk')).toHaveLength(1)
    expect(nameProblems('  ÖPNV ')).toHaveLength(1)
    expect(nameProblems('öpnv')).toHaveLength(1)
  })

  it('allows a set without cards', () => {
    expect(nameProblems('Verabredungen', [])).toEqual([])
  })
})

describe('isProblemFree', () => {
  it('is true when no field has a message', () => {
    expect(isProblemFree({ name: [] })).toBe(true)
  })

  it('is false when a field has a message', () => {
    expect(isProblemFree({ name: ['Der Name darf nicht leer sein.'] })).toBe(false)
  })

  it('agrees with checkCardSet', () => {
    expect(isProblemFree(checkCardSet(exampleDoc.sets, treffen))).toBe(true)
    expect(isProblemFree(checkCardSet(exampleDoc.sets, { ...treffen, name: '' }))).toBe(false)
  })
})
