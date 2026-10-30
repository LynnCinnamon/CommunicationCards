type Props = {
  id: string
  /** Names the input for screen readers; the legend above only names the surrounding fieldset */
  label: string
  value: string
  onChange: (value: string) => void
}

/** A single line of free text, e.g. a name. */
export function TextInput({ id, label, value, onChange }: Props) {
  return (
    <input
      id={id}
      class="text-input"
      type="text"
      inputMode="text"
      enterKeyHint="done"
      aria-label={label}
      value={value}
      onInput={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      autocomplete="off"
    />
  )
}
