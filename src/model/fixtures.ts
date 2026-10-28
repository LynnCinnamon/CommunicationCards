import type { Doc } from './schema.ts'

/** The README examples as a Doc; used by tests and as a starting point for presets. */
export const exampleDoc: Doc = {
  schemaVersion: 1,
  lists: [
    {
      id: 'haltestellen',
      name: 'Haltestellen',
      values: [
        { id: 'hagenmarkt', label: 'Hagenmarkt' },
        { id: 'rathaus', label: 'Rathaus' },
        { id: 'schloss', label: 'Schloss' },
      ],
    },
  ],
  sets: [{ id: 'oepnv', name: 'ÖPNV', cardIds: ['noch-haltestellen', 'aussteigen'] }],
  cards: [
    {
      id: 'noch-haltestellen',
      template: {
        text: 'Noch {n} Haltestellen?',
        fields: [{ id: 'n', type: 'number', min: 1, default: 3 }],
      },
      replies: [
        { id: 'noch-haltestellen-ja', template: { text: 'Ja', fields: [] } },
        { id: 'noch-haltestellen-nein', template: { text: 'Nein', fields: [] } },
        {
          id: 'noch-haltestellen-nein-anzahl',
          template: {
            text: 'Nein, noch {n} Haltestellen',
            fields: [{ id: 'n', type: 'number', min: 0 }],
          },
        },
      ],
    },
    {
      id: 'aussteigen',
      template: {
        text: 'Steigen wir am {stop} aus?',
        fields: [{ id: 'stop', type: 'choice', listId: 'haltestellen' }],
      },
      replies: [
        { id: 'aussteigen-ja', template: { text: 'Ja', fields: [] } },
        { id: 'aussteigen-nein', template: { text: 'Nein', fields: [] } },
      ],
    },
  ],
}
