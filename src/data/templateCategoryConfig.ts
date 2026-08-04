import { Megaphone, Wrench, ShieldCheck } from 'lucide-react'
import type { TemplateCategory } from '@/types'

export const CATEGORY_CONFIG: Record<TemplateCategory, {
  label: string
  icon: React.ElementType
  badgeBg: string
  badgeText: string
  bubbleBg: string
  buttonBorder: string
  buttonText: string
  buttonHoverBg: string
  tagline: string
}> = {
  MARKETING: {
    label: 'Marketing',
    icon: Megaphone,
    badgeBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',
    badgeText: 'text-[#1a5c3a]',
    bubbleBg: 'bg-[#eaf7ef] dark:bg-emerald-950/20',
    buttonBorder: 'border-[#1a5c3a]/30',
    buttonText: 'text-[#1a5c3a]',
    buttonHoverBg: 'hover:bg-[#1a5c3a]/5',
    tagline: 'Promote offers and engage customers',
  },
  UTILITY: {
    label: 'Utility',
    icon: Wrench,
    badgeBg: 'bg-blue-50 dark:bg-blue-950/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    bubbleBg: 'bg-blue-50/70 dark:bg-blue-950/20',
    buttonBorder: 'border-blue-300 dark:border-blue-800',
    buttonText: 'text-blue-600 dark:text-blue-400',
    buttonHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
    tagline: 'Share important updates and info',
  },
  AUTHENTICATION: {
    label: 'Authentication',
    icon: ShieldCheck,
    badgeBg: 'bg-orange-50 dark:bg-orange-950/30',
    badgeText: 'text-orange-600 dark:text-orange-400',
    bubbleBg: 'bg-orange-50/70 dark:bg-orange-950/20',
    buttonBorder: 'border-orange-300 dark:border-orange-800',
    buttonText: 'text-orange-600 dark:text-orange-400',
    buttonHoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
    tagline: 'Verify users and secure access',
  },
}
