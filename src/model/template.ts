export type Segment = { kind: 'text'; value: string } | { kind: 'field'; fieldId: string }

export class TemplateSyntaxError extends Error {}

/**
 * Splits a template text into literal text and field placeholders.
 * `{id}` is a placeholder; `{{` and `}}` are literal braces.
 */
export function parseTemplate(text: string): Segment[] {
  const segments: Segment[] = []
  let literal = ''
  let i = 0

  const flush = () => {
    if (literal) segments.push({ kind: 'text', value: literal })
    literal = ''
  }

  while (i < text.length) {
    const char = text[i]
    const next = text[i + 1]

    if ((char === '{' && next === '{') || (char === '}' && next === '}')) {
      //Handle escaped braces as literal braces
      literal += char
      i += 2
    } else if (char === '{') {
      //Not escaped? Must be a placeholder
      //Find the closing brace and extract the field ID
      const end = text.indexOf('}', i)
      if (end === -1) throw new TemplateSyntaxError(`Unclosed "{" at position ${i}`)
      const fieldId = text.slice(i + 1, end)
      if (!/^[A-Za-z0-9_-]+$/.test(fieldId)) {
        throw new TemplateSyntaxError(`Invalid placeholder "{${fieldId}}" at position ${i}`)
      }
      flush() //Flush the literal text before the placeholder if any
      segments.push({ kind: 'field', fieldId })
      i = end + 1
    } else if (char === '}') {
      throw new TemplateSyntaxError(`Unmatched "}" at position ${i}`)
    } else {
      literal += char
      i++
    }
  }

  flush() //Flush any remaining literal text
  return segments
}

/** Renders a template with the given field values, e.g. { n: "3" } → "Noch 3 Haltestellen?". */
export function fillTemplate(text: string, values: Record<string, string>): string {
  return parseTemplate(text)
    .map((s) => (s.kind === 'text' ? s.value : (values[s.fieldId] ?? `{${s.fieldId}}`)))
    .join('')
}
