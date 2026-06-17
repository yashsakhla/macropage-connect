import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { listenToMetaMessages } from '@/lib/metaSDK'
import { useFacebookSDK } from './useFacebookSDK'
import api from '@/lib/axios'
import type {
  FBLoginResponse,
  WAEmbeddedSignupFinishData,
  WABAAccount,
} from '@/types/meta'

export type SignupState =
  | 'idle'
  | 'sdk_loading'
  | 'popup_open'
  | 'exchanging'
  | 'connected'
  | 'error'
  | 'cancelled'

export interface UseEmbeddedSignupReturn {
  state:                 SignupState
  error:                 string | null
  wabaAccount:           WABAAccount | null
  capturedWabaId:        string | null
  capturedPhoneNumberId: string | null
  startSignup:           () => void
  reconnect:             () => void
  disconnect:            () => Promise<void>
  resetState:            () => void
  isLoading:             boolean
  isConnected:           boolean
}

export function useEmbeddedSignup(): UseEmbeddedSignupReturn {
  const { loaded: sdkLoaded, loading: sdkLoading } = useFacebookSDK()
  const queryClient = useQueryClient()

  const [state,       setState]       = useState<SignupState>('idle')
  const [error,       setError]       = useState<string | null>(null)
  const [wabaAccount, setWabaAccount] = useState<WABAAccount | null>(null)

  const capturedWabaIdRef  = useRef<string | null>(null)
  const capturedPhoneIdRef = useRef<string | null>(null)
  const cleanupListenerRef = useRef<(() => void) | null>(null)

  const connectMetaMutation = useMutation({
    mutationFn: async (payload: {
      code:          string
      wabaId:        string
      phoneNumberId: string
    }) => {
      const response = await api.post('/whatsapp/connect', payload)
      return response.data?.data ?? response.data
    },

    onSuccess: (data: any) => {
      setWabaAccount({
        wabaId:        data.wabaId        ?? '',
        wabaName:      data.wabaName      ?? data.displayName ?? '',
        phoneNumberId: data.phoneNumberId ?? '',
        phoneNumber:   data.phoneNumber   ?? '',
        displayName:   data.displayName   ?? '',
        qualityRating: data.qualityRating ?? 'GREEN',
        messagingTier: data.messagingTier ?? 'TIER_1K',
        isVerified:    data.isVerified    ?? false,
        currency:      data.currency      ?? '',
        timezone:      data.timezone      ?? '',
        connectedAt:   data.connectedAt   ?? new Date().toISOString(),
      })
      setState('connected')
      queryClient.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
      toast.success(`WhatsApp connected: ${data.displayName ?? data.wabaName ?? 'Account'}`)
    },

    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to connect Meta account. Please try again.'
      setError(message)
      setState('error')
      toast.error(message)
    },
  })

  const startSignup = useCallback(() => {
    if (!sdkLoaded || !window.FB) {
      setError('Facebook SDK is not loaded yet. Please wait a moment and try again.')
      setState('error')
      return
    }

    setError(null)
    capturedWabaIdRef.current  = null
    capturedPhoneIdRef.current = null

    if (cleanupListenerRef.current) {
      cleanupListenerRef.current()
    }

    setState('popup_open')

    // Register postMessage listener BEFORE opening popup so WABA data
    // from the popup is captured even if it fires before FB.login callback
    const cleanup = listenToMetaMessages(
      (data: WAEmbeddedSignupFinishData) => {
        capturedWabaIdRef.current  = data.waba_id
        capturedPhoneIdRef.current = data.phone_number_id
      },
      (step: string) => {
        console.log('[Embedded Signup] CANCEL at step:', step)
        setState('cancelled')
        toast('WhatsApp connection cancelled', { icon: 'ℹ️' })
      },
      (errorMessage: string) => {
        console.error('[Embedded Signup] ERROR:', errorMessage)
        setError(errorMessage)
        setState('error')
        toast.error(`Connection error: ${errorMessage}`)
      }
    )
    cleanupListenerRef.current = cleanup

    window.FB.login(
      (response: FBLoginResponse) => {
        if (cleanupListenerRef.current) {
          cleanupListenerRef.current()
          cleanupListenerRef.current = null
        }

        if (response.status !== 'connected' || !response.authResponse) {
          setState(prev => (prev !== 'cancelled' ? 'cancelled' : prev))
          if (response.status !== 'connected') {
            toast('Connection cancelled', { icon: 'ℹ️' })
          }
          return
        }

        const code = response.authResponse.code
        if (!code) {
          setError('No auth code received from Meta. Please try again.')
          setState('error')
          return
        }

        const payload = {
          code,
          wabaId:        capturedWabaIdRef.current  ?? '',
          phoneNumberId: capturedPhoneIdRef.current ?? '',
        }

        setState('exchanging')
        connectMetaMutation.mutate(payload)
      },
      {
        scope: [
          'whatsapp_business_management',
          'whatsapp_business_messaging',
          'business_management',
        ].join(','),
        extras: {
          feature:            'whatsapp_embedded_signup',
          sessionInfoVersion: 3,
          setup:              {},
        },
        auth_type:     'rerequest',
        return_scopes: true,
      }
    )
  }, [sdkLoaded, connectMetaMutation])

  const disconnect = useCallback(async () => {
    try {
      await api.delete('/whatsapp/setup/disconnect')
      setWabaAccount(null)
      setState('idle')
      queryClient.invalidateQueries({ queryKey: ['whatsapp-setup-status'] })
      toast.success('WhatsApp account disconnected')
    } catch {
      toast.error('Failed to disconnect. Please try again.')
    }
  }, [queryClient])

  const reconnect = useCallback(() => {
    setState('idle')
    setError(null)
    setWabaAccount(null)
    setTimeout(() => startSignup(), 100)
  }, [startSignup])

  const resetState = useCallback(() => {
    setState('idle')
    setError(null)
  }, [])

  return {
    state,
    error,
    wabaAccount,
    capturedWabaId:        capturedWabaIdRef.current,
    capturedPhoneNumberId: capturedPhoneIdRef.current,
    startSignup,
    reconnect,
    disconnect,
    resetState,
    isLoading:   sdkLoading || state === 'popup_open' || state === 'exchanging',
    isConnected: state === 'connected',
  }
}
