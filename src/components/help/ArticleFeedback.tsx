import { useState } from 'react'
import { CheckCircle, ThumbsUp, ThumbsDown, Twitter, Share2 } from 'lucide-react'
import { useArticleFeedback } from '@/hooks/useHelp'

interface Props {
  articleId: string
  articleSlug: string
  onNeedHelp: () => void
}

const REASONS = [
  'The information was inaccurate',
  "The steps didn't work for me",
  "I couldn't find what I needed",
  'The article was hard to understand',
]

export default function ArticleFeedback({ articleId, articleSlug, onNeedHelp }: Props) {
  const storageKey = `helpFeedback_${articleSlug}`
  const alreadyGiven = localStorage.getItem(storageKey)

  const [state, setState] = useState<'idle' | 'yes' | 'no' | 'submitted'>(
    alreadyGiven ? 'submitted' : 'idle'
  )
  const [reasons, setReasons] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const { mutate } = useArticleFeedback()

  function handleYes() {
    setState('yes')
    localStorage.setItem(storageKey, 'helpful')
    mutate({ articleId, helpful: true })
  }

  function handleNoSubmit() {
    setState('submitted')
    localStorage.setItem(storageKey, 'nothelpful')
    mutate({ articleId, helpful: false, reasons, comment: comment || undefined })
  }

  function toggleReason(r: string) {
    setReasons(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  if (state === 'yes') {
    return (
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-8 text-center">
        <CheckCircle size={20} className="text-[#1a5c3a] mx-auto" />
        <p className="text-base font-semibold text-gray-900 mt-3">Thank you for your feedback!</p>
        <p className="text-sm text-gray-600 mt-2">Glad this article helped you.</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => {
              const url = window.location.href
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')
            }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Twitter size={14} /> Share on X
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a5c3a] transition-colors"
          >
            <Share2 size={14} /> Copy link
          </button>
        </div>
      </div>
    )
  }

  if (state === 'no') {
    return (
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-8">
        <p className="text-sm font-semibold text-gray-900">Sorry to hear that. What could be better?</p>
        <div className="space-y-2 mt-4">
          {REASONS.map(r => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reasons.includes(r)}
                onChange={() => toggleReason(r)}
                className="rounded text-[#1a5c3a]"
              />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Tell us more (optional)"
          className="input w-full resize-none mt-4"
        />
        <button
          onClick={handleNoSubmit}
          className="btn-primary h-9 mt-4"
        >
          Submit feedback
        </button>
      </div>
    )
  }

  if (state === 'submitted') {
    return (
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-8 text-center">
        <CheckCircle size={20} className="text-[#1a5c3a] mx-auto" />
        <p className="text-sm text-gray-600 mt-3">Thank you for your feedback!</p>
        <button
          onClick={onNeedHelp}
          className="text-xs text-[#1a5c3a] font-medium mt-3 hover:underline"
        >
          Contact support if you still need help
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-8 text-center">
      <p className="text-base font-semibold text-gray-900">Was this article helpful?</p>
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handleYes}
          className="btn-primary h-10 px-6 flex items-center gap-2"
        >
          <ThumbsUp size={16} /> Yes, it helped
        </button>
        <button
          onClick={() => setState('no')}
          className="btn-outline h-10 px-6 flex items-center gap-2"
        >
          <ThumbsDown size={16} /> No, I need more help
        </button>
      </div>
    </div>
  )
}
