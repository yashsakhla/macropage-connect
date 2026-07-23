import { Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HelpArticle } from '@/types'
import { fromNow, getCategoryColor, getCategoryLabel, estimateReadTime, markdownExcerpt } from '@/lib/utils'

interface Props {
  article: HelpArticle
}

export default function ArticleCard({ article }: Props) {
  const navigate = useNavigate()
  const color = getCategoryColor(article.category)

  return (
    <div
      onClick={() => navigate(`/help/articles/${article.slug}`)}
      className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] cursor-pointer transition-all group"
    >
      {/* Top row */}
      <div className="flex items-center">
        <span
          className="text-[0.625rem] font-medium rounded-full px-2.5 py-1"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {getCategoryLabel(article.category)}
        </span>
        <span className="text-[0.625rem] text-gray-400 dark:text-gray-500 ml-auto flex items-center gap-1">
          <Clock size={11} />
          {estimateReadTime(article.content)} min read
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 leading-snug line-clamp-2 group-hover:text-[#1a5c3a] transition-colors">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
        {markdownExcerpt(article.content)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f5f5f5]">
        <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">
          Updated {fromNow(article.updatedAt)}
        </span>
        <span className="text-xs text-[#1a5c3a] font-medium flex items-center gap-1">
          Read article
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  )
}
