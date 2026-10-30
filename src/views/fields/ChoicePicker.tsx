import type { ComponentChildren } from 'preact'
import type { List } from '../../model/schema.ts'

type Props = {
  list: List
  /** Read out by screen readers, since the select itself is invisible */
  label: string
  selectedId: string | undefined
  onSelect: (valueId: string) => void
  /** What is visible: the field's value or chip in the sentence */
  children: ComponentChildren
}

/**
 * Makes its children open the system's native picker for a list when tapped.
 *
 * An invisible <select> lies on top of the children, so the tap lands on the select itself.
 * Opening a picker from code with `select.showPicker()` would be simpler, but Safari doesn't
 * support it on <select> yet: https://caniuse.com/wf-show-picker-select
 */
export function ChoicePicker({ list, label, selectedId, onSelect, children }: Props) {
  return (
    <span class="choice-picker">
      {children}
      <select
        aria-label={label}
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.currentTarget.value)}
      >
        {/*
          Selected while nothing is chosen. Without it, the browser may select the first value on
          its own, and picking that value would then fire no change event.
        */}
        <option value="" disabled>
          {label}
        </option>
        {list.values.map((value) => (
          <option key={value.id} value={value.id}>
            {value.label}
          </option>
        ))}
      </select>
    </span>
  )
}
