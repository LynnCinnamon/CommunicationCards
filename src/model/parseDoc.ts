import * as v from 'valibot'
import { checkIntegrity } from './integrity.ts'
import { DocSchema, type Doc } from './schema.ts'

export type ParseResult = { ok: true; doc: Doc } | { ok: false; problems: string[] }

/** Validates untrusted data (e.g. an imported file) as a Doc: structure first, then references. */
//Unknown is the safe type for untrusted data. "any" lets you do anything, but "unknown" forces you to check the type before using it.
export function parseDoc(data: unknown): ParseResult {
  const result = v.safeParse(DocSchema, data)
  if (!result.success) {
    return {
      ok: false,
      problems: result.issues.map((issue) => {
        const path = v.getDotPath(issue)
        return path ? `${path}: ${issue.message}` : issue.message
      }),
    }
  }

  const problems = checkIntegrity(result.output)
  return problems.length ? { ok: false, problems } : { ok: true, doc: result.output }
}
