import { useEffect, useState } from 'preact/hooks'
import { exampleDoc } from './model/fixtures.ts'
import type { Doc } from './model/schema.ts'
import { loadDoc, saveDoc } from './storage/docStore.ts'
import { CardListView } from './views/CardListView.tsx'
import { InvalidDataView } from './views/InvalidDataView.tsx'

type AppState =
  | { status: 'loading' }
  | { status: 'ok'; doc: Doc }
  | { status: 'invalid'; problems: string[]; raw: unknown }
  | { status: 'error'; message: string }

/** Stores a fresh copy of the example cards. Used on first launch and for a reset. */
async function saveDefaultDoc(): Promise<Doc> {
  // Copy so later edits never touch the shared fixture
  const doc = structuredClone(exampleDoc)
  await saveDoc(doc)
  return doc
}

async function startUp(): Promise<AppState> {
  const result = await loadDoc()
  if (result.status !== 'empty') return result
  return { status: 'ok', doc: await saveDefaultDoc() }
}

export function App() {
  const [state, setState] = useState<AppState>({ status: 'loading' })

  const showError = (error: unknown) => setState({ status: 'error', message: String(error) })

  // Runs once after the first render; the empty array means "no dependencies"
  useEffect(() => {
    startUp().then(setState, showError)
  }, [])

  const reset = () => {
    saveDefaultDoc().then((doc) => setState({ status: 'ok', doc }), showError)
  }

  switch (state.status) {
    case 'loading':
      return <main>Lädt …</main>
    case 'error':
      return (
        <main>
          <h1>Speicher nicht verfügbar</h1>
          <p>{state.message}</p>
        </main>
      )
    case 'invalid':
      return <InvalidDataView problems={state.problems} raw={state.raw} onReset={reset} />
    case 'ok':
      return <CardListView doc={state.doc} />
  }
}
