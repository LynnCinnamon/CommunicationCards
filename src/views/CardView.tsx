import type { Doc } from '../model/schema.ts'
import { routeHref } from '../router.ts'
import { TemplateText } from './TemplateText.tsx'

type Props = {
  doc: Doc
  cardId: string
}

/** A single opened card. Placeholder until its fields can be filled in. */
export function CardView({ doc, cardId }: Props) {
  const card = doc.cards.find((c) => c.id === cardId)

  return (
    <main>
      {/* Same as the phone's back button, so the list doesn't end up in the history twice */}
      <button type="button" class="back-button" onClick={() => history.back()}>
        ← Zurück
      </button>

      {card ? (
        <p class="card-text">
          <TemplateText template={card.template} lists={doc.lists} />
        </p>
      ) : (
        // An old link or a deleted card: offer a way out instead of an empty screen
        <>
          <p>Diese Karte gibt es nicht (mehr).</p>
          <a href={routeHref({ name: 'list' })}>Zur Kartenliste</a>
        </>
      )}
    </main>
  )
}
