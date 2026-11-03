import { useState } from 'preact/hooks'
import type { Doc } from '../model/schema.ts'
import { getDateString } from '../storage/dateFuncs.ts'
import { downloadJson } from '../storage/downloadJson.ts'
import { ImportDoc } from './ImportDoc.tsx'

type Props = {
  problems: string[]
  raw: unknown
  onImport: (doc: Doc) => Promise<void>
  onReset: () => void
}

/**
 * Shown instead of the app when the stored data is invalid. Nothing is saved from
 * here except explicit reset or import, so the broken data survives until the user decides.
 */
export function InvalidDataView({ problems, raw, onReset, onImport }: Props) {
  // Reset deletes the stored data, so it needs a second tap
  const [confirmingReset, setConfirmingReset] = useState(false)

  const exportRaw = () => {
    const date = getDateString()
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
      <div class="action-list">
        <button class="action-button" onClick={exportRaw}>
          Daten exportieren
        </button>
        <ImportDoc onImport={onImport} />

        {confirmingReset ? (
          <>
            <p>Alle gespeicherten Karten werden durch die Beispielkarten ersetzt.</p>
            <button class="action-button" onClick={onReset}>
              Ja, zurücksetzen
            </button>
            <button class="action-button" onClick={() => setConfirmingReset(false)}>
              Abbrechen
            </button>
          </>
        ) : (
          <button class="action-button" onClick={() => setConfirmingReset(true)}>
            Auf Beispielkarten zurücksetzen
          </button>
        )}
      </div>
    </main>
  )
}
