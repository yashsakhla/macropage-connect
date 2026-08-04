export type ChangeType = 'feature' | 'improvement' | 'fix'

export interface ChangelogChange {
  type: ChangeType
  text: string
}

export interface ChangelogEntry {
  version: string
  date: string // ISO date
  changes: ChangelogChange[]
}

// Newest first. Add a new entry at the top whenever a release ships —
// this file is the single source of truth for the current app version
// and is updated only on request, not automatically per commit.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-08-04',
    changes: [
      { type: 'feature', text: 'Account signup, login, email verification, and password reset' },
      { type: 'feature', text: 'Dashboard with account health, key stats, and a messages trend chart' },
      { type: 'feature', text: 'Live chat inbox for WhatsApp conversations' },
      { type: 'feature', text: 'Campaigns and message template management' },
      { type: 'feature', text: 'Contact list with profiles and conversation history' },
      { type: 'feature', text: 'Team management with role-based permissions and member invites' },
      { type: 'feature', text: 'Automation rules and visual flow builder' },
      { type: 'feature', text: 'WhatsApp Business number setup via Meta Embedded Signup' },
      { type: 'feature', text: 'Settings, billing, and subscription plans' },
      { type: 'feature', text: 'Developer documentation and API reference' },
      { type: 'feature', text: 'Help & Support center with docs, FAQs, support tickets, and live system status' },
    ],
  },
]

export const CURRENT_VERSION = CHANGELOG[0].version
export const LATEST_RELEASE_DATE = CHANGELOG[0].date
