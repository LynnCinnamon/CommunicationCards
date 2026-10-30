import { useEffect, useState } from 'preact/hooks'

/**
 * Screens are addressed by the URL hash (`#/card/<id>`), so every screen change is a
 * browser history entry and the phone's back button returns to the previous screen.
 */
export type Route = { name: 'list' } | { name: 'card'; cardId: string }

/** URL for a route, for use in `href`. IDs only contain URL-safe characters, so no encoding is needed. */
export function routeHref(route: Route): string {
  switch (route.name) {
    case 'list':
      return '#/'
    case 'card':
      return `#/card/${route.cardId}`
  }
}

function parseHash(hash: string): Route {
  const match = /^#\/card\/([A-Za-z0-9_-]+)$/.exec(hash)
  if (match) return { name: 'card', cardId: match[1]! }
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
