import type { List } from '../../model/schema.ts'

type Props = {
  list: List
  selectedId: string | undefined
  onSelect: (valueId: string) => void
}

/** The values of a list as a row of buttons; one tap picks a value. */
export function ChoiceButtons({ list, selectedId, onSelect }: Props) {
  return (
    <div class="choice-buttons">
      {list.values.map((value) => (
        <button
          key={value.id}
          type="button"
          class="choice-button"
          // Tells screen readers which button is selected; the CSS styles the same attribute
          aria-pressed={value.id === selectedId}
          onClick={() => onSelect(value.id)}
        >
          {value.label}
        </button>
      ))}
    </div>
  )
}
