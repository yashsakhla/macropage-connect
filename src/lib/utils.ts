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
