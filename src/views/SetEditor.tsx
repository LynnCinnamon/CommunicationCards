import type { TargetedInputEvent } from 'preact'
import { useState } from 'preact/hooks'
import { checkCardSet, isProblemFree, rebuildDoc, type SetProblems } from '../model/editorHelper.ts'
import type { Card, CardSet, Doc, List } from '../model/schema.ts'
import { routeHref } from '../router.ts'
import { TemplateText } from './TemplateText.tsx'

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
  const saveDraft = async (draft: CardSet): Promise<void> => {
    const newDoc = rebuildDoc(doc, draft)
    return onSave(newDoc)
  }

  const cardSet = doc.sets.find((s) => s.id === setId)
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
        <SetDraft
          cardSet={cardSet}
          key={cardSet.id}
          cards={doc.cards}
          lists={doc.lists}
          cardSets={doc.sets}
          saveDraft={saveDraft}
        ></SetDraft>
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

function SetDraft({
  cards,
  cardSet,
  lists,
  cardSets,
  saveDraft,
}: {
  cards: Card[]
  cardSet: CardSet
  lists: List[]
  cardSets: CardSet[]
  saveDraft: (draft: CardSet) => Promise<void>
}) {
  const [draft, setDraft] = useState(cardSet)
  const [problems, setProblems] = useState<SetProblems>({ name: [] })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const updateCardInclusion = (cardId: string, newStatus: boolean) => {
    if (newStatus) {
      setDraft({ ...draft, cardIds: [...draft.cardIds, cardId] })
      return
    }
    setDraft({ ...draft, cardIds: draft.cardIds.filter((id) => id !== cardId) })
  }

  const nameChange = (element: TargetedInputEvent<HTMLInputElement>) => {
    setDraft({ ...draft, name: element.currentTarget.value })
    // Clear the name field in our problems because we changed the checked value
    setProblems({ ...problems, name: [] })
    setMessage('')
  }
  const save = () => {
    setMessage('')
    const newProblems = checkCardSet(cardSets, draft)
    setProblems(newProblems)
    if (!isProblemFree(newProblems)) {
      return // Early return to block saving. We already have extracted the problems.
    }
    setSaving(true)
    saveDraft(draft)
      .then(
        () => {
          setMessage('Erfolgreich gespeichert')
        },
        (err) => {
          setMessage(`Fehler beim Speichern: ${String(err)}`)
        },
      )
      .finally(() => {
        setSaving(false)
      })
  }
  return (
    <>
      <h1>Set bearbeiten</h1>
      <label class="editor-field">
        <span class="editor-field-label">Name</span>
        <input type="text" class="field-input" onInput={nameChange} value={draft.name}></input>
      </label>
      <div role="status">
        {problems.name.map((problem) => {
          return <span key={problem}>{problem}</span>
        })}
      </div>
      <h2>Karten</h2>
      <ul class="card-list">
        {cards.map((card) => {
          const included = draft.cardIds.includes(card.id)
          return (
            <li key={card.id}>
              <label class="card-check">
                <input
                  type="checkbox"
                  onChange={() => {
                    updateCardInclusion(card.id, !included)
                  }}
                  checked={included}
                ></input>
                {/* One flex item: TemplateText renders several nodes, which would each get the gap */}
                <span>
                  <TemplateText template={card.template} lists={lists} />
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      <div role="status">{message}</div>
      <button onClick={save} disabled={saving}>
        Speichern
      </button>
    </>
  )
}
