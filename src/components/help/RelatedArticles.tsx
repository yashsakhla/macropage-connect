import { ArrowRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HelpArticle } from '@/types'
import { getCategoryColor, getCategoryLabel, estimateReadTime, markdownExcerpt } from '@/lib/utils'

interface Props {
  articles: HelpArticle[]
}

export default function RelatedArticles({ articles }: Props) {
  const navigate = useNavigate()

  if (!articles.length) return null

  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 mt-4">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Read more</p>

      <div className="space-y-2.5 max-h-[420px] overflow-y-auto thin-scrollbar pr-1 -mr-1">
        {articles.map(a => {
          const color = getCategoryColor(a.category)
          return (
            <div
              key={a._id}
              onClick={() => navigate(`/help/articles/${a.slug}`)}
              className="group border border-[#e8ebe8] dark:border-white/10 rounded-xl p-3 cursor-pointer hover:border-[#c8e6d4] hover:bg-[#fafffe] dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className="text-[0.625rem] font-medium rounded-full px-2 py-0.5 flex-shrink-0"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {getCategoryLabel(a.category)}
                </span>
                <span className="text-[0.625rem] text-gray-400 dark:text-gray-500 flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} /> {estimateReadTime(a.content)} min
                </span>
              </div>

              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 group-hover:text-[#1a5c3a] transition-colors">
                {a.title}
              </p>
              <p className="text-[0.6875rem] text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                {markdownExcerpt(a.content)}
              </p>

              <div className="flex items-center gap-1 mt-1.5 text-[0.625rem] text-[#1a5c3a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Read article <ArrowRight size={10} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
