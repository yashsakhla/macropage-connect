import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

/** Tailwind class merge helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extracts the video ID from a youtube.com/watch, youtu.be, /embed/, or /shorts/ URL. */
export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match?.[1] ?? null
}

/** Best-effort thumbnail for a YouTube URL; falls back to null for non-YouTube links. */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

/**
 * Reduce a #hex color to a translucent rgba tint of itself, so a chip that's
 * meant to sit on either a white or dark navy card stays a soft tint on both
 * instead of a flat pastel that turns into a stark white patch in dark mode.
 */
export function hexToTranslucent(hex: string, alpha = 0.15): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return hex
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Format a date for conversation timestamps */
export function formatChatTime(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'dd MMM')
}

/** Format relative time (e.g. "2 minutes ago") */
export function fromNow(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/** Truncate a string to n chars */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

/** Format numbers with Indian comma style (1,00,000) */
export function formatIndian(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

/** Get initials from a full name */
export function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Phone number display formatter */
export function formatPhone(phone: string): string {
  const clean = phone.startsWith('+') ? phone.slice(1) : phone
  if (clean.startsWith('91') && clean.length === 12) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`
  }
  return `+${clean}`
}

/** Trigger a CSV file download in the browser */
export function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Sleep helper for loading states in dev */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Matches emoji + pictographs + variation selectors + skin tone modifiers + ZWJ
// used to join emoji sequences — covers the ranges browsers actually render as emoji.
const EMOJI_REGEX = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}]|\u{FE0F}|\u{200D}/gu

/** Strip emoji/pictograph characters from sensitive text inputs (email, password, name fields) */
export function stripEmojis(value: string): string {
  return value.replace(EMOJI_REGEX, '')
}

const CONTACT_SAMPLE_TEMPLATE_ROWS: string[][] = [
  ['name', 'phone', 'email', 'company', 'city', 'tags'],
  ['Rohit Sharma', '+919876543210', 'rohit.sharma@example.com', 'Acme Corp', 'Mumbai', 'VIP,Customer'],
  ['Priya Verma', '+919812345678', 'priya.verma@example.com', 'Beta Industries', 'Delhi', 'Lead'],
  ['Amit Kumar', '+919900112233', 'amit.kumar@example.com', '', 'Bangalore', ''],
]

/** Trigger download of the dummy CSV template used to guide the contact-import column mapping */
export function downloadContactSampleTemplate(): void {
  downloadCSV('contacts-sample-template.csv', CONTACT_SAMPLE_TEMPLATE_ROWS)
}

// ── Help docs / FAQ helpers ───────────────────────────────────────────────────
// Backend /help/faq and /help/docs return only category slugs (e.g. "whatsapp",
// "getting-started") — color and label are derived client-side.

// bg is a translucent tint of `text` (not a flat pastel hex) so it reads
// correctly as a soft chip on both a white card and a dark navy card —
// these are applied via inline style, so they can't be handled by dark: classes.
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  account:            { bg: 'rgba(219,39,119,0.12)', text: '#db2777' },
  automation:         { bg: 'rgba(71,85,105,0.15)',   text: '#475569' },
  billing:            { bg: 'rgba(37,99,235,0.12)',   text: '#2563eb' },
  campaigns:          { bg: 'rgba(147,51,234,0.12)',  text: '#9333ea' },
  contacts:           { bg: 'rgba(13,148,136,0.12)',  text: '#0d9488' },
  general:            { bg: 'rgba(107,114,128,0.15)', text: '#6b7280' },
  'getting-started':  { bg: 'rgba(217,119,6,0.12)',   text: '#d97706' },
  inbox:              { bg: 'rgba(8,145,178,0.12)',   text: '#0891b2' },
  settings:           { bg: 'rgba(79,70,229,0.12)',   text: '#4f46e5' },
  team:               { bg: 'rgba(225,29,72,0.12)',   text: '#e11d48' },
  templates:          { bg: 'rgba(234,88,12,0.12)',   text: '#ea580c' },
  whatsapp:           { bg: 'rgba(22,163,74,0.12)',   text: '#16a34a' },
}
const DEFAULT_CATEGORY_COLOR = { bg: 'rgba(26,92,58,0.15)', text: '#1a5c3a' }

export function getCategoryColor(category: string): { bg: string; text: string } {
  return CATEGORY_COLORS[category.toLowerCase()] ?? DEFAULT_CATEGORY_COLOR
}

export function getCategoryLabel(category: string): string {
  return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** Strip markdown syntax down to a plain-text excerpt */
export function markdownExcerpt(content: string, maxLen = 140): string {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*|>]\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
  return truncate(text, maxLen)
}

/** Estimate reading time from markdown word count (~200 wpm) */
export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// ── Campaign cost helpers ─────────────────────────────────────────────────────

/** Meta India conversation rates (INR) — update manually if Meta changes rates */
export const META_RATES_INR: Record<string, number> = {
  MARKETING:      0.83,
  UTILITY:        0.15,
  AUTHENTICATION: 0.13,
  SERVICE:        0,
}

export function formatINR(amount: number): string {
  if (amount === 0) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateEstimatedCost(
  recipientCount: number,
  templateCategory: string,
): { perConversation: number; total: number; formatted: string; category: string } {
  const category = templateCategory?.toUpperCase() ?? 'MARKETING'
  const rate     = META_RATES_INR[category] ?? 0.83
  const total    = recipientCount * rate
  return { perConversation: rate, total, formatted: formatINR(total), category }
}
