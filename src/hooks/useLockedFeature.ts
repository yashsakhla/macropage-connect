import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PLAN_FEATURES } from '@/lib/permissions'
import type { Plan } from '@/lib/permissions'

export function useLockedFeature(feature: string) {
  const effectivePlan = useAuthStore(s => s.effectivePlan)
  const [showPopup, setShowPopup] = useState(false)

  const plan = (effectivePlan().toUpperCase() as Plan)
  const isLocked = !PLAN_FEATURES[plan]?.includes(feature)

  const handleClick = (onUnlocked: () => void) => {
    if (isLocked) {
      setShowPopup(true)
    } else {
      onUnlocked()
    }
  }

  return {
    isLocked,
    showPopup,
    openPopup:  () => setShowPopup(true),
    closePopup: () => setShowPopup(false),
    handleClick,
  }
}
