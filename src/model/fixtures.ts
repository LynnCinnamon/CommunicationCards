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
  sets: [
    {
      id: 'oepnv',
      name: 'ÖPNV',
      cardIds: ['noch-haltestellen', 'aussteigen'],
    },
    {
      id: 'smalltalk',
      name: 'Smalltalk',
      cardIds: ['vorstellung'],
    },
    {
      id: 'treffen',
      name: 'Treffen',
      cardIds: ['treffen-datetime', 'treffen-date', 'treffen-time'],
    },
  ],
  cards: [
    {
      id: 'noch-haltestellen',
      template: {
        text: 'Noch {n} Haltestellen?',
        fields: [{ id: 'n', label: 'Anzahl', type: 'number', min: 1, default: 3 }],
      },
      replies: [
        { id: 'noch-haltestellen-ja', template: { text: 'Ja', fields: [] } },
        { id: 'noch-haltestellen-nein', template: { text: 'Nein', fields: [] } },
        {
          id: 'noch-haltestellen-nein-anzahl',
          template: {
            text: 'Nein, noch {n} Haltestellen',
            fields: [{ id: 'n', label: 'Anzahl', type: 'number', min: 0 }],
          },
        },
      ],
    },
    {
      id: 'aussteigen',
      template: {
        text: 'Steigen wir am {stop} aus?',
        fields: [{ id: 'stop', label: 'Haltestelle', type: 'choice', listId: 'haltestellen' }],
      },
      replies: [
        { id: 'aussteigen-ja', template: { text: 'Ja', fields: [] } },
        { id: 'aussteigen-nein', template: { text: 'Nein', fields: [] } },
      ],
    },
    {
      id: 'vorstellung',
      template: {
        text: 'Hallo, ich bin {name}.',
        fields: [{ id: 'name', label: 'Name', type: 'text' }],
      },
      replies: [],
    },
    {
      id: 'treffen-datetime',
      template: {
        text: 'Treffen am {when}?',
        fields: [{ id: 'when', label: 'Datum & Uhrzeit', type: 'datetime', mode: 'both' }],
      },
      replies: [],
    },
    {
      id: 'treffen-date',
      template: {
        text: 'Treffen am {when}?',
        fields: [{ id: 'when', label: 'Datum', type: 'datetime', mode: 'date' }],
      },
      replies: [],
    },
    {
      id: 'treffen-time',
      template: {
        text: 'Treffen um {when}?',
        fields: [{ id: 'when', label: 'Uhrzeit', type: 'datetime', mode: 'time' }],
      },
      replies: [],
    },
  ],
}
