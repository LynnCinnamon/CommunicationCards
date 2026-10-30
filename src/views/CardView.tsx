import type { ComponentChildren } from 'preact'
import { useId, useState } from 'preact/hooks'
import { initialNumber } from '../model/numberField.ts'
import type { Card, Doc, Field, List } from '../model/schema.ts'
import { routeHref } from '../router.ts'
import { ChoiceButtons } from './fields/ChoiceButtons.tsx'
import { ChoicePicker } from './fields/ChoicePicker.tsx'
import { DateTimePicker } from './fields/DateTimePicker.tsx'
import { NumberStepper } from './fields/NumberStepper.tsx'
import { TextInput } from './fields/TextInput.tsx'
import { TemplateText, fieldName } from './TemplateText.tsx'

/** Number fields hold their number, choice fields the ID of the selected list value.
 * Text and datetime fields hold their string, which may be empty.
 */
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
  // A function, so the initial values are only computed on the first render
  const [values, setValues] = useState(() => initialValues(card))
  const idPrefix = useId()
  const inputId = (field: Field) => `${idPrefix}-${field.id}`

  const setValue = (fieldId: string, value: FieldValue) => {
    // A new object instead of changing the old one, otherwise Preact doesn't notice the change
    setValues((old) => ({ ...old, [fieldId]: value }))
  }

  const displayValues: Record<string, string> = {}
  for (const field of card.template.fields) {
    const text = displayValue(field, values[field.id], lists)
    if (text !== undefined) displayValues[field.id] = text
  }

  // Fields in the sentence are tappable, a shortcut to their input below.
  // Choice fields can't use a label: below are several buttons rather than one input,
  // and a label would only focus a select without opening it. So they get their own select.
  const renderField = (field: Field, content: ComponentChildren) => {
    if (field.type === 'text' || field.type === 'datetime') {
      return (
        <label class="field-link" for={inputId(field)}>
          {content}
        </label>
      )
    }
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
            inputId={inputId(field)}
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
  inputId: string
  field: Field
  value: FieldValue | undefined
  lists: List[]
  onChange: (value: FieldValue) => void
}

/** The input matching the field's type. */
function FieldInput({ inputId, field, value, lists, onChange }: FieldInputProps) {
  switch (field.type) {
    case 'choice': {
      // Integrity checks guarantee the list exists; skipping keeps the types honest
      const list = lists.find((l) => l.id === field.listId)
      if (!list) return null
      return <ChoiceButtons list={list} selectedId={selectedChoice(value)} onSelect={onChange} />
    }
    case 'number':
      return (
        <NumberStepper
          field={field}
          label={fieldName(field, lists)}
          value={typeof value === 'number' ? value : initialNumber(field)}
          onChange={onChange}
        />
      )
    case 'text':
      return (
        <TextInput
          id={inputId}
          label={fieldName(field, lists)}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      )
    case 'datetime':
      return (
        <DateTimePicker
          id={inputId}
          mode={field.mode}
          label={fieldName(field, lists)}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      )
    default:
      return <p class="hint">Dieser Feldtyp kommt später.</p>
  }
}

/**
 * Number fields start at their initial number. Choice fields start empty, so the user can't
 * show a value they never chose.
 * Text and datetime fields start empty.
 */
function initialValues(card: Card): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = {}
  for (const field of card.template.fields) {
    if (field.type === 'number') values[field.id] = initialNumber(field)
  }
  return values
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
    case 'text': {
      const text = typeof value === 'string' ? value.trim() : ''
      return text === '' ? undefined : text
    }
    case 'datetime':
      return typeof value === 'string' && value !== '' ? value : undefined
    default:
      return String(value)
  }
}
