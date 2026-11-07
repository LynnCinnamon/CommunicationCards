import { useEffect, useId, useRef, useState } from 'preact/hooks'

type Props = {
  actionLabel: string
  confirmationLabel: string
  explanation: string
  buttonClass: string
  onConfirm: () => void
  onConfirmOpen?: () => void
}

/**
 * A button for destructive actions: the first tap only asks, with an explanation and
 * a confirm and a cancel button. Closes as soon as the user confirms; waiting for the
 * action and showing its result or error is up to onConfirm's caller.
 */
export function ConfirmationButton({
  actionLabel,
  confirmationLabel,
  explanation,
  buttonClass,
  onConfirm,
  onConfirmOpen,
}: Props) {
  const [confirming, setConfirming] = useState(false)

  const cancelButton = useRef<HTMLButtonElement | null>(null)

  const id = useId()

  // The tapped button is gone once the question shows, so focus would drop to the page.
  // Cancel gets it, not confirm: a reflexive Enter must not destroy anything.
  // Runs after the render, because only then does the cancel button exist
  useEffect(() => {
    if (confirming) {
      cancelButton.current?.focus()
    }
  }, [confirming])

  const onConfirmClick = () => {
    onConfirm()
    setConfirming(false)
  }

  const onConfirmOpenClick = () => {
    onConfirmOpen?.()
    setConfirming(true)
  }
  return (
    <>
      {confirming ? (
        <>
          <p id={id}>{explanation}</p>
          <button type="button" class={buttonClass} onClick={onConfirmClick}>
            {confirmationLabel}
          </button>
          <button
            type="button"
            aria-describedby={id}
            ref={cancelButton}
            class="action-button"
            onClick={() => setConfirming(false)}
          >
            Abbrechen
          </button>
        </>
      ) : (
        <button
          type="button"

          class={buttonClass}
          onClick={onConfirmOpenClick}
        >
          {actionLabel}
        </button>
      )}
    </>
  )
}
