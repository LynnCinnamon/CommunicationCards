import type { NumberField } from './schema.ts'

/** Moves a number into the field's min/max range. */
export function clampToField(n: number, field: NumberField): number {
  if (field.min !== undefined && n < field.min) return field.min
  if (field.max !== undefined && n > field.max) return field.max
  return n
}

/** The value a number field starts with: its default, otherwise the number closest to 0 in its range. */
export function initialNumber(field: NumberField): number {
  return field.default ?? clampToField(0, field)
}

/** Parses typed text as a whole number, or returns undefined for "", "-", "1.5", "1e5" and the like. */
export function parseWholeNumber(text: string): number | undefined {
  return /^-?\d+$/.test(text.trim()) ? Number(text) : undefined
}
