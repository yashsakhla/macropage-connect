export interface FBAuthResponse {
  accessToken?: string
  code?: string
  expiresIn?: number
  signedRequest?: string
  userID?: string
  grantedScopes?: string
  reauthorize_required_hours?: number
}

export interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown'
  authResponse?: FBAuthResponse
}

export interface WAEmbeddedSignupEvent {
  type: 'WA_EMBEDDED_SIGNUP'
  event: 'FINISH' | 'CANCEL' | 'ERROR'
  data: WAEmbeddedSignupFinishData | WAEmbeddedSignupCancelData | WAEmbeddedSignupErrorData
  version: string
}

export interface WAEmbeddedSignupFinishData {
  phone_number_id: string
  waba_id: string
}

export interface WAEmbeddedSignupCancelData {
  current_step: string
}

export interface WAEmbeddedSignupErrorData {
  error_message: string
}

export interface WABAAccount {
  wabaId: string
  wabaName: string
  phoneNumberId: string
  phoneNumber: string
  displayName: string
  qualityRating: 'GREEN' | 'YELLOW' | 'RED'
  messagingTier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED'
  isVerified: boolean
  currency: string
  timezone: string
  connectedAt: string
}

export interface ConnectMetaResponse {
  success: boolean
  data: {
    wabaId: string
    wabaName: string
    phoneNumberId: string
    phoneNumber: string
    displayName: string
    qualityRating: string
    messagingTier: string
    businessName: string
  }
  message: string
}

export interface SetupStatusResponse {
  success: boolean
  data: {
    currentStep: 1 | 2 | 3 | 4
    businessInfoDone: boolean
    metaConnected: boolean
    phoneVerified: boolean
    testSent: boolean
    wabaAccount?: WABAAccount
  }
}

declare global {
  interface Window {
    FB: {
      init: (config: {
        appId: string
        autoLogAppEvents: boolean
        xfbml: boolean
        version: string
      }) => void
      login: (
        callback: (response: FBLoginResponse) => void,
        options?: {
          scope?: string
          config_id?: string
          response_type?: string
          override_default_response_type?: boolean
          extras?: {
            feature?: string
            sessionInfoVersion?: number
            setup?: Record<string, unknown>
          }
          auth_type?: string
          return_scopes?: boolean
        }
      ) => void
      getLoginStatus: (callback: (response: FBLoginResponse) => void) => void
      logout: (callback?: () => void) => void
      api: (
        path: string,
        method: string,
        params: Record<string, string>,
        callback: (response: unknown) => void
      ) => void
    }
    fbAsyncInit: () => void
  }
}

export {}
