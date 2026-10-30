import { useState } from 'preact/hooks'
import { clampToField, parseWholeNumber } from '../../model/numberField.ts'
import type { NumberField } from '../../model/schema.ts'

type Props = {
  field: NumberField
  /** Used to name the buttons and the input for screen readers */
  label: string
  value: number
  onChange: (value: number) => void
}

/** − and + buttons around the number; tapping the number opens the numeric keyboard. */
export function NumberStepper({ field, label, value, onChange }: Props) {
  // The text while typing, which may be incomplete like "" or "-". Null when not typing.
  const [draft, setDraft] = useState<string | null>(null)

  const handleInput = (text: string) => {
    setDraft(text)
    // Only complete numbers update the sentence; anything else waits for more typing
    const n = parseWholeNumber(text)
    if (n !== undefined) onChange(clampToField(n, field))
  }

  const selectAll = (input: HTMLInputElement) => {
    // Select all text, so the user can just type a new number
    // Runs on focus and click, so the user can tap to select all even after the input was already focused and the keyboard was dismissed.
    input.select()
  }

  const step = (delta: number) => {
    // Not every browser blurs the input when a button is tapped, so drop the draft here too
    setDraft(null)
    onChange(clampToField(value + delta, field))
  }

  return (
    <div class="stepper">
      <button
        type="button"
        class="stepper-button"
        aria-label={`${label} verringern`}
        disabled={field.min !== undefined && value <= field.min}
        onClick={() => step(-1)}
      >
        −
      </button>
      <input
        class="stepper-value"
        // Not type="number": that accepts "1e5", reports half-typed input as "" and reacts to the mouse wheel
        type="text"
        inputMode="numeric"
        enterKeyHint="done"
        aria-label={label}
        value={draft ?? String(value)}
        onInput={(e) => handleInput(e.currentTarget.value)}
        // Dropping the draft shows the last valid value, so an empty or clamped input corrects itself
        onBlur={() => setDraft(null)}
        onFocus={(e) => selectAll(e.currentTarget)}
        onClick={(e) => selectAll(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <button
        type="button"
        class="stepper-button"
        aria-label={`${label} erhöhen`}
        disabled={field.max !== undefined && value >= field.max}
        onClick={() => step(1)}
      >
        +
      </button>
    </div>
  )
}
