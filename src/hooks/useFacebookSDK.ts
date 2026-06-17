import { useState, useEffect } from 'react'
import { loadFacebookSDK } from '@/lib/metaSDK'

interface UseFacebookSDKReturn {
  loaded:  boolean
  loading: boolean
  error:   string | null
  reload:  () => void
}

export function useFacebookSDK(): UseFacebookSDKReturn {
  const [loaded,  setLoaded]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)

    loadFacebookSDK()
      .then(() => {
        setLoaded(true)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!loaded && !loading) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loaded, loading, error, reload: load }
}
