import { useState } from 'preact/hooks'
import { downloadJson } from '../storage/downloadJson.ts'

type Props = {
  problems: string[]
  raw: unknown
  onReset: () => void
}

/**
 * Shown instead of the app when the stored data is invalid. Nothing is saved from
 * here except an explicit reset, so the broken data survives until the user decides.
 */
export function InvalidDataView({ problems, raw, onReset }: Props) {
  // Reset deletes the stored data, so it needs a second tap
  const [confirmingReset, setConfirmingReset] = useState(false)

  const exportRaw = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(raw, `communication-cards-defekt-${date}.json`)
  }

  return (
    <main>
      <h1>Gespeicherte Daten sind fehlerhaft</h1>
      <p>Die App kann deine Karten nicht laden. Exportiere die Daten, bevor du zurücksetzt.</p>
      <ul>
        {/* Index as key is fine: the list never changes while shown, and messages can repeat */}
        {problems.map((problem, i) => (
          <li key={i}>{problem}</li>
        ))}
      </ul>

      <button onClick={exportRaw}>Daten exportieren</button>

      {confirmingReset ? (
        <>
          <p>Alle gespeicherten Karten werden durch die Beispielkarten ersetzt.</p>
          <button onClick={onReset}>Ja, zurücksetzen</button>
          <button onClick={() => setConfirmingReset(false)}>Abbrechen</button>
        </>
      ) : (
        <button onClick={() => setConfirmingReset(true)}>Auf Beispielkarten zurücksetzen</button>
      )}
    </main>
  )
}
