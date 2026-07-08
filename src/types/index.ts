// ─── API response wrapper ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
  deviceInfo?: string
}

export interface RegisterPayload {
  name: string
  company?: string
  email: string
  password: string
  phone?: string
  role?: 'admin' | 'user' | 'manager'
  termsAccepted: boolean
  marketingOptIn?: boolean
}

// User (shared) — backend sends lowercase roles but we normalise to uppercase in guards
export type UserRole = 'owner' | 'admin' | 'manager' | 'agent' | 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  companyId?: string
  companyName?: string
  wabaId?: string
  phone?: string
  whatsappSetupDone?: boolean
  setupStep?: 1 | 2 | 3 | 4

  // subscription / account state
  status?: 'active' | 'suspended' | 'ACTIVE' | 'SUSPENDED'
  emailVerified?: boolean
  createdAt?: string
  plan?: string
  trialEndsAt?: string
  subscriptionType?: 'FREE' | 'PAID'
  subscriptionActive?: boolean
  paidUser?: boolean
  wabaTokenExpired?: boolean
  paymentFailed?: boolean
  qualityRating?: 'GREEN' | 'YELLOW' | 'RED'
  onboardingComplete?: boolean
  onboardingStep?: number
  provider?: 'email' | 'google'
  gender?: 'male' | 'female' | 'other'
}

// ─── WhatsApp / WABA ─────────────────────────────────────────────────────────
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED'
export type MessagingTier = 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED'

export interface WabaAccount {
  id: string
  name: string
  phoneNumber: string
  displayName: string
  qualityRating: QualityRating
  messagingTier: MessagingTier
  isVerified: boolean
}

// ─── Conversations & Messages ─────────────────────────────────────────────────
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'snoozed'
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'template' | 'interactive' | 'note' | 'system'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'SENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export type ContactStatus = 'active' | 'inactive' | 'opted_out' | 'new'

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  city?: string
  jobTitle?: string
  avatarUrl?: string
  tags: string[]
  customFields: Record<string, string>
  isOptedOut: boolean
  status: ContactStatus
  languagePreference?: string
  totalCampaigns: number
  totalMessages: number
  lastSeenAt?: string
  lastMessageAt?: string
  createdAt: string
}

export interface ContactFilters {
  search?: string
  tags?: string[]
  status?: ContactStatus
  dateFrom?: string
  dateTo?: string
  lastSeenFrom?: string
  lastSeenTo?: string
  minCampaigns?: number
  segmentId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ContactSegment {
  id: string
  name: string
  color: string
  filters: ContactFilters
  contactCount: number
  isBuiltIn?: boolean
  createdAt: string
}

export interface ImportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRows: number
  processedRows: number
  importedCount: number
  skippedCount: number
  failedCount: number
  errorFileUrl?: string
  createdAt: string
  completedAt?: string
}

export interface CreateContactPayload {
  name: string
  phone: string
  email?: string
  company?: string
  city?: string
  tags?: string[]
  customFields?: Record<string, string>
}

