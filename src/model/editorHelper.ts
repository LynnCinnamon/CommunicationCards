import type { CardSet, Doc } from './schema.ts'

/**
 * A new doc with the set of the same ID replaced by this one, its name trimmed.
 * Throws if the doc has no set with that ID, so a save can't silently change nothing.
 * Never changes its inputs; the untouched sets are shared with the old doc.
 */
export function rebuildDoc(doc: Doc, cardSet: CardSet): Doc {
  if (!doc.sets.some((set) => set.id === cardSet.id)) {
    throw new Error(`Trying to update an unknown set ${cardSet.id}.`)
  }
  const newSets = doc.sets.map((set) =>
    set.id === cardSet.id ? { ...cardSet, name: cardSet.name.trim() } : set,
  )
  return { ...doc, sets: newSets }
}
