import { useRef, useState } from 'preact/hooks'
import { parseDoc, type ParseResult } from '../model/parseDoc.ts'
import type { Doc } from '../model/schema.ts'

export function ImportDoc({ onImport }: { onImport: (doc: Doc) => Promise<void> }) {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [resultMessage, setResultMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      input.value = '' // Clear the input so the same file can be selected again
      if (!file) return
      const reader = new FileReader()
      setFileName(file.name)

      reader.onload = (e) => {
        if (!e.target?.result) {
          setParseResult({ status: 'invalid', problems: ['Die Datei ist leer.'] })
          return
        }
        let jsonObject: unknown = null
        try {
          jsonObject = JSON.parse(e.target.result as string)
        } catch (err) {
          setParseResult({
            status: 'invalid',
            problems: ['Die Datei ist keine gültige JSON-Datei.', String(err)],
          })
          return
        }
        const parsedDoc = parseDoc(jsonObject)
        setParseResult(parsedDoc)
      }
      reader.onerror = () => {
        setParseResult({
          status: 'invalid',
          problems: ['Fehler beim Lesen der Datei.', String(reader.error)],
        })
      }
      reader.readAsText(file)
    }
  }

  const importButtonClick = () => {
    fileInputRef.current?.click()
    setParseResult(null) // Reset previous parse result
    setFileName(null) // Reset previous file name
    setResultMessage('') // Reset previous result message
  }

  const onImportClick = () => {
    if (parseResult?.status === 'ok') {
      onImport(parseResult.doc).then(() => {
        setResultMessage(`Die Datei ${fileName} wurde erfolgreich importiert.`)
        setParseResult(null)
        setFileName(null)
      })
    }
  }

  const onImportCancelClick = () => {
    setParseResult(null)
    setFileName(null)
    setResultMessage('')
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        hidden
      />
      <button type="button" class="action-button" onClick={importButtonClick}>
        Karten importieren
      </button>

      {parseResult?.status === 'ok' && (
        <>
          <p>{fileName} importieren? Alte Karten werden ersetzt.</p>
          <button type="button" class="action-button" onClick={onImportClick}>
            Ja, ersetzen
          </button>
          <button type="button" class="action-button" onClick={onImportCancelClick}>
            Abbrechen
          </button>
        </>
      )}
      {parseResult && parseResult.status !== 'ok' && (
        <div role="alert">
          <p>Beim Import der Datei {fileName} sind Fehler aufgetreten:</p>
          <ul>
            {parseResult.status === 'too-new' && (
              <li>Diese Datei nutzt eine neuere Version. Bitte aktualisiere die App.</li>
            )}
            {parseResult.status === 'invalid' &&
              parseResult.problems.map((problem, index) => <li key={index}>{problem}</li>)}
          </ul>
        </div>
      )}
      <p role="status">{resultMessage}</p>
    </>
  )
}
