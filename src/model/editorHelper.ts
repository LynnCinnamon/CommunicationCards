import type { CardSet, Doc } from './schema.ts'

/**
 * A new doc with the set of the same ID replaced by this one, its name trimmed.
 * Throws if the doc has no set with that ID, so a save can't silently change nothing.
 * Never changes its inputs; the untouched sets are shared with the old doc.
 */
export function replaceSet(doc: Doc, cardSet: CardSet): Doc {
  if (!doc.sets.some((set) => set.id === cardSet.id)) {
    throw new Error(`Trying to update an unknown set ${cardSet.id}.`)
  }
  const newSets = doc.sets.map((set) =>
    set.id === cardSet.id ? { ...cardSet, name: cardSet.name.trim() } : set,
  )
  return { ...doc, sets: newSets }
}

/**
 * A new doc with this set appended after the existing ones, its name trimmed.
 * Throws if a set with that ID already exists, so adding can never overwrite one.
 * Never changes its inputs; the existing sets are shared with the old doc.
 */
export function addSet(doc: Doc, cardSet: CardSet): Doc {
  if (doc.sets.some((set) => set.id === cardSet.id)) {
    throw new Error(`Trying to add an already known set ${cardSet.id}.`)
  }
  return { ...doc, sets: [...doc.sets, { ...cardSet, name: cardSet.name.trim() }] }
}

/**
 * A new doc without the set of that ID. Only the set goes: its cards stay in the doc,
 * other sets may still use them. Throws if the doc has no set with that ID.
 * Never changes its inputs; the remaining sets are shared with the old doc.
 */
export function removeSet(doc: Doc, id: string): Doc {
  if (!doc.sets.some((set) => set.id === id)) {
    throw new Error(`Trying to remove an unknown set ${id}.`)
  }
  const newSets = doc.sets.filter((set) => set.id !== id)
  return { ...doc, sets: newSets }
}

/** German messages per field of the set editor, shown next to that field. Empty means the field is fine. */
export type SetProblems = Record<'name', string[]>

/**
 * Checks what a user can get wrong when editing a set: the name must not be empty
 * and must differ from every other set's name, ignoring case and surrounding spaces.
 * A set without cards is fine. IDs aren't checked here: users never see them, saveDoc does.
 */
export function checkCardSet(cardSets: CardSet[], draft: CardSet): SetProblems {
  if (draft.name === '') {
    return { name: ['Der Name darf nicht leer sein.'] }
  }
  const trimmed = draft.name.trim()
  if (trimmed === '') {
    return { name: ['Der Name darf nicht nur aus Leerzeichen bestehen.'] }
  }
  const lowered = trimmed.toLowerCase()
  if (
    cardSets.some((set) => {
      return set.name.trim().toLowerCase() === lowered && set.id !== draft.id
    })
  ) {
    return { name: [`Der Name "${trimmed}" ist schon in Verwendung.`] }
  }
  return { name: [] }
}

/** True when no field has a message. Walks all fields, so new ones in SetProblems are covered without changes here. */
export function isProblemFree(problems: SetProblems): boolean {
  return !Object.values(problems).some((problemList) => problemList.length > 0)
}
