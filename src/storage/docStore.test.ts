import 'fake-indexeddb/auto' // must come first: provides IndexedDB in Node, where tests run
import { clear, set } from 'idb-keyval'
import { beforeEach, describe, expect, it } from 'vitest'
import { exampleDoc } from '../model/fixtures.ts'
import type { Doc } from '../model/schema.ts'
import { DOC_KEY, loadDoc, saveDoc, store } from './docStore.ts'

beforeEach(() => clear(store))

describe('docStore', () => {
  it('reports an empty store on first start', async () => {
    expect(await loadDoc()).toEqual({ status: 'empty' })
  })

  it('loads what was saved', async () => {
    await saveDoc(exampleDoc)
    expect(await loadDoc()).toEqual({ status: 'ok', doc: exampleDoc })
  })

  it('returns invalid stored data instead of discarding it', async () => {
    const broken = { schemaVersion: 1, cards: 'not an array' }
    await set(DOC_KEY, broken, store)

    const result = await loadDoc()
    expect(result.status).toBe('invalid')
    if (result.status !== 'invalid') return
    expect(result.raw).toEqual(broken)
    expect(result.problems).not.toEqual([])
  })

  it('refuses to save an inconsistent doc and keeps the previous one', async () => {
    await saveDoc(exampleDoc)
    const broken: Doc = { ...exampleDoc, lists: [] } // choice field now points to a missing list

    await expect(saveDoc(broken)).rejects.toThrow('references unknown list')
    expect(await loadDoc()).toEqual({ status: 'ok', doc: exampleDoc })
  })
})
