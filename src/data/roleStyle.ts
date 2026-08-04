import { Crown, Shield, Users, Headphones } from 'lucide-react'

type RoleStyleKey = string

export const ROLE_STYLE: Record<RoleStyleKey, { bg: string; text: string; border: string; icon: React.ElementType; label: string }> = {
  owner:   { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200', icon: Crown,      label: 'Owner'   },
  admin:   { bg: 'bg-purple-50 dark:bg-purple-950/30',  text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200', icon: Shield,     label: 'Admin'   },
  manager: { bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-700 dark:text-blue-400',   border: 'border-blue-200',   icon: Users,      label: 'Manager' },
  agent:   { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  text: 'text-[#1a5c3a]', border: 'border-[#c8e6d4]',  icon: Headphones, label: 'Agent'   },
  OWNER:   { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200', icon: Crown,      label: 'Owner'   },
  ADMIN:   { bg: 'bg-purple-50 dark:bg-purple-950/30',  text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200', icon: Shield,     label: 'Admin'   },
  MANAGER: { bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-700 dark:text-blue-400',   border: 'border-blue-200',   icon: Users,      label: 'Manager' },
  AGENT:   { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  text: 'text-[#1a5c3a]', border: 'border-[#c8e6d4]',  icon: Headphones, label: 'Agent'   },
}
