export type TriggerType =
  | 'message_contains'
  | 'button_click'
  | 'event'
  | 'schedule'

export type ActionType =
  | 'send_message'
  | 'send_template'
  | 'send_buttons'
  | 'assign_agent'
  | 'add_tag'
  | 'remove_tag'
  | 'mark_resolved'
  | 'webhook'
  | 'start_flow'

export interface AutomationRule {
  id: string
  name: string
  isEnabled: boolean
  isBuiltIn: boolean
  priority: number
  trigger: {
    type: TriggerType
    config: Record<string, unknown>
  }
  conditions?: Array<{
    field: string
    operator: string
    value: string
    connector: 'AND' | 'OR'
  }>
  actions: Array<{
    type: ActionType
    config: Record<string, unknown>
    delay?: number
  }>
  limits?: {
    maxPerContact?: number
    cooldownMinutes?: number
    activeHours?: 'business' | 'all' | 'custom'
  }
  stats: {
    totalTriggered: number
    lastTriggeredAt?: string
  }
  createdAt: string
}

export interface RulePayload {
  name: string
  priority: number
  trigger: AutomationRule['trigger']
  conditions?: AutomationRule['conditions']
  actions: AutomationRule['actions']
  limits?: AutomationRule['limits']
  isEnabled?: boolean
}

export interface AIConfig {
  isEnabled: boolean
  provider: 'openai' | 'anthropic'
  model: string
  apiKey?: string
  botName: string
  tone: 'professional' | 'friendly' | 'concise' | 'custom'
  customSystemPrompt?: string
  language: 'auto' | 'en' | 'hi' | string
  useEmoji: boolean
  maxResponseLength: 'short' | 'medium' | 'long' | 'auto'
  confidenceThreshold: number
  handoffMessage: string
  triggers: {
    allMessages: boolean
    businessHoursOnly: boolean
    whenNoAgentOnline: boolean
    afterDelayMinutes?: number
    excludeAssigned: boolean
  }
  stopWords: string[]
  updatedAt: string
}

export type AIConfigPayload = Omit<AIConfig, 'updatedAt'>

export interface KBItem {
  id: string
  type: 'document' | 'faq' | 'url'
  title: string
  content?: string
  fileUrl?: string
  sourceUrl?: string
  category?: string
  tags: string[]
  isEnabled: boolean
  status: 'processing' | 'ready' | 'error'
  charCount?: number
  createdAt: string
}

export interface KBItemPayload {
  type: KBItem['type']
  title: string
  content?: string
  fileUrl?: string
  sourceUrl?: string
  category?: string
  tags?: string[]
}

export interface AutomationStats {
  automatedConversations: {
    overall: number
    today: number
    todayPercent: number
  }
  rules: {
    total: number
    active: number
  }
  aiResponses: {
    overall: number
    today: number
    todayPercent: number
    avgConfidence: number
  }
}
