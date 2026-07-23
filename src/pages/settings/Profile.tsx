import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileForm from '@/components/profile/ProfileForm'
import ActivityFeed from '@/components/profile/ActivityFeed'
import { useProfile, useUpdateProfile, useUpdateAvatar } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

export default function Profile() {
  const storeUser = useAuthStore(s => s.user)
  const { data } = useProfile()
  const updateProfile = useUpdateProfile()
  const updateAvatar = useUpdateAvatar()

  const user = (data as User | undefined) ?? storeUser

  if (!user) return null

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your personal account details</p>
      </div>
      <div className="h-px bg-[#e8ebe8] dark:bg-white/10 mb-8" />

      <ProfileHeader user={user} onEditClick={() => {}} />

      <ProfileForm
        user={user}
        onSave={(data) => updateProfile.mutate(data)}
        onAvatarUpload={(file) => updateAvatar.mutate(file)}
        isSaving={updateProfile.isPending}
      />

      <ActivityFeed />

      {/* Connected accounts */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 mt-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Connected accounts</p>
        <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-400">G</div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Google account</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Not connected</p>
            </div>
          </div>
          <button className="btn-outline h-8 text-xs px-3">Connect Google</button>
        </div>
      </div>

      {/* Personal danger zone */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-2xl p-5 mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Close your account</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">This will delete your personal profile. If you're the account owner, delete the account from Settings → Danger Zone instead.</p>
        </div>
        <button className="btn-danger h-9 text-sm flex-shrink-0">Close account</button>
      </div>
    </div>
  )
}
