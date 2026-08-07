import type { FlowButton } from '@/types/flow'

// Older flows stored buttons as plain strings (quick replies only) — normalize
// those into the typed shape so every consumer can treat buttons uniformly.
export function normalizeFlowButtons(raw: unknown): FlowButton[] {
  if (!Array.isArray(raw)) return []
  return raw.map((b) =>
    typeof b === 'string'
      ? { type: 'QUICK_REPLY' as const, text: b }
      : (b as FlowButton)
  )
}

export const FLOW_BUTTON_TYPE_OPTIONS: { value: FlowButton['type']; label: string }[] = [
  { value: 'QUICK_REPLY', label: 'Quick reply' },
  { value: 'URL', label: 'Visit website' },
  { value: 'PHONE_NUMBER', label: 'Call phone' },
]
