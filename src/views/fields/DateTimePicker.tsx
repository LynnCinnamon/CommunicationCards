import type { DateTimeField } from '../../model/schema.ts'

type DateTimeMode = DateTimeField['mode']

type Props = {
  id: string
  mode: DateTimeMode
  /** Names the input for screen readers; the legend above only names the surrounding fieldset */
  label: string
  value: string
  onChange: (value: string) => void
}

const inputTypes = {
  date: 'date',
  time: 'time',
  both: 'datetime-local',
} as const satisfies Record<DateTimeMode, string>

/** The browser's native date and/or time picker, depending on the field's mode. */
export function DateTimePicker({ id, mode, label, value, onChange }: Props) {
  return (
    <input
      id={id}
      class="field-input"
      type={inputTypes[mode]}
      aria-label={label}
      value={value}
      onInput={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}
