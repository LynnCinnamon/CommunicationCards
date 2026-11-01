import { Fragment, type ComponentChildren } from 'preact'
import type { Field, List, Template } from '../model/schema.ts'
import { parseTemplate } from '../model/template.ts'

/** Shown for fields without a label. Choice fields use their list's name instead. */
const typeNames = {
  number: 'Zahl',
  text: 'Text',
  datetime: { date: 'Datum', time: 'Uhrzeit', both: 'Datum & Uhrzeit' },
} as const

/** The name shown for a field: in chips and as the heading of its input. */
export function fieldName(field: Field, lists: List[]): string {
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
  /** Display text per field ID. Fields without an entry are shown as chips. */
  values?: Record<string, string>
  /** Wraps a field's value or chip, e.g. to make it tappable. Without it, fields are plain text. */
  renderField?: (field: Field, content: ComponentChildren) => ComponentChildren
}

/**
 * A template's text with filled fields shown as their value and the others as named chips:
 * "Noch 3 Haltestellen?" or "Noch [Anzahl] Haltestellen?".
 */
export function TemplateText({ template, lists, values, renderField }: Props) {
  // Templates are integrity-checked on load, so parsing cannot fail and every placeholder has a field
  return (
    <>
      {parseTemplate(template.text).map((segment, i) => {
        if (segment.kind === 'text') return segment.value
        const field = template.fields.find((f) => f.id === segment.fieldId)
        const value = values?.[segment.fieldId]
        const content =
          value !== undefined ? (
            <strong class="filled">{value}</strong>
          ) : (
            <span class="placeholder">{field ? fieldName(field, lists) : segment.fieldId}</span>
          )
        return (
          <Fragment key={i}>
            {field && renderField ? renderField(field, content) : content}
          </Fragment>
        )
      })}
    </>
  )
}
