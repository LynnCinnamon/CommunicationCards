import { createStore, get, set } from 'idb-keyval'
import { checkIntegrity } from '../model/integrity.ts'
import { parseDoc } from '../model/parseDoc.ts'
import type { Doc } from '../model/schema.ts'

/** The IndexedDB database "communication-cards" with one key-value table "data". */
export const store = createStore('communication-cards', 'data')
export const DOC_KEY = 'doc'

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; doc: Doc }
  | { status: 'invalid'; problems: string[]; raw: unknown }

/**
 * Loads the stored doc. Stored data is validated like an import, because it may
 * come from an older app version or a bug. Invalid data is returned as `raw`
 * so it can still be exported instead of being lost.
 */
export async function loadDoc(): Promise<LoadResult> {
  const raw: unknown = await get(DOC_KEY, store)
  if (raw === undefined) return { status: 'empty' }

  const result = parseDoc(raw)
  return result.ok ? { status: 'ok', doc: result.doc } : { status: 'invalid', problems: result.problems, raw }
}

/** Saves the doc. Refuses inconsistent data so a bug can't corrupt what is stored. */
export async function saveDoc(doc: Doc): Promise<void> {
  const problems = checkIntegrity(doc)
  if (problems.length) throw new Error(`Refusing to save inconsistent doc:\n${problems.join('\n')}`)
  await set(DOC_KEY, doc, store)
}

/**
 * Asks the browser not to evict our data (e.g. Safari after 7 days without use).
 * Returns whether storage is persistent. Browsers may decide silently or ask the user.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}
