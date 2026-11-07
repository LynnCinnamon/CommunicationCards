import type { TargetedInputEvent } from 'preact'
import { useState } from 'preact/hooks'
import {
  addSet,
  checkCardSet,
  isProblemFree,
  replaceSet,
  type SetProblems,
} from '../model/editorHelper.ts'
import { generateUniqueId } from '../model/idHelper.ts'
import type { Card, CardSet, Doc, List } from '../model/schema.ts'
import { routeHref, safeBack } from '../router.ts'
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
    const newDoc = replaceSet(doc, draft)
    return onSave(newDoc)
  }

  const saveNewDraft = async (draft: CardSet): Promise<void> => {
    const id = generateUniqueId(new Set(doc.sets.map((set) => set.id)))
    const newSet = { ...draft, id }
    const newDoc = addSet(doc, newSet)
    return onSave(newDoc)
  }

  const cardSet = doc.sets.find((s) => s.id === setId)
  return (
    <main>
      {/* Back to the list we came from; after a direct link, to the list without leaving the app */}
      <button type="button" class="back-button" onClick={() => safeBack({ name: 'list' })}>
        ← Zurück
      </button>

      {setId === null ? (
        <>
          <h1>Set erstellen</h1>
          <SetDraft
            cardSet={{ id: '', name: '', cardIds: [] }} // id='' can never clash with existing sets
            key={''}
            cards={doc.cards}
            lists={doc.lists}
            cardSets={doc.sets}
            saveDraft={saveNewDraft}
          ></SetDraft>
        </>
      ) : cardSet ? (
        <>
          <h1>Set bearbeiten</h1>
          <SetDraft
            cardSet={cardSet}
            key={cardSet.id}
            cards={doc.cards}
            lists={doc.lists}
            cardSets={doc.sets}
            saveDraft={saveDraft}
          ></SetDraft>
        </>
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
  const [error, setError] = useState('')

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
    setError('')
  }
  const save = () => {
    setError('')
    const newProblems = checkCardSet(cardSets, draft)
    setProblems(newProblems)
    if (!isProblemFree(newProblems)) {
      return // Early return to block saving. We already have extracted the problems.
    }
    setSaving(true)
    saveDraft(draft)
      .then(
        () => {
          safeBack({ name: 'list' })
        },
        (err) => {
          setError(`Fehler beim Speichern: ${String(err)}`)
        },
      )
      .finally(() => {
        setSaving(false)
      })
  }
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label class="editor-field">
          <span class="editor-field-label">Name</span>
          <input
            type="text"
            class="field-input"
            aria-invalid={problems.name.length > 0}
            aria-describedby="name-problems"
            onInput={nameChange}
            value={draft.name}
          ></input>
        </label>
        <div id="name-problems" role="status" class="error-message">
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
        <div role="status" class="error-message">
          {error}
        </div>
        <button class="save-button" type="submit" disabled={saving}>
          Speichern
        </button>
      </form>
    </>
  )
}
