import { useState } from 'preact/hooks'

/** Settings screen, currently only a reset button. */
export function SettingsView({ onReset }: { onReset: () => Promise<void> }) {
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

  return (
    <main>
      <button type="button" class="back-button" onClick={() => history.back()}>
        ← Zurück
      </button>
      <h1>Einstellungen</h1>

      <section class="settings-section">
        {confirmingReset ? (
          <>
            <p>Alle gespeicherten Karten werden durch die Beispielkarten ersetzt.</p>
            <button type="button" class="settings-button" onClick={onResetClick}>
              Ja, zurücksetzen
            </button>
            <button type="button" class="settings-button" onClick={() => setConfirmingReset(false)}>
              Abbrechen
            </button>
          </>
        ) : (
          <button type="button" class="settings-button" onClick={clickConfirmReset}>
            Auf Beispielkarten zurücksetzen
          </button>
        )}

        {/* Always rendered: screen readers only announce changes to a live region that already exists */}
        <p role="status">{showResetMessage && 'Die Karten wurden zurückgesetzt.'}</p>
      </section>
    </main>
  )
}
