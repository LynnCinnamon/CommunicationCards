import { useState } from 'preact/hooks'
import type { Doc } from '../model/schema.ts'
import { getDateString } from '../storage/dateFuncs.ts'
import { downloadJson } from '../storage/downloadJson.ts'
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
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [showResetMessage, setShowResetMessage] = useState(false)

  const onResetClick = () => {
    onReset().then(() => {
      setConfirmingReset(false)
      setShowResetMessage(true)
    })
  }

  const clickConfirmReset = () => {
    setConfirmingReset(true)
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
        {confirmingReset ? (
          <>
            <p>Alle gespeicherten Karten werden durch die Beispielkarten ersetzt.</p>
            <button type="button" class="action-button" onClick={onResetClick}>
              Ja, zurücksetzen
            </button>
            <button type="button" class="action-button" onClick={() => setConfirmingReset(false)}>
              Abbrechen
            </button>
          </>
        ) : (
          <button type="button" class="action-button" onClick={clickConfirmReset}>
            Auf Beispielkarten zurücksetzen
          </button>
        )}

        {/* Always rendered: screen readers only announce changes to a live region that already exists */}
        <p role="status">{showResetMessage && 'Die Karten wurden zurückgesetzt.'}</p>
      </section>
    </main>
  )
}
