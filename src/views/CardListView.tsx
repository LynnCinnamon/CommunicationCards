import type { Doc } from '../model/schema.ts'
import { TemplateText } from './TemplateText.tsx'

/** Lists all sets with their cards. Cards cannot be opened yet. */
export function CardListView({ doc }: { doc: Doc }) {
  // Look up cards by ID once instead of searching the array for every set entry
  const cardsById = new Map(doc.cards.map((card) => [card.id, card]))

  return (
    <main>
      <h1>Communication Cards</h1>
      {doc.sets.map((set) => (
        <section key={set.id}>
          <h2>{set.name}</h2>
          <ul class="card-list">
            {set.cardIds.map((cardId) => {
              const card = cardsById.get(cardId)
              // Integrity checks guarantee the card exists; skipping keeps the types honest
              if (!card) return null
              return (
                <li key={cardId}>
                  <button type="button" class="card-button">
                    <TemplateText template={card.template} lists={doc.lists} />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}
