const FB_APP_ID = import.meta.env.VITE_META_APP_ID
const REDIRECT_URI = `${window.location.origin}/catalog/oauth-callback`

export function buildCatalogOAuthUrl(): string {
  const params = new URLSearchParams({
    app_id: FB_APP_ID,
    client_id: FB_APP_ID,
    display: 'popup',
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: [
      'catalog_management',
      'whatsapp_business_management',
      'business_management',
    ].join(','),
  })

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
}

export function openCatalogOAuthPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = buildCatalogOAuthUrl()

    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      url,
      'catalog-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    if (!popup) {
      reject(new Error('Popup blocked — please allow popups for this site'))
      return
    }

    // Poll the popup to detect when it navigates to our redirect_uri and
    // extract the token from the URL fragment
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval)
          reject(new Error('Catalog connection was cancelled'))
          return
        }

        const currentUrl = popup.location.href
        if (currentUrl.startsWith(REDIRECT_URI)) {
          clearInterval(interval)

          const hash = new URL(currentUrl).hash.substring(1)
          const hashParams = new URLSearchParams(hash)
          const accessToken = hashParams.get('access_token')

          popup.close()

          if (accessToken) {
            resolve(accessToken)
          } else {
            reject(new Error('No access token received from Facebook'))
          }
        }
      } catch {
        // Cross-origin errors are expected while the popup is still on
        // facebook.com — popup.location is only readable once it navigates
        // back to our own domain (REDIRECT_URI). Keep polling.
      }
    }, 500)
  })
}
