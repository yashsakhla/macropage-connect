import { differenceInCalendarDays } from 'date-fns'
import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useTrialBanner() {
  const { user } = useAuthStore()
  const { daysLeft, isExpired, isTrialUser } = useMemo(() => {
    const trialEndsAt = user?.trialEndsAt
    if (!trialEndsAt) return { daysLeft: 0, isExpired: false, isTrialUser: false }
    const days = differenceInCalendarDays(new Date(trialEndsAt), new Date())
    return { daysLeft: days, isExpired: days < 0, isTrialUser: true }
  }, [user])

  return { daysLeft, isExpired, isTrialUser }
}
