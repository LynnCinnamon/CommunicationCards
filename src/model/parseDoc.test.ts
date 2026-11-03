import { describe, expect, it } from 'vitest'
import { exampleDoc } from './fixtures.ts'
import { parseDoc } from './parseDoc.ts'
import type { Doc } from './schema.ts'

const clone = (): Doc => structuredClone(exampleDoc)

function problemsOf(data: unknown): string[] {
  const result = parseDoc(data)
  return result.status === 'invalid' ? result.problems : []
}

describe('parseDoc', () => {
  it('accepts the example doc', () => {
    expect(parseDoc(exampleDoc)).toEqual({ status: 'ok', doc: exampleDoc })
  })

  it('survives a JSON round trip', () => {
    expect(parseDoc(JSON.parse(JSON.stringify(exampleDoc)))).toEqual({
      status: 'ok',
      doc: exampleDoc,
    })
  })

  describe('schema version', () => {
    it('reports a higher version as too new', () => {
      expect(parseDoc({ ...clone(), schemaVersion: 2 })).toEqual({ status: 'too-new' })
    })

    // A newer version may change the structure, so the v1 schema must not even look at it
    it('reports too new even if the structure would be invalid for this version', () => {
      expect(parseDoc({ schemaVersion: 2, cards: 'changed in v2' })).toEqual({ status: 'too-new' })
    })

    it.each([
      ['a lower version', 0],
      ['a version given as text', '2'],
      ['a missing version', undefined],
    ])('rejects %s as invalid', (_, schemaVersion) => {
      expect(problemsOf({ ...clone(), schemaVersion })).toEqual([
        expect.stringContaining('schemaVersion'),
      ])
    })
  })

  describe('structural errors', () => {
    it('rejects non-objects', () => {
      expect(problemsOf('hello')).not.toEqual([])
    })

    it('rejects an unknown field type with its path', () => {
      const doc = clone() as any
      doc.cards[0].template.fields[0].type = 'colour'
      expect(problemsOf(doc)).toEqual([expect.stringContaining('cards.0.template.fields.0.type')])
    })

    it('rejects min > max', () => {
      const doc = clone()
      doc.cards[0]!.template.fields[0] = { id: 'n', type: 'number', min: 5, max: 1 }
      expect(problemsOf(doc)).toEqual([expect.stringContaining('min must not be greater than max')])
    })

    it('rejects a default outside min/max', () => {
      const doc = clone()
      doc.cards[0]!.template.fields[0] = { id: 'n', type: 'number', min: 1, max: 5, default: 9 }
      expect(problemsOf(doc)).toEqual([expect.stringContaining('default must lie between')])
    })

    it('rejects blank names', () => {
      const doc = clone()
      doc.lists[0]!.name = '   '
      expect(problemsOf(doc)).not.toEqual([])
    })

    it('accepts a field without a label', () => {
      const doc = clone()
      delete doc.cards[0]!.template.fields[0]!.label
      expect(problemsOf(doc)).toEqual([])
    })

    it('rejects a blank field label', () => {
      const doc = clone()
      doc.cards[0]!.template.fields[0]!.label = '   '
      expect(problemsOf(doc)).toEqual([expect.stringContaining('cards.0.template.fields.0.label')])
    })
  })

  describe('integrity errors', () => {
    it('rejects duplicate card IDs', () => {
      const doc = clone()
      doc.cards[1]!.id = doc.cards[0]!.id
      expect(problemsOf(doc)).toContain('Duplicate card ID "noch-haltestellen"')
    })

    it('rejects duplicate reply IDs across cards', () => {
      const doc = clone()
      doc.cards[1]!.replies[0]!.id = 'noch-haltestellen-ja'
      expect(problemsOf(doc)).toContain('Duplicate reply ID "noch-haltestellen-ja"')
    })

    it('rejects a set referencing a missing card', () => {
      const doc = clone()
      doc.sets[0]!.cardIds.push('gibt-es-nicht')
      expect(problemsOf(doc)).toContain('Set "oepnv" references unknown card "gibt-es-nicht"')
    })

    it('rejects a choice field referencing a missing list', () => {
      const doc = clone()
      doc.lists = []
      expect(problemsOf(doc)).toContain(
        'Card "aussteigen": field "stop" references unknown list "haltestellen"',
      )
    })

    it('rejects placeholders without a field and fields without a placeholder', () => {
      const doc = clone()
      doc.cards[0]!.template.text = 'Noch {x} Haltestellen?'
      expect(problemsOf(doc)).toEqual([
        'Card "noch-haltestellen": placeholder "{x}" has no field definition',
        'Card "noch-haltestellen": field "n" is not used in the text',
      ])
    })

    it('reports template syntax errors in replies', () => {
      const doc = clone()
      doc.cards[0]!.replies[2]!.template.text = 'Nein, noch {n Haltestellen'
      expect(problemsOf(doc)).toEqual([
        expect.stringContaining(
          'Reply "noch-haltestellen-nein-anzahl" of card "noch-haltestellen": Unclosed',
        ),
      ])
    })
  })
})
