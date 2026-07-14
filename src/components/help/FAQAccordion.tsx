import { useState } from 'react'
import { ChevronDown, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { FAQ } from '@/types'
import { cn, getCategoryColor, getCategoryLabel } from '@/lib/utils'

interface Props {
  faqs?: FAQ[]
}

export default function FAQAccordion({ faqs: allFaqs = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, 'yes' | 'no'>>({})

  const CATEGORIES = ['All', ...Array.from(new Set(allFaqs.map(f => f.category)))]

  const faqs: FAQ[] = activeCategory === 'All'
    ? allFaqs
    : allFaqs.filter(f => f.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto px-6 mb-10">
      <h2 className="text-xl font-bold text-gray-900">Frequently asked questions</h2>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap mt-4 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'text-xs rounded-full px-4 py-1.5 font-medium transition-colors',
              activeCategory === cat
                ? 'bg-[#1a5c3a] text-white'
                : 'bg-white border border-[#e8ebe8] text-gray-600 hover:border-[#c8e6d4]'
            )}
          >
            {cat === 'All' ? cat : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        {faqs.map(faq => {
          const isOpen = openId === faq._id
          const colors = getCategoryColor(faq.category)

          return (
            <div key={faq._id} className="border-b border-[#f5f5f5] last:border-0">
              {/* Question */}
              <button
                onClick={() => setOpenId(isOpen ? null : faq._id)}
                className="w-full px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#fafffe] transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  <HelpCircle size={14} />
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={cn('text-gray-400 flex-shrink-0 transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {/* Answer */}
              {isOpen && (
                <div className="px-6 pb-5 pl-16">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>

                  {/* Feedback row */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#f5f5f5]">
                    <span className="text-xs text-gray-500">Was this helpful?</span>
                    {feedback[faq._id] ? (
                      <span className="text-xs text-gray-500">Thanks for your feedback!</span>
                    ) : (
                      <>
                        <button
                          onClick={() => setFeedback(p => ({ ...p, [faq._id]: 'yes' }))}
                          className="bg-[#e8f5ee] text-[#1a5c3a] h-7 text-xs rounded-lg px-3 flex items-center gap-1 hover:bg-[#c8e6d4] transition-colors"
                        >
                          <ThumbsUp size={12} /> Yes
                        </button>
                        <button
                          onClick={() => setFeedback(p => ({ ...p, [faq._id]: 'no' }))}
                          className="bg-[#f7f8f6] text-gray-500 h-7 text-xs rounded-lg px-3 flex items-center gap-1 hover:bg-gray-200 transition-colors"
                        >
                          <ThumbsDown size={12} /> No
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
