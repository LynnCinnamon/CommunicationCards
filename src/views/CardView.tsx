import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import type { Card, Doc, Field, List } from '../model/schema.ts'
import { routeHref } from '../router.ts'
import { ChoiceButtons } from './fields/ChoiceButtons.tsx'
import { ChoicePicker } from './fields/ChoicePicker.tsx'
import { TemplateText, fieldName } from './TemplateText.tsx'

/** Number fields hold their number, choice fields the ID of the selected list value. */
type FieldValue = number | string

type Props = {
  doc: Doc
  cardId: string
}

/** A single opened card, or a way back if it doesn't exist. */
export function CardView({ doc, cardId }: Props) {
  const card = doc.cards.find((c) => c.id === cardId)

  return (
    <main>
      {/* Same as the phone's back button, so the list doesn't end up in the history twice */}
      <button type="button" class="back-button" onClick={() => history.back()}>
        ← Zurück
      </button>

      {card ? (
        // The key gives every card its own component instance, so values never carry over between cards
        <CardForm key={card.id} card={card} lists={doc.lists} />
      ) : (
        // An old link or a deleted card: offer a way out instead of an empty screen
        <>
          <p>Diese Karte gibt es nicht (mehr).</p>
          <a href={routeHref({ name: 'list' })}>Zur Kartenliste</a>
        </>
      )}
    </main>
  )
}

/** The card's sentence as a live preview, with one input per field below it. */
function CardForm({ card, lists }: { card: Card; lists: List[] }) {
  // Starts empty: nothing is preselected, so the user can't show a value they never chose
  const [values, setValues] = useState<Record<string, FieldValue>>({})

  const setValue = (fieldId: string, value: FieldValue) => {
    // A new object instead of changing the old one, otherwise Preact doesn't notice the change
    setValues((old) => ({ ...old, [fieldId]: value }))
  }

  const displayValues: Record<string, string> = {}
  for (const field of card.template.fields) {
    const text = displayValue(field, values[field.id], lists)
    if (text !== undefined) displayValues[field.id] = text
  }

  // Choice fields in the sentence open the native picker, a shortcut for long lists
  const renderField = (field: Field, content: ComponentChildren) => {
    if (field.type !== 'choice') return content
    const list = lists.find((l) => l.id === field.listId)
    if (!list) return content
    return (
      <ChoicePicker
        list={list}
        label={fieldName(field, lists)}
        selectedId={selectedChoice(values[field.id])}
        onSelect={(id) => setValue(field.id, id)}
      >
        {content}
      </ChoicePicker>
    )
  }

  return (
    <>
      <p class="card-text">
        <TemplateText
          template={card.template}
          lists={lists}
          values={displayValues}
          renderField={renderField}
        />
      </p>

      {card.template.fields.map((field) => (
        <fieldset key={field.id} class="field">
          <legend>{fieldName(field, lists)}</legend>
          <FieldInput
            field={field}
            value={values[field.id]}
            lists={lists}
            onChange={(v) => setValue(field.id, v)}
          />
        </fieldset>
      ))}
    </>
  )
}

type FieldInputProps = {
  field: Field
  value: FieldValue | undefined
  lists: List[]
  onChange: (value: FieldValue) => void
}

/** The input matching the field's type. */
function FieldInput({ field, value, lists, onChange }: FieldInputProps) {
  switch (field.type) {
    case 'choice': {
      // Integrity checks guarantee the list exists; skipping keeps the types honest
      const list = lists.find((l) => l.id === field.listId)
      if (!list) return null
      return <ChoiceButtons list={list} selectedId={selectedChoice(value)} onSelect={onChange} />
    }
    default:
      return <p class="hint">Dieser Feldtyp kommt später.</p>
  }
}

/** The selected list value's ID; number values can't belong to a choice field. */
function selectedChoice(value: FieldValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

/** How a field's value appears in the sentence, or undefined while the field is unfilled. */
function displayValue(
  field: Field,
  value: FieldValue | undefined,
  lists: List[],
): string | undefined {
  if (value === undefined) return undefined
  switch (field.type) {
    case 'choice':
      return lists.find((l) => l.id === field.listId)?.values.find((v) => v.id === value)?.label
    default:
      return String(value)
  }
}
