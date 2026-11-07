import { describe, expect, it } from 'vitest'
import { addSet, checkCardSet, isProblemFree, removeSet, replaceSet } from './editorHelper.ts'
import { exampleDoc } from './fixtures.ts'
import type { CardSet, Doc } from './schema.ts'

const treffen: CardSet = {
  id: 'treffen',
  name: 'Verabredungen',
  cardIds: ['treffen-date', 'vorstellung'],
}

describe('replaceSet', () => {
  it('replaces the set with the same ID', () => {
    const doc = replaceSet(exampleDoc, treffen)
    expect(doc.sets.find((set) => set.id === 'treffen')).toEqual(treffen)
  })

  it('keeps the set at its position', () => {
    const doc = replaceSet(exampleDoc, treffen)
    expect(doc.sets.map((set) => set.id)).toEqual(['oepnv', 'smalltalk', 'treffen'])
  })

  it('leaves the other sets, cards and lists as they are', () => {
    const doc = replaceSet(exampleDoc, treffen)
    expect(doc.sets.filter((set) => set.id !== 'treffen')).toEqual(
      exampleDoc.sets.filter((set) => set.id !== 'treffen'),
    )
    expect(doc.cards).toEqual(exampleDoc.cards)
    expect(doc.lists).toEqual(exampleDoc.lists)
  })

  it('does not change the doc or the set it was given', () => {
    const docBefore = structuredClone(exampleDoc)
    const setBefore = structuredClone(treffen)
    replaceSet(exampleDoc, treffen)
    expect(exampleDoc).toEqual(docBefore)
    expect(treffen).toEqual(setBefore)
  })

  it('trims spaces around the name', () => {
    const doc = replaceSet(exampleDoc, { ...treffen, name: '  Verabredungen ' })
    expect(doc.sets.find((set) => set.id === 'treffen')?.name).toBe('Verabredungen')
  })

  // E.g. deleted in another tab while the editor was open; saving must not look successful
  it('throws for a set ID that is not in the doc', () => {
    expect(() => replaceSet(exampleDoc, { ...treffen, id: 'gibt-es-nicht' })).toThrow()
  })
})

describe('addSet', () => {
  const ausflug: CardSet = {
    id: 'ausflug',
    name: 'Ausflug',
    cardIds: ['aussteigen'],
  }

  it('appends the set after the existing ones', () => {
    const doc = addSet(exampleDoc, ausflug)
    expect(doc.sets.map((set) => set.id)).toEqual(['oepnv', 'smalltalk', 'treffen', 'ausflug'])
    expect(doc.sets.at(-1)).toEqual(ausflug)
  })

  it('leaves the existing sets, cards and lists as they are', () => {
    const doc = addSet(exampleDoc, ausflug)
    expect(doc.sets.slice(0, -1)).toEqual(exampleDoc.sets)
    expect(doc.cards).toEqual(exampleDoc.cards)
    expect(doc.lists).toEqual(exampleDoc.lists)
  })

  it('does not change the doc or the set it was given', () => {
    const docBefore = structuredClone(exampleDoc)
    const setBefore = structuredClone(ausflug)
    addSet(exampleDoc, ausflug)
    expect(exampleDoc).toEqual(docBefore)
    expect(ausflug).toEqual(setBefore)
  })

  it('trims spaces around the name', () => {
    const doc = addSet(exampleDoc, { ...ausflug, name: ' Ausflug  ' })
    expect(doc.sets.at(-1)?.name).toBe('Ausflug')
  })

  it('allows a set without cards', () => {
    const doc = addSet(exampleDoc, { ...ausflug, cardIds: [] })
    expect(doc.sets.at(-1)?.cardIds).toEqual([])
  })

  // Adding must never overwrite a set that is already there
  it('throws for a set ID that is already in the doc', () => {
    expect(() => addSet(exampleDoc, { ...ausflug, id: 'treffen' })).toThrow()
  })
})

describe('removeSet', () => {
  // The only place that says how removeSet is called, so a signature change touches one line
  const remove = (doc: Doc, setId: string) => removeSet(doc, setId)

  it('removes the set with that ID and keeps the order of the others', () => {
    const doc = remove(exampleDoc, 'smalltalk')
    expect(doc.sets.map((set) => set.id)).toEqual(['oepnv', 'treffen'])
  })

  it('keeps the cards of the removed set and the lists', () => {
    const doc = remove(exampleDoc, 'treffen')
    expect(doc.cards).toEqual(exampleDoc.cards)
    expect(doc.lists).toEqual(exampleDoc.lists)
  })

  it('does not change the doc it was given', () => {
    const docBefore = structuredClone(exampleDoc)
    remove(exampleDoc, 'treffen')
    expect(exampleDoc).toEqual(docBefore)
  })

  it('can remove the last remaining set', () => {
    let doc = exampleDoc
    for (const set of exampleDoc.sets) doc = remove(doc, set.id)
    expect(doc.sets).toEqual([])
  })

  it('throws for a set ID that is not in the doc', () => {
    expect(() => remove(exampleDoc, 'gibt-es-nicht')).toThrow()
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
