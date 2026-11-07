import type { Doc } from '../model/schema.ts'
import { getDateString } from '../storage/dateFuncs.ts'
import { downloadJson } from '../storage/downloadJson.ts'
import { ConfirmationButton } from './ConfirmationButton.tsx'
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
        {/* Reset deletes the stored data, so it asks first */}
        <ConfirmationButton
          actionLabel="Auf Beispielkarten zurücksetzen"
          confirmationLabel="Ja, zurücksetzen"
          explanation="Alle gespeicherten Karten werden durch die Beispielkarten ersetzt."
          buttonClass="action-button"
          onConfirm={onReset}
        ></ConfirmationButton>
      </div>
    </main>
  )
}
