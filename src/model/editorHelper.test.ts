import { describe, expect, it } from 'vitest'
import { rebuildDoc } from './editorHelper.ts'
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
