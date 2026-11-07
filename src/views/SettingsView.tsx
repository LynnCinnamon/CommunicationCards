import { useState } from 'preact/hooks'
import type { Doc } from '../model/schema.ts'
import { getDateString } from '../storage/dateFuncs.ts'
import { downloadJson } from '../storage/downloadJson.ts'
import { ConfirmationButton } from './ConfirmationButton.tsx'
import { ImportDoc } from './ImportDoc.tsx'

/** Settings screen, reset and import buttons and export option. */
export function SettingsView({
  doc,
  onReset,
  onImport,
}: {
  doc: Doc
  onReset: () => Promise<void>
  onImport: (doc: Doc) => Promise<void>
}) {
  const [showResetMessage, setShowResetMessage] = useState(false)

  const onResetClick = () => {
    onReset().then(() => {
      setShowResetMessage(true)
    })
  }

  const clickConfirmReset = () => {
    setShowResetMessage(false)
  }

  const exportDoc = () => {
    const dateStr = getDateString()
    downloadJson(doc, `communication-cards-${dateStr}.json`)
  }

  return (
    <main>
      <button type="button" class="back-button" onClick={() => history.back()}>
        ← Zurück
      </button>
      <h1>Einstellungen</h1>
      <section class="action-list">
        <button type="button" class="action-button" onClick={exportDoc}>
          Karten exportieren
        </button>
        <ImportDoc onImport={onImport} />
        <ConfirmationButton
          actionLabel="Auf Beispielkarten zurücksetzen"
          confirmationLabel="Ja, zurücksetzen"
          explanation="Alle gespeicherten Karten werden durch die Beispielkarten ersetzt."
          buttonClass="action-button"
          onConfirm={onResetClick}
          onConfirmOpen={clickConfirmReset}
        ></ConfirmationButton>
        {/* Always rendered: screen readers only announce changes to a live region that already exists */}
        <p role="status">{showResetMessage && 'Die Karten wurden zurückgesetzt.'}</p>
      </section>
    </main>
  )
}
