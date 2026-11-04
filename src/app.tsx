import { useEffect, useState } from 'preact/hooks'
import { exampleDoc } from './model/fixtures.ts'
import type { Doc } from './model/schema.ts'
import { useRoute } from './router.ts'
import { loadDoc, saveDoc } from './storage/docStore.ts'
import { CardListView } from './views/CardListView.tsx'
import { CardView } from './views/CardView.tsx'
import { InvalidDataView } from './views/InvalidDataView.tsx'
import { SettingsView } from './views/SettingsView.tsx'

type AppState =
  | { status: 'loading' }
  | { status: 'ok'; doc: Doc }
  | { status: 'invalid'; problems: string[]; raw: unknown }
  | { status: 'error'; message: string }
  | { status: 'too-new' }

/** Stores a fresh copy of the example cards. Used on first launch and for a reset. */
async function saveDefaultDoc(): Promise<Doc> {
  // Copy so later edits never touch the shared fixture
  const doc = structuredClone(exampleDoc)
  await saveDoc(doc)
  return doc
}

async function startUp(): Promise<AppState> {
  const result = await loadDoc()

  switch (result.status) {
    case 'ok':
    case 'invalid':
    case 'too-new':
      return result
    case 'empty':
      return { status: 'ok', doc: await saveDefaultDoc() }
  }
}

export function App() {
  const [state, setState] = useState<AppState>({ status: 'loading' })
  // Hooks must run on every render, so the route is read here and not only in the 'ok' case
  const route = useRoute()

  const showError = (error: unknown) => setState({ status: 'error', message: String(error) })
  const [setId, setSetId] = useState<string | null>(null)

  // Runs once after the first render; the empty array means "no dependencies"
  useEffect(() => {
    startUp().then(setState, showError)
  }, [])

  const reset = () => {
    return saveDefaultDoc().then((doc) => setState({ status: 'ok', doc }), showError)
  }

  const updateDoc = (doc: Doc) => {
    //On any error, updateDoc rejects and the caller must handle the error.
    return saveDoc(doc).then(() => setState({ status: 'ok', doc }))
  }

  const importDoc = (doc: Doc) => {
    // showError swallows the rejection, so ImportDoc's success message would run on failure if this ever stops being full-screen
    return updateDoc(doc).catch(showError)
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
    case 'too-new':
      return (
        <main>
          <h1>Karten aus neuerer App-Version</h1>
          <p>Die geladenen Karten nutzen eine neuere Version. Bitte aktualisiere die App.</p>
        </main>
      )
    case 'invalid':
      return (
        <InvalidDataView
          problems={state.problems}
          raw={state.raw}
          onReset={reset}
          onImport={importDoc}
        />
      )
    case 'ok':
      switch (route.name) {
        case 'settings':
          return <SettingsView doc={state.doc} onReset={reset} onImport={importDoc} />
        case 'card': {
          return <CardView doc={state.doc} cardId={route.cardId} show={route.show} />
        }
        case 'list': {
          return <CardListView doc={state.doc} setId={setId} setSetId={setSetId} />
        }
      }
  }
}
