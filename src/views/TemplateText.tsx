import type { Field, List, Template } from '../model/schema.ts'
import { parseTemplate } from '../model/template.ts'

/** Shown for fields without a label. Choice fields use their list's name instead. */
const typeNames = {
  number: 'Zahl',
  text: 'Text',
  datetime: { date: 'Datum', time: 'Uhrzeit', both: 'Datum & Uhrzeit' },
} as const

function fieldName(field: Field, lists: List[]): string {
  if (field.label) return field.label
  switch (field.type) {
    case 'choice':
      return lists.find((l) => l.id === field.listId)?.name ?? field.listId
    case 'datetime':
      return typeNames.datetime[field.mode]
    default:
      return typeNames[field.type]
  }
}

type Props = {
  template: Template
  lists: List[]
}

/** A template's text with its placeholders shown as named, unfilled chips: "Noch [Anzahl] Haltestellen?". */
export function TemplateText({ template, lists }: Props) {
  // Templates are integrity-checked on load, so parsing cannot fail and every placeholder has a field
  return (
    <>
      {parseTemplate(template.text).map((segment, i) => {
        if (segment.kind === 'text') return segment.value
        const field = template.fields.find((f) => f.id === segment.fieldId)
        return (
          <span key={i} class="placeholder">
            {field ? fieldName(field, lists) : segment.fieldId}
          </span>
        )
      })}
    </>
  )
}
