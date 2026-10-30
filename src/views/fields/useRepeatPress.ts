import { useEffect, useRef } from 'preact/hooks'

type RepeatPressOptions = {
  /** Delay before the first repeat in milliseconds. */
  initialDelay?: number
  /** Delay between repeats in milliseconds. */
  repeatDelay?: number
  /** Factor to multiply the delay by after each repeat. */
  repeatAcceleration?: number
  /** Minimum delay between repeats in milliseconds. */
  minDelay?: number
}

/** Calls `onStep` once when pressed, then repeatedly while the press is held */
export function useRepeatPress(
  onStep: () => boolean,
  {
    initialDelay = 1000,
    repeatDelay = 500,
    repeatAcceleration = 0.9,
    minDelay = 50,
  }: RepeatPressOptions = {},
) {
  const onStepRef = useRef(onStep)
  const timerId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Update the ref on every render, so the latest onStep is called in the timer
  onStepRef.current = onStep

  const resetTimer = () => {
    clearTimeout(timerId.current)
    timerId.current = undefined
  }

  // Stops a running repeat when the button disappears mid-press, e.g. when navigating back
  useEffect(() => {
    return () => {
      resetTimer()
    }
  }, [])

  return {
    onPointerDown: () => {
      let currentDelay = repeatDelay
      resetTimer()
      onStepRef.current()
      timerId.current = setTimeout(function repeat() {
        const changed = onStepRef.current()
        // If the value didn't change, the user is already at a limit and we don't want to keep repeating.
        // pointerup is not guaranteed to fire on disabled elements, so we stop repeating here too.
        if (changed) {
          timerId.current = setTimeout(repeat, currentDelay)
          currentDelay = Math.max(minDelay, currentDelay * repeatAcceleration)
        }
      }, initialDelay)
    },
    onPointerUp: resetTimer,
    onPointerCancel: resetTimer,
    onClick: (e: MouseEvent) => {
      // Enter/Space fire only click (with detail 0); pointer presses already stepped in onPointerDown
      if (e.detail === 0) {
        onStepRef.current()
      }
    },
  }
}
