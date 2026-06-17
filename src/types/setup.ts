export interface BusinessInfoPayload {
  businessName: string
  category: string
  description?: string
  website?: string
  email?: string
  address?: string
  logoFile?: File | null
}

export interface PhoneVerificationPayload {
  phoneNumber: string
  countryCode: string
  displayName: string
  verificationMethod: 'SMS' | 'VOICE'
}

export interface TestMessagePayload {
  toNumber: string
  toCountryCode: string
  templateIndex: 0 | 1 | 2
  customMessage?: string
}

export interface SetupStatus {
  currentStep: number
  businessInfoSaved: boolean
  metaConnected: boolean
  phoneVerified: boolean
  testMessageSent: boolean
  setupComplete: boolean
  tokenExpired?: boolean
  wabaAccount?: {
    phoneNumberId?: string
    wabaId?: string
    phoneNumber?: string
    displayName?: string
    qualityRating?: string
  }
}
