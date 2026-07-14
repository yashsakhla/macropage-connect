import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

/** Tailwind class merge helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

// ── Help docs / FAQ helpers ───────────────────────────────────────────────────
// Backend /help/faq and /help/docs return only category slugs (e.g. "whatsapp",
// "getting-started") — color and label are derived client-side.

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  account:            { bg: '#fdf2f8', text: '#db2777' },
  automation:         { bg: '#f8fafc', text: '#475569' },
  billing:            { bg: '#eff6ff', text: '#2563eb' },
  campaigns:          { bg: '#faf5ff', text: '#9333ea' },
  contacts:           { bg: '#f0fdfa', text: '#0d9488' },
  general:            { bg: '#f9fafb', text: '#6b7280' },
  'getting-started':  { bg: '#fffbeb', text: '#d97706' },
  inbox:              { bg: '#ecfeff', text: '#0891b2' },
  settings:           { bg: '#eef2ff', text: '#4f46e5' },
  team:               { bg: '#fff1f2', text: '#e11d48' },
  templates:          { bg: '#fff7ed', text: '#ea580c' },
  whatsapp:           { bg: '#f0fdf4', text: '#16a34a' },
}
const DEFAULT_CATEGORY_COLOR = { bg: '#e8f5ee', text: '#1a5c3a' }

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
