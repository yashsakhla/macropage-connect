import { useParams, Navigate } from 'react-router-dom'
import RequireRole from '@/components/auth/RequireRole'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import AccountSettingsPage from './sections/AccountSettings'
import WhatsAppSettings from './sections/WhatsAppSettings'
import BillingSettings from './sections/BillingSettings'
import NotificationSettings from './sections/NotificationSettings'
import SecuritySettings from './sections/SecuritySettings'
import APISettings from './sections/APISettings'
import WebhookSettings from './sections/WebhookSettings'
import IntegrationSettings from './sections/IntegrationSettings'
import DangerZone from '@/components/settings/DangerZone'
import SettingsSection from '@/components/settings/SettingsSection'
import Profile from './Profile'

const SECTIONS: Record<string, React.ComponentType> = {
  account: AccountSettingsPage,
  whatsapp: WhatsAppSettings,
  profile: Profile,
  billing: BillingSettings,
  usage: UsageSettings,
  'api-keys': APISettings,
  webhooks: WebhookSettings,
  integrations: IntegrationSettings,
  notifications: NotificationSettings,
  security: SecuritySettings,
  danger: DangerZoneSection,
}

function UsageSettings() {
  return (
    <SettingsSection title="Usage" subtitle="Monitor your current resource usage">
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Detailed usage analytics coming soon.</p>
      </div>
    </SettingsSection>
  )
}

function DangerZoneSection() {
  return (
    <SettingsSection title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
      <DangerZone />
    </SettingsSection>
  )
}

export default function Settings() {
  const { section = 'account' } = useParams<{ section?: string }>()

  if (section && !SECTIONS[section]) return <Navigate to="/settings/account" replace />

  const ActiveSection = SECTIONS[section] ?? AccountSettingsPage

  return (
    <div
      className="flex bg-[#f7f8f6] dark:bg-[#0f1724]"
      style={{ height: `calc(100vh - 56px)` }}
    >
      {/* Left sidebar — fixed 240px */}
      <div className="w-60 flex-shrink-0 h-full">
        <SettingsSidebar activeSection={section} />
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-8">
          {section === 'billing' ? (
            <RequireRole allowedRoles={['OWNER']}>
              <ActiveSection />
            </RequireRole>
          ) : (
            <ActiveSection />
          )}
        </div>
      </div>
    </div>
  )
}
