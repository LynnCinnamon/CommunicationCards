import type { DateTimeMode } from './schema.ts'

/** How a date/time value appears in the card sentence, or undefined if it's empty or malformed. */
export function formatDateTime(
  value: string,
  mode: DateTimeMode,
  now: Date = new Date(),
): string | undefined {
  switch (mode) {
    case 'time':
      return formatTime(value)
    case 'date':
      return formatDate(value, now)
    case 'both': {
      const parts = value.split('T')
      if (parts.length !== 2) return undefined
      const time = formatTime(parts[1]!)
      if (time === undefined) return undefined // Short-circuit with 'cheaper' function first

      const date = formatDate(parts[0]!, now)
      if (date === undefined) return undefined

      return `${date} um ${time}`
    }
  }
}

function formatTime(value: string): string | undefined {
  // Accepts "HH:MM:SS" and "HH:MM"
  const pattern = /^(\d\d):(\d\d)(?::\d\d)?$/

  const match = pattern.exec(value)
  if (!match) return undefined
  const hours = Number.parseInt(match[1]!)
  const minutes = Number.parseInt(match[2]!)

  if (hours >= 24) return undefined
  if (minutes >= 60) return undefined

  // Using hours to strip potential leading zero, using match[2] to keep potential leading zero
  return `${hours}:${match[2]}`
}

function formatDate(value: string, now: Date): string | undefined {
  // Accepts: YYYY-MM-DD and nothing else

  const pattern = /^(\d{4})-(\d\d)-(\d\d)$/

  const match = pattern.exec(value)
  if (!match) return undefined

  const year = Number.parseInt(match[1]!)
  const month = Number.parseInt(match[2]!)
  const day = Number.parseInt(match[3]!)

  const constructedDate = new Date(year, month - 1, day)

  if (constructedDate.getMonth() !== month - 1) return undefined
  if (constructedDate.getFullYear() !== year) return undefined

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: year === now.getFullYear() ? undefined : 'numeric', // Only outside current year
  }).format(constructedDate)
}
