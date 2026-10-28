import * as v from 'valibot'

export const SCHEMA_VERSION = 1

const Id = v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]+$/, 'IDs may only contain letters, digits, "_" and "-"'))
const Name = v.pipe(v.string(), v.trim(), v.nonEmpty())

const NumberField = v.pipe(
  v.object({
    id: Id,
    type: v.literal('number'),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    default: v.optional(v.number()),
  }),
  v.check(
    (f) => f.min === undefined || f.max === undefined || f.min <= f.max,
    'min must not be greater than max',
  ),
  v.check(
    (f) =>
      f.default === undefined ||
      ((f.min === undefined || f.default >= f.min) && (f.max === undefined || f.default <= f.max)),
    'default must lie between min and max',
  ),
)

const ChoiceField = v.object({
  id: Id,
  type: v.literal('choice'),
  listId: Id,
})

const DateTimeField = v.object({
  id: Id,
  type: v.literal('datetime'),
  mode: v.picklist(['date', 'time', 'both']),
})

const TextField = v.object({
  id: Id,
  type: v.literal('text'),
})

export const FieldSchema = v.variant('type', [NumberField, ChoiceField, DateTimeField, TextField])

/** A sentence with placeholders like "Noch {n} Haltestellen?" plus the definitions of its fields. */
export const TemplateSchema = v.object({
  text: v.pipe(v.string(), v.nonEmpty()),
  fields: v.array(FieldSchema),
})

export const ReplySchema = v.object({
  id: Id,
  template: TemplateSchema,
})

export const CardSchema = v.object({
  id: Id,
  template: TemplateSchema,
  replies: v.array(ReplySchema),
})

export const ListSchema = v.object({
  id: Id,
  name: Name,
  values: v.array(v.object({ id: Id, label: Name })),
})

export const CardSetSchema = v.object({
  id: Id,
  name: Name,
  cardIds: v.array(Id),
})

/** The full user content: what gets stored, exported and imported. Usage data (favorites, recents) lives elsewhere. */
export const DocSchema = v.object({
  schemaVersion: v.literal(SCHEMA_VERSION),
  lists: v.array(ListSchema),
  sets: v.array(CardSetSchema),
  cards: v.array(CardSchema),
})

export type Field = v.InferOutput<typeof FieldSchema>
export type Template = v.InferOutput<typeof TemplateSchema>
export type Reply = v.InferOutput<typeof ReplySchema>
export type Card = v.InferOutput<typeof CardSchema>
export type List = v.InferOutput<typeof ListSchema>
export type CardSet = v.InferOutput<typeof CardSetSchema>
export type Doc = v.InferOutput<typeof DocSchema>