export interface ImportPayload {
  fileData: string
  columnMapping: Record<string, string>
  duplicateHandling: 'skip' | 'update' | 'create'
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export type MemberStatus = 'active' | 'pending' | 'inactive'
export type OnlineStatus = 'online' | 'away' | 'offline'

export interface TeamMemberStats {
  conversationsThisMonth: number
  messagesThisMonth: number
  avgResponseTimeSeconds: number
  resolutionRate: number
  csatScore?: number
  csatCount?: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  status: MemberStatus
  avatarUrl?: string
  department?: string
  phone?: string
  onlineStatus: OnlineStatus
  lastActiveAt?: string
  invitedAt?: string
  invitedBy?: { id: string; name: string }
  joinedAt?: string
  permissions: string[]
  stats?: TeamMemberStats
  openConversations: number
}

export interface InvitePayload {
  emails: string[]
  role: UserRole
  department?: string
  message?: string
  expiresIn: '24h' | '3d' | '7d' | 'never'
}

export interface TeamFilters {
  role?: UserRole
  status?: MemberStatus
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ActivityLog {
  id: string
  memberId: string
  memberName: string
  memberAvatar?: string
  action: string
  actionType: 'conversation' | 'campaign' | 'contact' | 'template' | 'team' | 'settings'
  targetId?: string
  targetName?: string
  targetType?: string
  ipAddress?: string
  location?: string
  createdAt: string
}

export interface ActivityFilters {
  memberId?: string
  actionType?: string
  dateFrom?: string
  dateTo?: string
}

export interface Message {
  id: string
  _id?: string
  metaMessageId?: string
  conversationId: string
  direction: MessageDirection
  type: MessageType
  status: MessageStatus
  content: string
  mediaUrl?: string
  mediaName?: string
  mediaSize?: number
  caption?: string
  agentId?: string
  agentName?: string
  templateName?: string
  templateData?: {
    name: string
    header?: string
    body: string
    footer?: string
    buttons?: Array<{ text: string }>
  }
  createdAt: string
}

export interface QuickReply {
  id: string
  shortcode?: string
  title: string
  content: string
  tags?: string[]
  usageCount?: number
}

export interface Conversation {
  id: string
  contact: Contact
  status: ConversationStatus
  assignedTo?: { id: string; name: string; avatarUrl?: string }
  labels: string[]
  lastMessage?: Message
  unreadCount: number
  isBot: boolean
  createdAt: string
  updatedAt: string
}

// ─── Templates ────────────────────────────────────────────────────────────────
export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DRAFT'
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
  text: string
  url?: string
  phone_number?: string
}

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  language: string
  status: TemplateStatus
  header?: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    text?: string
    mediaUrl?: string
  }
  body: string
  footer?: string
  buttons?: TemplateButton[]
  variables: string[]
  rejectionReason?: string
  namespace?: string
  usedInCampaigns: number
  avgDeliveryRate?: number
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateHeader {
  format: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  text?: string
}

export interface CreateTemplatePayload {
  name: string
  category: TemplateCategory
  language: string
  header?: CreateTemplateHeader
  body: string
  footer?: string
  buttons?: { buttons: TemplateButton[] }
  sampleVariables: Record<string, string>
}

// ─── Campaigns ────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  templateId: string
  templateName: string
  audienceType: 'all' | 'tag' | 'csv'
  audienceTags?: string[]
  totalContacts: number
  validContacts: number
  sent: number
  delivered: number
  read: number
  replied: number
  failed: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  sendSpeed: 'slow' | 'normal' | 'fast'
  isAbTest: boolean
  variableMapping: Record<string, string>
  createdBy: { id: string; name: string }
  createdAt: string
}

export interface CampaignRecipient {
  id: string
  contactId: string
  contactName: string
  phone: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failureReason?: string
}

export interface CreateCampaignPayload {
  name: string
  templateId: string
  audienceType: 'all' | 'tag' | 'csv'
  audienceTags?: string[]
  csvUploadId?: string
  variableMapping: Record<string, string>
  scheduledAt?: string
  sendSpeed: 'slow' | 'normal' | 'fast'
  isAbTest: boolean
  abTestTemplateId?: string
  abTestSplit?: number
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalSent: number
  totalDelivered: number
  totalRead: number
  totalFailed: number
  openConversations: number
  activeCampaigns: number
  deliveryRate: number
  readRate: number
}

export interface ChartDataPoint {
  date: string
  inbound: number
  outbound: number
  total: number
}

export interface DashboardStatMetric {
  value: number
  trend: number
  label?: string
}

export interface DashboardStatsData {
  conversations: DashboardStatMetric
  messagesSent: DashboardStatMetric
  activeContacts: DashboardStatMetric
  campaigns: DashboardStatMetric
}

export interface DashboardHealthData {
  connected: boolean
  qualityRating: 'GREEN' | 'YELLOW' | 'RED'
  messagingTier: string
  tokenExpired: boolean
  phoneNumber: string
  displayName: string
  phoneNumberId: string
  messagesSentToday: number
  tierLimit: number
  usagePercent: number
}

export interface DashboardRecentItem {
  id: string
  type: string
  title: string
  subtitle: string
  timestamp: string
  link: string
  meta: {
    contactId?: string
    name?: string
    phone?: string
  }
}

