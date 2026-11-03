import type { Doc } from '../model/schema.ts'
import { routeHref } from '../router.ts'
import { TemplateText } from './TemplateText.tsx'

/** Lists all sets with their cards. Tapping a card opens it. */
export function CardListView({
  doc,
  setId,
  setSetId,
}: {
  doc: Doc
  setId: string | null
  setSetId: (id: string) => void
}) {
  // Look up cards by ID once instead of searching the array for every set entry
  const cardsById = new Map(doc.cards.map((card) => [card.id, card]))

  const cardSet = doc.sets.find((set) => set.id === setId) ?? doc.sets[0]

  return (
    <main>
      <h1>Communication Cards</h1>
      <a href={routeHref({ name: 'settings' })}>⚙️ Einstellungen</a>
      <div class="set-tabs">
        {doc.sets.map((set) => {
          return (
            <button
              class="set-tab"
              key={set.id}
              aria-pressed={set.id === cardSet?.id}
              onClick={() => setSetId(set.id)}
            >
              {set.name}
            </button>
          )
        })}
      </div>
      {cardSet && (
        <section key={cardSet.id}>
          <h2>{cardSet.name}</h2>
          <ul class="card-list">
            {cardSet.cardIds.map((cardId) => {
              const card = cardsById.get(cardId)
              // Integrity checks guarantee the card exists; skipping keeps the types honest
              if (!card) return null
              return (
                <li key={cardId}>
                  {/* A link, not a button: opening a card is navigation and must create a history entry */}
                  <a class="card-button" href={routeHref({ name: 'card', cardId, show: false })}>
                    <TemplateText template={card.template} lists={doc.lists} />
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
