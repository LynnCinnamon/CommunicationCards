import { useRegisterSW } from 'virtual:pwa-register/preact'

export function UpdateBanner() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  const [needsRefresh, setNeedsRefresh] = needRefresh

  if (!needsRefresh) return null

  return (
    // role="status": screen readers announce the banner when it appears, without stealing focus
    <div class="update-banner" role="status">
      <div class="update-banner-inner">
        <p>Eine neue Version ist verfügbar.</p>
        <div class="update-banner-buttons">
          <button
            class="update-banner-button update-banner-button-primary"
            onClick={() => {
              updateServiceWorker()
            }}
          >
            Jetzt aktualisieren
          </button>
          <button
            class="update-banner-button"
            onClick={() => {
              setNeedsRefresh(false)
            }}
          >
            Später
          </button>
        </div>
      </div>
    </div>
  )
}
