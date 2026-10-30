import type { Doc } from '../model/schema.ts'

/** Lists all sets with their cards. Placeholder until cards can be opened. */
export function CardListView({ doc }: { doc: Doc }) {
  // Look up cards by ID once instead of searching the array for every set entry
  const cardsById = new Map(doc.cards.map((card) => [card.id, card]))

  return (
    <main>
      <h1>Communication Cards</h1>
      {doc.sets.map((set) => (
        <section key={set.id}>
          <h2>{set.name}</h2>
          <ul>
            {set.cardIds.map((cardId) => (
              <li key={cardId}>{cardsById.get(cardId)?.template.text}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
