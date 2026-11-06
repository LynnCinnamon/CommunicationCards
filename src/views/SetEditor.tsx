import { useState } from 'preact/hooks'
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
        <SetDraft cardSet={cardSet} key={cardSet.id} cards={doc.cards} lists={doc.lists}></SetDraft>
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

function SetDraft({ cards, cardSet, lists }: { cards: Card[]; cardSet: CardSet; lists: List[] }) {
  const [draft, setDraft] = useState(cardSet)

  const updateCardInclusion = (cardId: string, newStatus: boolean) => {
    if (newStatus) {
      setDraft({ ...draft, cardIds: [...draft.cardIds, cardId] })
      return
    }
    setDraft({ ...draft, cardIds: draft.cardIds.filter((id) => id !== cardId) })
  }

  return (
    <>
      <label>
        Name:
        <input
          type="text"
          onInput={(e) => {
            setDraft({ ...draft, name: e.currentTarget.value })
          }}
          value={draft.name}
        ></input>
      </label>
      <ul>
        {cards.map((card) => {
          const included = draft.cardIds.includes(card.id)
          return (
            <li key={card.id}>
              <label>
                <input
                  type="checkbox"
                  onChange={() => {
                    updateCardInclusion(card.id, !included)
                  }}
                  checked={included}
                ></input>
                <TemplateText template={card.template} lists={lists} />
              </label>
            </li>
          )
        })}
      </ul>
    </>
  )
}
