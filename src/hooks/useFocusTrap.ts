/**
 * Sets up a focus trap on the provided element.
 * Returns a cleanup function to remove the listener.
 * Call inside useEffect — NOT a hook itself.
 */
export function setupFocusTrap(container: HTMLElement | null, active: boolean): (() => void) | undefined {
  if (!active || !container) return

  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  focusable[0]?.focus()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !container) return

    const els = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = els[0]
    const last = els[els.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  return () => container.removeEventListener('keydown', handleKeyDown)
}
