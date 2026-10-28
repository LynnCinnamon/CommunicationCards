import { describe, expect, it } from 'vitest'
import { fillTemplate, parseTemplate, TemplateSyntaxError } from './template.ts'

describe('parseTemplate', () => {
  it('splits text and placeholders', () => {
    expect(parseTemplate('Noch {n} Haltestellen?')).toEqual([
      { kind: 'text', value: 'Noch ' },
      { kind: 'field', fieldId: 'n' },
      { kind: 'text', value: ' Haltestellen?' },
    ])
  })

  it('handles adjacent placeholders and text-only templates', () => {
    expect(parseTemplate('{a}{b}')).toEqual([
      { kind: 'field', fieldId: 'a' },
      { kind: 'field', fieldId: 'b' },
    ])
    expect(parseTemplate('Ja')).toEqual([{ kind: 'text', value: 'Ja' }])
  })

  it('treats doubled braces as literals', () => {
    expect(parseTemplate('{{x}} = {x}')).toEqual([
      { kind: 'text', value: '{x} = ' },
      { kind: 'field', fieldId: 'x' },
    ])
  })

  it.each(['Noch {n Haltestellen', 'a } b', '{}', '{a b}'])('rejects %j', (text) => {
    expect(() => parseTemplate(text)).toThrow(TemplateSyntaxError)
  })
})

describe('fillTemplate', () => {
  it('fills in values', () => {
    expect(fillTemplate('Noch {n} Haltestellen?', { n: '3' })).toBe('Noch 3 Haltestellen?')
  })

  it('leaves unfilled placeholders visible', () => {
    expect(fillTemplate('Steigen wir am {stop} aus?', {})).toBe('Steigen wir am {stop} aus?')
  })
})
