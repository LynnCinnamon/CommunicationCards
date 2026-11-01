import type { Doc, Template } from './schema.ts'
import { parseTemplate, TemplateSyntaxError } from './template.ts'

/**
 * Checks what the structural schema cannot: unique IDs, references between
 * cards, sets and lists, and that placeholders match field definitions.
 * Returns human-readable problems; an empty array means the doc is consistent.
 */
export function checkIntegrity(doc: Doc): string[] {
  //Collect problems in a single array so we can report all of them at once
  const problems: string[] = []
  //Collect unique IDs for cross-reference checks in a fast set
  const listIds = new Set(doc.lists.map((l) => l.id))
  const cardIds = new Set(doc.cards.map((c) => c.id))

  reportDuplicates(
    doc.lists.map((l) => l.id),
    'list',
    problems,
  )
  reportDuplicates(
    doc.sets.map((s) => s.id),
    'set',
    problems,
  )
  reportDuplicates(
    doc.cards.map((c) => c.id),
    'card',
    problems,
  )
  reportDuplicates(
    doc.cards.flatMap((c) => c.replies.map((r) => r.id)),
    'reply',
    problems,
  )

  for (const list of doc.lists) {
    reportDuplicates(
      list.values.map((v) => v.id),
      `value in list "${list.id}"`,
      problems,
    )
  }

  for (const set of doc.sets) {
    for (const cardId of set.cardIds) {
      if (!cardIds.has(cardId)) problems.push(`Set "${set.id}" references unknown card "${cardId}"`)
    }
  }

  for (const card of doc.cards) {
    checkTemplate(card.template, `Card "${card.id}"`, listIds, problems)
    for (const reply of card.replies) {
      checkTemplate(reply.template, `Reply "${reply.id}" of card "${card.id}"`, listIds, problems)
    }
  }

  return problems
}

function checkTemplate(
  template: Template,
  where: string,
  listIds: Set<string>,
  problems: string[],
) {
  const fieldIds = template.fields.map((f) => f.id)
  reportDuplicates(fieldIds, `field in ${where}`, problems)

  for (const field of template.fields) {
    if (field.type === 'choice' && !listIds.has(field.listId)) {
      problems.push(`${where}: field "${field.id}" references unknown list "${field.listId}"`)
    }
  }

  let placeholders: string[]
  try {
    placeholders = parseTemplate(template.text).flatMap((s) =>
      s.kind === 'field' ? [s.fieldId] : [],
    )
  } catch (e) {
    if (e instanceof TemplateSyntaxError) {
      //If we have a TemplateSyntaxError, we can report it as a problem in the doc instead of throwing it
      problems.push(`${where}: ${e.message}`)
      return
    }
    //If we have some other error, we don't know how to handle it, so rethrow it
    throw e
  }

  for (const id of placeholders) {
    if (!fieldIds.includes(id)) {
      problems.push(`${where}: placeholder "{${id}}" has no field definition`)
    }
  }
  for (const id of fieldIds) {
    if (!placeholders.includes(id)) problems.push(`${where}: field "${id}" is not used in the text`)
  }
}

function reportDuplicates(ids: string[], kind: string, problems: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) problems.push(`Duplicate ${kind} ID "${id}"`)
    seen.add(id)
  }
}
