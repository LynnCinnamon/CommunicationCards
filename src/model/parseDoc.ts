import * as v from 'valibot'
import { checkIntegrity } from './integrity.ts'
import { DocSchema, SCHEMA_VERSION, type Doc } from './schema.ts'

export const DocSchemaVersion = v.object({
  schemaVersion: v.number(),
})

export type ParseResult =
  { status: 'ok'; doc: Doc } | { status: 'invalid'; problems: string[] } | { status: 'too-new' }

/** Validates untrusted data (e.g. an imported file) as a Doc: structure first, then references. */
//Unknown is the safe type for untrusted data. "any" lets you do anything, but "unknown" forces you to check the type before using it.
export function parseDoc(data: unknown): ParseResult {
  const schemaVersion = v.safeParse(DocSchemaVersion, data)
  if (schemaVersion.success && schemaVersion.output.schemaVersion > SCHEMA_VERSION) {
    return { status: 'too-new' }
  }
  const result = v.safeParse(DocSchema, data)
  if (!result.success) {
    return {
      status: 'invalid',
      problems: result.issues.map((issue) => {
        const path = v.getDotPath(issue)
        return path ? `${path}: ${issue.message}` : issue.message
      }),
    }
  }
  const problems = checkIntegrity(result.output)
  return problems.length > 0
    ? { status: 'invalid', problems }
    : { status: 'ok', doc: result.output }
}