export interface ChecklistStep {
  id: string
  title: string
  completed: boolean
  actionUrl?: string
}

export interface ChecklistData {
  steps: ChecklistStep[]
  progressPercent: number
  completedCount: number
  totalSteps: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AccountSettings {
  companyName: string
  companyLogoUrl?: string
  industry?: string
  description?: string
  website?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country: string
  postalCode?: string
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  language: string
  currency: 'INR' | 'USD' | 'EUR'
}

export interface NotificationPreferences {
  channels: { email: boolean; inApp: boolean; whatsapp: boolean; whatsappNumber?: string }
  events: Record<string, { email: boolean; inApp: boolean; whatsapp: boolean }>
  quietHours: { enabled: boolean; from: string; to: string; days: number[] }
  digest: { enabled: boolean; frequency: 'daily' | 'weekly' | 'never' }
}

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly'

export interface PlanPricingTier {
  price: number
  billedAs: string
  savings?: string
}

export interface BillingPlan {
  id: string
  name: string
  desc: string
  badge: string | null
  highlight: boolean
  cta: string
  ctaHref: string
  currency: string
  custom?: boolean
  pricing: Record<BillingCycle, PlanPricingTier>
  features: string[]
  notIncluded: string[]
}

export interface Subscription {
  planId: string
  planName: string
  status: 'active' | 'trial' | 'cancelled' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEndsAt?: string
  usage: { messages: number; contacts: number; storage: number; teamMembers: number; campaigns: number }
}

export interface Payment {
  _id: string
  plan: string
  billingCycle: string
  amount: number // paise
  status: 'success' | 'failed' | 'pending'
  invoiceUrl?: string
  createdAt: string
}

export interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: 'paid' | 'failed' | 'pending'
  paidAt?: string
  createdAt: string
  downloadUrl?: string
}

export interface APIKey {
  id: string
  name: string
  keyPreview: string
  permissions: string[]
  expiresAt?: string
  lastUsedAt?: string
  createdAt: string
  isActive: boolean
  requestsToday: number
}

export interface Webhook {
  id: string
  url: string
  description?: string
  events: string[]
  isEnabled: boolean
  createdAt: string
  stats: { totalDeliveries: number; successRate: number; lastDeliveredAt?: string }
  recentDeliveries: Array<{ id: string; event: string; statusCode: number; responseTime: number; createdAt: string }>
}

export interface ActiveSession {
  id: string
  device: string
  browser: string
  os: string
  location?: string
  ipAddress: string
  isCurrent: boolean
  lastActiveAt: string
  createdAt: string
}

export interface UpdateProfilePayload {
  firstName?: string; lastName?: string; displayName?: string
  bio?: string; phone?: string; department?: string
  jobTitle?: string; city?: string; timezone?: string; language?: string
}

export interface ChangePasswordPayload { currentPassword: string; newPassword: string }

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationKind = 'message' | 'campaign' | 'template' | 'system' | 'billing' | 'team'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

// ─── Help & Support ───────────────────────────────────────────────────────────
export interface HelpArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  categoryColor: string
  author: string
  readTimeMinutes: number
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  helpfulPercent: number
  tags: string[]
  relatedArticles: HelpArticle[]
  tableOfContents: Array<{
    id: string
    text: string
    level: 2 | 3
  }>
  updatedAt: string
  publishedAt: string
}

export interface HelpCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  bgColor: string
  articleCount: number
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

export interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnailUrl?: string
  videoUrl: string
  category: string
  views: number
  publishedAt: string
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage'
  services: Array<{
    name: string
    status: 'operational' | 'degraded' | 'outage'
    uptime: number
    history: Array<'operational' | 'degraded' | 'outage'>
  }>
  incidents: Array<{
    id: string
    title: string
    status: 'resolved' | 'monitoring' | 'identified'
    createdAt: string
    resolvedAt?: string
  }>
  lastUpdated: string
}

export interface TicketPayload {
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high'
  description: string
  attachments?: File[]
}

export interface SearchResult {
  id: string
  type: 'article' | 'faq' | 'video'
  title: string
  excerpt: string
  category: string
  url: string
  relevanceScore: number
  meta: Record<string, unknown>
}
