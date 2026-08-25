import type { WAEmbeddedSignupEvent, WAEmbeddedSignupFinishData, FBLoginResponse } from '@/types/meta'

let sdkLoaded = false
let sdkLoading = false
const loadCallbacks: Array<() => void> = []

/**
 * Dynamically loads the Facebook JavaScript SDK.
 * Safe to call multiple times — only loads once.
 */
export function loadFacebookSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (sdkLoaded && window.FB) {
      resolve()
      return
    }

    if (sdkLoading) {
      loadCallbacks.push(resolve)
      return
    }

    sdkLoading = true

    window.fbAsyncInit = function () {
      window.FB.init({
        appId:            import.meta.env.VITE_META_APP_ID,
        autoLogAppEvents: true,
        xfbml:            true,
        version:          'v25.0',
      })

      sdkLoaded = true
      sdkLoading = false

      resolve()
      loadCallbacks.forEach(cb => cb())
      loadCallbacks.length = 0
    }

    const existing = document.getElementById('facebook-jssdk')
    if (existing) {
      // Script tag already injected — fbAsyncInit will fire on its own
      return
    }

    const script = document.createElement('script')
    script.id          = 'facebook-jssdk'
    script.src         = 'https://connect.facebook.net/en_US/sdk.js'
    script.async       = true
    script.defer       = true
    script.crossOrigin = 'anonymous'

    script.onerror = () => {
      sdkLoading = false
      reject(new Error('Failed to load Facebook SDK. Check your internet connection.'))
    }

    document.body.appendChild(script)
  })
}

/**
 * Opens the Meta popup for catalog connection and resolves with the auth code.
 * Reuses the same FB SDK session already loaded for WhatsApp Embedded Signup.
 */
export function launchCatalogConnect(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Facebook SDK not loaded'))
      return
    }

    window.FB.login(
      (response: FBLoginResponse) => {
        if (response.authResponse?.code) {
          resolve(response.authResponse.code)
        } else {
          reject(new Error('Catalog connection was cancelled'))
        }
      },
      {
        config_id: import.meta.env.VITE_META_CATALOG_CONFIG_ID
          ?? import.meta.env.VITE_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          sessionInfoVersion: '3',
        },
      }
    )
  })
}

/**
 * Listens to Meta's postMessage events from the Embedded Signup popup.
 * Returns a cleanup function to remove the listener.
 */
export function listenToMetaMessages(
  onFinish: (data: WAEmbeddedSignupFinishData) => void,
  onCancel: (step: string) => void,
  onError:  (message: string) => void
): () => void {
  const ALLOWED_ORIGINS = [
    'https://www.facebook.com',
    'https://web.facebook.com',
    'https://business.facebook.com',
  ]

  const handler = (event: MessageEvent) => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) return

    let data: WAEmbeddedSignupEvent
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    } catch {
      return
    }

    if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

    switch (data.event) {
      case 'FINISH':
        onFinish(data.data as WAEmbeddedSignupFinishData)
        break
      case 'CANCEL':
        onCancel((data.data as { current_step: string }).current_step)
        break
      case 'ERROR':
        onError((data.data as { error_message: string }).error_message)
        break
    }
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
