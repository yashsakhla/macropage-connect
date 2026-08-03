import { Bot } from 'lucide-react'
import { usePlanFeature, UpgradePrompt } from '@/lib/permissions'

// AI Chatbot Configuration is temporarily disabled for all plans. The real
// page (AISettings.tsx) is untouched and will be wired back up here once the
// feature is ready to launch.
function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center p-8">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Bot size={28} className="text-brand-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">AI Chatbot Configuration</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This feature is coming soon. We're putting the finishing touches on it — check back shortly.
      </p>
    </div>
  )
}

export default function AIChatbotComingSoon() {
  const planHasFeature = usePlanFeature('ai_chatbot')

  if (!planHasFeature) {
    return (
      <div className="p-6">
        <UpgradePrompt feature="ai_chatbot" />
      </div>
    )
  }

  return <ComingSoon />
}
