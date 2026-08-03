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
import AllTimeUsageCard from '@/components/analytics/AllTimeUsageCard'
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
    <SettingsSection title="Usage" subtitle="Monitor your lifetime resource usage">
      <AllTimeUsageCard />
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
      className="flex flex-col md:flex-row bg-[#f7f8f6] dark:bg-[#0f1724] md:overflow-hidden"
      style={{ minHeight: `calc(100vh - 56px)` }}
    >
      {/* Left sidebar — fixed 240px on desktop; horizontal strip on mobile (rendered inside SettingsSidebar) */}
      <div className="md:w-60 md:flex-shrink-0 md:h-full">
        <SettingsSidebar activeSection={section} />
      </div>

      {/* Right content */}
      <div className="flex-1 md:overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-8">
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
