import { useEffect, useState } from 'preact/hooks'

/**
 * Screens are addressed by the URL hash (`#/card/<id>`), so every screen change is a
 * browser history entry and the phone's back button returns to the previous screen.
 * `/show` is appended to the URL when the card is displayed in an overlay,
 * so the back button closes the overlay.
 * The set editor lives at `#/editor/set/<id>`; without an ID (`#/editor/set`) it creates a new set.
 * Each editor gets its own route name, so the planned card editor won't share this one.
 */
export type Route =
  | { name: 'list' }
  | { name: 'card'; cardId: string; show: boolean }
  | { name: 'settings' }
  | { name: 'set-editor'; setId: string | null }

/** URL for a route, for use in `href`. IDs only contain URL-safe characters, so no encoding is needed. */
export function routeHref(route: Route): string {
  switch (route.name) {
    case 'list':
      return '#/'
    case 'card':
      return `#/card/${route.cardId}${route.show ? '/show' : ''}`
    case 'settings':
      return '#/settings'
    case 'set-editor':
      return `#/editor/set${route.setId !== null ? `/${route.setId}` : ''}`
  }
}

/**
 * Navigates to the route and marks the new history entry, which says: the entry before
 * this one is a screen of this app. safeBack relies on that mark.
 * For screens that are left again by code (overlay closing, editor saving), not for plain links.
 */
export function markedNavigation(route: Route) {
  location.hash = routeHref(route)
  // Replaces the state of the entry the hash change just created; the mark lives only there
  history.replaceState({ fromApp: true }, '')
}

/**
 * Leaves the current screen. With the mark from markedNavigation it goes back, so the
 * screen doesn't stay in the history. Without it (reload or a direct link) going back
 * could leave the app, so it replaces the current entry with the fallback route instead.
 */
export function safeBack(fallback: Route) {
  if (history.state?.fromApp) {
    history.back()
    return
  }
  location.replace(routeHref(fallback))
}

export function parseHash(hash: string): Route {
  const cardMatch = /^#\/card\/([A-Za-z0-9_-]+)(\/show)?$/.exec(hash)
  const setEditorMatch = /^#\/editor\/set(?:\/([A-Za-z0-9_-]+))?$/.exec(hash)
  if (cardMatch) return { name: 'card', cardId: cardMatch[1]!, show: cardMatch[2] !== undefined }
  if (setEditorMatch) {
    const setId = setEditorMatch[1] ?? null
    return { name: 'set-editor', setId }
  }
  if (hash === '#/settings') return { name: 'settings' }
  // Unknown or empty hashes fall back to the list instead of showing an error
  return { name: 'list' }
}

/** The current route; re-renders the calling component whenever the hash changes. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))

  useEffect(() => {
    const update = () => setRoute(parseHash(location.hash))
    window.addEventListener('hashchange', update)
    // Cleanup: stop listening when the component is removed
    return () => window.removeEventListener('hashchange', update)
  }, [])

  return route
}
