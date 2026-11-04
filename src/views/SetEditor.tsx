import type { Doc } from '../model/schema.ts'
import { routeHref } from '../router.ts'

/** Edits one set, or creates a new one when there is no set ID. Changes are only stored via onSave. */
export function SetEditor({
  doc,
  setId,
  onSave,
}: {
  doc: Doc
  setId: string | null
  onSave: (doc: Doc) => Promise<void>
}) {
  const cardSet = doc.sets.find((s) => s.id === setId)
  void onSave // Used once saving exists
  return (
    <main>
      {/* Same as the phone's back button, so the list doesn't end up in the history twice */}
      <button type="button" class="back-button" onClick={() => history.back()}>
        ← Zurück
      </button>

      {setId === null ? (
        <>
          <p>Neues Set Editor placeholder.</p>
          <a href={routeHref({ name: 'list' })}>Zur Kartenliste</a>
        </>
      ) : cardSet ? (
        <p>Editor for set {setId}</p>
      ) : (
        // An old link or a deleted set: offer a way out instead of an empty screen
        <>
          <p>Dieses Set gibt es nicht (mehr).</p>
          <a href={routeHref({ name: 'list' })}>Zur Kartenliste</a>
        </>
      )}
    </main>
  )
}
